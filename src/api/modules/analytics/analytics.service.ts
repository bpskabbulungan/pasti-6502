import { createHash } from "crypto";
import { format } from "date-fns";
import PDFDocument from "pdfkit";
import * as XLSX from "xlsx";
import prisma from "@api/infrastructure/database/prisma";
import { QueueStatus, Prisma } from "@prisma/client";
import { formatDisplayDate, formatDisplayDateTimeWithSeconds } from "@/lib/date-format";
import type { AnalyticsExportRow } from "@shared/types/analytics";

type DateRange = {
  startDate: Date;
  endDate: Date;
};

const hashPayload = (payload: unknown) =>
  createHash("sha256").update(JSON.stringify(payload)).digest("hex");

const parseDateRange = (
  startDateParam: string,
  endDateParam: string,
  maxRangeDays: number
): { ok: true; range: DateRange } | { ok: false; status: number; error: string } => {
  const startDate = new Date(startDateParam);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(endDateParam);
  endDate.setHours(0, 0, 0, 0);
  endDate.setDate(endDate.getDate() + 1);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return {
      ok: false,
      status: 400,
      error: "Tanggal tidak valid, gunakan format YYYY-MM-DD",
    };
  }

  const diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
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

type ExportFormat = "xlsx" | "pdf";

const EXPORT_COLUMNS: Array<{ key: keyof AnalyticsExportRow; label: string }> = [
  { key: "queueNumber", label: "Nomor Antrean" },
  { key: "serviceType", label: "Layanan" },
  { key: "visitorName", label: "Nama Pengunjung" },
  { key: "phoneNumber", label: "Telepon" },
  { key: "createdAt", label: "Waktu Dibuat" },
  { key: "startTime", label: "Mulai Layanan" },
  { key: "endTime", label: "Selesai Layanan" },
  { key: "status", label: "Status" },
  { key: "servedBy", label: "Petugas" },
  { key: "waitTimeMinutes", label: "Waktu Tunggu (m)" },
  { key: "serviceTimeMinutes", label: "Durasi Layanan (m)" },
];

const PDF_COLUMNS: Array<{
  key: keyof AnalyticsExportRow;
  label: string;
  width: number;
  align?: "left" | "right";
}> = [
  { key: "queueNumber", label: "No", width: 30, align: "right" },
  { key: "serviceType", label: "Layanan", width: 80 },
  { key: "visitorName", label: "Pengunjung", width: 90 },
  { key: "phoneNumber", label: "Telepon", width: 70 },
  { key: "createdAt", label: "Dibuat", width: 70 },
  { key: "startTime", label: "Mulai", width: 70 },
  { key: "endTime", label: "Selesai", width: 70 },
  { key: "status", label: "Status", width: 55 },
  { key: "servedBy", label: "Petugas", width: 70 },
  { key: "waitTimeMinutes", label: "Tunggu", width: 55, align: "right" },
  { key: "serviceTimeMinutes", label: "Layanan", width: 55, align: "right" },
];

const buildPdfBuffer = async (rows: AnalyticsExportRow[], range: DateRange) => {
  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margin: 36,
  });
  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const startLabel = formatDisplayDate(range.startDate);
  const endLabel = formatDisplayDate(new Date(range.endDate.getTime() - 24 * 60 * 60 * 1000));

  doc.fontSize(16).fillColor("#111827").text("Laporan Analitik Antrean");
  doc
    .fontSize(9)
    .fillColor("#6B7280")
    .text(`Periode: ${startLabel} - ${endLabel}`)
    .text(`Diekspor: ${formatDisplayDateTimeWithSeconds(new Date())}`);
  doc.moveDown(0.8);

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const baseWidth = PDF_COLUMNS.reduce((sum, col) => sum + col.width, 0);
  const scale = baseWidth > pageWidth ? pageWidth / baseWidth : 1;
  const columns = PDF_COLUMNS.map((col) => ({
    ...col,
    width: Math.floor(col.width * scale),
  }));

  const rowHeight = 18;
  const startX = doc.page.margins.left;
  let y = doc.y;

  const drawHeader = () => {
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#111827");
    let x = startX;
    columns.forEach((col) => {
      doc.text(col.label, x, y + 3, {
        width: col.width - 4,
        align: col.align ?? "left",
        ellipsis: true,
      });
      x += col.width;
    });
    y += rowHeight;
    doc
      .moveTo(startX, y - 2)
      .lineTo(startX + pageWidth, y - 2)
      .strokeColor("#E5E7EB")
      .stroke();
    doc.font("Helvetica").fontSize(8).fillColor("#111827");
  };

  const ensureSpace = () => {
    if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage({ size: "A4", layout: "landscape", margin: 36 });
      y = doc.page.margins.top;
      drawHeader();
    }
  };

  drawHeader();

  rows.forEach((row) => {
    ensureSpace();
    let x = startX;
    columns.forEach((col) => {
      const value = row[col.key];
      const text = value === null || value === undefined ? "" : String(value);
      doc.text(text, x, y + 3, {
        width: col.width - 4,
        align: col.align ?? "left",
        ellipsis: true,
      });
      x += col.width;
    });
    y += rowHeight;
  });

  doc.end();
  return done;
};

export async function exportAnalytics(range: DateRange, exportFormat: ExportFormat) {
  const queueWithRelations = {
    include: {
      visitor: true,
      service: true,
      admin: true,
    },
  } satisfies Prisma.QueueFindManyArgs;

  type QueueWithRelations = Prisma.QueueGetPayload<typeof queueWithRelations>;

  const totalRows = await prisma.queue.count({
    where: {
      queueDate: {
        gte: range.startDate,
        lt: range.endDate,
      },
    },
  });

  if (totalRows === 0) {
    return {
      ok: false as const,
      status: 404,
      error: "No data to export for the selected date range",
    };
  }

  const makeRow = (queue: QueueWithRelations): AnalyticsExportRow => ({
    queueNumber: queue.queueNumber,
    serviceType: queue.service.name,
    visitorName: queue.visitor.name,
    phoneNumber: queue.visitor.phone,
    createdAt: formatDisplayDateTimeWithSeconds(new Date(queue.createdAt)),
    startTime: queue.startTime ? formatDisplayDateTimeWithSeconds(new Date(queue.startTime)) : "",
    endTime: queue.endTime ? formatDisplayDateTimeWithSeconds(new Date(queue.endTime)) : "",
    status: queue.status,
    servedBy: queue.admin ? queue.admin.name : "",
    waitTimeMinutes: queue.startTime
      ? Math.round(
          (new Date(queue.startTime).getTime() - new Date(queue.createdAt).getTime()) / (1000 * 60)
        )
      : "",
    serviceTimeMinutes:
      queue.startTime && queue.endTime
        ? Math.round(
            (new Date(queue.endTime).getTime() - new Date(queue.startTime).getTime()) / (1000 * 60)
          )
        : "",
  });

  const pageSize = 500;

  async function* fetchQueueBatches() {
    let cursor: { id: string } | undefined = undefined;
    let hasMore = true;
    while (hasMore) {
      const batch: QueueWithRelations[] = await prisma.queue.findMany({
        ...queueWithRelations,
        where: {
          queueDate: {
            gte: range.startDate,
            lt: range.endDate,
          },
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: pageSize,
        cursor: cursor ? { id: cursor.id } : undefined,
        skip: cursor ? 1 : 0,
      });

      if (batch.length === 0) {
        break;
      }

      yield batch.map(makeRow);

      if (batch.length < pageSize) {
        hasMore = false;
        continue;
      }

      cursor = { id: batch[batch.length - 1].id };
    }
  }

  const collectRows = async () => {
    const rows: AnalyticsExportRow[] = [];
    for await (const batch of fetchQueueBatches()) {
      rows.push(...batch);
    }
    return rows;
  };

  if (exportFormat === "xlsx") {
    const rows = await collectRows();
    const headerRow = EXPORT_COLUMNS.map((column) => column.label);
    const dataRows = rows.map((row) =>
      EXPORT_COLUMNS.map((column) => {
        const value = row[column.key];
        return value === null || value === undefined ? "" : value;
      })
    );
    const worksheet = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Analytics");
    const body = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    return {
      ok: true as const,
      format: "xlsx" as const,
      body,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    };
  }

  const rows = await collectRows();
  const body = await buildPdfBuffer(rows, range);
  return {
    ok: true as const,
    format: "pdf" as const,
    body,
    headers: {
      "Content-Type": "application/pdf",
    },
  };
}

export { parseDateRange };
