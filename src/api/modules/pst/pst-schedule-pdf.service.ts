import { createWriteStream, existsSync, promises as fs } from "node:fs";
import path from "node:path";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  PstOfficerEmploymentStatus,
  PstScheduleDetailStatus,
  PstScheduleStatus,
} from "@prisma/client";
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
  wfoFixedOfficerNames: string[];
  notes: string[];
};

type PstAssignedRecord = {
  date: string;
  dayName: string;
  role: "PST" | "WFO";
  officerId: string;
  officerName: string;
};

type MonthPeriod = {
  year: number;
  month: number;
};

type OfficerHistoryAggregate = {
  historyWindowTotal: number;
  historyWindowPst: number;
  historyWindowWfo: number;
  previousMonthTotal: number;
  previousMonthPst: number;
  previousMonthWfo: number;
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
  includeBody?: boolean;
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
  "Setiap Jumat efektif wajib memiliki 1 PST Jumat dan 1 WFO Jumat Random (dua orang berbeda).",
  "WFO Jumat Tetap tidak dihitung sebagai fairness random.",
  "Hari libur nasional/cuti bersama dikosongkan.",
  "Petugas unavailable tidak dapat dipilih.",
  "Fairness random memakai snapshot final scheduleDetail pada window histori 3 bulan.",
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

const shiftMonthPeriod = (year: number, month: number, delta: number): MonthPeriod => {
  const shifted = new Date(year, month - 1 + delta, 1);
  return {
    year: shifted.getFullYear(),
    month: shifted.getMonth() + 1,
  };
};

const getMonthStartDate = ({ year, month }: MonthPeriod) => new Date(year, month - 1, 1);

const formatMonthPeriodLabel = (period: MonthPeriod) => monthLabel(period.month, period.year);

const formatHistoryRangeLabel = (startPeriod: MonthPeriod, endPeriod: MonthPeriod) => {
  const startLabel = formatMonthPeriodLabel(startPeriod);
  const endLabel = formatMonthPeriodLabel(endPeriod);
  return startLabel === endLabel ? startLabel : `${startLabel} - ${endLabel}`;
};

const getAppTimeZone = () => process.env.APP_TIMEZONE?.trim() || "Asia/Makassar";

const getIndonesiaTimeZoneLabel = (timeZone: string) => {
  if (timeZone === "Asia/Jakarta") return "WIB";
  if (timeZone === "Asia/Jayapura") return "WIT";
  if (timeZone === "Asia/Makassar") return "WITA";
  return null;
};

const formatDateTimeWithZoneLabel = (value: Date) => {
  const timeZone = getAppTimeZone();
  const formatter = new Intl.DateTimeFormat("id-ID", {
    timeZone,
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(value);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value])) as Record<
    string,
    string
  >;

  const day = byType.day ?? "00";
  const month = byType.month ?? "-";
  const year = byType.year ?? "0000";
  const hour = byType.hour ?? "00";
  const minute = byType.minute ?? "00";
  const second = byType.second ?? "00";
  const zoneLabel = getIndonesiaTimeZoneLabel(timeZone) ?? timeZone;

  return `${day} ${month} ${year} ${hour}:${minute}:${second} ${zoneLabel}`;
};

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

const buildPstSchedulePdfBaseFileName = (month: number, year: number) =>
  `Jadwal_PST_WFO_${String(month).padStart(2, "0")}_${year}`;

const toSchedulePdfFilePaths = (month: number, year: number): PstSchedulePdfFilePaths => {
  const monthToken = String(month).padStart(2, "0");
  const directory = path.posix.join(String(year), monthToken);
  const stem = buildPstSchedulePdfBaseFileName(month, year);
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
        wfoFixedOfficerNames: [],
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
        wfoFixedOfficerNames: [],
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
      const fixedWfoNames = isFriday
        ? Array.from(
            new Set(
              notes.flatMap((note) => {
                const match = /WFO Tetap:\s*([^|]+)/i.exec(note);
                if (!match || !match[1]) return [];
                return match[1]
                  .split(",")
                  .map((name) => name.trim())
                  .filter(Boolean);
              })
            )
          )
        : [];
      const fixedWfoCount = fixedWfoNames.length;
      const hasFixedCoverageOnly = isFriday && requiresWfo && fixedWfoCount > 0 && !row.wfoOfficerId;
      const pstOfficer = row.isHoliday ? "-" : row.pstOfficerName || "BELUM TERISI";
      const wfoRandomOfficer = row.isHoliday
        ? "-"
        : isFriday
          ? requiresWfo
            ? hasFixedCoverageOnly
              ? "-"
              : row.wfoOfficerName || "BELUM TERISI"
            : "-"
          : "-";
      const wfoFixedOfficer = row.isHoliday ? "-" : isFriday ? (fixedWfoNames.join(", ") || "-") : "-";

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
          const fridayCoverageReady = !requiresWfo || Boolean(row.wfoOfficerId);
          const fridayIncomplete = !row.hasPstSlot || !row.pstOfficerId || !fridayCoverageReady;
          if (fridayIncomplete) {
            fridayIncompleteCount += 1;
            notes.push("SLOT JUMAT BELUM LENGKAP");
          }

          if (requiresWfo && !row.wfoOfficerId) {
            unfilledSlotCount += 1;
            notes.push("WFO JUMAT RANDOM BELUM TERISI");
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

      const dedupedNotes = Array.from(
        new Set(
          notes
            .map((noteText) => noteText.trim())
            .filter((noteText) => Boolean(noteText) && !/WFO\s*TETAP\s*:/i.test(noteText))
        )
      );
      const note = buildCompactNote(dedupedNotes);
      weekRows.push({
        week,
        dateIso: row.date,
        dayName: row.dayName,
        dateLabel: formatIsoDate(row.date),
        pstOfficer,
        wfoRandomOfficer,
        wfoFixedOfficer,
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
    rule: "Jumat harus punya PST Jumat dan WFO Jumat Random",
    detail:
      validation.fridayIncompleteCount === 0
        ? "Semua hari Jumat memiliki PST Jumat dan WFO Jumat Random."
        : `${validation.fridayIncompleteCount} hari Jumat belum lengkap PST/WFO random.`,
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
  summary: MonthlyScheduleSummary | null | undefined,
  activeOfficers: Array<{ id: string; name: string }>,
  assignedRecords: PstAssignedRecord[],
  historyByOfficerId: Map<string, OfficerHistoryAggregate>
): PstSchedulePdfFairnessOfficerRow[] => {
  const summaryRows = summary?.fairness?.officerDetails;
  if (Array.isArray(summaryRows) && summaryRows.length > 0) {
    return [...summaryRows]
      .sort((left, right) => left.name.localeCompare(right.name, "id"))
      .map((row) => ({
        name: row.name,
        poolPstLabel: row.poolPstLabel,
        statusWfoFriday: row.statusWfoFriday,
        pstCurrentMonth: row.pstCurrentMonthDisplay,
        pstFridayCurrentMonth: row.pstFridayCurrentMonthDisplay,
        randomWfoFridayCurrentMonth: row.randomWfoFridayCurrentMonthDisplay,
        fixedWfoFridayCurrentMonth: row.fixedWfoFridayCurrentMonthDisplay,
        fridayRandomBurdenCurrentMonth: String(row.fridayRandomBurdenCurrentMonth),
        totalOperationalPresence: String(row.totalOperationalPresence),
        previousMonthFridayBurden: String(row.previousMonthFridayBurden),
        totalCurrentMonthForRandomFairness: String(row.totalCurrentMonthForRandomFairness),
        previousMonthRandomTotal: String(row.previousMonthRandomTotal),
        historyWindowFridayBurden: String(row.historyWindowFridayBurden),
        historyWindowTotalRandomAssignments: String(row.historyWindowTotalRandomAssignments),
        cumulativeRandomFairnessTotal: String(row.cumulativeRandomFairnessTotal),
        fairnessStatus: row.fairnessStatus,
        nextPriorityRole: row.nextPriorityRole,
        priorityReason: row.priorityReason,
        lastRandomAssignedDate: row.lastRandomAssignedDate ? formatIsoDate(row.lastRandomAssignedDate) : "-",
      }));
  }

  const rowMap = new Map<
    string,
    {
      officerId: string;
      name: string;
      pstAssignments: number;
      randomWfoAssignments: number;
    }
  >();

  for (const officer of activeOfficers) {
    rowMap.set(officer.id, {
      officerId: officer.id,
      name: officer.name,
      pstAssignments: 0,
      randomWfoAssignments: 0,
    });
  }

  for (const record of assignedRecords) {
    const bucket = rowMap.get(record.officerId) ?? {
      officerId: record.officerId,
      name: record.officerName,
      pstAssignments: 0,
      randomWfoAssignments: 0,
    };
    if (record.role === "PST") {
      bucket.pstAssignments += 1;
    } else {
      bucket.randomWfoAssignments += 1;
    }
    rowMap.set(record.officerId, bucket);
  }

  return Array.from(rowMap.values())
    .sort((left, right) => {
      const leftTotal = left.pstAssignments + left.randomWfoAssignments;
      const rightTotal = right.pstAssignments + right.randomWfoAssignments;
      if (leftTotal !== rightTotal) {
        return rightTotal - leftTotal;
      }
      return left.name.localeCompare(right.name, "id");
    })
    .map((row) => ({
      name: row.name,
      poolPstLabel: "Normal",
      statusWfoFriday: "Random",
      pstCurrentMonth: String(row.pstAssignments),
      pstFridayCurrentMonth: "0",
      randomWfoFridayCurrentMonth: String(row.randomWfoAssignments),
      fixedWfoFridayCurrentMonth: "-",
      fridayRandomBurdenCurrentMonth: "0",
      totalOperationalPresence: String(row.pstAssignments + row.randomWfoAssignments),
      previousMonthFridayBurden: "0",
      totalCurrentMonthForRandomFairness: String(row.pstAssignments + row.randomWfoAssignments),
      previousMonthRandomTotal: String(historyByOfficerId.get(row.officerId)?.previousMonthTotal ?? 0),
      historyWindowFridayBurden: "0",
      historyWindowTotalRandomAssignments: String(
        historyByOfficerId.get(row.officerId)?.historyWindowTotal ?? 0
      ),
      cumulativeRandomFairnessTotal: String(
        (historyByOfficerId.get(row.officerId)?.historyWindowTotal ?? 0) +
          row.pstAssignments +
          row.randomWfoAssignments
      ),
      fairnessStatus: "Audit Legacy",
      nextPriorityRole: "-",
      priorityReason: "Menggunakan fallback karena summary fairness detail tidak tersedia",
      lastRandomAssignedDate: "-",
    }));
};

const buildSchedulePdfViewModel = async (
  schedule: MonthlyScheduleResponse,
  generatedById: string | null,
  generatedByName: string | null
): Promise<PstSchedulePdfViewModel> => {
  const summary = (schedule.summary ?? null) as MonthlyScheduleSummary | null;
  const generatedAtDate = asDate(schedule.generatedAt);
  const generatedAtLabel = formatDateTimeWithZoneLabel(generatedAtDate);
  const monthYearText = monthLabel(schedule.month, schedule.year);
  const wfoStartDateOverride = getWfoStartDateOverride(schedule.year, schedule.month);
  const calendarState = await buildScheduleCalendarState(schedule);
  const summaryFairness = summary?.fairness;
  const historyWindowMonths = Math.max(1, summaryFairness?.historyWindowMonths ?? 3);
  const currentMonthPeriod: MonthPeriod = { year: schedule.year, month: schedule.month };
  const previousMonthPeriod = shiftMonthPeriod(schedule.year, schedule.month, -1);
  const historyWindowStartPeriod = shiftMonthPeriod(
    schedule.year,
    schedule.month,
    -historyWindowMonths
  );
  const currentMonthStartDate = getMonthStartDate(currentMonthPeriod);
  const historyWindowStartDate = getMonthStartDate(historyWindowStartPeriod);

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
  const fairnessHistoryRecords = await prisma.scheduleDetail.findMany({
    where: {
      officerId: { not: null },
      scheduleDate: {
        gte: historyWindowStartDate,
        lt: currentMonthStartDate,
      },
      status: {
        in: [
          PstScheduleDetailStatus.ASSIGNED,
          PstScheduleDetailStatus.REPLACED,
          PstScheduleDetailStatus.SWAPPED,
        ],
      },
      monthlySchedule: {
        status: {
          not: PstScheduleStatus.CANCELLED,
        },
      },
    },
    select: {
      officerId: true,
      slotRole: true,
      monthlySchedule: {
        select: {
          month: true,
          year: true,
        },
      },
    },
  });
  const historyByOfficerId = new Map<string, OfficerHistoryAggregate>();
  for (const officer of activeOfficers) {
    historyByOfficerId.set(officer.id, {
      historyWindowTotal: 0,
      historyWindowPst: 0,
      historyWindowWfo: 0,
      previousMonthTotal: 0,
      previousMonthPst: 0,
      previousMonthWfo: 0,
    });
  }
  for (const record of fairnessHistoryRecords) {
    if (!record.officerId) {
      continue;
    }

    const bucket = historyByOfficerId.get(record.officerId) ?? {
      historyWindowTotal: 0,
      historyWindowPst: 0,
      historyWindowWfo: 0,
      previousMonthTotal: 0,
      previousMonthPst: 0,
      previousMonthWfo: 0,
    };
    bucket.historyWindowTotal += 1;
    if (record.slotRole === "PST") {
      bucket.historyWindowPst += 1;
    } else {
      bucket.historyWindowWfo += 1;
    }
    const sourceMonth = record.monthlySchedule?.month;
    const sourceYear = record.monthlySchedule?.year;
    if (sourceMonth === previousMonthPeriod.month && sourceYear === previousMonthPeriod.year) {
      bucket.previousMonthTotal += 1;
      if (record.slotRole === "PST") {
        bucket.previousMonthPst += 1;
      } else {
        bucket.previousMonthWfo += 1;
      }
    }
    historyByOfficerId.set(record.officerId, bucket);
  }

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
  const priorityPstNames =
    summaryFairness?.nextMonthPriority?.pst?.map((item) => item.name) ?? [];
  const priorityWfoRandomNames =
    summaryFairness?.nextMonthPriority?.wfoFridayRandom?.map((item) => item.name) ?? [];
  const priorityFridayBurdenNames =
    summaryFairness?.nextMonthPriority?.fridayBurden?.map((item) => item.name) ?? [];
  const priorityRandomTotalNames =
    summaryFairness?.nextMonthPriority?.randomTotal?.map((item) => item.name) ?? priorityOfficerNames;

  const fairnessNote =
    summary?.fairness?.note ??
    (unselectedOfficerNames.length > 0
      ? "Petugas yang belum kebagian jadwal diprioritaskan untuk generate bulan berikutnya."
      : "Semua petugas aktif telah mendapatkan jadwal pada bulan ini.");

  const validationItems = resolveValidationItems(summary, calendarState.validation);
  const auditMeta = extractAuditMeta(summary);
  const revisionCode = formatRevisionCode(auditMeta.documentVersion);
  const fairnessOfficerRows = buildFairnessOfficerRows(
    summary,
    activeOfficers,
    calendarState.assignedRecords,
    historyByOfficerId
  );
  const assignmentTotals = fairnessOfficerRows.map(
    (row) => Number(row.totalCurrentMonthForRandomFairness)
  );
  const fridayTotals = fairnessOfficerRows.map((row) => Number(row.fridayRandomBurdenCurrentMonth));
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
  const historyWindowTotalAssignments = Array.from(historyByOfficerId.values()).reduce(
    (sum, item) => sum + item.historyWindowTotal,
    0
  );
  const currentMonthAssignedCount =
    summary?.totalAssigned ?? calendarState.assignedRecords.length;
  const previousMonthTotalAssignments = Array.from(historyByOfficerId.values()).reduce(
    (sum, item) => sum + item.previousMonthTotal,
    0
  );
  const previousMonthLabel = formatMonthPeriodLabel(previousMonthPeriod);
  const fairnessSummaryRows = [
    {
      label: "Window histori fairness",
      value: `${historyWindowMonths} bulan`,
    },
    {
      label: "Rentang histori fairness",
      value: formatHistoryRangeLabel(historyWindowStartPeriod, previousMonthPeriod),
    },
    {
      label: "Riwayat Bulan Lalu",
      value: String(previousMonthTotalAssignments),
    },
    {
      label: "Histori Window",
      value: String(historyWindowTotalAssignments),
    },
    {
      label: "Total slot PST",
      value: String(summaryFairness?.monthlyOperationalSummary?.totalPstSlots ?? 0),
    },
    {
      label: "Total slot WFO Jumat Random",
      value: String(summaryFairness?.monthlyOperationalSummary?.totalWfoFridayRandomSlots ?? 0),
    },
    {
      label: "Total slot random bulan ini",
      value: String(
        summaryFairness?.monthlyOperationalSummary?.totalRandomSlots ?? currentMonthAssignedCount
      ),
    },
    {
      label: "Total WFO Jumat Tetap",
      value: String(summaryFairness?.monthlyOperationalSummary?.totalWfoFridayFixed ?? 0),
    },
    {
      label: "Total Kehadiran Operasional",
      value: String(
        summaryFairness?.monthlyOperationalSummary?.totalOperationalPresence ??
          (summaryFairness?.officerDetails?.reduce(
            (sum, row) => sum + row.totalOperationalPresence,
            0
          ) ?? currentMonthAssignedCount)
      ),
    },
    {
      label: "Total Kumulatif Fairness Random",
      value: String(historyWindowTotalAssignments + currentMonthAssignedCount),
    },
    {
      label: "Cakupan petugas terjadwal",
      value: `${summaryFairness?.assignedOfficerCount ?? selectedOfficerNames.length}/${
        summaryFairness?.eligibleOfficerCount ?? activeOfficers.length
      } (${summaryFairness?.coverageRate ?? 0}%)`,
    },
    {
      label: "Denominator cakupan random",
      value: `${summaryFairness?.denominator?.randomEligibleOfficerCount ?? 0} eligible random`,
    },
    {
      label: "Spread penugasan total",
      value: String(summaryFairness?.distributionSpread ?? dynamicDistributionSpread),
    },
    {
      label: "Spread beban Jumat random",
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
    title: `JADWAL PETUGAS PST DAN WFO BULAN ${monthYearText.toUpperCase()}`,
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
    priorityPstNames,
    priorityWfoRandomNames,
    priorityFridayBurdenNames,
    priorityRandomTotalNames,
    poolSummaryRows: summaryFairness?.poolSummary ?? [],
    fairnessNote,
    fairnessSummaryRows,
    fairnessOfficerRows,
    historyWindowColumnLabel: "Riwayat bulan sebelumnya",
    previousMonthColumnLabel: `Histori ${previousMonthLabel}`,
    rules: scheduleRules,
  };
};

const buildPdfBufferFromViewModel = async (
  view: PstSchedulePdfViewModel,
  options?: { outputPath?: string; collectBuffer?: boolean }
) => {
  const collectBuffer = options?.collectBuffer ?? true;
  const outputPath = options?.outputPath;
  const doc = new PDFDocument({
    size: "A4",
    layout: "portrait",
    margin: 44,
    font: PST_PDF_FONT_PATH,
  });
  // Map standard PDFKit font names to bundled TTF so runtime doesn't depend on .afm files.
  doc.registerFont("Helvetica", PST_PDF_FONT_PATH);
  doc.registerFont("Helvetica-Bold", PST_PDF_FONT_PATH);

  const fileStream = outputPath ? createWriteStream(outputPath) : null;
  if (fileStream) {
    doc.pipe(fileStream);
  }

  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((resolve, reject) => {
    if (collectBuffer) {
      doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    }
    doc.on("end", () => resolve(collectBuffer ? Buffer.concat(chunks) : Buffer.alloc(0)));
    doc.on("error", reject);
  });

  const fileDone = new Promise<void>((resolve, reject) => {
    if (!fileStream) {
      resolve();
      return;
    }
    fileStream.on("finish", () => resolve());
    fileStream.on("error", reject);
  });

  const marginLeft = doc.page.margins.left;
  const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const bodyBottomLimit = doc.page.height - doc.page.margins.bottom - 56;
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
    doc.addPage({ size: "A4", layout: "portrait", margin: 44 });
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
  } else {
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
  doc.moveTo(marginLeft, y).lineTo(marginLeft + contentWidth, y).strokeColor("#94A3B8").lineWidth(0.55).stroke();
  y += 18;

  doc.font("Helvetica-Bold").fontSize(14.5).fillColor(palette.ink).text(view.title, marginLeft, y, {
    width: contentWidth,
    align: "center",
  });
  y = doc.y + 18;

  const metadataRows = [`Generate : ${view.generatedAtLabel}`];

  doc.font(PST_PDF_FONT_PATH).fontSize(9.5).fillColor(palette.muted);
  for (const row of metadataRows) {
    ensureSpace(24);
    doc.save().rect(marginLeft, y - 2, contentWidth, 20).fill(palette.panelStrong).restore();
    doc.text(row, marginLeft + 8, y + 2, { width: contentWidth - 16 });
    y = doc.y + 3;
  }

  y += 10;

  ensureSpace(26);
  doc.moveTo(marginLeft, y).lineTo(marginLeft + contentWidth, y).strokeColor(palette.border).lineWidth(0.8).stroke();
  y += 10;

  doc.font("Helvetica-Bold").fontSize(11.5).fillColor(palette.ink).text("Ringkasan", marginLeft, y, {
    width: contentWidth,
  });
  y = doc.y + 10;

  const summaryCols = [marginLeft, marginLeft + contentWidth / 2];
  const summaryLabelWidth = 148;
  const halfIndex = Math.ceil(view.executiveSummaryRows.length / 2);
  const leftSummary = view.executiveSummaryRows.slice(0, halfIndex);
  const rightSummary = view.executiveSummaryRows.slice(halfIndex);
  const rowCount = Math.max(leftSummary.length, rightSummary.length);
  ensureSpace(rowCount * 20 + 22);

  doc.save().rect(marginLeft, y - 2, contentWidth, rowCount * 20 + 14).fill(palette.panel).restore();

  const drawSummaryRow = (
    rows: Array<{ label: string; value: string }>,
    startX: number,
    index: number
  ) => {
    const row = rows[index];
    if (!row) {
      return;
    }
    const lineY = y + 3 + index * 20;
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
  y += rowCount * 20 + 18;
  y += 14;

  const renderScheduleTable = () => {
    const tableColumns = [
      { key: "dayName", label: "Hari", width: 62, align: "center" as const },
      { key: "dateLabel", label: "Tanggal", width: 80, align: "center" as const },
      { key: "pstOfficer", label: "Petugas PST", width: 120, align: "left" as const },
      {
        key: "wfoRandomOfficer",
        label: "Petugas WFO Jumat",
        width: 110,
        align: "left" as const,
      },
      {
        key: "note",
        label: "Keterangan",
        width: contentWidth - (62 + 80 + 120 + 110),
        align: "left" as const,
      },
    ] as const;

    const headerHeight = 26;

    const drawTableHeader = () => {
      doc.save();
      doc.rect(marginLeft, y, contentWidth, headerHeight).fill(palette.header);
      doc.restore();

      let x = marginLeft;
      doc.font("Helvetica-Bold").fontSize(9).fillColor(palette.ink);
      for (const column of tableColumns) {
        doc.rect(x, y, column.width, headerHeight).strokeColor(palette.border).lineWidth(0.8).stroke();
        doc.text(column.label, x + 4, y + 8, {
          width: column.width - 8,
          align: column.align,
          ellipsis: true,
        });
        x += column.width;
      }
      y += headerHeight;
    };

    ensureSpace(36, "Tabel Jadwal (lanjutan)");
    doc.font("Helvetica-Bold").fontSize(11.5).fillColor(palette.ink).text("Tabel Jadwal", marginLeft, y, {
      width: contentWidth,
    });
    y = doc.y + 10;

    const weekRanges = buildWeekRangeLabels(view.weekRows);
    const weekRangeMap = new Map(weekRanges.map((item) => [item.week, item.label]));
    const weekNumbers = Array.from(new Set(view.weekRows.map((row) => row.week))).sort((a, b) => a - b);
    for (const week of weekNumbers) {
      const rows = view.weekRows.filter((row) => row.week === week);
      const weekTitle = `Minggu ${week} (${weekRangeMap.get(week) ?? "-"})`;
      ensureSpace(26 + headerHeight + 22, "Tabel Jadwal (lanjutan)");
      doc
        .save()
        .rect(marginLeft, y - 1, contentWidth, 20)
        .fill(palette.panelStrong)
        .restore();
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(palette.ink)
        .text(weekTitle, marginLeft + 8, y + 4, { width: contentWidth - 16 });
      y = doc.y + 6;
      drawTableHeader();

      rows.forEach((row, rowIndex) => {
        const rowValues: Record<(typeof tableColumns)[number]["key"], string> = {
          dayName: row.dayName,
          dateLabel: row.dateLabel,
          pstOfficer: row.pstOfficer,
          wfoRandomOfficer: row.wfoRandomOfficer,
          note: row.note,
        };

        doc.font(PST_PDF_FONT_PATH).fontSize(9);
        const rowHeight = Math.max(
          28,
          ...tableColumns.map((column) =>
            Math.ceil(
              doc.heightOfString(rowValues[column.key], {
                width: column.width - 8,
                align: column.align,
              }) + 12
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
          doc.text(rowValues[column.key], x + 4, y + 7, {
            width: column.width - 8,
            height: rowHeight - 12,
            align: column.align,
          });
          x += column.width;
        }

        y += rowHeight;
      });

      y += 10;
    }

  };

  y += 10;
  ensureSpace(26, "Ringkasan Petugas (lanjutan)");
  doc.moveTo(marginLeft, y).lineTo(marginLeft + contentWidth, y).strokeColor(palette.border).lineWidth(0.8).stroke();
  y += 12;

  doc.font("Helvetica-Bold").fontSize(11.5).fillColor(palette.ink).text("Ringkasan Petugas", marginLeft, y, {
    width: contentWidth,
  });
  y = doc.y + 10;

  const drawOfficerSummaryRow = (label: string, value: string) => {
    const labelWidth = 180;
    const valueWidth = contentWidth - 196;

    doc.font("Helvetica-Bold").fontSize(9.5);
    const labelHeight = doc.heightOfString(label, {
      width: labelWidth,
      align: "left",
    });

    doc.font(PST_PDF_FONT_PATH).fontSize(9.5);
    const valueHeight = doc.heightOfString(value, {
      width: valueWidth,
      align: "left",
    });

    const rowHeight = Math.max(28, Math.ceil(Math.max(labelHeight, valueHeight) + 14));
    ensureSpace(rowHeight + 6, "Ringkasan Petugas (lanjutan)");

    doc.save().rect(marginLeft, y - 1, contentWidth, rowHeight).fill(palette.panel).restore();
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(palette.ink).text(label, marginLeft + 8, y + 6, {
      width: labelWidth,
      height: rowHeight - 10,
    });
    doc.font(PST_PDF_FONT_PATH).fontSize(9.5).fillColor(palette.muted).text(value, marginLeft + 188, y + 6, {
      width: valueWidth,
      height: rowHeight - 10,
    });
    y += rowHeight + 4;
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
    `Prioritas PST Bulan Berikutnya (${(view.priorityPstNames ?? []).length})`,
    (view.priorityPstNames ?? []).length > 0 ? (view.priorityPstNames ?? []).join(", ") : "-"
  );
  drawOfficerSummaryRow(
    `Prioritas WFO Jumat Random Bulan Berikutnya (${(view.priorityWfoRandomNames ?? []).length})`,
    (view.priorityWfoRandomNames ?? []).length > 0
      ? (view.priorityWfoRandomNames ?? []).join(", ")
      : "-"
  );
  drawOfficerSummaryRow(
    `Prioritas Beban Jumat Bulan Berikutnya (${(view.priorityFridayBurdenNames ?? []).length})`,
    (view.priorityFridayBurdenNames ?? []).length > 0
      ? (view.priorityFridayBurdenNames ?? []).join(", ")
      : "-"
  );
  drawOfficerSummaryRow(
    `Prioritas Beban Random Total Bulan Berikutnya (${(view.priorityRandomTotalNames ?? []).length})`,
    (view.priorityRandomTotalNames ?? []).length > 0
      ? (view.priorityRandomTotalNames ?? []).join(", ")
      : "-"
  );

  addPage();
  y += 4;
  renderScheduleTable();

  // Keep fairness audit in one dedicated page so it is presentation-friendly.
  addPage();
  y += 4;
  doc.font("Helvetica-Bold").fontSize(12.5).fillColor(palette.ink).text("Lampiran Fairness", marginLeft, y, {
    width: contentWidth,
    align: "center",
  });
  y = doc.y + 8;

  const fairnessMetaLabelWidth = 180;
  const fairnessMetaRowHeight = 18;
  for (const row of view.fairnessSummaryRows) {
    doc.save().rect(marginLeft, y - 1, contentWidth, fairnessMetaRowHeight).fill(palette.panel).restore();
    doc.font("Helvetica").fontSize(9).fillColor(palette.muted).text(row.label, marginLeft + 8, y + 3, {
      width: fairnessMetaLabelWidth,
    });
    doc.font("Helvetica-Bold").fontSize(9).fillColor(palette.ink).text(`: ${row.value}`, marginLeft + fairnessMetaLabelWidth + 8, y + 3, {
      width: contentWidth - fairnessMetaLabelWidth - 16,
    });
    y += fairnessMetaRowHeight + 2;
  }

  y += 6;
  if ((view.poolSummaryRows ?? []).length > 0) {
    doc
      .font("Helvetica-Bold")
      .fontSize(10.5)
      .fillColor(palette.ink)
      .text("Ringkasan Aturan Pool", marginLeft, y, {
        width: contentWidth,
      });
    y = doc.y + 6;

    const poolColumns = [
      { key: "pool", label: "Pool", width: 140, align: "left" as const },
      { key: "meaning", label: "Arti", width: 190, align: "left" as const },
      { key: "officers", label: "Petugas", width: contentWidth - (140 + 190), align: "left" as const },
    ] as const;

    const poolHeaderHeight = 18;
    let x = marginLeft;
    doc.save().rect(marginLeft, y, contentWidth, poolHeaderHeight).fill(palette.header).restore();
    doc.font("Helvetica-Bold").fontSize(8).fillColor(palette.ink);
    for (const column of poolColumns) {
      doc.rect(x, y, column.width, poolHeaderHeight).strokeColor(palette.border).lineWidth(0.8).stroke();
      doc.text(column.label, x + 4, y + 5, {
        width: column.width - 8,
        align: column.align,
      });
      x += column.width;
    }
    y += poolHeaderHeight;

    (view.poolSummaryRows ?? []).forEach((row, index) => {
      const values = {
        pool: row.pool,
        meaning: row.meaning,
        officers: row.officers,
      };
      doc.font(PST_PDF_FONT_PATH).fontSize(7.6).fillColor(palette.ink);
      const rowHeight = Math.max(
        24,
        ...poolColumns.map((column) =>
          Math.ceil(
            doc.heightOfString(values[column.key], {
              width: column.width - 8,
              align: column.align,
            }) + 10
          )
        )
      );
      doc
        .save()
        .rect(marginLeft, y, contentWidth, rowHeight)
        .fill(index % 2 === 1 ? palette.panel : palette.white)
        .restore();
      let colX = marginLeft;
      for (const column of poolColumns) {
        doc.rect(colX, y, column.width, rowHeight).strokeColor(palette.border).lineWidth(0.7).stroke();
        doc.text(values[column.key], colX + 4, y + 4, {
          width: column.width - 8,
          height: rowHeight - 8,
          align: column.align,
        });
        colX += column.width;
      }
      y += rowHeight;
    });
    y += 8;
  }

  const fairnessColumns = [
    { key: "name", label: "Petugas", width: 112, align: "left" as const },
    { key: "poolPstLabel", label: "Pool PST", width: 54, align: "center" as const },
    { key: "pstCurrentMonth", label: "PST Senin-Kamis", width: 40, align: "center" as const },
    {
      key: "randomWfoFridayCurrentMonth",
      label: "WFO Jumat Random",
      width: 46,
      align: "center" as const,
    },
    {
      key: "fridayRandomBurdenCurrentMonth",
      label: "Beban Jumat Random",
      width: 46,
      align: "center" as const,
    },
    {
      key: "totalCurrentMonthForRandomFairness",
      label: "Total Random Bulan Ini",
      width: 46,
      align: "center" as const,
    },
    {
      key: "fairnessStatus",
      label: "Status Fairness",
      width: 54,
      align: "center" as const,
    },
    {
      key: "nextPriorityRole",
      label: "Prioritas Berikutnya",
      width: contentWidth - (112 + 54 + 40 + 46 + 46 + 46 + 54),
      align: "left" as const,
    },
  ] as const;
  const fairnessAuditColumns = [
    { key: "name", label: "Petugas", width: 110, align: "left" as const },
    {
      key: "previousMonthRandomTotal",
      label: "Riwayat Bulan Lalu Total Random",
      width: 60,
      align: "center" as const,
    },
    {
      key: "previousMonthFridayBurden",
      label: "Riwayat Bulan Lalu Beban Jumat",
      width: 60,
      align: "center" as const,
    },
    {
      key: "historyWindowTotalRandomAssignments",
      label: "Histori Window Random (PST+WFO Random)",
      width: 65,
      align: "center" as const,
    },
    {
      key: "historyWindowFridayBurden",
      label: "Histori Window Beban Jumat",
      width: 65,
      align: "center" as const,
    },
    {
      key: "cumulativeRandomFairnessTotal",
      label: "Total Kumulatif Fairness Random",
      width: 70,
      align: "center" as const,
    },
    {
      key: "lastRandomAssignedDate",
      label: "Terakhir Bertugas Random",
      width: contentWidth - (110 + 60 + 60 + 65 + 65 + 70),
      align: "center" as const,
    },
  ] as const;
  const fairnessHeaderHeight = 18;
  const fairnessAuditHeaderHeight = 34;

  const drawFairnessHeader = () => {
    doc.save();
    doc.rect(marginLeft, y, contentWidth, fairnessHeaderHeight).fill(palette.header);
    doc.restore();

    let x = marginLeft;
    doc.font("Helvetica-Bold").fontSize(7.8).fillColor(palette.ink);
    for (const column of fairnessColumns) {
      doc.rect(x, y, column.width, fairnessHeaderHeight).strokeColor(palette.border).lineWidth(0.8).stroke();
      doc.text(column.label, x + 4, y + 5, {
        width: column.width - 8,
        align: column.align,
        ellipsis: true,
        lineBreak: false,
      });
      x += column.width;
    }
    y += fairnessHeaderHeight;
  };

  const drawFairnessAuditHeader = () => {
    doc.save().rect(marginLeft, y, contentWidth, fairnessAuditHeaderHeight).fill(palette.header).restore();
    let auditX = marginLeft;
    doc.font("Helvetica-Bold").fontSize(6.9).fillColor(palette.ink);
    for (const column of fairnessAuditColumns) {
      doc
        .rect(auditX, y, column.width, fairnessAuditHeaderHeight)
        .strokeColor(palette.border)
        .lineWidth(0.8)
        .stroke();
      doc.text(column.label, auditX + 4, y + 5, {
        width: column.width - 8,
        align: column.align,
        lineBreak: true,
      });
      auditX += column.width;
    }
    y += fairnessAuditHeaderHeight;
  };

  const drawFairnessTableTitle = (title: string) => {
    ensureSpace(22);
    doc.font("Helvetica-Bold").fontSize(10.5).fillColor(palette.ink).text(title, marginLeft, y, {
      width: contentWidth,
    });
    y = doc.y + 8;
  };

  // Dedicated page for "Detail Fairness per Petugas"
  addPage();
  y += 4;
  drawFairnessTableTitle("Detail Fairness per Petugas");
  ensureSpace(fairnessHeaderHeight + 2);
  drawFairnessHeader();
  view.fairnessOfficerRows.forEach((row, rowIndex) => {
    const rowValues: Record<(typeof fairnessColumns)[number]["key"], string> = {
      name: row.name,
      poolPstLabel: row.poolPstLabel,
      pstCurrentMonth: row.pstCurrentMonth,
      randomWfoFridayCurrentMonth: row.randomWfoFridayCurrentMonth,
      fridayRandomBurdenCurrentMonth: row.fridayRandomBurdenCurrentMonth,
      totalCurrentMonthForRandomFairness: row.totalCurrentMonthForRandomFairness,
      fairnessStatus: row.fairnessStatus,
      nextPriorityRole: row.nextPriorityRole,
    };

    const rowHeight = 16;
    if (y + rowHeight > bodyBottomLimit) {
      addPage();
      y += 4;
      drawFairnessTableTitle("Detail Fairness per Petugas");
      drawFairnessHeader();
    }

    doc
      .save()
      .rect(marginLeft, y, contentWidth, rowHeight)
      .fill(rowIndex % 2 === 1 ? palette.panel : palette.white)
      .restore();

    let x = marginLeft;
    doc.font(PST_PDF_FONT_PATH).fontSize(6.1).fillColor(palette.ink);
    for (const column of fairnessColumns) {
      doc.rect(x, y, column.width, rowHeight).strokeColor(palette.border).lineWidth(0.7).stroke();
      doc.text(rowValues[column.key], x + 4, y + 3, {
        width: column.width - 8,
        height: rowHeight - 4,
        align: column.align,
        ellipsis: true,
        lineBreak: false,
      });
      x += column.width;
    }
    y += rowHeight;
  });

  // Dedicated page for "Audit Histori Fairness"
  addPage();
  y += 4;
  drawFairnessTableTitle("Audit Histori Fairness");
  ensureSpace(fairnessHeaderHeight + 2);
  drawFairnessAuditHeader();

  view.fairnessOfficerRows.forEach((row, index) => {
    const values: Record<(typeof fairnessAuditColumns)[number]["key"], string> = {
      name: row.name,
      previousMonthRandomTotal: row.previousMonthRandomTotal,
      previousMonthFridayBurden: row.previousMonthFridayBurden,
      historyWindowTotalRandomAssignments: row.historyWindowTotalRandomAssignments,
      historyWindowFridayBurden: row.historyWindowFridayBurden,
      cumulativeRandomFairnessTotal: row.cumulativeRandomFairnessTotal,
      lastRandomAssignedDate: row.lastRandomAssignedDate,
    };
    const rowHeight = 16;
    if (y + rowHeight > bodyBottomLimit) {
      addPage();
      y += 4;
      drawFairnessTableTitle("Audit Histori Fairness");
      drawFairnessAuditHeader();
    }
    doc
      .save()
      .rect(marginLeft, y, contentWidth, rowHeight)
      .fill(index % 2 === 1 ? palette.panel : palette.white)
      .restore();
    let cellX = marginLeft;
    doc.font(PST_PDF_FONT_PATH).fontSize(6.8).fillColor(palette.ink);
    for (const column of fairnessAuditColumns) {
      doc.rect(cellX, y, column.width, rowHeight).strokeColor(palette.border).lineWidth(0.7).stroke();
      doc.text(values[column.key], cellX + 4, y + 3, {
        width: column.width - 8,
        height: rowHeight - 4,
        align: column.align,
        lineBreak: false,
      });
      cellX += column.width;
    }
    y += rowHeight;
  });

  // Dedicated guide page so long explanations and examples remain readable.
  addPage();
  y += 4;
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(palette.ink)
    .text("Panduan Membaca Fairness", marginLeft, y, {
      width: contentWidth,
      align: "center",
    });
  y = doc.y + 10;

  const guideIntro =
    "Halaman ini menjelaskan arti kolom fairness agar pembaca mudah memahami perhitungan beban random dan prioritas bulan berikutnya.";
  doc.font("Helvetica").fontSize(9).fillColor(palette.muted).text(guideIntro, marginLeft, y, {
    width: contentWidth,
    lineGap: 2,
  });
  y = doc.y + 10;
  const findRowByNames = (names: string[]) =>
    view.fairnessOfficerRows.find((row) =>
      names.some((name) => row.name.toLowerCase().includes(name.toLowerCase()))
    );

  const exampleMainOfficer =
    findRowByNames(["Novanni Indi Pradana", "Novanni", "Anuar", "Jusman"]) ??
    view.fairnessOfficerRows[0];
  const exampleSecondaryOfficer =
    view.fairnessOfficerRows.find((row) => row.name !== exampleMainOfficer?.name) ??
    exampleMainOfficer;
  const exampleDashOfficer =
    view.fairnessOfficerRows.find((row) =>
      [
        row.pstCurrentMonth,
        row.randomWfoFridayCurrentMonth,
        row.fridayRandomBurdenCurrentMonth,
        row.totalCurrentMonthForRandomFairness,
      ].some((value) => value.includes("-"))
    ) ??
    findRowByNames(["Ari Susilowati", "Idhamsyah"]) ??
    exampleSecondaryOfficer;

  const detectDashColumns = (row: PstSchedulePdfFairnessOfficerRow | undefined) => {
    if (!row) return "-";
    const columns: string[] = [];
    if (row.pstCurrentMonth.includes("-")) columns.push("PST Senin-Kamis");
    if (row.randomWfoFridayCurrentMonth.includes("-")) columns.push("WFO Jumat Random");
    if (row.fridayRandomBurdenCurrentMonth.includes("-")) columns.push("Beban Jumat Random");
    if (row.totalCurrentMonthForRandomFairness.includes("-")) {
      columns.push("Total Random Bulan Ini");
    }
    return columns.length > 0 ? columns.join(", ") : "-";
  };

  const drawGuideSection = (title: string, items: string[]) => {
    const headingHeight = 22;
    if (y + headingHeight > bodyBottomLimit) {
      addPage();
      y += 4;
    }

    doc.save().rect(marginLeft, y - 1, contentWidth, 18).fill(palette.panelStrong).restore();
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(palette.ink)
      .text(title, marginLeft + 8, y + 3, { width: contentWidth - 16 });
    y += headingHeight;

    doc.font("Helvetica").fontSize(8.8).fillColor(palette.muted);
    for (const item of items) {
      const estimated = doc.heightOfString(`• ${item}`, {
        width: contentWidth - 12,
        lineGap: 2,
      });
      if (y + estimated + 4 > bodyBottomLimit) {
        addPage();
        y += 4;
        doc.save().rect(marginLeft, y - 1, contentWidth, 18).fill(palette.panelStrong).restore();
        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .fillColor(palette.ink)
          .text(title, marginLeft + 8, y + 3, { width: contentWidth - 16 });
        y += headingHeight;
        doc.font("Helvetica").fontSize(8.8).fillColor(palette.muted);
      }
      doc.text(`• ${item}`, marginLeft + 6, y, {
        width: contentWidth - 12,
        lineGap: 2,
      });
      y = doc.y + 3;
    }
    y += 6;
  };

  drawGuideSection("1) Arti Kolom Utama", [
    "PST Senin-Kamis: jumlah tugas PST pada hari Senin sampai Kamis.",
    "WFO Jumat Random: jumlah tugas WFO Jumat yang dipilih sistem (bukan WFO tetap).",
    "Beban Jumat Random: total beban tugas Jumat random = PST Jumat + WFO Jumat Random.",
    "Total Random Bulan Ini: total semua tugas random pada bulan aktif.",
    "Status Fairness: ringkasan pemerataan beban saat ini (misalnya: Sesuai/Kurang).",
    "Histori Window Random: total random pada window histori (PST Senin-Kamis + PST Jumat + WFO Jumat Random), bukan hanya PST.",
    "Simbol '-': petugas tidak eligible pada role tersebut, sehingga bukan angka 0.",
  ]);

  drawGuideSection("2) Catatan Penting", [
    "WFO Jumat Tetap bersifat operasional/non-random dan tidak menambah fairness random.",
    "Riwayat fairness dihitung dari snapshot jadwal final, bukan log event mentah.",
    "Prioritas bulan berikutnya dihitung setelah jadwal bulan aktif final terbentuk.",
  ]);

  drawGuideSection("3) Contoh Nyata (Berdasarkan Data Bulan Ini)", [
    `Contoh A (${exampleMainOfficer?.name ?? "-"}): pada baris tabel tercatat PST Senin-Kamis = ${exampleMainOfficer?.pstCurrentMonth ?? "-"}, WFO Jumat Random = ${exampleMainOfficer?.randomWfoFridayCurrentMonth ?? "-"}, Beban Jumat Random = ${exampleMainOfficer?.fridayRandomBurdenCurrentMonth ?? "-"}, Total Random Bulan Ini = ${exampleMainOfficer?.totalCurrentMonthForRandomFairness ?? "-"}, Status Fairness = ${exampleMainOfficer?.fairnessStatus ?? "-"}.`,
    `Contoh B (${exampleSecondaryOfficer?.name ?? "-"}): pada baris tabel tercatat PST Senin-Kamis = ${exampleSecondaryOfficer?.pstCurrentMonth ?? "-"}, WFO Jumat Random = ${exampleSecondaryOfficer?.randomWfoFridayCurrentMonth ?? "-"}, Beban Jumat Random = ${exampleSecondaryOfficer?.fridayRandomBurdenCurrentMonth ?? "-"}, Total Random Bulan Ini = ${exampleSecondaryOfficer?.totalCurrentMonthForRandomFairness ?? "-"}, Prioritas Berikutnya = ${exampleSecondaryOfficer?.nextPriorityRole ?? "-"}.`,
    `Contoh C (${exampleDashOfficer?.name ?? "-"}): pada baris tabel kolom ${detectDashColumns(exampleDashOfficer)} dapat berisi '-' yang berarti petugas tidak eligible untuk role tersebut (bukan nilai 0).`,
  ]);

  doc.end();
  const body = await done;
  await fileDone;
  return body;
};

const writePdfArtifacts = async (
  schedule: MonthlyScheduleResponse,
  generatedById: string | null,
  htmlBody: string,
  filePaths?: PstSchedulePdfFilePaths
): Promise<PersistedPstSchedulePdfMeta> => {
  const resolvedPaths = filePaths ?? toSchedulePdfFilePaths(schedule.month, schedule.year);
  const generatedAtIso = new Date().toISOString();
  const metadata: PersistedPstSchedulePdfMeta = {
    scheduleId: schedule.id,
    fileName: resolvedPaths.fileName,
    path: resolvedPaths.relativePath,
    htmlPath: resolvedPaths.htmlRelativePath,
    metadataPath: resolvedPaths.metadataRelativePath,
    month: schedule.month,
    year: schedule.year,
    generatedAt: generatedAtIso,
    generatedById: generatedById ?? null,
    downloadUrl: toDownloadUrl(schedule.id),
  };

  await fs.mkdir(path.dirname(resolvedPaths.absolutePath), { recursive: true });
  await Promise.all([
    fs.writeFile(resolvedPaths.htmlAbsolutePath, htmlBody, "utf-8"),
    fs.writeFile(resolvedPaths.metadataAbsolutePath, JSON.stringify(metadata, null, 2), "utf-8"),
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
  const filePaths = toSchedulePdfFilePaths(params.schedule.month, params.schedule.year);
  await fs.mkdir(path.dirname(filePaths.absolutePath), { recursive: true });
  const pdf = await buildPdfBufferFromViewModel(view, {
    outputPath: filePaths.absolutePath,
    collectBuffer: params.includeBody === true,
  });
  const metadata = await writePdfArtifacts(
    params.schedule,
    params.generatedById ?? null,
    html,
    filePaths
  );

  return {
    body: params.includeBody === true ? pdf : null,
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
    const filePaths = toSchedulePdfFilePaths(schedule.month, schedule.year);
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
      includeBody: true,
    });
    if (!generated.ok) {
      return generated;
    }

    if (!generated.body) {
      const storedPdf = await readFileOrNull(filePaths.absolutePath);
      if (!storedPdf) {
        return {
          ok: false as const,
          status: 500,
          error: "PDF berhasil dibuat tetapi tidak dapat dibaca ulang",
        };
      }
      return {
        ok: true as const,
        body: storedPdf,
        contentType: generated.contentType,
        fileName: generated.fileName,
        metadata: generated.metadata,
      };
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
