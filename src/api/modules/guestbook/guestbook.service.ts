import { createHash } from "crypto";
import { Purpose, QueueStatus, Prisma } from "@prisma/client";
import PDFDocument from "pdfkit";
import * as XLSX from "xlsx";
import { formatDisplayDateTimeWithSeconds } from "@/lib/date-format";
import prisma from "@api/infrastructure/database/prisma";
import type { GuestbookEntry, GuestbookListResponse } from "@shared/types/guestbook";
import { formatGuestQueueCode } from "@shared/utils/guest-queue-code";

type DateFilter = "today" | "all";
type ExportFormat = "xlsx" | "pdf";

type GuestbookListParams = {
  status?: string | null;
  purpose?: string | null;
  dateFilter?: DateFilter;
  search?: string | null;
  limit?: string | null;
  offset?: string | null;
  clientHash?: string | null;
};

type GuestbookExportParams = {
  status?: string | null;
  purpose?: string | null;
  dateFilter?: DateFilter;
  search?: string | null;
  format: ExportFormat;
};

type GuestbookExportRow = {
  pengunjung: string;
  keperluan: string;
  layanan: string;
  antrean: string;
  petugas: string;
  skd: string;
  waktu: string;
};

const ALLOWED_STATUSES: QueueStatus[] = [QueueStatus.SERVING, QueueStatus.COMPLETED];

const statusLabels: Record<QueueStatus, string> = {
  WAITING: "Menunggu",
  SERVING: "Sedang Dilayani",
  COMPLETED: "Selesai",
  CANCELED: "Dibatalkan",
};

const purposeLabels: Record<Purpose, string> = {
  KONSULTASI_STATISTIK: "Konsultasi Statistik",
  PERPUSTAKAAN: "Perpustakaan",
  REKOMENDASI_STATISTIK: "Rekomendasi Statistik",
  LAINNYA: "Lainnya",
};

const EXPORT_COLUMNS: Array<{ key: keyof GuestbookExportRow; label: string }> = [
  { key: "pengunjung", label: "Pengunjung" },
  { key: "keperluan", label: "Keperluan" },
  { key: "layanan", label: "Layanan" },
  { key: "antrean", label: "Antrean" },
  { key: "petugas", label: "Petugas" },
  { key: "skd", label: "SKD" },
  { key: "waktu", label: "Waktu" },
];

const PDF_COLUMNS: Array<{
  key: keyof GuestbookExportRow;
  label: string;
  width: number;
}> = [
  { key: "pengunjung", label: "Pengunjung", width: 110 },
  { key: "keperluan", label: "Keperluan", width: 110 },
  { key: "layanan", label: "Layanan", width: 100 },
  { key: "antrean", label: "Antrean", width: 95 },
  { key: "petugas", label: "Petugas", width: 105 },
  { key: "skd", label: "SKD", width: 55 },
  { key: "waktu", label: "Waktu", width: 120 },
];

const hashPayload = (payload: unknown) =>
  createHash("sha256").update(JSON.stringify(payload)).digest("hex");

const guestbookQueueWithRelations = {
  include: {
    guest: true,
    service: { select: { name: true } },
    admin: { select: { name: true } },
    dutyStaff: { select: { name: true } },
  },
} satisfies Prisma.QueueFindManyArgs;

type GuestbookQueueWithRelations = Prisma.QueueGetPayload<typeof guestbookQueueWithRelations>;

const sanitizeLimit = (limitParam?: string | null) => {
  if (limitParam === null || typeof limitParam === "undefined") return undefined;
  const parsed = Number.parseInt(limitParam, 10);
  if (Number.isNaN(parsed)) return undefined;
  return Math.min(Math.max(parsed, 1), 500);
};

const sanitizeOffset = (offsetParam?: string | null) => {
  if (offsetParam === null || typeof offsetParam === "undefined") return undefined;
  const parsed = Number.parseInt(offsetParam, 10);
  if (Number.isNaN(parsed)) return undefined;
  return Math.max(parsed, 0);
};

const parseStatus = (value?: string | null) => {
  if (!value || value === "ALL") return null;
  const normalized = value.toUpperCase();
  return ALLOWED_STATUSES.includes(normalized as QueueStatus) ? (normalized as QueueStatus) : null;
};

const parsePurpose = (value?: string | null) => {
  if (!value || value === "ALL") return null;
  const normalized = value.toUpperCase();
  return Object.values(Purpose).includes(normalized as Purpose) ? (normalized as Purpose) : null;
};

const buildGuestbookBaseWhere = ({
  purpose,
  dateFilter,
  search,
}: Pick<GuestbookListParams, "purpose" | "dateFilter" | "search">) => {
  const normalizedPurpose = parsePurpose(purpose);
  const searchTerm = search?.trim() ?? "";

  const baseWhere: Prisma.QueueWhereInput = {
    guestId: { not: null },
    status: { in: ALLOWED_STATUSES },
  };

  if (dateFilter === "today") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    baseWhere.queueDate = { gte: today, lt: tomorrow };
  }

  if (normalizedPurpose) {
    baseWhere.guest = { is: { purpose: normalizedPurpose } };
  }

  if (searchTerm) {
    const numericSearch = Number.parseInt(searchTerm, 10);
    const searchFilters: Prisma.QueueWhereInput[] = [
      {
        guest: {
          is: {
            fullName: { contains: searchTerm },
          },
        },
      },
      {
        guest: {
          is: {
            phone: { contains: searchTerm },
          },
        },
      },
      {
        guest: {
          is: {
            institution: { contains: searchTerm },
          },
        },
      },
      {
        guest: {
          is: {
            email: { contains: searchTerm },
          },
        },
      },
      {
        admin: {
          is: {
            name: { contains: searchTerm },
          },
        },
      },
      {
        dutyStaff: {
          is: {
            name: { contains: searchTerm },
          },
        },
      },
    ];

    if (!Number.isNaN(numericSearch)) {
      searchFilters.push({ queueNumber: numericSearch });
    }

    baseWhere.OR = searchFilters;
  }

  return baseWhere;
};

const toGuestbookEntry = (queue: GuestbookQueueWithRelations): GuestbookEntry => {
  const guest = queue.guest;

  return {
    id: queue.id,
    guestId: guest?.id ?? "",
    fullName: guest?.fullName ?? "-",
    email: guest?.email ?? null,
    phone: guest?.phone ?? "-",
    address: guest?.address ?? null,
    age: guest?.age ?? null,
    institution: guest?.institution ?? null,
    gender: guest?.gender ?? null,
    lastEducation: guest?.lastEducation ?? null,
    occupation: guest?.occupation ?? null,
    purpose: guest?.purpose ?? null,
    queueNumber: queue.queueNumber,
    queueCode: formatGuestQueueCode(guest?.purpose, queue.queueNumber),
    status: queue.status,
    queueType: queue.queueType,
    serviceName: queue.service.name,
    officerName: queue.dutyStaff?.name ?? queue.admin?.name ?? null,
    createdAt: queue.createdAt,
    filledSKD: queue.filledSKD ?? false,
    trackingLink: queue.trackingLink ?? null,
  };
};

const buildPdfBuffer = async (rows: GuestbookExportRow[]) => {
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

  doc.fontSize(16).fillColor("#111827").text("Laporan Buku Tamu PST");
  doc
    .fontSize(9)
    .fillColor("#6B7280")
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
        align: "left",
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
      doc.text(row[col.key], x, y + 3, {
        width: col.width - 4,
        align: "left",
        ellipsis: true,
      });
      x += col.width;
    });
    y += rowHeight;
  });

  doc.end();
  return done;
};

export async function getGuestbookEntries({
  status,
  purpose,
  dateFilter = "today",
  search,
  limit: limitParam,
  offset: offsetParam,
  clientHash,
}: GuestbookListParams): Promise<GuestbookListResponse> {
  const limit = sanitizeLimit(limitParam);
  const offset = sanitizeOffset(offsetParam);
  const normalizedStatus = parseStatus(status);
  const baseWhere = buildGuestbookBaseWhere({ purpose, dateFilter, search });

  const listWhere: Prisma.QueueWhereInput = normalizedStatus
    ? { ...baseWhere, status: normalizedStatus }
    : baseWhere;

  const summaryWhere: Prisma.QueueWhereInput = { ...baseWhere };

  const [summaryAggregate, listAggregate, statusGroups, skdPendingCount] = await Promise.all([
    prisma.queue.aggregate({
      where: summaryWhere,
      _count: { _all: true },
      _max: { updatedAt: true },
    }),
    normalizedStatus
      ? prisma.queue.aggregate({
          where: listWhere,
          _count: { _all: true },
          _max: { updatedAt: true },
        })
      : Promise.resolve(null),
    prisma.queue.groupBy({
      by: ["status"],
      _count: { _all: true },
      where: summaryWhere,
    }),
    prisma.queue.count({
      where: { ...summaryWhere, filledSKD: false },
    }),
  ]);

  const statusSummary = {
    waiting: 0,
    serving: 0,
    completed: 0,
    canceled: 0,
  };

  statusGroups.forEach((group) => {
    switch (group.status) {
      case QueueStatus.WAITING:
        statusSummary.waiting = group._count._all;
        break;
      case QueueStatus.SERVING:
        statusSummary.serving = group._count._all;
        break;
      case QueueStatus.COMPLETED:
        statusSummary.completed = group._count._all;
        break;
      case QueueStatus.CANCELED:
        statusSummary.canceled = group._count._all;
        break;
      default:
        break;
    }
  });

  const summaryTotal = summaryAggregate._count._all;
  const total = normalizedStatus ? (listAggregate?._count._all ?? 0) : summaryTotal;
  const hash = hashPayload({
    pagination: {
      total,
      limit: limit ?? total,
      offset: offset ?? 0,
    },
    summary: {
      total: summaryTotal,
      waiting: statusSummary.waiting,
      serving: statusSummary.serving,
      completed: statusSummary.completed,
      canceled: statusSummary.canceled,
      skdPending: skdPendingCount,
    },
    latestUpdatedAt:
      (normalizedStatus
        ? listAggregate?._max.updatedAt
        : summaryAggregate._max.updatedAt
      )?.toISOString() ?? null,
  });
  const hasChanges = !clientHash || clientHash !== hash;

  const pagination = {
    total,
    limit: limit ?? total,
    offset: offset ?? 0,
    hasMore: limit !== undefined && offset !== undefined ? offset + limit < total : false,
  };

  const summary = {
    total: summaryTotal,
    waiting: statusSummary.waiting,
    serving: statusSummary.serving,
    completed: statusSummary.completed,
    canceled: statusSummary.canceled,
    skdPending: skdPendingCount,
  };

  if (!hasChanges) {
    return {
      entries: [],
      pagination,
      summary,
      hash,
      hasChanges,
    };
  }

  const queues = await prisma.queue.findMany({
    ...guestbookQueueWithRelations,
    where: listWhere,
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });

  const entries = queues.map(toGuestbookEntry);

  return {
    entries,
    pagination,
    summary,
    hash,
    hasChanges,
  };
}

export async function exportGuestbookEntries({
  status,
  purpose,
  dateFilter = "today",
  search,
  format,
}: GuestbookExportParams) {
  if (format !== "xlsx" && format !== "pdf") {
    return { ok: false as const, status: 400, error: "Format export tidak didukung" };
  }

  const normalizedStatus = parseStatus(status);
  const baseWhere = buildGuestbookBaseWhere({ purpose, dateFilter, search });
  const listWhere: Prisma.QueueWhereInput = normalizedStatus
    ? { ...baseWhere, status: normalizedStatus }
    : baseWhere;

  const totalRows = await prisma.queue.count({ where: listWhere });
  if (totalRows === 0) {
    return {
      ok: false as const,
      status: 404,
      error: "Tidak ada data buku tamu untuk diekspor",
    };
  }

  const queues = await prisma.queue.findMany({
    ...guestbookQueueWithRelations,
    where: listWhere,
    orderBy: { createdAt: "desc" },
  });

  const rows = queues.map((queue) => {
    const entry = toGuestbookEntry(queue);
    const purposeLabel = entry.purpose ? purposeLabels[entry.purpose] : "-";
    const queueLabel = `${entry.queueCode} (${statusLabels[entry.status]})`;

    return {
      pengunjung: entry.fullName,
      keperluan: purposeLabel,
      layanan: entry.serviceName,
      antrean: queueLabel,
      petugas: entry.officerName ?? "-",
      skd: entry.filledSKD ? "Sudah" : "Belum",
      waktu: formatDisplayDateTimeWithSeconds(entry.createdAt),
    } satisfies GuestbookExportRow;
  });

  if (format === "xlsx") {
    const headerRow = EXPORT_COLUMNS.map((column) => column.label);
    const dataRows = rows.map((row) => EXPORT_COLUMNS.map((column) => row[column.key]));
    const worksheet = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guestbook");
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

  const body = await buildPdfBuffer(rows);
  return {
    ok: true as const,
    format: "pdf" as const,
    body,
    headers: {
      "Content-Type": "application/pdf",
    },
  };
}
