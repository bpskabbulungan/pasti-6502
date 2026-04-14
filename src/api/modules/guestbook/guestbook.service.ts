import { createHash } from "crypto";
import { existsSync } from "node:fs";
import path from "path";
import { QueueStatus, Prisma, Gender, LastEducation } from "@prisma/client";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import PDFDocument from "pdfkit";
import * as XLSX from "xlsx";
import { formatDisplayDateTimeWithSeconds } from "@/lib/date-format";
import prisma from "@api/infrastructure/database/prisma";
import type { GuestbookEntry, GuestbookListResponse } from "@shared/types/guestbook";
import {
  getDayRangeInTimeZone,
  parseDateOnlyInTimeZone,
  toIsoDateInTimeZone,
} from "@shared/utils/date-boundary";
import { formatGuestQueueCode } from "@shared/utils/guest-queue-code";

const PDF_FONT_PATH = (() => {
  const candidates = [
    path.join(process.cwd(), "public", "fonts", "noto-sans-regular.ttf"),
    path.join(
      process.cwd(),
      "node_modules",
      "next",
      "dist",
      "compiled",
      "@vercel",
      "og",
      "noto-sans-v27-latin-regular.ttf"
    ),
  ];

  const found = candidates.find((candidate) => existsSync(candidate));
  if (found) {
    return found;
  }

  throw new Error(
    "Font PDF tidak ditemukan. Pastikan file public/fonts/noto-sans-regular.ttf tersedia."
  );
})();

type DateFilter = "today" | "all" | "year" | "month" | "quarter" | "semester";
type GuestbookSortBy =
  | "createdAt"
  | "fullName"
  | "serviceName"
  | "queueCode"
  | "officerName"
  | "filledSKD";
type GuestbookSortOrder = "asc" | "desc";
type ExportFormat = "xlsx" | "pdf";

type GuestbookListParams = {
  status?: string | null;
  dateFilter?: DateFilter;
  year?: string | null;
  month?: string | null;
  quarter?: string | null;
  semester?: string | null;
  sortBy?: string | null;
  sortOrder?: string | null;
  search?: string | null;
  limit?: string | null;
  offset?: string | null;
  clientHash?: string | null;
};

type GuestbookExportParams = {
  status?: string | null;
  dateFilter?: DateFilter;
  year?: string | null;
  month?: string | null;
  quarter?: string | null;
  semester?: string | null;
  sortBy?: string | null;
  sortOrder?: string | null;
  search?: string | null;
  format: ExportFormat;
};

type GuestbookExportRow = {
  no: number;
  nama_lengkap: string;
  jenis_kelamin: string;
  umur: number | null;
  email: string;
  nomor_wa: string;
  alamat: string;
  asal_instansi: string;
  pendidikan_terakhir: string;
  pekerjaan: string;
  layanan: string;
  tanggal: string; // Changed from Date to string for proper formatting
  kode_antrean: string;
  status_layanan: string;
  durasi_pelayanan: number | null;
  petugas_pelayanan: string;
  status_skd: string;
};

const ALLOWED_STATUSES: QueueStatus[] = [QueueStatus.COMPLETED, QueueStatus.CANCELED];

const statusLabels: Record<QueueStatus, string> = {
  WAITING: "Menunggu",
  SERVING: "Sedang Dilayani",
  COMPLETED: "Selesai",
  CANCELED: "Dibatalkan",
};

const genderLabels: Record<Gender, string> = {
  MALE: "Laki-laki",
  FEMALE: "Perempuan",
};

const educationLabels: Record<LastEducation, string> = {
  SD: "SD",
  SMP: "SMP",
  SMA_SMK: "SMA/SMK",
  D1: "D1",
  D2: "D2",
  D3: "D3",
  D4_S1: "D4/S1",
  S2: "S2",
  S3: "S3",
  LAINNYA: "Lainnya",
};

const EXPORT_COLUMNS: Array<{ key: keyof GuestbookExportRow; label: string }> = [
  { key: "no", label: "No" },
  { key: "nama_lengkap", label: "Nama Lengkap" },
  { key: "jenis_kelamin", label: "Jenis Kelamin" },
  { key: "umur", label: "Umur" },
  { key: "email", label: "Email" },
  { key: "nomor_wa", label: "Nomor WhatsApp" },
  { key: "alamat", label: "Alamat" },
  { key: "asal_instansi", label: "Asal/Instansi" },
  { key: "pendidikan_terakhir", label: "Pendidikan Terakhir" },
  { key: "pekerjaan", label: "Pekerjaan" },
  { key: "layanan", label: "Layanan" },
  { key: "tanggal", label: "Tanggal" },
  { key: "kode_antrean", label: "Kode Antrean" },
  { key: "status_layanan", label: "Status Layanan" },
  { key: "durasi_pelayanan", label: "Durasi Pelayanan" },
  { key: "petugas_pelayanan", label: "Petugas Pelayanan" },
  { key: "status_skd", label: "Status SKD" },
];

const PDF_COLUMNS: Array<{
  key: keyof GuestbookExportRow;
  label: string;
  width: number;
}> = [
  { key: "nama_lengkap", label: "Nama", width: 90 },
  { key: "nomor_wa", label: "WhatsApp", width: 85 },
  { key: "layanan", label: "Layanan", width: 90 },
  { key: "kode_antrean", label: "Kode", width: 60 },
  { key: "status_layanan", label: "Status", width: 75 },
  { key: "petugas_pelayanan", label: "Petugas", width: 80 },
  { key: "tanggal", label: "Tgl", width: 85 },
  { key: "status_skd", label: "SKD", width: 45 },
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

const sanitizeYear = (value?: string | null) => {
  if (value === null || typeof value === "undefined") return undefined;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return undefined;
  if (parsed < 2000 || parsed > 2100) return undefined;
  return parsed;
};

const sanitizeMonth = (value?: string | null) => {
  if (value === null || typeof value === "undefined") return undefined;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return undefined;
  if (parsed < 1 || parsed > 12) return undefined;
  return parsed;
};

const sanitizeQuarter = (value?: string | null) => {
  if (value === null || typeof value === "undefined") return undefined;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return undefined;
  if (parsed < 1 || parsed > 4) return undefined;
  return parsed;
};

const sanitizeSemester = (value?: string | null) => {
  if (value === null || typeof value === "undefined") return undefined;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return undefined;
  if (parsed < 1 || parsed > 2) return undefined;
  return parsed;
};

const parseStatus = (value?: string | null) => {
  if (!value || value === "ALL") return null;
  const normalized = value.toUpperCase();
  return ALLOWED_STATUSES.includes(normalized as QueueStatus) ? (normalized as QueueStatus) : null;
};

const parseSortBy = (value?: string | null): GuestbookSortBy => {
  if (!value) return "createdAt";
  if (
    value === "createdAt" ||
    value === "fullName" ||
    value === "serviceName" ||
    value === "queueCode" ||
    value === "officerName" ||
    value === "filledSKD"
  ) {
    return value;
  }
  return "createdAt";
};

const parseSortOrder = (value?: string | null): GuestbookSortOrder => {
  if (!value) return "desc";
  return value === "asc" ? "asc" : "desc";
};

const parseDateFilter = (value?: string | null): DateFilter => {
  if (
    value === "today" ||
    value === "all" ||
    value === "year" ||
    value === "month" ||
    value === "quarter" ||
    value === "semester"
  ) {
    return value;
  }
  return "today";
};

const createDateOnly = (year: number, month: number, day: number) =>
  `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const resolvePeriodRange = ({
  dateFilter,
  year,
  month,
  quarter,
  semester,
}: {
  dateFilter: DateFilter;
  year?: number;
  month?: number;
  quarter?: number;
  semester?: number;
}) => {
  if (dateFilter === "all") {
    return null;
  }

  if (dateFilter === "today") {
    return getDayRangeInTimeZone(new Date());
  }

  const [currentYearText, currentMonthText] = toIsoDateInTimeZone(new Date()).split("-");
  const currentYear = Number.parseInt(currentYearText ?? "", 10);
  const currentMonth = Number.parseInt(currentMonthText ?? "", 10);

  const normalizedYear = year ?? (Number.isNaN(currentYear) ? new Date().getFullYear() : currentYear);
  const normalizedMonth = month ?? (Number.isNaN(currentMonth) ? new Date().getMonth() + 1 : currentMonth);
  const normalizedQuarter =
    quarter ?? (Number.isNaN(currentMonth) ? Math.ceil((new Date().getMonth() + 1) / 3) : Math.ceil(currentMonth / 3));
  const normalizedSemester =
    semester ?? (Number.isNaN(currentMonth) ? (new Date().getMonth() + 1 <= 6 ? 1 : 2) : currentMonth <= 6 ? 1 : 2);

  const startYear = normalizedYear;
  let startMonth = 1;
  let endYear = normalizedYear + 1;
  let endMonth = 1;

  if (dateFilter === "month") {
    startMonth = normalizedMonth;
    if (normalizedMonth === 12) {
      endYear = normalizedYear + 1;
      endMonth = 1;
    } else {
      endYear = normalizedYear;
      endMonth = normalizedMonth + 1;
    }
  }

  if (dateFilter === "quarter") {
    startMonth = (normalizedQuarter - 1) * 3 + 1;
    const computedEndMonth = startMonth + 3;
    if (computedEndMonth > 12) {
      endYear = normalizedYear + 1;
      endMonth = computedEndMonth - 12;
    } else {
      endYear = normalizedYear;
      endMonth = computedEndMonth;
    }
  }

  if (dateFilter === "semester") {
    startMonth = normalizedSemester === 1 ? 1 : 7;
    if (normalizedSemester === 1) {
      endYear = normalizedYear;
      endMonth = 7;
    } else {
      endYear = normalizedYear + 1;
      endMonth = 1;
    }
  }

  const start = parseDateOnlyInTimeZone(createDateOnly(startYear, startMonth, 1));
  const end = parseDateOnlyInTimeZone(createDateOnly(endYear, endMonth, 1));
  if (!start || !end) {
    return null;
  }

  return { start, end };
};

const buildOrderBy = ({
  sortBy,
  sortOrder,
}: {
  sortBy: GuestbookSortBy;
  sortOrder: GuestbookSortOrder;
}): Prisma.QueueOrderByWithRelationInput[] => {
  if (sortBy === "fullName") {
    return [{ guest: { fullName: sortOrder } }, { createdAt: "desc" }, { id: "asc" }];
  }

  if (sortBy === "serviceName") {
    return [{ service: { name: sortOrder } }, { createdAt: "desc" }, { id: "asc" }];
  }

  if (sortBy === "queueCode") {
    return [{ service: { name: sortOrder } }, { queueNumber: sortOrder }, { createdAt: "desc" }, { id: "asc" }];
  }

  if (sortBy === "officerName") {
    return [
      { dutyStaff: { name: sortOrder } },
      { admin: { name: sortOrder } },
      { createdAt: "desc" },
      { id: "asc" },
    ];
  }

  if (sortBy === "filledSKD") {
    return [{ filledSKD: sortOrder }, { createdAt: "desc" }, { id: "asc" }];
  }

  return [{ createdAt: sortOrder }, { id: sortOrder }];
};

const buildGuestbookBaseWhere = ({
  dateFilter,
  year,
  month,
  quarter,
  semester,
  search,
}: Pick<
  GuestbookListParams,
  "dateFilter" | "year" | "month" | "quarter" | "semester" | "search"
>) => {
  const normalizedDateFilter = parseDateFilter(dateFilter);
  const periodRange = resolvePeriodRange({
    dateFilter: normalizedDateFilter,
    year: sanitizeYear(year),
    month: sanitizeMonth(month),
    quarter: sanitizeQuarter(quarter),
    semester: sanitizeSemester(semester),
  });
  const searchTerm = search?.trim() ?? "";

  const baseWhere: Prisma.QueueWhereInput = {
    guestId: { not: null },
    status: { in: ALLOWED_STATUSES },
  };

  if (periodRange) {
    baseWhere.queueDate = { gte: periodRange.start, lt: periodRange.end };
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
    queueCode: formatGuestQueueCode(queue.service, queue.queueNumber),
    status: queue.status,
    serviceName: queue.service.name,
    officerName: queue.dutyStaff?.name ?? queue.admin?.name ?? null,
    createdAt: queue.createdAt,
    startTime: queue.startTime,
    filledSKD: queue.filledSKD ?? false,
    trackingLink: queue.trackingLink ?? null,
  };
};

const buildPdfBuffer = async (rows: GuestbookExportRow[]) => {
  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margin: 36,
    font: PDF_FONT_PATH,
  });
  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc.fontSize(16).fillColor("#111827").text("Laporan Buku Tamu PASTI 6502");
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
    doc.font(PDF_FONT_PATH).fontSize(8).fillColor("#111827");
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
    doc.font(PDF_FONT_PATH).fontSize(8).fillColor("#111827");
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
      const cellValue = row[col.key as keyof GuestbookExportRow];
      const cellText = typeof cellValue === "string" ? cellValue : String(cellValue ?? "");
      doc.text(cellText, x, y + 3, {
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
  dateFilter = "today",
  year,
  month,
  quarter,
  semester,
  sortBy: sortByParam,
  sortOrder: sortOrderParam,
  search,
  limit: limitParam,
  offset: offsetParam,
  clientHash,
}: GuestbookListParams): Promise<GuestbookListResponse> {
  const limit = sanitizeLimit(limitParam);
  const offset = sanitizeOffset(offsetParam);
  const normalizedStatus = parseStatus(status);
  const sortBy = parseSortBy(sortByParam);
  const sortOrder = parseSortOrder(sortOrderParam);
  const orderBy = buildOrderBy({ sortBy, sortOrder });
  const baseWhere = buildGuestbookBaseWhere({
    dateFilter,
    year,
    month,
    quarter,
    semester,
    search,
  });

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
    completed: 0,
    canceled: 0,
  };

  statusGroups.forEach((group) => {
    switch (group.status) {
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
      completed: statusSummary.completed,
      canceled: statusSummary.canceled,
      skdPending: skdPendingCount,
    },
    sorting: {
      sortBy,
      sortOrder,
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
    orderBy,
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
  dateFilter = "today",
  year,
  month,
  quarter,
  semester,
  sortBy: sortByParam,
  sortOrder: sortOrderParam,
  search,
  format: exportFormat,
}: GuestbookExportParams) {
  try {
    if (exportFormat !== "xlsx" && exportFormat !== "pdf") {
      return { ok: false as const, status: 400, error: "Format export tidak didukung" };
    }

    const normalizedStatus = parseStatus(status);
    const sortBy = parseSortBy(sortByParam);
    const sortOrder = parseSortOrder(sortOrderParam);
    const orderBy = buildOrderBy({ sortBy, sortOrder });
    const baseWhere = buildGuestbookBaseWhere({
      dateFilter,
      year,
      month,
      quarter,
      semester,
      search,
    });
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
      orderBy,
    });

    const formatTimeOnly = (value: string | Date | null): string => {
      try {
        if (!value) return "-";
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        return format(date, "HH:mm", { locale: localeId });
      } catch (error) {
        console.error("Error formatting time:", error, value);
        return "-";
      }
    };

    const formatDateOnly = (value: string | Date | null): string => {
      try {
        if (!value) return "-";
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) return "-";
        return format(date, "dd-MMM-yyyy", { locale: localeId });
      } catch (error) {
        console.error("Error formatting date:", error, value);
        return "-";
      }
    };

    // Helper untuk calculate durasi dalam menit (dari createdAt ke startTime)
    const calculateDurationMinutes = (createdAt: Date, startTime: Date | null): number | null => {
      if (!startTime) return null;
      const diffMs = new Date(startTime).getTime() - new Date(createdAt).getTime();
      if (diffMs < 0) return null; // invalid duration
      return Math.round(diffMs / 60000);
    };

    const rows = queues.map((queue, index) => {
      const entry = toGuestbookEntry(queue);
      const genderLabel = entry.gender ? genderLabels[entry.gender] : "-";
      const educationLabel = entry.lastEducation ? educationLabels[entry.lastEducation] : "-";
      const durationMinutes = calculateDurationMinutes(new Date(entry.createdAt), entry.startTime ? new Date(entry.startTime) : null);

      const createdDate = new Date(entry.createdAt);
      
      // Format tanggal sebagai dd-mm-yyyy
      let tanggalFormatted = "-";
      try {
        if (createdDate && !isNaN(createdDate.getTime())) {
          const day = String(createdDate.getDate()).padStart(2, "0");
          const month = String(createdDate.getMonth() + 1).padStart(2, "0");
          const year = createdDate.getFullYear();
          tanggalFormatted = `${day}-${month}-${year}`;
        }
      } catch {
        tanggalFormatted = "-";
      }

      return {
        no: index + 1,
        nama_lengkap: entry.fullName || "-",
        jenis_kelamin: genderLabel,
        umur: entry.age ?? null,
        email: entry.email || "-",
        nomor_wa: entry.phone || "-",
        alamat: entry.address || "-",
        asal_instansi: entry.institution || "-",
        pendidikan_terakhir: educationLabel,
        pekerjaan: entry.occupation || "-",
        layanan: entry.serviceName,
        tanggal: tanggalFormatted,
        kode_antrean: entry.queueCode,
        status_layanan: statusLabels[entry.status],
        durasi_pelayanan: durationMinutes,
        petugas_pelayanan: entry.officerName || "-",
        status_skd: entry.filledSKD ? "Sudah" : "Belum",
      } satisfies GuestbookExportRow;
    });

    if (exportFormat === "xlsx") {
      // Helper untuk format cell value dengan proper type
      const formatCellValue = (value: unknown, key: keyof GuestbookExportRow) => {
        if (value === null || value === undefined) return "";
        
        if (key === "tanggal") {
          // tanggal sudah dalam format string dd/mm/yyyy
          return value;
        }
        
        if (key === "nomor_wa") {
          return String(value);
        }
        
        if (key === "umur" || key === "durasi_pelayanan" || key === "no") {
          return typeof value === "number" ? value : "";
        }
        
        return value;
      };

      const headerRow = EXPORT_COLUMNS.map((col) => col.label);

      const dataRows = rows.map((row) =>
        EXPORT_COLUMNS.map((col) => formatCellValue(row[col.key as keyof typeof row], col.key as keyof typeof row))
      );

      // === SHEET 1: Summary Sheet ===
      const totalRows = rows.length;
      const totalCompleted = rows.filter((r) => r.status_layanan === "Selesai").length;
      const totalCanceled = rows.filter((r) => r.status_layanan === "Dibatalkan").length;
      const totalPending = rows.filter((r) => r.status_layanan !== "Selesai" && r.status_layanan !== "Dibatalkan").length;
      const totalSkdPending = rows.filter((r) => r.status_skd === "Belum").length;
      const avgDuration = rows
        .filter((r) => r.durasi_pelayanan !== null && r.durasi_pelayanan !== undefined)
        .reduce((sum, r) => sum + (r.durasi_pelayanan || 0), 0) / Math.max(rows.filter((r) => r.durasi_pelayanan !== null && r.durasi_pelayanan !== undefined).length, 1);

      const summaryData = [
        ["RINGKASAN LAPORAN BUKU TAMU"],
        [],
        ["Tanggal Export", (() => {
          const now = new Date();
          const day = String(now.getDate()).padStart(2, "0");
          const month = String(now.getMonth() + 1).padStart(2, "0");
          const year = now.getFullYear();
          const hours = String(now.getHours()).padStart(2, "0");
          const minutes = String(now.getMinutes()).padStart(2, "0");
          const seconds = String(now.getSeconds()).padStart(2, "0");
          return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
        })()],
        [],
        ["STATISTIK UTAMA"],
        ["Total Data", totalRows],
        ["Selesai", totalCompleted],
        ["Dibatalkan", totalCanceled],
        ["Pending/Proses", totalPending],
        [],
        ["Data Quality"],
        ["SKD Belum Diisi", totalSkdPending],
        ["Rata-rata Durasi Pelayanan (Menit)", Math.round(avgDuration)],
      ];

      const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
      summaryWorksheet["!cols"] = [{ wch: 30 }, { wch: 20 }];
      summaryWorksheet["!rows"] = [{ hpx: 25 }]; // Header height

      // Apply summary styling
      const summaryTitleStyle = {
        font: { bold: true, size: 14, color: { rgb: "FFFFFF" } },
        fill: { type: "pattern" as const, patternType: "solid" as const, fgColor: { rgb: "1F2937" } },
        alignment: { horizontal: "left" as const, vertical: "center" as const, wrapText: true },
        border: {
          left: { style: "thin" as const },
          right: { style: "thin" as const },
          top: { style: "thin" as const },
          bottom: { style: "thin" as const },
        },
      };

      const summarySectionStyle = {
        font: { bold: true, size: 11, color: { rgb: "FFFFFF" } },
        fill: { type: "pattern" as const, patternType: "solid" as const, fgColor: { rgb: "374151" } },
        alignment: { horizontal: "left" as const, vertical: "center" as const },
        border: {
          left: { style: "thin" as const },
          right: { style: "thin" as const },
          top: { style: "thin" as const },
          bottom: { style: "thin" as const },
        },
      };

      const summaryDataStyle = {
        alignment: { horizontal: "left" as const, vertical: "center" as const },
        border: {
          left: { style: "hair" as const },
          right: { style: "hair" as const },
          bottom: { style: "hair" as const },
        },
      };

      const summaryNumberStyle = {
        ...summaryDataStyle,
        alignment: { horizontal: "right" as const, vertical: "center" as const },
        numFmt: "0",
      };

      // Apply styles ke summary worksheet
      summaryWorksheet["A1"].s = summaryTitleStyle;
      
      for (let i = 0; i < summaryData.length; i++) {
        const row = i + 1;
        if (summaryData[i][0] === "STATISTIK UTAMA" || summaryData[i][0] === "Data Quality") {
          summaryWorksheet[`A${row}`].s = summarySectionStyle;
        } else if (typeof summaryData[i][1] === "number" || summaryData[i][0] === "Tanggal Export") {
          summaryWorksheet[`A${row}`].s = summaryDataStyle;
          if (summaryWorksheet[`B${row}`]) {
            if (summaryData[i][0] === "Tanggal Export") {
              summaryWorksheet[`B${row}`].s = { ...summaryDataStyle, numFmt: "@" }; // text format
              summaryWorksheet[`B${row}`].t = "s"; // text type
            } else {
              summaryWorksheet[`B${row}`].s = summaryNumberStyle;
              summaryWorksheet[`B${row}`].t = "n";
            }
          }
        }
      }

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Ringkasan");

      // === SHEET 2: Data Sheet dengan Table ===
      const dataWorksheet = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);

      // Define column widths for the new 17-column export
      const columnWidths: Array<{ wch: number }> = [
        { wch: 5 },   // No
        { wch: 18 },  // Nama Lengkap
        { wch: 14 },  // Jenis Kelamin
        { wch: 8 },   // Umur
        { wch: 20 },  // Email
        { wch: 16 },  // Nomor WhatsApp
        { wch: 20 },  // Alamat
        { wch: 18 },  // Asal/Instansi
        { wch: 16 },  // Pendidikan Terakhir
        { wch: 14 },  // Pekerjaan
        { wch: 16 },  // Layanan
        { wch: 13 },  // Tanggal
        { wch: 12 },  // Kode Antrean
        { wch: 14 },  // Status Layanan
        { wch: 12 },  // Durasi Pelayanan
        { wch: 14 },  // Petugas Pelayanan
        { wch: 12 },  // Status SKD
      ];
      dataWorksheet["!cols"] = columnWidths;

      // Header styling
      const headerStyle = {
        fill: { type: "pattern" as const, patternType: "solid" as const, fgColor: { rgb: "1F2937" } },
        font: { bold: true, color: { rgb: "FFFFFF" }, size: 11 },
        alignment: { horizontal: "center" as const, vertical: "center" as const, wrapText: true },
        border: {
          left: { style: "thin" as const, color: { rgb: "D1D5DB" } },
          right: { style: "thin" as const, color: { rgb: "D1D5DB" } },
          top: { style: "thin" as const, color: { rgb: "D1D5DB" } },
          bottom: { style: "thin" as const, color: { rgb: "D1D5DB" } },
        },
      };

      // Data cell styling dengan wrap text
      const dataStyle = {
        alignment: { horizontal: "left" as const, vertical: "center" as const, wrapText: true },
        border: {
          left: { style: "hair" as const, color: { rgb: "E5E7EB" } },
          right: { style: "hair" as const, color: { rgb: "E5E7EB" } },
          top: { style: "hair" as const, color: { rgb: "E5E7EB" } },
          bottom: { style: "hair" as const, color: { rgb: "E5E7EB" } },
        },
      };

      // Center align style untuk kolom tertentu
      const centerStyle = {
        ...dataStyle,
        alignment: { horizontal: "center" as const, vertical: "center" as const, wrapText: true },
      };

      // Date format (date-only) - using text format to preserve dd-mm-yyyy
      const dateStyle = { ...centerStyle, numFmt: "@" }; // @ = text format
      // Time format (time-only)
      const timeStyle = { ...centerStyle, numFmt: "hh:mm" };
      // Number format
      const numberStyle = { ...centerStyle, numFmt: "0" };
      // Phone text format untuk safely retain leading zero
      const phoneStyle = { ...dataStyle, numFmt: "@" }; // @ = text format

      // Apply header styles
      for (let i = 0; i < headerRow.length; i++) {
        const cellRef = XLSX.utils.encode_col(i) + "1";
        if (!dataWorksheet[cellRef]) dataWorksheet[cellRef] = {};
        dataWorksheet[cellRef].s = headerStyle;
      }

      // Apply data cell styles dan format types
      for (let rowIdx = 0; rowIdx < dataRows.length; rowIdx++) {
        for (let colIdx = 0; colIdx < EXPORT_COLUMNS.length; colIdx++) {
          const cellRef = XLSX.utils.encode_col(colIdx) + (rowIdx + 2);
          const colKey = EXPORT_COLUMNS[colIdx].key;
          const cellValue = dataRows[rowIdx][colIdx];

          if (!dataWorksheet[cellRef]) dataWorksheet[cellRef] = {};

          // Conditional formatting untuk status_layanan dengan warna
          if (colKey === "status_layanan") {
            if (cellValue === "Selesai") {
              dataWorksheet[cellRef].s = {
                ...dataStyle,
                fill: { type: "pattern" as const, patternType: "solid" as const, fgColor: { rgb: "D1FAE5" } },
                font: { bold: true, color: { rgb: "065F46" } },
              };
            } else if (cellValue === "Dibatalkan") {
              dataWorksheet[cellRef].s = {
                ...dataStyle,
                fill: { type: "pattern" as const, patternType: "solid" as const, fgColor: { rgb: "FEE2E2" } },
                font: { bold: true, color: { rgb: "991B1B" } },
              };
            } else {
              dataWorksheet[cellRef].s = {
                ...dataStyle,
                fill: { type: "pattern" as const, patternType: "solid" as const, fgColor: { rgb: "FEF3C7" } },
                font: { color: { rgb: "92400E" } },
              };
            }
          } else if (colKey === "tanggal") {
            dataWorksheet[cellRef].s = dateStyle;
            dataWorksheet[cellRef].t = "s"; // text type untuk preserve format dd-mm-yyyy
          } else if (colKey === "umur" || colKey === "durasi_pelayanan") {
            dataWorksheet[cellRef].s = numberStyle;
            dataWorksheet[cellRef].t = "n"; // number type
          } else if (colKey === "no") {
            dataWorksheet[cellRef].s = centerStyle;
            dataWorksheet[cellRef].t = "n";
          } else if (colKey === "nomor_wa") {
            dataWorksheet[cellRef].s = phoneStyle;
            dataWorksheet[cellRef].t = "s"; // text type
          } else {
            dataWorksheet[cellRef].s = dataStyle;
          }
        }
      }

      // Enable AutoFilter
      const filterRange = `A1:${XLSX.utils.encode_col(EXPORT_COLUMNS.length - 1)}${dataRows.length + 1}`;
      dataWorksheet["!autofilter"] = { ref: filterRange };

      // Freeze header row ONLY (ySplit: 1, xSplit: 0)
      dataWorksheet["!freeze"] = { xSplit: 0, ySplit: 1 };

      // Add Excel Table untuk data range (untuk pivot compatibility)
      const tableRange = `A1:${XLSX.utils.encode_col(EXPORT_COLUMNS.length - 1)}${dataRows.length + 1}`;
      dataWorksheet["!table"] = {
        ref: tableRange,
        name: "DataBubuTamu",
        displayName: "DataBubuTamu",
        tableStyleInfo: {
          name: "TableStyleMedium2",
          showFirstColumn: false,
          showLastColumn: false,
          showRowStripes: true,
          showColumnStripes: false,
        },
      };

      XLSX.utils.book_append_sheet(workbook, dataWorksheet, "Buku Tamu");

      // Write workbook
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
  } catch (error) {
    console.error("Export guestbook error:", error);
    return {
      ok: false as const,
      status: 500,
      error: error instanceof Error ? error.message : "Terjadi kesalahan tidak terduga saat mengekspor data",
    };
  }
}

