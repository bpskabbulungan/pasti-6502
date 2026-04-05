import PDFDocument from "pdfkit";
import * as XLSX from "xlsx";
import prisma from "@api/infrastructure/database/prisma";
import { Prisma } from "@prisma/client";
import { formatDisplayDate, formatDisplayDateTimeWithSeconds } from "@/lib/date-format";
import { getAnalyticsSummary } from "./analytics-summary.service";
import type { AnalyticsExportRow, AnalyticsSummary } from "@shared/types/analytics";

type DateRange = {
  startDate: Date;
  endDate: Date;
};

type ExportFormat = "xlsx" | "pdf";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const MAX_ANALYTICS_EXPORT_ROWS = (() => {
  const parsed = Number.parseInt(process.env.ANALYTICS_EXPORT_MAX_ROWS ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10000;
})();

const EXPORT_DETAIL_COLUMNS: Array<{ key: keyof AnalyticsExportRow; label: string }> = [
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

const PDF_DETAIL_COLUMNS: Array<{
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

const toPeriodLabels = (range: DateRange) => ({
  startDateLabel: formatDisplayDate(range.startDate),
  endDateLabel: formatDisplayDate(new Date(range.endDate.getTime() - ONE_DAY_MS)),
});

const toOfficerDistributionLabel = (serviceBreakdown: AnalyticsSummary["officerDetails"][number]["serviceBreakdown"]) => {
  if (serviceBreakdown.length === 0) {
    return "-";
  }

  return serviceBreakdown.map((item) => `${item.serviceName}: ${item.count}`).join("; ");
};

const buildSummarySheetRows = (analytics: AnalyticsSummary, range: DateRange) => {
  const { startDateLabel, endDateLabel } = toPeriodLabels(range);

  return [
    ["Laporan", "Analitik Antrean"],
    ["Periode", `${startDateLabel} - ${endDateLabel}`],
    ["Diekspor", formatDisplayDateTimeWithSeconds(new Date())],
    ["", ""],
    ["Ringkasan Total", ""],
    ["Total Pengunjung", analytics.summary.totalVisitors],
    ["Layanan Selesai", analytics.summary.completedServices],
    ["Layanan Dibatalkan", analytics.summary.canceledServices],
    ["Rata-rata Waktu Tunggu (menit)", analytics.summary.averageWaitTimeMinutes],
    ["Rata-rata Durasi Layanan (menit)", analytics.summary.averageServiceTimeMinutes],
    ["", ""],
    ["Insight", ""],
    ["Layanan Paling Populer", analytics.insights.mostPopularService?.serviceName ?? "-"],
    ["Jumlah Layanan Populer", analytics.insights.mostPopularService?.count ?? 0],
    ["Petugas Paling Aktif", analytics.insights.mostActiveOfficer?.officerName ?? "-"],
    ["Jumlah Layanan Petugas Aktif", analytics.insights.mostActiveOfficer?.completedCount ?? 0],
    [
      "Perbandingan Online vs Offline",
      `${analytics.insights.onlineVsOffline.online} (${analytics.insights.onlineVsOffline.onlinePercentage}%) vs ${analytics.insights.onlineVsOffline.offline} (${analytics.insights.onlineVsOffline.offlinePercentage}%)`,
    ],
    ["Rata-rata Layanan per Petugas", analytics.insights.averageServicesPerOfficer],
  ];
};

const buildOfficerSheetRows = (analytics: AnalyticsSummary) => {
  const header = [
    "Nama Petugas",
    "Jumlah Layanan",
    "Top Service",
    "Frekuensi Layanan",
    "Rata-rata Waktu Tunggu (m)",
    "Rata-rata Durasi Layanan (m)",
  ];

  const rows = analytics.officerDetails.map((officer) => [
    officer.officerName,
    officer.totalHandled,
    officer.topService ? `${officer.topService.serviceName} (${officer.topService.count})` : "-",
    toOfficerDistributionLabel(officer.serviceBreakdown),
    officer.averageWaitTime,
    officer.averageServiceTime,
  ]);

  return [header, ...rows];
};

const buildPdfBuffer = async (
  rows: AnalyticsExportRow[],
  range: DateRange,
  analytics: AnalyticsSummary
) => {
  const doc = new PDFDocument({
    size: "A4",
    layout: "portrait",
    margin: 36,
  });

  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const { startDateLabel, endDateLabel } = toPeriodLabels(range);

  doc.fontSize(16).fillColor("#111827").text("Laporan Analitik Antrean");
  doc
    .fontSize(9)
    .fillColor("#6B7280")
    .text(`Periode: ${startDateLabel} - ${endDateLabel}`)
    .text(`Diekspor: ${formatDisplayDateTimeWithSeconds(new Date())}`)
    .moveDown(0.8);

  doc.font("Helvetica-Bold").fontSize(11).fillColor("#111827").text("Ringkasan Total");
  doc
    .font("Helvetica")
    .fontSize(10)
    .text(`Total pengunjung: ${analytics.summary.totalVisitors}`)
    .text(`Layanan selesai: ${analytics.summary.completedServices}`)
    .text(`Layanan dibatalkan: ${analytics.summary.canceledServices}`)
    .text(`Rata-rata waktu tunggu: ${analytics.summary.averageWaitTimeMinutes} menit`)
    .text(`Rata-rata durasi layanan: ${analytics.summary.averageServiceTimeMinutes} menit`)
    .moveDown(0.7);

  doc.font("Helvetica-Bold").fontSize(11).fillColor("#111827").text("Insight");
  doc
    .font("Helvetica")
    .fontSize(10)
    .text(
      `Layanan paling populer: ${analytics.insights.mostPopularService ? `${analytics.insights.mostPopularService.serviceName} (${analytics.insights.mostPopularService.count})` : "-"}`
    )
    .text(
      `Petugas paling aktif: ${analytics.insights.mostActiveOfficer ? `${analytics.insights.mostActiveOfficer.officerName} (${analytics.insights.mostActiveOfficer.completedCount})` : "-"}`
    )
    .text(
      `Perbandingan online vs offline: ${analytics.insights.onlineVsOffline.online} (${analytics.insights.onlineVsOffline.onlinePercentage}%) vs ${analytics.insights.onlineVsOffline.offline} (${analytics.insights.onlineVsOffline.offlinePercentage}%)`
    )
    .text(`Rata-rata layanan per petugas: ${analytics.insights.averageServicesPerOfficer}`)
    .moveDown(0.7);

  doc.font("Helvetica-Bold").fontSize(11).fillColor("#111827").text("Ringkasan Per Petugas");

  if (analytics.officerDetails.length === 0) {
    doc.font("Helvetica").fontSize(10).fillColor("#374151").text("Tidak ada data petugas.").moveDown(0.8);
  } else {
    analytics.officerDetails.forEach((officer, index) => {
      const topServiceLabel = officer.topService
        ? `${officer.topService.serviceName} (${officer.topService.count})`
        : "-";
      const frequencies = toOfficerDistributionLabel(officer.serviceBreakdown);

      doc
        .font("Helvetica")
        .fontSize(9.5)
        .fillColor("#111827")
        .text(
          `${index + 1}. ${officer.officerName} | Total: ${officer.totalHandled} | Top service: ${topServiceLabel}`
        )
        .fillColor("#4B5563")
        .text(`   Frekuensi: ${frequencies}`)
        .text(
          `   Rata-rata tunggu: ${officer.averageWaitTime} menit, rata-rata layanan: ${officer.averageServiceTime} menit`
        )
        .moveDown(0.2);
    });
  }

  if (rows.length > 0) {
    doc.addPage({ size: "A4", layout: "landscape", margin: 36 });

    doc.font("Helvetica-Bold").fontSize(11).fillColor("#111827").text("Lampiran Detail Antrean");
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#6B7280")
      .text(`Jumlah baris: ${rows.length}`)
      .moveDown(0.6);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const baseWidth = PDF_DETAIL_COLUMNS.reduce((sum, col) => sum + col.width, 0);
    const scale = baseWidth > pageWidth ? pageWidth / baseWidth : 1;
    const columns = PDF_DETAIL_COLUMNS.map((col) => ({
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
  }

  doc.end();
  return done;
};

export async function exportAnalytics(range: DateRange, exportFormat: ExportFormat) {
  if (
    Number.isNaN(range.startDate.getTime()) ||
    Number.isNaN(range.endDate.getTime()) ||
    range.endDate.getTime() <= range.startDate.getTime()
  ) {
    return {
      ok: false as const,
      status: 400,
      error: "Rentang tanggal export tidak valid",
    };
  }

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

  if (totalRows > MAX_ANALYTICS_EXPORT_ROWS) {
    return {
      ok: false as const,
      status: 413,
      error: `Jumlah data export melebihi batas (${MAX_ANALYTICS_EXPORT_ROWS} baris). Persempit rentang tanggal.`,
    };
  }

  const analyticsSummary = await getAnalyticsSummary(range.startDate, range.endDate);

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

  const detailRows = await collectRows();

  if (exportFormat === "xlsx") {
    const workbook = XLSX.utils.book_new();

    const summaryWorksheet = XLSX.utils.aoa_to_sheet(buildSummarySheetRows(analyticsSummary, range));
    const officerWorksheet = XLSX.utils.aoa_to_sheet(buildOfficerSheetRows(analyticsSummary));

    const detailHeader = EXPORT_DETAIL_COLUMNS.map((column) => column.label);
    const detailDataRows = detailRows.map((row) =>
      EXPORT_DETAIL_COLUMNS.map((column) => {
        const value = row[column.key];
        return value === null || value === undefined ? "" : value;
      })
    );
    const detailWorksheet = XLSX.utils.aoa_to_sheet([detailHeader, ...detailDataRows]);

    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Ringkasan");
    XLSX.utils.book_append_sheet(workbook, officerWorksheet, "Per Petugas");
    XLSX.utils.book_append_sheet(workbook, detailWorksheet, "Detail Antrean");

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

  const body = await buildPdfBuffer(detailRows, range, analyticsSummary);
  return {
    ok: true as const,
    format: "pdf" as const,
    body,
    headers: {
      "Content-Type": "application/pdf",
    },
  };
}
