import ExcelJS from "exceljs";
import prisma from "@api/infrastructure/database/prisma";
import { Prisma } from "@prisma/client";
import { formatDisplayDate, formatDisplayDateTimeWithSeconds } from "@/lib/date-format";
import { getAnalyticsSummary } from "./analytics-summary.service";
import type { AnalyticsExportRow, AnalyticsSummary } from "@shared/types/analytics";

type DateRange = {
  startDate: Date;
  endDate: Date;
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const MAX_ANALYTICS_EXPORT_ROWS = (() => {
  const parsed = Number.parseInt(process.env.ANALYTICS_EXPORT_MAX_ROWS ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10000;
})();

const EXPORT_DETAIL_COLUMNS: Array<{ key: keyof AnalyticsExportRow; label: string; width: number }> = [
  { key: "queueNumber", label: "Nomor Antrean", width: 14 },
  { key: "serviceType", label: "Layanan", width: 28 },
  { key: "visitorName", label: "Nama Pengunjung", width: 28 },
  { key: "phoneNumber", label: "Telepon", width: 16 },
  { key: "createdAt", label: "Waktu Dibuat", width: 22 },
  { key: "startTime", label: "Mulai Layanan", width: 22 },
  { key: "endTime", label: "Selesai Layanan", width: 22 },
  { key: "status", label: "Status", width: 14 },
  { key: "servedBy", label: "Petugas", width: 22 },
  { key: "waitTimeMinutes", label: "Tunggu (menit)", width: 14 },
  { key: "serviceTimeMinutes", label: "Durasi Layanan (menit)", width: 18 },
];

// ── ExcelJS style constants ──────────────────────────────────────────────────
const NAVY_ARGB = "FF1E3A5F";
const HEADER_BG_ARGB = "FF2B4C7E";
const SECTION_BG_ARGB = "FFE8EDF5";
const ZEBRA_BG_ARGB = "FFF7F9FC";
const WHITE_ARGB = "FFFFFFFF";
const MUTED_TEXT_ARGB = "FF607189";

const headerFill: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_BG_ARGB } };
const sectionFill: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: SECTION_BG_ARGB } };
const zebraFill: ExcelJS.Fill = { type: "pattern", pattern: "solid", fgColor: { argb: ZEBRA_BG_ARGB } };
const headerFont: Partial<ExcelJS.Font> = { bold: true, color: { argb: WHITE_ARGB }, size: 10 };
const sectionFont: Partial<ExcelJS.Font> = { bold: true, color: { argb: NAVY_ARGB }, size: 10 };
const labelFont: Partial<ExcelJS.Font> = { bold: true, color: { argb: NAVY_ARGB }, size: 10 };

// ── Excel formatting helpers ─────────────────────────────────────────────────

const toPeriodLabels = (range: DateRange) => ({
  startDateLabel: formatDisplayDate(range.startDate),
  endDateLabel: formatDisplayDate(new Date(range.endDate.getTime() - ONE_DAY_MS)),
});

const toPeriodLabel = (range: DateRange): string => {
  const { startDateLabel, endDateLabel } = toPeriodLabels(range);
  return `${startDateLabel} – ${endDateLabel}`;
};

const formatDuration = (minutes: number | null | undefined): string => {
  if (minutes === null || minutes === undefined || Number.isNaN(minutes) || minutes < 0) return "-";
  const rounded = Math.round(minutes);
  if (rounded === 0) return "0 menit";
  if (rounded < 60) return `${rounded} menit`;
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  return m > 0 ? `${h} jam ${m} menit` : `${h} jam`;
};

const toOfficerFrequencyLabel = (serviceBreakdown: AnalyticsSummary["officerDetails"][number]["serviceBreakdown"]): string => {
  if (serviceBreakdown.length === 0) return "-";
  return serviceBreakdown.map((item) => `${item.serviceName}: ${item.count}`).join("; ");
};

const styleTableHeader = (row: ExcelJS.Row, colCount: number) => {
  for (let c = 1; c <= colCount; c++) {
    const cell = row.getCell(c);
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { horizontal: "left", vertical: "middle" };
  }
  row.height = 22;
};

const addSectionHeader = (ws: ExcelJS.Worksheet, title: string, colCount: number) => {
  const row = ws.addRow([title]);
  const cell = row.getCell(1);
  cell.fill = sectionFill;
  cell.font = sectionFont;
  cell.alignment = { horizontal: "left", vertical: "middle" };
  ws.mergeCells(row.number, 1, row.number, colCount);
  row.height = 20;
};

const addSheetTitle = (ws: ExcelJS.Worksheet, title: string, subtitle: string, colCount: number) => {
  const titleRow = ws.addRow([title]);
  const titleCell = titleRow.getCell(1);
  titleCell.font = { bold: true, size: 14, color: { argb: NAVY_ARGB } };
  titleCell.alignment = { horizontal: "left", vertical: "middle" };
  ws.mergeCells(titleRow.number, 1, titleRow.number, colCount);
  titleRow.height = 30;

  if (subtitle) {
    const subtitleRow = ws.addRow([subtitle]);
    const subtitleCell = subtitleRow.getCell(1);
    subtitleCell.font = { size: 10, color: { argb: MUTED_TEXT_ARGB } };
    ws.mergeCells(subtitleRow.number, 1, subtitleRow.number, colCount);
    subtitleRow.height = 18;
  }
};

const applyZebra = (row: ExcelJS.Row, index: number, colCount: number) => {
  if (index % 2 === 1) {
    for (let c = 1; c <= colCount; c++) {
      row.getCell(c).fill = zebraFill;
    }
  }
};

const addEmptySheetRow = (ws: ExcelJS.Worksheet, colCount: number) => {
  const row = ws.addRow([]);
  row.height = 8;
  ws.mergeCells(row.number, 1, row.number, colCount);
};

// ── Sheet builders ───────────────────────────────────────────────────────────

const buildRingkasanSheet = (ws: ExcelJS.Worksheet, analytics: AnalyticsSummary, range: DateRange) => {
  const colCount = 4;
  ws.columns = [{ width: 36 }, { width: 24 }, { width: 18 }, { width: 18 }];

  addSheetTitle(ws, "Laporan Analitik Antrean", "Rekap Kinerja Pelayanan Antrean", colCount);
  addEmptySheetRow(ws, colCount);

  // Info block
  const periodeRow = ws.addRow(["Periode", toPeriodLabel(range)]);
  periodeRow.getCell(1).font = labelFont;
  periodeRow.getCell(2).font = { size: 10 };
  periodeRow.height = 18;

  const exportRow = ws.addRow(["Tanggal Export", formatDisplayDateTimeWithSeconds(new Date())]);
  exportRow.getCell(1).font = labelFont;
  exportRow.getCell(2).font = { size: 10 };
  exportRow.height = 18;

  addEmptySheetRow(ws, colCount);
  addSectionHeader(ws, "RINGKASAN TOTAL", colCount);

  const summaryItems: [string, string | number][] = [
    ["Total Pengunjung", analytics.summary.totalVisitors],
    ["Layanan Selesai", analytics.summary.completedServices],
    ["Layanan Dibatalkan", analytics.summary.canceledServices],
    ["Rata-rata Waktu Tunggu", formatDuration(analytics.summary.averageWaitTimeMinutes)],
    ["Rata-rata Durasi Layanan", formatDuration(analytics.summary.averageServiceTimeMinutes)],
  ];

  summaryItems.forEach(([label, value], i) => {
    const row = ws.addRow([label, value]);
    row.height = 18;
    if (i % 2 === 1) {
      for (let c = 1; c <= colCount; c++) {
        row.getCell(c).fill = zebraFill;
      }
    }
    row.getCell(1).font = labelFont;
  });

  addEmptySheetRow(ws, colCount);
  addSectionHeader(ws, "INSIGHT", colCount);

  const popularService = analytics.insights.mostPopularService;
  const activeOfficer = analytics.insights.mostActiveOfficer;

  const insightItems: [string, string | number, string?, string?][] = [
    [
      "Layanan Paling Populer",
      popularService?.serviceName ?? "-",
      popularService ? `${popularService.count} antrean` : "",
      popularService ? `${popularService.percentage.toFixed(1)}%` : "",
    ],
    [
      "Petugas Paling Aktif",
      activeOfficer?.officerName ?? "-",
      activeOfficer ? `${activeOfficer.completedCount} layanan selesai` : "",
    ],
    ["Rata-rata Layanan/Petugas", analytics.insights.averageServicesPerOfficer.toFixed(2)],
  ];

  insightItems.forEach(([label, ...values], i) => {
    const row = ws.addRow([label, ...values]);
    row.height = 18;
    if (i % 2 === 1) {
      for (let c = 1; c <= colCount; c++) {
        row.getCell(c).fill = zebraFill;
      }
    }
    row.getCell(1).font = labelFont;
  });

  addEmptySheetRow(ws, colCount);
  addSectionHeader(ws, "KANAL ANTREAN", colCount);

  const channelHeaderRow = ws.addRow(["Kanal", "Jumlah", "Persentase"]);
  styleTableHeader(channelHeaderRow, 3);

  if (analytics.queueTypeDistribution.length === 0) {
    const emptyRow = ws.addRow(["Tidak ada data kanal antrean untuk periode ini"]);
    ws.mergeCells(emptyRow.number, 1, emptyRow.number, colCount);
    emptyRow.getCell(1).font = { italic: true, color: { argb: MUTED_TEXT_ARGB }, size: 10 };
    emptyRow.getCell(1).alignment = { horizontal: "center" };
  } else {
    analytics.queueTypeDistribution.forEach((item, i) => {
      const row = ws.addRow([item.name, item.count, `${item.percentage.toFixed(1)}%`]);
      applyZebra(row, i, 3);
      row.height = 17;
      row.getCell(2).alignment = { horizontal: "right" };
      row.getCell(3).alignment = { horizontal: "right" };
    });

    const totalCount = analytics.queueTypeDistribution.reduce((s, item) => s + item.count, 0);
    const totalRow = ws.addRow(["TOTAL", totalCount, "100%"]);
    totalRow.height = 20;
    for (let c = 1; c <= 3; c++) {
      totalRow.getCell(c).fill = sectionFill;
      totalRow.getCell(c).font = sectionFont;
      totalRow.getCell(c).alignment = c === 1 ? { horizontal: "left" } : { horizontal: "right" };
    }
  }
};

const buildPerPetugasSheet = (ws: ExcelJS.Worksheet, analytics: AnalyticsSummary, range: DateRange) => {
  const colCount = 6;
  ws.columns = [
    { width: 30 }, { width: 14 }, { width: 30 }, { width: 40 }, { width: 20 }, { width: 20 },
  ];

  addSheetTitle(ws, "Per Petugas", `Periode: ${toPeriodLabel(range)}`, colCount);
  addEmptySheetRow(ws, colCount);

  const headerRow = ws.addRow([
    "Nama Petugas", "Total Layanan", "Top Service", "Frekuensi Layanan",
    "Rata-rata Tunggu", "Rata-rata Layanan",
  ]);
  styleTableHeader(headerRow, colCount);

  if (analytics.officerDetails.length === 0) {
    const emptyRow = ws.addRow(["Tidak ada data petugas untuk periode ini"]);
    ws.mergeCells(emptyRow.number, 1, emptyRow.number, colCount);
    emptyRow.getCell(1).font = { italic: true, color: { argb: MUTED_TEXT_ARGB }, size: 10 };
    emptyRow.getCell(1).alignment = { horizontal: "center" };
    return;
  }

  analytics.officerDetails.forEach((officer, i) => {
    const row = ws.addRow([
      officer.officerName,
      officer.totalHandled,
      officer.topService ? `${officer.topService.serviceName} (${officer.topService.count})` : "-",
      toOfficerFrequencyLabel(officer.serviceBreakdown),
      formatDuration(officer.averageWaitTime),
      formatDuration(officer.averageServiceTime),
    ]);
    applyZebra(row, i, colCount);
    row.height = 17;
    row.getCell(2).alignment = { horizontal: "right" };
    row.getCell(4).alignment = { wrapText: true };
  });
};

const buildTrenHarianSheet = (ws: ExcelJS.Worksheet, analytics: AnalyticsSummary, range: DateRange) => {
  const colCount = 5;
  ws.columns = [{ width: 20 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 }];

  addSheetTitle(ws, "Tren Harian", `Periode: ${toPeriodLabel(range)}`, colCount);
  addEmptySheetRow(ws, colCount);

  const headerRow = ws.addRow(["Tanggal", "Waiting", "Selesai", "Dibatalkan", "Total Harian"]);
  styleTableHeader(headerRow, colCount);

  if (analytics.dailyTrends.length === 0) {
    const emptyRow = ws.addRow(["Tidak ada data tren harian untuk periode ini"]);
    ws.mergeCells(emptyRow.number, 1, emptyRow.number, colCount);
    emptyRow.getCell(1).font = { italic: true, color: { argb: MUTED_TEXT_ARGB }, size: 10 };
    emptyRow.getCell(1).alignment = { horizontal: "center" };
    return;
  }

  let totalWaiting = 0;
  let totalCompleted = 0;
  let totalCanceled = 0;

  analytics.dailyTrends.forEach((item, i) => {
    totalWaiting += item.waiting;
    totalCompleted += item.completed;
    totalCanceled += item.canceled;
    const dailyTotal = item.waiting + item.completed + item.canceled;
    const row = ws.addRow([item.date, item.waiting, item.completed, item.canceled, dailyTotal]);
    applyZebra(row, i, colCount);
    row.height = 17;
    for (let c = 2; c <= colCount; c++) {
      row.getCell(c).alignment = { horizontal: "right" };
    }
  });

  const grandTotal = totalWaiting + totalCompleted + totalCanceled;
  const totalRow = ws.addRow(["TOTAL", totalWaiting, totalCompleted, totalCanceled, grandTotal]);
  totalRow.height = 20;
  for (let c = 1; c <= colCount; c++) {
    totalRow.getCell(c).fill = sectionFill;
    totalRow.getCell(c).font = sectionFont;
    totalRow.getCell(c).alignment = c === 1 ? { horizontal: "left" } : { horizontal: "right" };
  }
};

const buildDistribusiLayananSheet = (ws: ExcelJS.Worksheet, analytics: AnalyticsSummary, range: DateRange) => {
  const colCount = 3;
  ws.columns = [{ width: 35 }, { width: 14 }, { width: 14 }];

  addSheetTitle(ws, "Distribusi Layanan", `Periode: ${toPeriodLabel(range)}`, colCount);
  addEmptySheetRow(ws, colCount);

  const headerRow = ws.addRow(["Jenis Layanan", "Jumlah", "Persentase"]);
  styleTableHeader(headerRow, colCount);

  if (analytics.serviceDistribution.length === 0) {
    const emptyRow = ws.addRow(["Tidak ada data distribusi layanan untuk periode ini"]);
    ws.mergeCells(emptyRow.number, 1, emptyRow.number, colCount);
    emptyRow.getCell(1).font = { italic: true, color: { argb: MUTED_TEXT_ARGB }, size: 10 };
    emptyRow.getCell(1).alignment = { horizontal: "center" };
    return;
  }

  analytics.serviceDistribution.forEach((item, i) => {
    const row = ws.addRow([item.name, item.count, `${item.percentage.toFixed(1)}%`]);
    applyZebra(row, i, colCount);
    row.height = 17;
    row.getCell(2).alignment = { horizontal: "right" };
    row.getCell(3).alignment = { horizontal: "right" };
  });

  const totalCount = analytics.serviceDistribution.reduce((s, item) => s + item.count, 0);
  const totalRow = ws.addRow(["TOTAL", totalCount, "100%"]);
  totalRow.height = 20;
  for (let c = 1; c <= colCount; c++) {
    totalRow.getCell(c).fill = sectionFill;
    totalRow.getCell(c).font = sectionFont;
    totalRow.getCell(c).alignment = c === 1 ? { horizontal: "left" } : { horizontal: "right" };
  }
};

const buildKanalAntreanSheet = (ws: ExcelJS.Worksheet, analytics: AnalyticsSummary, range: DateRange) => {
  const colCount = 3;
  ws.columns = [{ width: 35 }, { width: 14 }, { width: 14 }];

  addSheetTitle(ws, "Kanal Antrean", `Periode: ${toPeriodLabel(range)}`, colCount);
  addEmptySheetRow(ws, colCount);

  const headerRow = ws.addRow(["Kanal Antrean", "Jumlah", "Persentase"]);
  styleTableHeader(headerRow, colCount);

  if (analytics.queueTypeDistribution.length === 0) {
    const emptyRow = ws.addRow(["Tidak ada data kanal antrean untuk periode ini"]);
    ws.mergeCells(emptyRow.number, 1, emptyRow.number, colCount);
    emptyRow.getCell(1).font = { italic: true, color: { argb: MUTED_TEXT_ARGB }, size: 10 };
    emptyRow.getCell(1).alignment = { horizontal: "center" };
    return;
  }

  analytics.queueTypeDistribution.forEach((item, i) => {
    const row = ws.addRow([item.name, item.count, `${item.percentage.toFixed(1)}%`]);
    applyZebra(row, i, colCount);
    row.height = 17;
    row.getCell(2).alignment = { horizontal: "right" };
    row.getCell(3).alignment = { horizontal: "right" };
  });

  const totalCount = analytics.queueTypeDistribution.reduce((s, item) => s + item.count, 0);
  const totalRow = ws.addRow(["TOTAL", totalCount, "100%"]);
  totalRow.height = 20;
  for (let c = 1; c <= colCount; c++) {
    totalRow.getCell(c).fill = sectionFill;
    totalRow.getCell(c).font = sectionFont;
    totalRow.getCell(c).alignment = c === 1 ? { horizontal: "left" } : { horizontal: "right" };
  }
};

const buildDetailAntreanSheet = (ws: ExcelJS.Worksheet, rows: AnalyticsExportRow[], range: DateRange) => {
  const colCount = EXPORT_DETAIL_COLUMNS.length;
  ws.columns = EXPORT_DETAIL_COLUMNS.map((col) => ({ width: col.width }));

  addSheetTitle(
    ws,
    "Detail Antrean",
    `Periode: ${toPeriodLabel(range)} — Total ${rows.length} baris`,
    colCount
  );
  addEmptySheetRow(ws, colCount);

  const headerRow = ws.addRow(EXPORT_DETAIL_COLUMNS.map((col) => col.label));
  styleTableHeader(headerRow, colCount);

  rows.forEach((row, i) => {
    const values = EXPORT_DETAIL_COLUMNS.map((col) => {
      const value = row[col.key];
      return value === null || value === undefined ? "" : value;
    });
    const excelRow = ws.addRow(values);
    applyZebra(excelRow, i, colCount);
    excelRow.height = 17;
  });
};

const buildExcelBuffer = async (
  rows: AnalyticsExportRow[],
  range: DateRange,
  analytics: AnalyticsSummary
) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "PASTI – Sistem Manajemen Antrean";
  workbook.created = new Date();

  buildRingkasanSheet(workbook.addWorksheet("Ringkasan"), analytics, range);
  buildPerPetugasSheet(workbook.addWorksheet("Per Petugas"), analytics, range);
  buildTrenHarianSheet(workbook.addWorksheet("Tren Harian"), analytics, range);
  buildDistribusiLayananSheet(workbook.addWorksheet("Distribusi Layanan"), analytics, range);
  buildKanalAntreanSheet(workbook.addWorksheet("Kanal Antrean"), analytics, range);
  buildDetailAntreanSheet(workbook.addWorksheet("Detail Antrean"), rows, range);

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
};

export async function exportAnalytics(range: DateRange) {
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
    endTime:
      queue.status === "COMPLETED"
        ? formatDisplayDateTimeWithSeconds(new Date(queue.updatedAt))
        : "",
    status: queue.status,
    servedBy: queue.admin ? queue.admin.name : "",
    waitTimeMinutes: queue.startTime
      ? Math.round(
          (new Date(queue.startTime).getTime() - new Date(queue.createdAt).getTime()) / (1000 * 60)
        )
      : "",
    serviceTimeMinutes:
      queue.status === "COMPLETED" && queue.startTime
        ? Math.round(
            (new Date(queue.updatedAt).getTime() - new Date(queue.startTime).getTime()) / (1000 * 60)
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
  const body = await buildExcelBuffer(detailRows, range, analyticsSummary);

  return {
    ok: true as const,
    format: "xlsx" as const,
    body,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  };
}
