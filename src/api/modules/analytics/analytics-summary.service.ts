import { createHash } from "crypto";
import { format } from "date-fns";
import prisma from "@api/infrastructure/database/prisma";
import { Prisma } from "@prisma/client";
import { addDaysInTimeZone, parseDateOnlyInTimeZone } from "@shared/utils/date-boundary";

type DateRange = {
  startDate: Date;
  endDate: Date;
};

const hashPayload = (payload: unknown) =>
  createHash("sha256").update(JSON.stringify(payload)).digest("hex");

export const parseDateRange = (
  startDateParam: string,
  endDateParam: string,
  maxRangeDays: number
): { ok: true; range: DateRange } | { ok: false; status: number; error: string } => {
  const startDate = parseDateOnlyInTimeZone(startDateParam);
  const endDateStart = parseDateOnlyInTimeZone(endDateParam);
  if (!startDate || !endDateStart) {
    return {
      ok: false,
      status: 400,
      error: "Tanggal tidak valid, gunakan format YYYY-MM-DD",
    };
  }

  const endDate = addDaysInTimeZone(endDateStart, 1);
  const diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays <= 0) {
    return {
      ok: false,
      status: 400,
      error: "Rentang tanggal tidak valid. Pastikan tanggal akhir tidak lebih kecil dari tanggal awal.",
    };
  }

  if (diffDays > maxRangeDays) {
    return {
      ok: false,
      status: 400,
      error: `Rentang tanggal terlalu besar. Maksimal ${maxRangeDays} hari.`,
    };
  }

  return { ok: true, range: { startDate, endDate } };
};

export async function getAnalyticsSummary(
  startDate: Date,
  endDate: Date,
  clientHash?: string | null
) {
  const toNumber = (value: unknown) => {
    if (typeof value === "bigint") {
      return Number(value);
    }
    if (value === null || typeof value === "undefined") {
      return 0;
    }
    return Number(value);
  };

  const [summaryRows, serviceRows, queueTypeRows, officerRows, timeRows, dailyRows] =
    await Promise.all([
      prisma.$queryRaw<
        Array<{
          totalVisitors: bigint | number;
          completedServices: bigint | number;
          canceledServices: bigint | number;
          averageWaitTimeMinutes: number | null;
          averageServiceTimeMinutes: number | null;
          dataLastUpdatedAt: Date | null;
        }>
      >(Prisma.sql`
				SELECT
					COUNT(*) AS totalVisitors,
					COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END), 0) AS completedServices,
					COALESCE(SUM(CASE WHEN status = 'CANCELED' THEN 1 ELSE 0 END), 0) AS canceledServices,
					ROUND(COALESCE(AVG(CASE
						WHEN startTime IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, createdAt, startTime)
						ELSE NULL
					END), 0)) AS averageWaitTimeMinutes,
					ROUND(COALESCE(AVG(CASE
						WHEN status = 'COMPLETED' AND startTime IS NOT NULL AND endTime IS NOT NULL
							THEN TIMESTAMPDIFF(MINUTE, startTime, endTime)
						ELSE NULL
					END), 0)) AS averageServiceTimeMinutes,
					MAX(updatedAt) AS dataLastUpdatedAt
				FROM \`Queue\`
				WHERE queueDate >= ${startDate} AND queueDate < ${endDate}
			`),
      prisma.$queryRaw<Array<{ name: string; count: bigint | number }>>(Prisma.sql`
				SELECT s.name AS name, COUNT(*) AS count
				FROM \`Queue\` q
				INNER JOIN \`Service\` s ON s.id = q.serviceId
				WHERE q.queueDate >= ${startDate} AND q.queueDate < ${endDate}
				GROUP BY q.serviceId, s.name
				ORDER BY count DESC, s.name ASC
			`),
      prisma.$queryRaw<Array<{ queueType: string; count: bigint | number }>>(Prisma.sql`
				SELECT queueType, COUNT(*) AS count
				FROM \`Queue\`
				WHERE queueDate >= ${startDate} AND queueDate < ${endDate}
				GROUP BY queueType
				ORDER BY count DESC
			`),
      prisma.$queryRaw<
        Array<{
          officerName: string;
          completedCount: bigint | number;
          averageServiceTime: number | null;
        }>
      >(Prisma.sql`
				SELECT
					u.name AS officerName,
					COALESCE(SUM(CASE WHEN q.status = 'COMPLETED' THEN 1 ELSE 0 END), 0) AS completedCount,
					ROUND(COALESCE(AVG(CASE
						WHEN q.status = 'COMPLETED' AND q.startTime IS NOT NULL AND q.endTime IS NOT NULL
							THEN TIMESTAMPDIFF(MINUTE, q.startTime, q.endTime)
						ELSE NULL
					END), 0)) AS averageServiceTime
				FROM \`Queue\` q
				INNER JOIN \`User\` u ON u.id = q.adminId
				WHERE q.queueDate >= ${startDate}
					AND q.queueDate < ${endDate}
					AND q.adminId IS NOT NULL
				GROUP BY q.adminId, u.name
				HAVING completedCount > 0
				ORDER BY completedCount DESC, officerName ASC
			`),
      prisma.$queryRaw<Array<{ hourOfDay: number; count: bigint | number }>>(Prisma.sql`
				SELECT HOUR(createdAt) AS hourOfDay, COUNT(*) AS count
				FROM \`Queue\`
				WHERE queueDate >= ${startDate} AND queueDate < ${endDate}
				GROUP BY HOUR(createdAt)
				ORDER BY hourOfDay ASC
			`),
      prisma.$queryRaw<
        Array<{
          date: Date | string;
          waiting: bigint | number;
          completed: bigint | number;
          canceled: bigint | number;
        }>
      >(Prisma.sql`
				SELECT
					DATE(queueDate) AS date,
					COALESCE(SUM(CASE WHEN status IN ('WAITING', 'SERVING') THEN 1 ELSE 0 END), 0) AS waiting,
					COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END), 0) AS completed,
					COALESCE(SUM(CASE WHEN status = 'CANCELED' THEN 1 ELSE 0 END), 0) AS canceled
				FROM \`Queue\`
				WHERE queueDate >= ${startDate} AND queueDate < ${endDate}
				GROUP BY DATE(queueDate)
				ORDER BY DATE(queueDate) ASC
			`),
    ]);

  const summaryRow = summaryRows[0] ?? {
    totalVisitors: 0,
    completedServices: 0,
    canceledServices: 0,
    averageWaitTimeMinutes: 0,
    averageServiceTimeMinutes: 0,
    dataLastUpdatedAt: null,
  };
  const totalVisitors = toNumber(summaryRow.totalVisitors);
  const completedServices = toNumber(summaryRow.completedServices);
  const canceledServices = toNumber(summaryRow.canceledServices);
  const dataLastUpdatedAt = summaryRow.dataLastUpdatedAt?.toISOString();
  const hash = hashPayload({
    range: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
    summary: {
      totalVisitors,
      completedServices,
      canceledServices,
    },
    dataLastUpdatedAt,
  });
  const hasChanges = !clientHash || clientHash !== hash;

  if (!hasChanges) {
    return {
      summary: {
        totalVisitors,
        completedServices,
        canceledServices,
        averageWaitTimeMinutes: 0,
        averageServiceTimeMinutes: 0,
      },
      serviceDistribution: [],
      queueTypeDistribution: [],
      officerPerformance: [],
      timeAnalysis: [],
      dailyTrends: [],
      dataLastUpdatedAt,
      hash,
      hasChanges,
    };
  }

  return {
    summary: {
      totalVisitors,
      completedServices,
      canceledServices,
      averageWaitTimeMinutes: toNumber(summaryRow.averageWaitTimeMinutes),
      averageServiceTimeMinutes: toNumber(summaryRow.averageServiceTimeMinutes),
    },
    serviceDistribution: serviceRows.map((row) => {
      const count = toNumber(row.count);
      return {
        name: row.name,
        count,
        percentage: totalVisitors > 0 ? Math.round((count / totalVisitors) * 100) : 0,
      };
    }),
    queueTypeDistribution: queueTypeRows.map((row) => {
      const count = toNumber(row.count);
      return {
        name: row.queueType === "ONLINE" ? "Online" : "Offline",
        count,
        percentage: totalVisitors > 0 ? Math.round((count / totalVisitors) * 100) : 0,
      };
    }),
    officerPerformance: officerRows.map((row) => ({
      officerName: row.officerName,
      completedCount: toNumber(row.completedCount),
      averageServiceTime: toNumber(row.averageServiceTime),
    })),
    timeAnalysis: timeRows.map((row) => ({
      hourOfDay: toNumber(row.hourOfDay),
      count: toNumber(row.count),
    })),
    dailyTrends: dailyRows.map((row) => ({
      date: format(new Date(row.date), "yyyy-MM-dd"),
      waiting: toNumber(row.waiting),
      completed: toNumber(row.completed),
      canceled: toNumber(row.canceled),
    })),
    dataLastUpdatedAt,
    hash,
    hasChanges,
  };
}
