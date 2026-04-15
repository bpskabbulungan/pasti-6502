import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { PstOfficerEmploymentStatus, PstScheduleStatus } from "@prisma/client";
import PDFDocument from "pdfkit";
import prisma from "@api/infrastructure/database/prisma";
import type {
  MonthlyScheduleResponse,
  MonthlyScheduleSummary,
  PstDocumentStatus,
  PstValidationLevel,
} from "@shared/types/pst-schedule";
import { parseDateOnlyInTimeZone, toIsoDateInTimeZone } from "@shared/utils/date-boundary";
import { getMonthlyScheduleById } from "./pst-schedule-generator.service";
import {
  buildPstSchedulePdfHtmlTemplate,
  type PstSchedulePdfFairnessOfficerRow,
  type PstSchedulePdfValidationItem,
  type PstSchedulePdfViewModel,
  type PstSchedulePdfWeekRow,
} from "./templates/pst-schedule-pdf.template";

type PstScheduleDayAggregate = {
  week: number;
  date: string;
  dayName: string;
  isHoliday: boolean;
  holidayType: "LIBURAN" | "CUTI_BERSAMA" | null;
  holidayName: string | null;
  hasPstSlot: boolean;
  hasWfoSlot: boolean;
  pstOfficerId: string | null;
  pstOfficerName: string | null;
  wfoOfficerId: string | null;
  wfoOfficerName: string | null;
  notes: string[];
};

type PstAssignedRecord = {
  date: string;
  dayName: string;
  role: "PST" | "WFO";
  officerId: string;
  officerName: string;
};

type PstSchedulePdfBuildState = {
  weekRows: PstSchedulePdfWeekRow[];
  assignedRecords: PstAssignedRecord[];
  validation: {
    duplicateOfficerCount: number;
    fridayIncompleteCount: number;
    holidayAssignedCount: number;
    unavailableAssignmentCount: number;
    unfilledSlotCount: number;
    chronologicalIssueCount: number;
  };
};

type PstSchedulePdfWeekRange = {
  week: number;
  label: string;
};

type PstSchedulePdfFilePaths = {
  fileName: string;
  metadataFileName: string;
  htmlFileName: string;
  relativePath: string;
  metadataRelativePath: string;
  htmlRelativePath: string;
  absolutePath: string;
  metadataAbsolutePath: string;
  htmlAbsolutePath: string;
};

type PersistedPstSchedulePdfMeta = {
  scheduleId: string;
  fileName: string;
  path: string;
  htmlPath: string;
  metadataPath: string;
  month: number;
  year: number;
  generatedAt: string;
  generatedById: string | null;
  downloadUrl: string;
};

type BuildAndStoreParams = {
  schedule: MonthlyScheduleResponse;
  generatedById?: string | null;
  generatedByName?: string | null;
};

const DEFAULT_PST_SCHEDULE_PDF_STORAGE_ROOT = path.join(
  process.cwd(),
  "storage",
  "app",
  "public",
  "generated-schedules"
);

const pstSchedulePdfStorageRoot = path.resolve(
  process.env.PST_SCHEDULE_PDF_STORAGE_PATH?.trim() || DEFAULT_PST_SCHEDULE_PDF_STORAGE_ROOT
);
const PST_PDF_FONT_PATH = (() => {
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

const FOOTER_TEXT = "PASTI - Pelayanan Statistik Terpadu dan Terintegrasi";
const INSTITUTION_TITLE = "BADAN PUSAT STATISTIK";
const INSTITUTION_SUBTITLE = "KABUPATEN BULUNGAN";
const BASE_SCHEDULE_RULES = [
  "WFO hanya diisi pada hari Jumat (1 PST + 1 WFO).",
  "Hari libur nasional/cuti bersama dikosongkan.",
  "Petugas unavailable tidak dapat dipilih.",
  "Fairness mempertimbangkan histori 3 bulan, jarak penugasan, dan prioritas bulan sebelumnya.",
];
const APRIL_2026_WFO_START_DATE = "2026-04-10";

const logoCandidates = [
  path.join(process.cwd(), "public", "logo_bps.png"),
  path.join(process.cwd(), "public", "logo-bps.png"),
  path.join(process.cwd(), "public", "bps-logo.png"),
  path.join(process.cwd(), "public", "icon_pst.png"),
];

const logoPath = logoCandidates.find((candidate) => existsSync(candidate)) ?? null;

const DAY_LABELS: Record<number, string> = {
  1: "Senin",
  2: "Selasa",
  3: "Rabu",
  4: "Kamis",
  5: "Jumat",
  6: "Sabtu",
  7: "Minggu",
};

const getWfoStartDateOverride = (year: number, month: number) =>
  year === 2026 && month === 4 ? APRIL_2026_WFO_START_DATE : null;

const isWfoRequiredOnDate = (dateIso: string, wfoStartDateIso: string | null) =>
  !wfoStartDateIso || dateIso >= wfoStartDateIso;

const normalizeStoragePath = (value: string) => value.replaceAll("\\", "/").trim();

const resolvePstSchedulePdfPath = (relativePath: string) => {
  const normalized = normalizeStoragePath(relativePath);
  if (!normalized || normalized.includes("..")) {
    throw new Error("Path PDF jadwal tidak valid");
  }

  const resolvedPath = path.resolve(pstSchedulePdfStorageRoot, normalized);
  if (
    resolvedPath !== pstSchedulePdfStorageRoot &&
    !resolvedPath.startsWith(`${pstSchedulePdfStorageRoot}${path.sep}`)
  ) {
    throw new Error("Path PDF jadwal keluar dari root storage");
  }

  return resolvedPath;
};

const asDate = (value: Date | string) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const monthLabel = (month: number, year: number) =>
  format(new Date(year, month - 1, 1), "MMMM yyyy", { locale: localeId });

const formatIsoDate = (isoDate: string) => {
  const parsed = parseDateOnlyInTimeZone(isoDate);
  if (!parsed) {
    return isoDate;
  }
  return format(parsed, "dd-MM-yyyy", { locale: localeId });
};

const formatRevisionCode = (version: number) => `REV-${String(Math.max(1, version)).padStart(2, "0")}`;

const formatWeekRangeLabel = (startIso: string, endIso: string) => {
  const startDate = parseDateOnlyInTimeZone(startIso);
  const endDate = parseDateOnlyInTimeZone(endIso);
  if (!startDate || !endDate) {
    return `${formatIsoDate(startIso)} - ${formatIsoDate(endIso)}`;
  }

  const sameMonth = startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear();
  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  if (sameMonth) {
    return `${format(startDate, "dd", { locale: localeId })} - ${format(endDate, "dd MMM yyyy", {
      locale: localeId,
    })}`;
  }

  if (sameYear) {
    return `${format(startDate, "dd MMM", { locale: localeId })} - ${format(endDate, "dd MMM yyyy", {
      locale: localeId,
    })}`;
  }

  return `${format(startDate, "dd MMM yyyy", { locale: localeId })} - ${format(endDate, "dd MMM yyyy", {
    locale: localeId,
  })}`;
};

const toShortNoteLabel = (noteText: string): string | null => {
  const normalized = noteText
    .replace(/^(PST|WFO)\s*:\s*/i, "")
    .trim()
    .toUpperCase();

  if (!normalized || normalized.includes("SKOR FAIRNESS")) {
    return null;
  }
  if (normalized.includes("DI LUAR RENTANG BULAN")) return "DI LUAR RENTANG BULAN";
  if (normalized.includes("SLOT HARUS KOSONG")) return "SLOT LIBUR HARUS KOSONG";
  if (normalized.includes("SLOT JUMAT")) return "JUMAT BELUM LENGKAP";
  if (normalized.includes("PST BELUM TERISI")) return "PST BELUM TERISI";
  if (normalized.includes("WFO BELUM TERISI")) return "WFO BELUM TERISI";
  if (normalized.includes("BELUM TERISI")) return "BELUM TERISI";
  if (normalized.includes("PETUGAS GANDA")) return "PETUGAS GANDA";
  if (normalized.includes("UNAVAILABLE")) return "UNAVAILABLE";
  if (normalized.includes("CUTI")) return "CUTI BERSAMA";
  if (normalized.includes("LIBUR")) return "LIBUR";
  if (normalized.includes("PRIORITAS")) return "PRIORITAS";
  if (normalized.includes("PEMERATAAN")) return "PEMERATAAN";
  if (normalized.includes("ROTASI JUMAT")) return "ROTASI JUMAT";

  return noteText.trim();
};

const buildCompactNote = (notes: string[]) => {
  const compact = Array.from(
    new Set(
      notes
        .map(toShortNoteLabel)
        .filter((item): item is string => Boolean(item))
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );

  return compact.length > 0 ? compact.join(" | ") : "-";
};

const toDownloadUrl = (scheduleId: string) => `/api/pst/schedules/monthly/${scheduleId}/pdf`;

const toSchedulePdfFilePaths = (scheduleId: string, month: number, year: number): PstSchedulePdfFilePaths => {
  const monthToken = String(month).padStart(2, "0");
  const directory = path.posix.join(String(year), monthToken);
  const stem = `jadwal-petugas-pst-${year}-${monthToken}-${scheduleId}`;
  const fileName = `${stem}.pdf`;
  const metadataFileName = `${stem}.json`;
  const htmlFileName = `${stem}.html`;
  const relativePath = path.posix.join(directory, fileName);
  const metadataRelativePath = path.posix.join(directory, metadataFileName);
  const htmlRelativePath = path.posix.join(directory, htmlFileName);

  return {
    fileName,
    metadataFileName,
    htmlFileName,
    relativePath,
    metadataRelativePath,
    htmlRelativePath,
    absolutePath: resolvePstSchedulePdfPath(relativePath),
    metadataAbsolutePath: resolvePstSchedulePdfPath(metadataRelativePath),
    htmlAbsolutePath: resolvePstSchedulePdfPath(htmlRelativePath),
  };
};

const readFileOrNull = async (filePath: string) => {
  try {
    return await fs.readFile(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
};

const readJsonOrNull = async <T>(filePath: string) => {
  const raw = await readFileOrNull(filePath);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw.toString("utf-8")) as T;
  } catch {
    return null;
  }
};

const sortByDateAscending = (left: PstScheduleDayAggregate, right: PstScheduleDayAggregate) =>
  left.date.localeCompare(right.date);

const toValidationLevel = (value: unknown): PstValidationLevel | null => {
  if (value === "OK" || value === "WARNING" || value === "ERROR") {
    return value;
  }
  return null;
};

const extractAuditMeta = (summary: MonthlyScheduleSummary | null | undefined) => {
  const audit = summary?.audit;
  const fallbackStatus: PstDocumentStatus = "DRAFT";

  return {
    documentVersion:
      typeof audit?.documentVersion === "number" && Number.isFinite(audit.documentVersion)
        ? Math.max(1, Math.floor(audit.documentVersion))
        : 1,
    documentStatus: audit?.documentStatus ?? fallbackStatus,
    generatedByName: audit?.generatedByName ?? null,
    changeNotes: audit?.changeNotes ?? "-",
  };
};

const getWeekdayIso = (date: Date) => {
  const day = date.getDay();
  return day === 0 ? 7 : day;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const buildUnavailableKeySet = async (
  schedule: MonthlyScheduleResponse,
  officerIds: string[]
) => {
  if (officerIds.length === 0) {
    return new Set<string>();
  }

  const monthStart = parseDateOnlyInTimeZone(
    `${schedule.year}-${String(schedule.month).padStart(2, "0")}-01`
  );
  const nextMonth = schedule.month === 12 ? 1 : schedule.month + 1;
  const nextYear = schedule.month === 12 ? schedule.year + 1 : schedule.year;
  const monthEnd = parseDateOnlyInTimeZone(
    `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`
  );

  if (!monthStart || !monthEnd) {
    return new Set<string>();
  }

  const records = await prisma.officerAvailability.findMany({
    where: {
      officerId: { in: officerIds },
      date: {
        gte: monthStart,
        lt: monthEnd,
      },
    },
    select: {
      officerId: true,
      date: true,
    },
  });

  return new Set(records.map((record) => `${record.officerId}|${toIsoDateInTimeZone(record.date)}`));
};

const buildDayAggregateMap = (schedule: MonthlyScheduleResponse) => {
  const weekMap = new Map<number, Map<string, PstScheduleDayAggregate>>();

  for (const week of schedule.weeks) {
    const dateMap = weekMap.get(week.week) ?? new Map<string, PstScheduleDayAggregate>();

    for (const item of week.items) {
      const row = dateMap.get(item.date) ?? {
        week: week.week,
        date: item.date,
        dayName: item.dayName,
        isHoliday: false,
        holidayType: null,
        holidayName: null,
        hasPstSlot: false,
        hasWfoSlot: false,
        pstOfficerId: null,
        pstOfficerName: null,
        wfoOfficerId: null,
        wfoOfficerName: null,
        notes: [],
      };

      row.dayName = item.dayName;

      if (item.isHoliday) {
        row.isHoliday = true;
        row.holidayType = item.holidayType;
        row.holidayName = item.holidayName;
        if (item.note) {
          row.notes.push(item.note);
        }
        dateMap.set(item.date, row);
        continue;
      }

      if (item.role === "PST") {
        row.hasPstSlot = true;
        row.pstOfficerId = item.officerId;
        row.pstOfficerName = item.officerName;
      }

      if (item.role === "WFO") {
        row.hasWfoSlot = true;
        row.wfoOfficerId = item.officerId;
        row.wfoOfficerName = item.officerName;
      }

      if (item.note) {
        row.notes.push(`${item.role}: ${item.note}`);
      }

      dateMap.set(item.date, row);
    }

    weekMap.set(week.week, dateMap);
  }

  return weekMap;
};

const buildDisplayWeekMap = (
  schedule: MonthlyScheduleResponse,
  source: Map<number, Map<string, PstScheduleDayAggregate>>
) => {
  const monthStart = parseDateOnlyInTimeZone(
    `${schedule.year}-${String(schedule.month).padStart(2, "0")}-01`
  );
  const totalDays = new Date(schedule.year, schedule.month, 0).getDate();
  const monthEnd = parseDateOnlyInTimeZone(
    `${schedule.year}-${String(schedule.month).padStart(2, "0")}-${String(totalDays).padStart(2, "0")}`
  );

  if (!monthStart || !monthEnd) {
    return source;
  }

  const firstWeekMonday = addDays(monthStart, -(getWeekdayIso(monthStart) - 1));
  const lastWeekFriday = addDays(monthEnd, 5 - getWeekdayIso(monthEnd));

  const aggregateByDate = new Map<string, PstScheduleDayAggregate>();
  for (const dateMap of source.values()) {
    for (const [dateIso, row] of dateMap.entries()) {
      aggregateByDate.set(dateIso, row);
    }
  }

  const display = new Map<number, Map<string, PstScheduleDayAggregate>>();
  let week = 1;
  for (
    let cursor = new Date(firstWeekMonday);
    cursor.getTime() <= lastWeekFriday.getTime();
    cursor = addDays(cursor, 7)
  ) {
    const dateMap = new Map<string, PstScheduleDayAggregate>();

    for (let weekday = 1; weekday <= 5; weekday += 1) {
      const currentDate = addDays(cursor, weekday - 1);
      const insideMonth =
        currentDate.getTime() >= monthStart.getTime() &&
        currentDate.getTime() <= monthEnd.getTime();
      if (!insideMonth) {
        continue;
      }

      const dateIso = toIsoDateInTimeZone(currentDate);
      const existing = aggregateByDate.get(dateIso);

      if (existing) {
        dateMap.set(dateIso, {
          ...existing,
          week,
        });
        continue;
      }

      dateMap.set(dateIso, {
        week,
        date: dateIso,
        dayName: DAY_LABELS[weekday] ?? "-",
        isHoliday: false,
        holidayType: null,
        holidayName: null,
        hasPstSlot: false,
        hasWfoSlot: false,
        pstOfficerId: null,
        pstOfficerName: null,
        wfoOfficerId: null,
        wfoOfficerName: null,
        notes: ["Belum ada data slot pada tanggal ini"],
      });
    }

    if (dateMap.size > 0) {
      display.set(week, dateMap);
      week += 1;
    }
  }

  return display;
};

const buildScheduleCalendarState = async (
  schedule: MonthlyScheduleResponse
): Promise<PstSchedulePdfBuildState> => {
  const aggregateByWeek = buildDisplayWeekMap(schedule, buildDayAggregateMap(schedule));
  const wfoStartDateOverride = getWfoStartDateOverride(schedule.year, schedule.month);

  const assignedRecords: PstAssignedRecord[] = [];
  for (const dateMap of aggregateByWeek.values()) {
    for (const item of dateMap.values()) {
      if (item.pstOfficerId && item.pstOfficerName) {
        assignedRecords.push({
          date: item.date,
          dayName: item.dayName,
          role: "PST",
          officerId: item.pstOfficerId,
          officerName: item.pstOfficerName,
        });
      }
      if (item.wfoOfficerId && item.wfoOfficerName) {
        assignedRecords.push({
          date: item.date,
          dayName: item.dayName,
          role: "WFO",
          officerId: item.wfoOfficerId,
          officerName: item.wfoOfficerName,
        });
      }
    }
  }

  const unavailableKeySet = await buildUnavailableKeySet(
    schedule,
    Array.from(new Set(assignedRecords.map((record) => record.officerId)))
  );

  const weekRows: PstSchedulePdfWeekRow[] = [];
  let duplicateOfficerCount = 0;
  let fridayIncompleteCount = 0;
  let holidayAssignedCount = 0;
  let unavailableAssignmentCount = 0;
  let unfilledSlotCount = 0;
  let chronologicalIssueCount = 0;
  let previousDate: string | null = null;

  for (const week of Array.from(aggregateByWeek.keys()).sort((a, b) => a - b)) {
    const dateMap = aggregateByWeek.get(week);
    if (!dateMap) {
      continue;
    }

    const rows = Array.from(dateMap.values()).sort(sortByDateAscending);
    for (const row of rows) {
      if (previousDate && previousDate > row.date) {
        chronologicalIssueCount += 1;
      }
      previousDate = row.date;

      const notes: string[] = [...row.notes];
      const isFriday = row.dayName === "Jumat";
      const requiresWfo = isFriday && isWfoRequiredOnDate(row.date, wfoStartDateOverride);
      const pstOfficer = row.isHoliday ? "-" : row.pstOfficerName || "BELUM TERISI";
      const wfoOfficer = row.isHoliday
        ? "-"
        : isFriday
          ? requiresWfo
            ? row.wfoOfficerName || "BELUM TERISI"
            : "-"
          : "-";

      if (row.isHoliday) {
        const holidayLabel = row.holidayType === "CUTI_BERSAMA" ? "CUTI BERSAMA" : "LIBUR";
        notes.push(holidayLabel);

        if (row.pstOfficerId || row.wfoOfficerId) {
          holidayAssignedCount += 1;
          notes.push("SLOT HARUS KOSONG SAAT LIBUR/CUTI");
        }
      } else {
        if (!row.pstOfficerId) {
          unfilledSlotCount += 1;
          notes.push("PST BELUM TERISI");
        }

        if (isFriday) {
          const fridayIncomplete = !row.hasPstSlot || !row.pstOfficerId || (requiresWfo && (!row.hasWfoSlot || !row.wfoOfficerId));
          if (fridayIncomplete) {
            fridayIncompleteCount += 1;
            notes.push("SLOT JUMAT BELUM LENGKAP");
          }

          if (requiresWfo && !row.wfoOfficerId) {
            unfilledSlotCount += 1;
            notes.push("WFO BELUM TERISI");
          }
          if (!requiresWfo) {
            notes.push(`WFO MULAI BERLAKU ${formatIsoDate(wfoStartDateOverride ?? row.date)}`);
          }
        }

        if (row.pstOfficerId && row.wfoOfficerId && row.pstOfficerId === row.wfoOfficerId) {
          duplicateOfficerCount += 1;
          notes.push("PETUGAS GANDA DALAM SATU TANGGAL");
        }

        if (row.pstOfficerId && unavailableKeySet.has(`${row.pstOfficerId}|${row.date}`)) {
          unavailableAssignmentCount += 1;
          notes.push("PST UNAVAILABLE");
        }

        if (row.wfoOfficerId && unavailableKeySet.has(`${row.wfoOfficerId}|${row.date}`)) {
          unavailableAssignmentCount += 1;
          notes.push("WFO UNAVAILABLE");
        }
      }

      const dedupedNotes = Array.from(new Set(notes.map((noteText) => noteText.trim()).filter(Boolean)));
      const note = buildCompactNote(dedupedNotes);
      weekRows.push({
        week,
        dateIso: row.date,
        dayName: row.dayName,
        dateLabel: formatIsoDate(row.date),
        pstOfficer,
        wfoOfficer,
        note,
        isHoliday: row.isHoliday,
        hasIssue: dedupedNotes.some((value) =>
          [
            "BELUM TERISI",
            "PETUGAS GANDA",
            "UNAVAILABLE",
            "SLOT HARUS KOSONG",
            "SLOT JUMAT",
          ].some((keyword) => value.includes(keyword))
        ),
      });
    }
  }

  return {
    weekRows,
    assignedRecords,
    validation: {
      duplicateOfficerCount,
      fridayIncompleteCount,
      holidayAssignedCount,
      unavailableAssignmentCount,
      unfilledSlotCount,
      chronologicalIssueCount,
    },
  };
};

const buildValidationItems = (
  validation: PstSchedulePdfBuildState["validation"]
): PstSchedulePdfValidationItem[] => [
  {
    status: validation.duplicateOfficerCount === 0 ? "OK" : "ERROR",
    rule: "Tidak ada petugas ganda di tanggal yang sama",
    detail:
      validation.duplicateOfficerCount === 0
        ? "Tidak ditemukan petugas ganda."
        : `${validation.duplicateOfficerCount} tanggal terdeteksi petugas ganda.`,
  },
  {
    status: validation.fridayIncompleteCount === 0 ? "OK" : "ERROR",
    rule: "Jumat harus punya slot PST dan WFO",
    detail:
      validation.fridayIncompleteCount === 0
        ? "Semua hari Jumat memiliki PST dan WFO."
        : `${validation.fridayIncompleteCount} hari Jumat belum lengkap.`,
  },
  {
    status: validation.holidayAssignedCount === 0 ? "OK" : "ERROR",
    rule: "Hari libur/cuti bersama tidak boleh terisi slot",
    detail:
      validation.holidayAssignedCount === 0
        ? "Semua hari libur/cuti bersama kosong."
        : `${validation.holidayAssignedCount} hari libur/cuti masih berisi slot.`,
  },
  {
    status: validation.unavailableAssignmentCount === 0 ? "OK" : "ERROR",
    rule: "Petugas unavailable tidak boleh muncul",
    detail:
      validation.unavailableAssignmentCount === 0
        ? "Tidak ditemukan petugas unavailable."
        : `${validation.unavailableAssignmentCount} penugasan mengenai petugas unavailable.`,
  },
  {
    status: validation.chronologicalIssueCount === 0 ? "OK" : "ERROR",
    rule: "Urutan tanggal harus kronologis",
    detail:
      validation.chronologicalIssueCount === 0
        ? "Urutan tanggal valid dan kronologis."
        : `${validation.chronologicalIssueCount} anomali urutan tanggal ditemukan.`,
  },
  {
    status: validation.unfilledSlotCount === 0 ? "OK" : "WARNING",
    rule: "Slot kosong ditandai BELUM TERISI",
    detail:
      validation.unfilledSlotCount === 0
        ? "Semua slot sudah terisi."
        : `${validation.unfilledSlotCount} slot belum terisi.`,
  },
];

const resolveValidationItems = (
  summary: MonthlyScheduleSummary | null | undefined,
  fallbackValidation: PstSchedulePdfBuildState["validation"]
) => {
  const summaryItems = summary?.validation?.items;
  if (!Array.isArray(summaryItems) || summaryItems.length === 0) {
    return buildValidationItems(fallbackValidation);
  }

  const mapped = summaryItems
    .map((item) => {
      const status = toValidationLevel(item?.status);
      const rule = typeof item?.rule === "string" ? item.rule : null;
      const detail = typeof item?.detail === "string" ? item.detail : null;
      if (!status || !rule || !detail) {
        return null;
      }
      return {
        status,
        rule,
        detail,
      } satisfies PstSchedulePdfValidationItem;
    })
    .filter((item): item is PstSchedulePdfValidationItem => Boolean(item));

  return mapped.length > 0 ? mapped : buildValidationItems(fallbackValidation);
};

const resolveDocumentStatusLabel = (
  schedule: MonthlyScheduleResponse,
  summary: MonthlyScheduleSummary | null | undefined
): PstDocumentStatus => {
  const fromAudit = summary?.audit?.documentStatus;
  if (fromAudit === "DRAFT" || fromAudit === "FINAL" || fromAudit === "REVISI") {
    return fromAudit;
  }

  if (schedule.status === PstScheduleStatus.PUBLISHED) {
    return "FINAL";
  }

  return "DRAFT";
};

const buildWeekRangeLabels = (rows: PstSchedulePdfWeekRow[]): PstSchedulePdfWeekRange[] => {
  const grouped = new Map<number, string[]>();
  for (const row of rows) {
    const bucket = grouped.get(row.week) ?? [];
    bucket.push(row.dateIso);
    grouped.set(row.week, bucket);
  }

  return Array.from(grouped.entries())
    .sort((left, right) => left[0] - right[0])
    .map(([week, dates]) => {
      const sorted = [...dates].sort((left, right) => left.localeCompare(right));
      const firstDate = sorted[0] ?? "-";
      const lastDate = sorted[sorted.length - 1] ?? firstDate;
      return {
        week,
        label: formatWeekRangeLabel(firstDate, lastDate),
      };
    });
};

const buildFairnessOfficerRows = (
  activeOfficers: Array<{ id: string; name: string }>,
  assignedRecords: PstAssignedRecord[]
): PstSchedulePdfFairnessOfficerRow[] => {
  const rowMap = new Map<
    string,
    {
      name: string;
      totalAssignments: number;
      pstAssignments: number;
      wfoAssignments: number;
      fridayAssignments: number;
      lastAssignedIso: string | null;
    }
  >();

  for (const officer of activeOfficers) {
    rowMap.set(officer.id, {
      name: officer.name,
      totalAssignments: 0,
      pstAssignments: 0,
      wfoAssignments: 0,
      fridayAssignments: 0,
      lastAssignedIso: null,
    });
  }

  for (const record of assignedRecords) {
    const bucket = rowMap.get(record.officerId) ?? {
      name: record.officerName,
      totalAssignments: 0,
      pstAssignments: 0,
      wfoAssignments: 0,
      fridayAssignments: 0,
      lastAssignedIso: null,
    };

    bucket.totalAssignments += 1;
    if (record.role === "PST") {
      bucket.pstAssignments += 1;
    } else {
      bucket.wfoAssignments += 1;
    }
    if (record.dayName === "Jumat") {
      bucket.fridayAssignments += 1;
    }

    if (!bucket.lastAssignedIso || bucket.lastAssignedIso < record.date) {
      bucket.lastAssignedIso = record.date;
    }
    rowMap.set(record.officerId, bucket);
  }

  return Array.from(rowMap.values())
    .sort((left, right) => {
      if (left.totalAssignments !== right.totalAssignments) {
        return right.totalAssignments - left.totalAssignments;
      }
      return left.name.localeCompare(right.name, "id");
    })
    .map((row) => ({
      name: row.name,
      totalAssignments: String(row.totalAssignments),
      pstAssignments: String(row.pstAssignments),
      wfoAssignments: String(row.wfoAssignments),
      fridayAssignments: String(row.fridayAssignments),
      lastAssignedLabel: row.lastAssignedIso ? formatIsoDate(row.lastAssignedIso) : "-",
    }));
};

const buildSchedulePdfViewModel = async (
  schedule: MonthlyScheduleResponse,
  generatedById: string | null,
  generatedByName: string | null
): Promise<PstSchedulePdfViewModel> => {
  const summary = (schedule.summary ?? null) as MonthlyScheduleSummary | null;
  const generatedAtDate = asDate(schedule.generatedAt);
  const generatedAtLabel = format(generatedAtDate, "dd MMMM yyyy HH:mm:ss", { locale: localeId });
  const monthYearText = monthLabel(schedule.month, schedule.year);
  const wfoStartDateOverride = getWfoStartDateOverride(schedule.year, schedule.month);
  const calendarState = await buildScheduleCalendarState(schedule);

  const activeOfficers = await prisma.pstOfficerCandidate.findMany({
    where: {
      isActiveCandidate: true,
      employmentStatus: PstOfficerEmploymentStatus.MASUK,
    },
    select: {
      id: true,
      name: true,
      priorityNextMonth: true,
    },
    orderBy: [{ priorityNextMonth: "desc" }, { name: "asc" }],
  });

  const selectedOfficerIdSet = new Set(calendarState.assignedRecords.map((record) => record.officerId));
  const selectedOfficerNameSet = new Set(
    calendarState.assignedRecords.map((record) => record.officerName).filter(Boolean)
  );

  const selectedOfficerNames = activeOfficers
    .filter((officer) => selectedOfficerIdSet.has(officer.id))
    .map((officer) => officer.name);

  for (const officerName of selectedOfficerNameSet) {
    if (!selectedOfficerNames.includes(officerName)) {
      selectedOfficerNames.push(officerName);
    }
  }
  selectedOfficerNames.sort((left, right) => left.localeCompare(right, "id"));

  const unselectedOfficerNames = activeOfficers
    .filter((officer) => !selectedOfficerIdSet.has(officer.id))
    .map((officer) => officer.name)
    .sort((left, right) => left.localeCompare(right, "id"));

  const priorityOfficerNames = activeOfficers
    .filter((officer) => officer.priorityNextMonth)
    .map((officer) => officer.name)
    .sort((left, right) => left.localeCompare(right, "id"));

  const fairnessNote =
    summary?.fairness?.note ??
    (unselectedOfficerNames.length > 0
      ? "Petugas yang belum kebagian jadwal diprioritaskan untuk generate bulan berikutnya."
      : "Semua petugas aktif telah mendapatkan jadwal pada bulan ini.");

  const validationItems = resolveValidationItems(summary, calendarState.validation);
  const auditMeta = extractAuditMeta(summary);
  const revisionCode = formatRevisionCode(auditMeta.documentVersion);
  const fairnessOfficerRows = buildFairnessOfficerRows(activeOfficers, calendarState.assignedRecords);
  const assignmentTotals = fairnessOfficerRows.map((row) => Number(row.totalAssignments));
  const fridayTotals = fairnessOfficerRows.map((row) => Number(row.fridayAssignments));
  const dynamicDistributionSpread =
    assignmentTotals.length > 0 ? Math.max(...assignmentTotals) - Math.min(...assignmentTotals) : 0;
  const dynamicFridaySpread =
    fridayTotals.length > 0 ? Math.max(...fridayTotals) - Math.min(...fridayTotals) : 0;
  const averageAssignment =
    fairnessOfficerRows.length > 0
      ? (
          assignmentTotals.reduce((sum, value) => sum + value, 0) /
          fairnessOfficerRows.length
        ).toFixed(2)
      : "0.00";
  const summaryFairness = summary?.fairness;
  const fairnessSummaryRows = [
    {
      label: "Window histori fairness",
      value: `${summaryFairness?.historyWindowMonths ?? 3} bulan`,
    },
    {
      label: "Cakupan petugas terjadwal",
      value: `${summaryFairness?.assignedOfficerCount ?? selectedOfficerNames.length}/${
        summaryFairness?.eligibleOfficerCount ?? activeOfficers.length
      } (${summaryFairness?.coverageRate ?? 0}%)`,
    },
    {
      label: "Spread penugasan total",
      value: String(summaryFairness?.distributionSpread ?? dynamicDistributionSpread),
    },
    {
      label: "Spread slot Jumat",
      value: String(summaryFairness?.fridaySpread ?? dynamicFridaySpread),
    },
    {
      label: "Rata-rata tugas per petugas",
      value: averageAssignment,
    },
  ];
  const scheduleRules = [...BASE_SCHEDULE_RULES];
  if (wfoStartDateOverride) {
    scheduleRules.unshift(
      `Khusus ${monthYearText}, slot WFO efektif mulai ${formatIsoDate(wfoStartDateOverride)}.`
    );
  }
  const executiveSummaryRows = [
    { label: "Total Petugas Aktif", value: String(activeOfficers.length) },
    {
      label: "Total Hari Kerja Efektif",
      value: String(summary?.totalWorkingDays ?? 0),
    },
    { label: "Total Slot Jadwal", value: String(summary?.totalSlots ?? 0) },
    { label: "Total Petugas Terpilih", value: String(selectedOfficerNames.length) },
    { label: "Total Petugas Belum Terpilih", value: String(unselectedOfficerNames.length) },
    {
      label: "Total Slot Belum Terisi",
      value: String(summary?.totalUnassigned ?? calendarState.validation.unfilledSlotCount),
    },
  ];

  return {
    title: `JADWAL PETUGAS PST BULAN ${monthYearText.toUpperCase()}`,
    monthYearLabel: monthYearText,
    generatedAtLabel,
    generatedByLabel:
      generatedByName || generatedById || auditMeta.generatedByName || summary?.audit?.generatedById || "-",
    documentVersionLabel: `VER-${String(auditMeta.documentVersion).padStart(2, "0")}`,
    revisionCodeLabel: revisionCode,
    documentStatusLabel: resolveDocumentStatusLabel(schedule, summary),
    changeNotes: auditMeta.changeNotes,
    executiveSummaryRows,
    validations: validationItems,
    weekRows: calendarState.weekRows,
    selectedOfficerNames,
    unselectedOfficerNames,
    priorityOfficerNames,
    fairnessNote,
    fairnessSummaryRows,
    fairnessOfficerRows,
    rules: scheduleRules,
  };
};

const buildPdfBufferFromViewModel = async (view: PstSchedulePdfViewModel) => {
  const doc = new PDFDocument({
    size: "A4",
    layout: "portrait",
    margin: 40,
    font: PST_PDF_FONT_PATH,
  });
  // Map standard PDFKit font names to bundled TTF so runtime doesn't depend on .afm files.
  doc.registerFont("Helvetica", PST_PDF_FONT_PATH);
  doc.registerFont("Helvetica-Bold", PST_PDF_FONT_PATH);

  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const marginLeft = doc.page.margins.left;
  const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const bodyBottomLimit = doc.page.height - doc.page.margins.bottom - 52;
  let pageNumber = 1;
  let y = doc.page.margins.top;

  const palette = {
    ink: "#0F172A",
    muted: "#475569",
    soft: "#64748B",
    border: "#CBD5E1",
    panel: "#F8FAFC",
    panelStrong: "#EEF2FF",
    header: "#E2E8F0",
    issue: "#FFF1F2",
    holiday: "#F8FAFC",
    white: "#FFFFFF",
  } as const;

  const drawFooter = () => {
    const footerY = doc.page.height - doc.page.margins.bottom - 24;
    doc
      .moveTo(marginLeft, footerY - 6)
      .lineTo(marginLeft + contentWidth, footerY - 6)
      .strokeColor(palette.border)
      .lineWidth(0.7)
      .stroke();

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(palette.muted)
      .text(FOOTER_TEXT, marginLeft, footerY, {
        width: contentWidth,
        align: "center",
      });

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(palette.soft)
      .text(`Halaman ${pageNumber}`, marginLeft, footerY + 10, {
        width: contentWidth,
        align: "right",
      });
  };

  const addPage = (continuationTitle?: string) => {
    doc.addPage({ size: "A4", layout: "portrait", margin: 40 });
    pageNumber += 1;
    y = doc.page.margins.top;
    drawFooter();
    if (continuationTitle) {
      doc
        .font("Helvetica-Bold")
        .fontSize(10.5)
        .fillColor(palette.ink)
        .text(continuationTitle, marginLeft, y, {
          width: contentWidth,
        });
      y = doc.y + 8;
    }
  };

  const ensureSpace = (height: number, continuationTitle?: string) => {
    if (y + height > bodyBottomLimit) {
      addPage(continuationTitle);
      return true;
    }
    return false;
  };

  drawFooter();

  const logoX = marginLeft;
  const logoY = y;
  const logoBoxSize = 56;

  doc
    .save()
    .rect(marginLeft, logoY - 6, contentWidth, logoBoxSize + 12)
    .fill(palette.panel)
    .restore();

  if (logoPath) {
    doc.image(logoPath, logoX, logoY, {
      fit: [logoBoxSize, logoBoxSize],
      align: "center",
      valign: "center",
    });
    doc.rect(logoX, logoY, logoBoxSize, logoBoxSize).strokeColor(palette.border).lineWidth(0.7).stroke();
  } else {
    doc.rect(logoX, logoY, logoBoxSize, logoBoxSize).strokeColor(palette.border).lineWidth(1).stroke();
    doc.font("Helvetica").fontSize(8).fillColor(palette.soft).text("LOGO", logoX, logoY + 22, {
      width: logoBoxSize,
      align: "center",
    });
  }

  const institutionX = logoX + logoBoxSize + 12;
  doc.font("Helvetica-Bold").fontSize(16.5).fillColor(palette.ink).text(INSTITUTION_TITLE, institutionX, logoY + 6, {
    width: contentWidth - logoBoxSize - 12,
  });
  doc.font("Helvetica-Bold").fontSize(15.5).fillColor(palette.ink).text(INSTITUTION_SUBTITLE, institutionX, logoY + 30, {
    width: contentWidth - logoBoxSize - 12,
  });

  y = logoY + logoBoxSize + 12;
  doc.moveTo(marginLeft, y).lineTo(marginLeft + contentWidth, y).strokeColor(palette.ink).lineWidth(1).stroke();
  y += 6;
  doc.moveTo(marginLeft, y).lineTo(marginLeft + contentWidth, y).strokeColor(palette.border).lineWidth(0.8).stroke();
  y += 18;

  doc.font("Helvetica-Bold").fontSize(14.5).fillColor(palette.ink).text(view.title, marginLeft, y, {
    width: contentWidth,
    align: "center",
  });
  y = doc.y + 14;

  const metadataRows = [`Generate : ${view.generatedAtLabel}`];

  doc.font(PST_PDF_FONT_PATH).fontSize(9.5).fillColor(palette.muted);
  for (const row of metadataRows) {
    ensureSpace(20);
    doc.save().rect(marginLeft, y - 2, contentWidth, 18).fill(palette.panelStrong).restore();
    doc.text(row, marginLeft + 8, y + 2, { width: contentWidth - 16 });
    y = doc.y + 1;
  }

  y += 4;

  ensureSpace(26);
  doc.moveTo(marginLeft, y).lineTo(marginLeft + contentWidth, y).strokeColor(palette.border).lineWidth(0.8).stroke();
  y += 10;

  doc.font("Helvetica-Bold").fontSize(11.5).fillColor(palette.ink).text("Ringkasan", marginLeft, y, {
    width: contentWidth,
  });
  y = doc.y + 6;

  const summaryCols = [marginLeft, marginLeft + contentWidth / 2];
  const summaryLabelWidth = 148;
  const halfIndex = Math.ceil(view.executiveSummaryRows.length / 2);
  const leftSummary = view.executiveSummaryRows.slice(0, halfIndex);
  const rightSummary = view.executiveSummaryRows.slice(halfIndex);
  const rowCount = Math.max(leftSummary.length, rightSummary.length);
  ensureSpace(rowCount * 16 + 16);

  doc.save().rect(marginLeft, y - 2, contentWidth, rowCount * 16 + 10).fill(palette.panel).restore();

  const drawSummaryRow = (
    rows: Array<{ label: string; value: string }>,
    startX: number,
    index: number
  ) => {
    const row = rows[index];
    if (!row) {
      return;
    }
    const lineY = y + 2 + index * 16;
    doc.font("Helvetica").fontSize(9.5).fillColor(palette.muted).text(row.label, startX + 8, lineY, {
      width: summaryLabelWidth,
    });
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(palette.ink).text(`: ${row.value}`, startX + 8 + summaryLabelWidth, lineY, {
      width: contentWidth / 2 - summaryLabelWidth - 16,
    });
  };

  for (let index = 0; index < rowCount; index += 1) {
    drawSummaryRow(leftSummary, summaryCols[0]!, index);
    drawSummaryRow(rightSummary, summaryCols[1]!, index);
  }
  y += rowCount * 16 + 14;
  y += 8;

  const tableColumns = [
    { key: "dayName", label: "Hari", width: 72, align: "center" as const },
    { key: "dateLabel", label: "Tanggal", width: 92, align: "center" as const },
    { key: "pstOfficer", label: "Petugas PST", width: 128, align: "left" as const },
    { key: "wfoOfficer", label: "Petugas WFO", width: 128, align: "left" as const },
    { key: "note", label: "Keterangan", width: contentWidth - (72 + 92 + 128 + 128), align: "left" as const },
  ] as const;

  const headerHeight = 22;

  const drawTableHeader = () => {
    doc.save();
    doc.rect(marginLeft, y, contentWidth, headerHeight).fill(palette.header);
    doc.restore();

    let x = marginLeft;
    doc.font("Helvetica-Bold").fontSize(9).fillColor(palette.ink);
    for (const column of tableColumns) {
      doc.rect(x, y, column.width, headerHeight).strokeColor(palette.border).lineWidth(0.8).stroke();
      doc.text(column.label, x + 4, y + 6, {
        width: column.width - 8,
        align: column.align,
        ellipsis: true,
      });
      x += column.width;
    }
    y += headerHeight;
  };

  ensureSpace(30, "Tabel Jadwal (lanjutan)");
  doc.font("Helvetica-Bold").fontSize(11.5).fillColor(palette.ink).text("Tabel Jadwal", marginLeft, y, {
    width: contentWidth,
  });
  y = doc.y + 6;

  const weekRanges = buildWeekRangeLabels(view.weekRows);
  const weekRangeMap = new Map(weekRanges.map((item) => [item.week, item.label]));
  const weekNumbers = Array.from(new Set(view.weekRows.map((row) => row.week))).sort((a, b) => a - b);
  for (const week of weekNumbers) {
    const rows = view.weekRows.filter((row) => row.week === week);
    const weekTitle = `Minggu ${week} (${weekRangeMap.get(week) ?? "-"})`;
    ensureSpace(22 + headerHeight + 18, "Tabel Jadwal (lanjutan)");
    doc
      .save()
      .rect(marginLeft, y - 1, contentWidth, 18)
      .fill(palette.panelStrong)
      .restore();
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(palette.ink)
      .text(weekTitle, marginLeft + 8, y + 3, { width: contentWidth - 16 });
    y = doc.y + 4;
    drawTableHeader();

    rows.forEach((row, rowIndex) => {
      const rowValues: Record<(typeof tableColumns)[number]["key"], string> = {
        dayName: row.dayName,
        dateLabel: row.dateLabel,
        pstOfficer: row.pstOfficer,
        wfoOfficer: row.wfoOfficer,
        note: row.note,
      };

      doc.font(PST_PDF_FONT_PATH).fontSize(9);
      const rowHeight = Math.max(
        22,
        ...tableColumns.map((column) =>
          Math.ceil(
            doc.heightOfString(rowValues[column.key], {
              width: column.width - 8,
              align: column.align,
            }) + 8
          )
        )
      );

      if (ensureSpace(rowHeight, `Tabel Jadwal ${weekTitle} (lanjutan)`)) {
        drawTableHeader();
      }

      const rowColor = row.isHoliday
        ? palette.holiday
        : row.hasIssue
          ? palette.issue
          : rowIndex % 2 === 1
            ? palette.panel
            : palette.white;
      doc.save();
      doc.rect(marginLeft, y, contentWidth, rowHeight).fill(rowColor);
      doc.restore();

      let x = marginLeft;
      doc.font(PST_PDF_FONT_PATH).fontSize(9).fillColor(palette.ink);
      for (const column of tableColumns) {
        doc.rect(x, y, column.width, rowHeight).strokeColor(palette.border).lineWidth(0.7).stroke();
        doc.text(rowValues[column.key], x + 4, y + 5, {
          width: column.width - 8,
          height: rowHeight - 8,
          align: column.align,
        });
        x += column.width;
      }

      y += rowHeight;
    });

    y += 6;
  }

  y += 8;
  ensureSpace(26, "Ringkasan Petugas (lanjutan)");
  doc.moveTo(marginLeft, y).lineTo(marginLeft + contentWidth, y).strokeColor(palette.border).lineWidth(0.8).stroke();
  y += 8;

  doc.font("Helvetica-Bold").fontSize(11.5).fillColor(palette.ink).text("Ringkasan Petugas", marginLeft, y, {
    width: contentWidth,
  });
  y = doc.y + 6;

  const drawOfficerSummaryRow = (label: string, value: string) => {
    ensureSpace(26, "Ringkasan Petugas (lanjutan)");
    doc.save().rect(marginLeft, y - 1, contentWidth, 20).fill(palette.panel).restore();
    doc.font("Helvetica-Bold").fontSize(9.3).fillColor(palette.ink).text(label, marginLeft + 8, y + 4, {
      width: 180,
    });
    doc.font(PST_PDF_FONT_PATH).fontSize(9.3).fillColor(palette.muted).text(value, marginLeft + 188, y + 4, {
      width: contentWidth - 196,
    });
    y += 22;
  };

  drawOfficerSummaryRow(
    `Petugas Terpilih (${view.selectedOfficerNames.length})`,
    view.selectedOfficerNames.length > 0 ? view.selectedOfficerNames.join(", ") : "-"
  );
  drawOfficerSummaryRow(
    `Petugas Belum Terpilih (${view.unselectedOfficerNames.length})`,
    view.unselectedOfficerNames.length > 0 ? view.unselectedOfficerNames.join(", ") : "-"
  );
  drawOfficerSummaryRow(
    `Prioritas Bulan Berikutnya (${view.priorityOfficerNames.length})`,
    view.priorityOfficerNames.length > 0 ? view.priorityOfficerNames.join(", ") : "-"
  );
  drawOfficerSummaryRow("Catatan fairness", view.fairnessNote);

  doc.font("Helvetica-Bold").fontSize(12.5).fillColor(palette.ink).text("Ringkasan Fairness (Audit)", marginLeft, y, {
    width: contentWidth,
  });
  y = doc.y + 6;

  const fairnessMetaLabelWidth = 180;
  for (const row of view.fairnessSummaryRows) {
    ensureSpace(20, "Ringkasan Fairness (lanjutan)");
    doc.save().rect(marginLeft, y - 1, contentWidth, 18).fill(palette.panel).restore();
    doc.font("Helvetica").fontSize(9.2).fillColor(palette.muted).text(row.label, marginLeft + 8, y + 3, {
      width: fairnessMetaLabelWidth,
    });
    doc.font("Helvetica-Bold").fontSize(9.2).fillColor(palette.ink).text(`: ${row.value}`, marginLeft + fairnessMetaLabelWidth + 8, y + 3, {
      width: contentWidth - fairnessMetaLabelWidth - 16,
    });
    y += 20;
  }

  y += 4;
  ensureSpace(24, "Detail Fairness per Petugas (lanjutan)");
  doc.font("Helvetica-Bold").fontSize(10.5).fillColor(palette.ink).text("Detail Fairness per Petugas", marginLeft, y, {
    width: contentWidth,
  });
  y = doc.y + 6;

  const fairnessColumns = [
    { key: "name", label: "Petugas", width: 180, align: "left" as const },
    { key: "totalAssignments", label: "Total", width: 52, align: "center" as const },
    { key: "pstAssignments", label: "PST", width: 48, align: "center" as const },
    { key: "wfoAssignments", label: "WFO", width: 48, align: "center" as const },
    { key: "fridayAssignments", label: "Jumat", width: 52, align: "center" as const },
    { key: "lastAssignedLabel", label: "Terakhir Bertugas", width: contentWidth - (180 + 52 + 48 + 48 + 52), align: "center" as const },
  ] as const;
  const fairnessHeaderHeight = 20;

  const drawFairnessHeader = () => {
    doc.save();
    doc.rect(marginLeft, y, contentWidth, fairnessHeaderHeight).fill(palette.header);
    doc.restore();

    let x = marginLeft;
    doc.font("Helvetica-Bold").fontSize(8.2).fillColor(palette.ink);
    for (const column of fairnessColumns) {
      doc.rect(x, y, column.width, fairnessHeaderHeight).strokeColor(palette.border).lineWidth(0.8).stroke();
      doc.text(column.label, x + 4, y + 6, { width: column.width - 8, align: column.align, ellipsis: true });
      x += column.width;
    }
    y += fairnessHeaderHeight;
  };

  ensureSpace(30, "Detail Fairness per Petugas (lanjutan)");
  drawFairnessHeader();
  view.fairnessOfficerRows.forEach((row, rowIndex) => {
    const rowValues: Record<(typeof fairnessColumns)[number]["key"], string> = {
      name: row.name,
      totalAssignments: row.totalAssignments,
      pstAssignments: row.pstAssignments,
      wfoAssignments: row.wfoAssignments,
      fridayAssignments: row.fridayAssignments,
      lastAssignedLabel: row.lastAssignedLabel,
    };

    doc.font(PST_PDF_FONT_PATH).fontSize(8.5);
    const rowHeight = Math.max(
      18,
        ...fairnessColumns.map((column) =>
          Math.ceil(
            doc.heightOfString(rowValues[column.key], {
              width: column.width - 8,
              align: column.align,
            }) + 7
          )
        )
      );

    if (ensureSpace(rowHeight, "Detail Fairness per Petugas (lanjutan)")) {
      drawFairnessHeader();
    }

    doc
      .save()
      .rect(marginLeft, y, contentWidth, rowHeight)
      .fill(rowIndex % 2 === 1 ? palette.panel : palette.white)
      .restore();

    let x = marginLeft;
    for (const column of fairnessColumns) {
      doc.rect(x, y, column.width, rowHeight).strokeColor(palette.border).lineWidth(0.7).stroke();
      doc.text(rowValues[column.key], x + 4, y + 4, {
        width: column.width - 8,
        height: rowHeight - 6,
        align: column.align,
      });
      x += column.width;
    }
    y += rowHeight;
  });

  doc.end();
  return done;
};

const writePdfArtifacts = async (
  schedule: MonthlyScheduleResponse,
  generatedById: string | null,
  pdfBody: Buffer,
  htmlBody: string
): Promise<PersistedPstSchedulePdfMeta> => {
  const filePaths = toSchedulePdfFilePaths(schedule.id, schedule.month, schedule.year);
  const generatedAtIso = new Date().toISOString();
  const metadata: PersistedPstSchedulePdfMeta = {
    scheduleId: schedule.id,
    fileName: filePaths.fileName,
    path: filePaths.relativePath,
    htmlPath: filePaths.htmlRelativePath,
    metadataPath: filePaths.metadataRelativePath,
    month: schedule.month,
    year: schedule.year,
    generatedAt: generatedAtIso,
    generatedById: generatedById ?? null,
    downloadUrl: toDownloadUrl(schedule.id),
  };

  await fs.mkdir(path.dirname(filePaths.absolutePath), { recursive: true });
  await Promise.all([
    fs.writeFile(filePaths.absolutePath, pdfBody),
    fs.writeFile(filePaths.htmlAbsolutePath, htmlBody, "utf-8"),
    fs.writeFile(filePaths.metadataAbsolutePath, JSON.stringify(metadata, null, 2), "utf-8"),
  ]);

  return metadata;
};

const generatePdfArtifacts = async (params: BuildAndStoreParams) => {
  const view = await buildSchedulePdfViewModel(
    params.schedule,
    params.generatedById ?? null,
    params.generatedByName ?? null
  );
  const html = buildPstSchedulePdfHtmlTemplate(view);
  const pdf = await buildPdfBufferFromViewModel(view);
  const metadata = await writePdfArtifacts(params.schedule, params.generatedById ?? null, pdf, html);

  return {
    body: pdf,
    html,
    metadata,
  };
};

const fallbackPdfMeta = (
  schedule: MonthlyScheduleResponse,
  paths: PstSchedulePdfFilePaths
): PersistedPstSchedulePdfMeta => ({
  scheduleId: schedule.id,
  fileName: paths.fileName,
  path: paths.relativePath,
  htmlPath: paths.htmlRelativePath,
  metadataPath: paths.metadataRelativePath,
  month: schedule.month,
  year: schedule.year,
  generatedAt: new Date().toISOString(),
  generatedById: null,
  downloadUrl: toDownloadUrl(schedule.id),
});

export async function generateAndStorePstSchedulePdf(params: BuildAndStoreParams) {
  try {
    const result = await generatePdfArtifacts(params);

    return {
      ok: true as const,
      body: result.body,
      contentType: "application/pdf",
      fileName: result.metadata.fileName,
      metadata: result.metadata,
    };
  } catch (error) {
    return {
      ok: false as const,
      status: 500,
      error: error instanceof Error ? error.message : "Gagal membuat PDF jadwal bulanan",
    };
  }
}

export async function getStoredOrCreatePstSchedulePdf(scheduleId: string) {
  const schedule = await getMonthlyScheduleById(scheduleId);
  if (!schedule) {
    return {
      ok: false as const,
      status: 404,
      error: "Jadwal bulanan tidak ditemukan",
    };
  }

  try {
    const filePaths = toSchedulePdfFilePaths(schedule.id, schedule.month, schedule.year);
    const existingPdf = await readFileOrNull(filePaths.absolutePath);

    if (existingPdf) {
      const storedMeta = await readJsonOrNull<PersistedPstSchedulePdfMeta>(filePaths.metadataAbsolutePath);
      return {
        ok: true as const,
        body: existingPdf,
        contentType: "application/pdf",
        fileName: filePaths.fileName,
        metadata: storedMeta ?? fallbackPdfMeta(schedule, filePaths),
      };
    }

    const generated = await generateAndStorePstSchedulePdf({
      schedule,
      generatedById: null,
      generatedByName: null,
    });
    if (!generated.ok) {
      return generated;
    }

    return generated;
  } catch (error) {
    return {
      ok: false as const,
      status: 500,
      error: error instanceof Error ? error.message : "Gagal menyiapkan file PDF jadwal bulanan",
    };
  }
}

