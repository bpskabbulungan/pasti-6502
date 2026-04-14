import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { PstOfficerEmploymentStatus } from "@prisma/client";
import PDFDocument from "pdfkit";
import prisma from "@api/infrastructure/database/prisma";
import type { MonthlyScheduleResponse } from "@shared/types/pst-schedule";
import { parseDateOnlyInTimeZone, toIsoDateInTimeZone } from "@shared/utils/date-boundary";
import { getMonthlyScheduleById } from "./pst-schedule-generator.service";
import {
  buildPstSchedulePdfHtmlTemplate,
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
  };
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

const DAY_ORDER: Record<string, number> = {
  Senin: 1,
  Selasa: 2,
  Rabu: 3,
  Kamis: 4,
  Jumat: 5,
  Sabtu: 6,
  Minggu: 7,
};

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

const sortByDayThenDate = (left: PstScheduleDayAggregate, right: PstScheduleDayAggregate) => {
  const leftOrder = DAY_ORDER[left.dayName] ?? 99;
  const rightOrder = DAY_ORDER[right.dayName] ?? 99;
  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }
  return left.date.localeCompare(right.date);
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
      };

      row.dayName = item.dayName;

      if (item.isHoliday) {
        row.isHoliday = true;
        row.holidayType = item.holidayType;
        row.holidayName = item.holidayName;
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

      dateMap.set(item.date, row);
    }

    weekMap.set(week.week, dateMap);
  }

  return weekMap;
};

const buildScheduleCalendarState = async (
  schedule: MonthlyScheduleResponse
): Promise<PstSchedulePdfBuildState> => {
  const aggregateByWeek = buildDayAggregateMap(schedule);

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

  for (const week of Array.from(aggregateByWeek.keys()).sort((a, b) => a - b)) {
    const dateMap = aggregateByWeek.get(week);
    if (!dateMap) {
      continue;
    }

    const rows = Array.from(dateMap.values()).sort(sortByDayThenDate);
    for (const row of rows) {
      const notes: string[] = [];
      const isFriday = row.dayName === "Jumat";
      const pstOfficer = row.isHoliday ? "-" : row.pstOfficerName || "BELUM TERISI";
      const wfoOfficer = row.isHoliday
        ? "-"
        : isFriday
          ? row.wfoOfficerName || "BELUM TERISI"
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
          const fridayIncomplete =
            !row.hasPstSlot || !row.hasWfoSlot || !row.pstOfficerId || !row.wfoOfficerId;
          if (fridayIncomplete) {
            fridayIncompleteCount += 1;
            notes.push("SLOT JUMAT BELUM LENGKAP");
          }

          if (!row.wfoOfficerId) {
            unfilledSlotCount += 1;
            notes.push("WFO BELUM TERISI");
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

      const note = notes.length > 0 ? notes.join(" | ") : "-";
      weekRows.push({
        week,
        dayName: row.dayName,
        dateLabel: formatIsoDate(row.date),
        pstOfficer,
        wfoOfficer,
        note,
        isHoliday: row.isHoliday,
        hasIssue: notes.length > 0 && !(row.isHoliday && notes.length === 1),
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
    },
  };
};

const buildValidationItems = (
  validation: PstSchedulePdfBuildState["validation"]
): PstSchedulePdfValidationItem[] => [
  {
    rule: "Tidak ada petugas ganda di tanggal yang sama",
    passed: validation.duplicateOfficerCount === 0,
    detail:
      validation.duplicateOfficerCount === 0
        ? "Tidak ditemukan petugas ganda."
        : `${validation.duplicateOfficerCount} tanggal terdeteksi petugas ganda.`,
  },
  {
    rule: "Jumat harus punya slot PST dan WFO",
    passed: validation.fridayIncompleteCount === 0,
    detail:
      validation.fridayIncompleteCount === 0
        ? "Semua hari Jumat memiliki PST dan WFO."
        : `${validation.fridayIncompleteCount} hari Jumat belum lengkap.`,
  },
  {
    rule: "Hari libur/cuti bersama tidak boleh terisi slot",
    passed: validation.holidayAssignedCount === 0,
    detail:
      validation.holidayAssignedCount === 0
        ? "Semua hari libur/cuti bersama kosong."
        : `${validation.holidayAssignedCount} hari libur/cuti masih berisi slot.`,
  },
  {
    rule: "Petugas unavailable tidak boleh muncul",
    passed: validation.unavailableAssignmentCount === 0,
    detail:
      validation.unavailableAssignmentCount === 0
        ? "Tidak ditemukan petugas unavailable."
        : `${validation.unavailableAssignmentCount} penugasan mengenai petugas unavailable.`,
  },
  {
    rule: "Slot kosong ditandai BELUM TERISI",
    passed: validation.unfilledSlotCount === 0,
    detail:
      validation.unfilledSlotCount === 0
        ? "Semua slot sudah terisi."
        : `${validation.unfilledSlotCount} slot belum terisi.`,
  },
];

const buildSchedulePdfViewModel = async (
  schedule: MonthlyScheduleResponse,
  generatedById: string | null,
  generatedByName: string | null
): Promise<PstSchedulePdfViewModel> => {
  const generatedAtDate = asDate(schedule.generatedAt);
  const generatedAtLabel = format(generatedAtDate, "dd MMMM yyyy HH:mm:ss", { locale: localeId });
  const monthYearText = monthLabel(schedule.month, schedule.year);
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

  const fairnessNote =
    unselectedOfficerNames.length > 0
      ? "Petugas yang belum kebagian jadwal diprioritaskan untuk generate bulan berikutnya."
      : "Semua petugas aktif telah mendapatkan jadwal pada bulan ini.";

  const validationItems = buildValidationItems(calendarState.validation);
  const infoRows = [
    { label: "Bulan / Tahun Generate", value: monthYearText },
    { label: "Tanggal Generate", value: generatedAtLabel },
    { label: "Total Petugas Aktif", value: String(activeOfficers.length) },
    {
      label: "Total Hari Kerja Efektif",
      value: String(schedule.summary?.totalWorkingDays ?? 0),
    },
    { label: "Total Slot Jadwal", value: String(schedule.summary?.totalSlots ?? 0) },
    { label: "Total Petugas Terpilih", value: String(selectedOfficerNames.length) },
    { label: "Total Petugas Belum Terpilih", value: String(unselectedOfficerNames.length) },
    {
      label: "Total Slot Belum Terisi",
      value: String(calendarState.validation.unfilledSlotCount),
    },
  ];

  return {
    title: `Jadwal Petugas PST Bulan ${monthYearText}`,
    monthYearLabel: monthYearText,
    generatedAtLabel,
    generatedByLabel: generatedByName || generatedById || "-",
    infoRows,
    validations: validationItems,
    weekRows: calendarState.weekRows,
    selectedOfficerNames,
    unselectedOfficerNames,
    fairnessNote,
  };
};

const buildPdfBufferFromViewModel = async (view: PstSchedulePdfViewModel) => {
  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margin: 32,
    font: PST_PDF_FONT_PATH,
  });

  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const marginLeft = doc.page.margins.left;
  const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  let y = doc.page.margins.top;

  const addPage = (showContinuation = true) => {
    doc.addPage({ size: "A4", layout: "landscape", margin: 32 });
    y = doc.page.margins.top;
    if (showContinuation) {
      doc
        .font(PST_PDF_FONT_PATH)
        .fontSize(10)
        .fillColor("#374151")
        .text(`${view.title} (lanjutan)`, marginLeft, y, {
          width: contentWidth,
        });
      y = doc.y + 6;
    }
  };

  const ensureSpace = (height: number) => {
    const limit = doc.page.height - doc.page.margins.bottom;
    if (y + height > limit) {
      addPage();
    }
  };

  doc.font(PST_PDF_FONT_PATH).fontSize(16).fillColor("#111827").text(view.title, marginLeft, y, {
    width: contentWidth,
  });
  y = doc.y + 2;

  doc
    .font(PST_PDF_FONT_PATH)
    .fontSize(9)
    .fillColor("#4B5563")
    .text(
      `Bulan/Tahun: ${view.monthYearLabel} | Generate: ${view.generatedAtLabel} | Oleh: ${view.generatedByLabel}`,
      marginLeft,
      y,
      { width: contentWidth }
    );
  y = doc.y + 8;

  const leftColumnX = marginLeft;
  const rightColumnX = marginLeft + contentWidth / 2;
  const labelWidth = 140;
  const lineHeight = 14;
  const halfIndex = Math.ceil(view.infoRows.length / 2);
  const leftInfo = view.infoRows.slice(0, halfIndex);
  const rightInfo = view.infoRows.slice(halfIndex);
  const infoRowsCount = Math.max(leftInfo.length, rightInfo.length);

  ensureSpace(infoRowsCount * lineHeight + 8);
  doc.fontSize(9);
  leftInfo.forEach((row, index) => {
    const lineY = y + index * lineHeight;
    doc.font(PST_PDF_FONT_PATH).fillColor("#1F2937").text(row.label, leftColumnX, lineY, {
      width: labelWidth,
    });
    doc.font(PST_PDF_FONT_PATH).fillColor("#111827").text(`: ${row.value}`, leftColumnX + labelWidth, lineY, {
      width: contentWidth / 2 - labelWidth - 8,
    });
  });
  rightInfo.forEach((row, index) => {
    const lineY = y + index * lineHeight;
    doc.font(PST_PDF_FONT_PATH).fillColor("#1F2937").text(row.label, rightColumnX, lineY, {
      width: labelWidth,
    });
    doc.font(PST_PDF_FONT_PATH).fillColor("#111827").text(`: ${row.value}`, rightColumnX + labelWidth, lineY, {
      width: contentWidth / 2 - labelWidth - 8,
    });
  });
  y += infoRowsCount * lineHeight + 8;

  ensureSpace(24 + view.validations.length * 16);
  doc.font(PST_PDF_FONT_PATH).fontSize(11).fillColor("#111827").text("Validasi Otomatis", marginLeft, y);
  y = doc.y + 4;
  for (const item of view.validations) {
    ensureSpace(18);
    doc
      .font(PST_PDF_FONT_PATH)
      .fontSize(8)
      .fillColor(item.passed ? "#065F46" : "#991B1B")
      .text(item.passed ? "OK" : "ISSUE", marginLeft, y, { width: 42 });
    doc
      .font(PST_PDF_FONT_PATH)
      .fontSize(9)
      .fillColor("#111827")
      .text(`${item.rule} - ${item.detail}`, marginLeft + 46, y, {
        width: contentWidth - 46,
      });
    y = doc.y + 1;
  }
  y += 4;

  const tableColumns = [
    { key: "dayName", label: "Hari", width: 72 },
    { key: "dateLabel", label: "Tanggal", width: 90 },
    { key: "pstOfficer", label: "Petugas PST", width: 176 },
    { key: "wfoOfficer", label: "Petugas WFO", width: 172 },
    { key: "note", label: "Keterangan", width: contentWidth - (72 + 90 + 176 + 172) },
  ] as const;

  const rowHeight = 22;
  const headerHeight = 22;

  const drawTableHeader = () => {
    doc.save();
    doc.rect(marginLeft, y, contentWidth, headerHeight).fill("#E5E7EB");
    doc.restore();

    let x = marginLeft;
    doc.font(PST_PDF_FONT_PATH).fontSize(9).fillColor("#111827");
    for (const column of tableColumns) {
      doc.rect(x, y, column.width, headerHeight).strokeColor("#D1D5DB").lineWidth(1).stroke();
      doc.text(column.label, x + 4, y + 6, {
        width: column.width - 8,
        ellipsis: true,
      });
      x += column.width;
    }
    y += headerHeight;
  };

  const weekNumbers = Array.from(new Set(view.weekRows.map((row) => row.week))).sort((a, b) => a - b);
  for (const week of weekNumbers) {
    const rows = view.weekRows.filter((row) => row.week === week);
    ensureSpace(26 + headerHeight + rowHeight);
    doc
      .font(PST_PDF_FONT_PATH)
      .fontSize(11)
      .fillColor("#111827")
      .text(`Minggu ke-${week}`, marginLeft, y, { width: contentWidth });
    y = doc.y + 4;
    drawTableHeader();

    for (const row of rows) {
      ensureSpace(rowHeight);
      const rowColor = row.isHoliday ? "#F3F4F6" : row.hasIssue ? "#FFF1F2" : "#FFFFFF";
      doc.save();
      doc.rect(marginLeft, y, contentWidth, rowHeight).fill(rowColor);
      doc.restore();

      const rowValues: Record<(typeof tableColumns)[number]["key"], string> = {
        dayName: row.dayName,
        dateLabel: row.dateLabel,
        pstOfficer: row.pstOfficer,
        wfoOfficer: row.wfoOfficer,
        note: row.note,
      };

      let x = marginLeft;
      doc.font(PST_PDF_FONT_PATH).fontSize(9).fillColor("#111827");
      for (const column of tableColumns) {
        doc.rect(x, y, column.width, rowHeight).strokeColor("#D1D5DB").lineWidth(1).stroke();
        doc.text(rowValues[column.key], x + 4, y + 6, {
          width: column.width - 8,
          height: rowHeight - 10,
          ellipsis: true,
        });
        x += column.width;
      }

      y += rowHeight;
    }

    y += 6;
  }

  ensureSpace(110);
  doc.moveTo(marginLeft, y).lineTo(marginLeft + contentWidth, y).strokeColor("#D1D5DB").stroke();
  y += 8;

  doc.font(PST_PDF_FONT_PATH).fontSize(11).fillColor("#111827").text("Ringkasan Petugas", marginLeft, y, {
    width: contentWidth,
  });
  y = doc.y + 4;

  doc.font(PST_PDF_FONT_PATH).fontSize(9).text(
    `Petugas Terpilih (${view.selectedOfficerNames.length})`,
    marginLeft,
    y,
    { width: 180 }
  );
  doc.font(PST_PDF_FONT_PATH).fontSize(9).text(
    view.selectedOfficerNames.length > 0 ? view.selectedOfficerNames.join(", ") : "-",
    marginLeft + 184,
    y,
    { width: contentWidth - 184 }
  );
  y = doc.y + 4;

  doc.font(PST_PDF_FONT_PATH).fontSize(9).text(
    `Petugas Belum Terpilih (${view.unselectedOfficerNames.length})`,
    marginLeft,
    y,
    { width: 180 }
  );
  doc.font(PST_PDF_FONT_PATH).fontSize(9).text(
    view.unselectedOfficerNames.length > 0 ? view.unselectedOfficerNames.join(", ") : "-",
    marginLeft + 184,
    y,
    { width: contentWidth - 184 }
  );
  y = doc.y + 4;

  doc.font(PST_PDF_FONT_PATH).fontSize(9).text("Catatan fairness", marginLeft, y, { width: 180 });
  doc.font(PST_PDF_FONT_PATH).fontSize(9).text(view.fairnessNote, marginLeft + 184, y, {
    width: contentWidth - 184,
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

