import { createHash } from "crypto";
import { format } from "date-fns";
import prisma from "@api/infrastructure/database/prisma";
import { Gender, LastEducation, Prisma, ServiceStatus } from "@prisma/client";
import type {
  AnalyticsOfficerServiceFrequency,
  AnalyticsSummary,
} from "@shared/types/analytics";
import { addDaysInTimeZone, parseDateOnlyInTimeZone } from "@shared/utils/date-boundary";

type DateRange = {
  startDate: Date;
  endDate: Date;
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const EMPTY_CATEGORY_LABEL = "Tidak diisi";

const genderLabels: Record<Gender, string> = {
  [Gender.MALE]: "Laki-Laki",
  [Gender.FEMALE]: "Perempuan",
};

const educationLabels: Record<LastEducation, string> = {
  [LastEducation.SD]: "SD",
  [LastEducation.SMP]: "SMP",
  [LastEducation.SMA_SMK]: "SMA / SMK",
  [LastEducation.D1]: "D1",
  [LastEducation.D2]: "D2",
  [LastEducation.D3]: "D3",
  [LastEducation.D4_S1]: "D4 / S1",
  [LastEducation.S2]: "S2",
  [LastEducation.S3]: "S3",
  [LastEducation.LAINNYA]: "Lainnya",
};

const hashPayload = (payload: unknown) =>
  createHash("sha256").update(JSON.stringify(payload)).digest("hex");

const toNumber = (value: unknown) => {
  if (typeof value === "bigint") {
    return Number(value);
  }
  if (value === null || typeof value === "undefined") {
    return 0;
  }
  return Number(value);
};

const toPercentage = (value: number, total: number) => {
  if (total <= 0) {
    return 0;
  }
  return Math.round((value / total) * 100);
};

const toInclusiveEndDateLabel = (endDate: Date) =>
  format(new Date(endDate.getTime() - ONE_DAY_MS), "yyyy-MM-dd");

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
  const diffDays = (endDate.getTime() - startDate.getTime()) / ONE_DAY_MS;
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
): Promise<AnalyticsSummary> {
  const [
    summaryRows,
    serviceRows,
    queueTypeRows,
    occupationRows,
    genderRows,
    educationRows,
    officerRows,
    officerServiceRows,
    timeRows,
    dailyRows,
  ] =
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
            WHEN status = 'COMPLETED' AND startTime IS NOT NULL
              THEN TIMESTAMPDIFF(MINUTE, startTime, updatedAt)
            ELSE NULL
          END), 0)) AS averageServiceTimeMinutes,
          MAX(updatedAt) AS dataLastUpdatedAt
        FROM \`Queue\`
        WHERE queueDate >= ${startDate} AND queueDate < ${endDate}
      `),
      prisma.$queryRaw<Array<{ name: string; count: bigint | number }>>(Prisma.sql`
        SELECT s.name AS name, COUNT(q.id) AS count
        FROM \`Service\` s
        LEFT JOIN \`Queue\` q
          ON q.serviceId = s.id
          AND q.queueDate >= ${startDate}
          AND q.queueDate < ${endDate}
        WHERE s.status = ${ServiceStatus.ACTIVE}
        GROUP BY s.id, s.name
        ORDER BY count DESC, s.name ASC
      `),
      prisma.$queryRaw<Array<{ queueType: string; count: bigint | number }>>(Prisma.sql`
        SELECT 'OFFLINE' AS queueType, COUNT(*) AS count
        FROM \`Queue\`
        WHERE queueDate >= ${startDate} AND queueDate < ${endDate}
      `),
      prisma.$queryRaw<Array<{ name: string | null; count: bigint | number }>>(Prisma.sql`
        SELECT NULLIF(TRIM(v.occupation), '') AS name, COUNT(*) AS count
        FROM \`Queue\` q
        INNER JOIN \`Visitor\` v ON v.id = q.visitorId
        WHERE q.queueDate >= ${startDate} AND q.queueDate < ${endDate}
        GROUP BY NULLIF(TRIM(v.occupation), '')
        ORDER BY count DESC, name ASC
      `),
      prisma.$queryRaw<Array<{ gender: Gender | null; count: bigint | number }>>(Prisma.sql`
        SELECT v.gender AS gender, COUNT(*) AS count
        FROM \`Queue\` q
        INNER JOIN \`Visitor\` v ON v.id = q.visitorId
        WHERE q.queueDate >= ${startDate} AND q.queueDate < ${endDate}
        GROUP BY v.gender
        ORDER BY count DESC, gender ASC
      `),
      prisma.$queryRaw<Array<{ education: LastEducation | null; count: bigint | number }>>(Prisma.sql`
        SELECT v.lastEducation AS education, COUNT(*) AS count
        FROM \`Queue\` q
        INNER JOIN \`Visitor\` v ON v.id = q.visitorId
        WHERE q.queueDate >= ${startDate} AND q.queueDate < ${endDate}
        GROUP BY v.lastEducation
        ORDER BY count DESC, education ASC
      `),
      prisma.$queryRaw<
        Array<{
          officerId: string;
          officerName: string;
          completedCount: bigint | number;
          averageServiceTime: number | null;
          averageWaitTime: number | null;
        }>
      >(Prisma.sql`
        SELECT
          u.id AS officerId,
          u.name AS officerName,
          COUNT(*) AS completedCount,
          ROUND(COALESCE(AVG(CASE
            WHEN q.startTime IS NOT NULL
              THEN TIMESTAMPDIFF(MINUTE, q.startTime, q.updatedAt)
            ELSE NULL
          END), 0)) AS averageServiceTime,
          ROUND(COALESCE(AVG(CASE
            WHEN q.startTime IS NOT NULL
              THEN TIMESTAMPDIFF(MINUTE, q.createdAt, q.startTime)
            ELSE NULL
          END), 0)) AS averageWaitTime
        FROM \`Queue\` q
        INNER JOIN \`User\` u ON u.id = q.adminId
        WHERE q.queueDate >= ${startDate}
          AND q.queueDate < ${endDate}
          AND q.adminId IS NOT NULL
          AND q.status = 'COMPLETED'
        GROUP BY q.adminId, u.id, u.name
        ORDER BY completedCount DESC, officerName ASC
      `),
      prisma.$queryRaw<
        Array<{
          officerId: string;
          serviceName: string;
          count: bigint | number;
        }>
      >(Prisma.sql`
        SELECT
          q.adminId AS officerId,
          s.name AS serviceName,
          COUNT(*) AS count
        FROM \`Queue\` q
        INNER JOIN \`Service\` s ON s.id = q.serviceId
        WHERE q.queueDate >= ${startDate}
          AND q.queueDate < ${endDate}
          AND q.adminId IS NOT NULL
          AND q.status = 'COMPLETED'
        GROUP BY q.adminId, q.serviceId, s.name
        ORDER BY q.adminId ASC, count DESC, s.name ASC
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

  const selectedPeriod = {
    startDate: format(startDate, "yyyy-MM-dd"),
    endDate: toInclusiveEndDateLabel(endDate),
    totalDays: Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / ONE_DAY_MS)),
  };

  const totalVisitors = toNumber(summaryRow.totalVisitors);
  const completedServices = toNumber(summaryRow.completedServices);
  const canceledServices = toNumber(summaryRow.canceledServices);
  const dataLastUpdatedAt = summaryRow.dataLastUpdatedAt?.toISOString();
  const averageWaitTimeMinutes = toNumber(summaryRow.averageWaitTimeMinutes);
  const averageServiceTimeMinutes = toNumber(summaryRow.averageServiceTimeMinutes);

  const serviceDistributionTotal = serviceRows.reduce((total, row) => total + toNumber(row.count), 0);

  const serviceDistribution = serviceRows.map((row) => {
    const count = toNumber(row.count);
    return {
      name: row.name,
      count,
      percentage: toPercentage(count, serviceDistributionTotal),
    };
  });

  const queueTypeDistribution = queueTypeRows.map((row) => {
    const count = toNumber(row.count);
    return {
      name: row.queueType === "ONLINE" ? "Online" : "Offline",
      count,
      percentage: toPercentage(count, totalVisitors),
    };
  });

  const occupationDistribution = occupationRows.map((row) => {
    const count = toNumber(row.count);
    return {
      name: row.name?.trim() || EMPTY_CATEGORY_LABEL,
      count,
      percentage: toPercentage(count, totalVisitors),
    };
  });

  const genderDistribution = genderRows.map((row) => {
    const count = toNumber(row.count);
    return {
      name: row.gender ? genderLabels[row.gender] : EMPTY_CATEGORY_LABEL,
      count,
      percentage: toPercentage(count, totalVisitors),
    };
  });

  const educationDistribution = educationRows.map((row) => {
    const count = toNumber(row.count);
    return {
      name: row.education ? educationLabels[row.education] : EMPTY_CATEGORY_LABEL,
      count,
      percentage: toPercentage(count, totalVisitors),
    };
  });

  const officerServiceMap = new Map<string, Array<{ serviceName: string; count: number }>>();
  officerServiceRows.forEach((row) => {
    const list = officerServiceMap.get(row.officerId) ?? [];
    list.push({
      serviceName: row.serviceName,
      count: toNumber(row.count),
    });
    officerServiceMap.set(row.officerId, list);
  });

  const officerPerformance = officerRows.map((row) => ({
    officerId: row.officerId,
    officerName: row.officerName,
    completedCount: toNumber(row.completedCount),
    averageServiceTime: toNumber(row.averageServiceTime),
    averageWaitTime: toNumber(row.averageWaitTime),
  }));

  const officerDetails = officerRows.map((row) => {
    const totalHandled = toNumber(row.completedCount);
    const breakdown = (officerServiceMap.get(row.officerId) ?? [])
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return a.serviceName.localeCompare(b.serviceName);
      })
      .map<AnalyticsOfficerServiceFrequency>((item) => ({
        serviceName: item.serviceName,
        count: item.count,
        percentage: toPercentage(item.count, totalHandled),
      }));

    const topService = breakdown[0]
      ? {
          serviceName: breakdown[0].serviceName,
          count: breakdown[0].count,
          percentage: breakdown[0].percentage,
        }
      : null;

    return {
      officerId: row.officerId,
      officerName: row.officerName,
      totalHandled,
      averageWaitTime: toNumber(row.averageWaitTime),
      averageServiceTime: toNumber(row.averageServiceTime),
      serviceBreakdown: breakdown,
      topService,
    };
  });

  const onlineCount = queueTypeDistribution.find((item) => item.name === "Online")?.count ?? 0;
  const offlineCount = queueTypeDistribution.find((item) => item.name === "Offline")?.count ?? 0;
  const queueTypeTotal = onlineCount + offlineCount;

  const activeOfficerCount = officerPerformance.filter((item) => item.completedCount > 0).length;
  const mostPopularService = serviceDistribution.find((item) => item.count > 0) ?? null;
  const timeAnalysis = timeRows.map((row) => ({
    hourOfDay: toNumber(row.hourOfDay),
    count: toNumber(row.count),
  }));
  const dailyTrends = dailyRows.map((row) => ({
    date: format(new Date(row.date), "yyyy-MM-dd"),
    waiting: toNumber(row.waiting),
    completed: toNumber(row.completed),
    canceled: toNumber(row.canceled),
  }));

  const hash = hashPayload({
    range: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
    selectedPeriod,
    summary: {
      totalVisitors,
      completedServices,
      canceledServices,
      averageWaitTimeMinutes,
      averageServiceTimeMinutes,
    },
    serviceDistribution,
    queueTypeDistribution,
    occupationDistribution,
    genderDistribution,
    educationDistribution,
    officerPerformance,
    officerDetails,
    timeAnalysis,
    dailyTrends,
    dataLastUpdatedAt,
  });
  const hasChanges = !clientHash || clientHash !== hash;

  if (!hasChanges) {
    return {
      summary: {
        totalVisitors,
        completedServices,
        canceledServices,
        averageWaitTimeMinutes,
        averageServiceTimeMinutes,
      },
      serviceDistribution: [],
      queueTypeDistribution: [],
      occupationDistribution: [],
      genderDistribution: [],
      educationDistribution: [],
      officerPerformance: [],
      officerDetails: [],
      insights: {
        mostPopularService: null,
        mostActiveOfficer: null,
        onlineVsOffline: {
          online: 0,
          offline: 0,
          onlinePercentage: 0,
          offlinePercentage: 0,
        },
        averageServicesPerOfficer: 0,
      },
      selectedPeriod,
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
      averageWaitTimeMinutes,
      averageServiceTimeMinutes,
    },
    serviceDistribution,
    queueTypeDistribution,
    occupationDistribution,
    genderDistribution,
    educationDistribution,
    officerPerformance,
    officerDetails,
    insights: {
      mostPopularService: mostPopularService
        ? {
            serviceName: mostPopularService.name,
            count: mostPopularService.count,
            percentage: mostPopularService.percentage,
          }
        : null,
      mostActiveOfficer: officerPerformance[0]
        ? {
            officerId: officerPerformance[0].officerId,
            officerName: officerPerformance[0].officerName,
            completedCount: officerPerformance[0].completedCount,
          }
        : null,
      onlineVsOffline: {
        online: onlineCount,
        offline: offlineCount,
        onlinePercentage: toPercentage(onlineCount, queueTypeTotal),
        offlinePercentage: toPercentage(offlineCount, queueTypeTotal),
      },
      averageServicesPerOfficer:
        activeOfficerCount > 0 ? Number((completedServices / activeOfficerCount).toFixed(2)) : 0,
    },
    selectedPeriod,
    timeAnalysis,
    dailyTrends,
    dataLastUpdatedAt,
    hash,
    hasChanges,
  };
}
