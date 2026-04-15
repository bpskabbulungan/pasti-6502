import {
  DayOffType,
  Prisma,
  PstOfficerEmploymentStatus,
  PstScheduleDetailStatus,
  PstScheduleStatus,
  PstSlotRole,
  ReshuffleActionType,
  SwapRequestStatus,
} from "@prisma/client";
import prisma from "@api/infrastructure/database/prisma";
import defaultHolidayCalendar from "@shared/constants/pst-holiday-calendar-2026.json";
import { startOfDayInTimeZone, toIsoDateInTimeZone } from "@shared/utils/date-boundary";
import type {
  MonthlyScheduleSummary,
  MonthlyScheduleResponse,
  PstDocumentStatus,
  PstHolidayCalendar,
  PstValidationLevel,
  WeeklyScheduleGroup,
  WeeklyScheduleSlot,
} from "@shared/types/pst-schedule";

type WorkingSlot = {
  scheduleDate: Date;
  dateIso: string;
  dayName: string;
  weekOfMonth: number;
  weekday: number;
  role: PstSlotRole;
};

type HolidayEntry = {
  dateIso: string;
  dayName: string;
  weekOfMonth: number;
  holidayType: "LIBURAN" | "CUTI_BERSAMA";
};

type CandidateScoringContext = {
  monthlyAssignmentCount: number;
  monthlyRoleCount: number;
  monthlyFridayRoleCount: number;
  monthlyFridayTotalCount: number;
  threeMonthAssignmentCount: number;
  threeMonthFridayCount: number;
  previouslyAssignedLastMonth: boolean;
  closestAssignmentDistanceDays: number | null;
  historicalPriorityFlag: boolean;
  lastAssignedAt: Date | null;
};

type CandidateWithScore = {
  candidate: {
    id: string;
    name: string;
    sigapUsername: string | null;
    whatsappNumber: string | null;
    priorityNextMonth: boolean;
    employmentStatus: PstOfficerEmploymentStatus;
  };
  score: number;
  weight: number;
  context: CandidateScoringContext;
};

type FairnessValidationItem = {
  code: string;
  rule: string;
  status: PstValidationLevel;
  detail: string;
};

type MonthlySpecialSchedulingRule = {
  year: number;
  month: number;
  wfoStartDateIso: string;
  fixedAssignments: Array<{
    dateIso: string;
    role: PstSlotRole;
    officerName: string;
  }>;
};

const DAY_LABELS: Record<number, string> = {
  1: "Senin",
  2: "Selasa",
  3: "Rabu",
  4: "Kamis",
  5: "Jumat",
  6: "Sabtu",
  7: "Minggu",
};

const FAIRNESS_HISTORY_WINDOW_MONTHS = 3;
const FAIRNESS_ALGORITHM_VERSION = "v2.0-historical-3m";
const FRIDAY_ASSIGNMENT_HARD_CAP_PER_OFFICER = 1;

const APRIL_2026_SPECIAL_SCHEDULING_RULE: MonthlySpecialSchedulingRule = {
  year: 2026,
  month: 4,
  wfoStartDateIso: "2026-04-10",
  fixedAssignments: [
    {
      dateIso: "2026-04-10",
      role: PstSlotRole.PST,
      officerName: "Afnita Rahma",
    },
    {
      dateIso: "2026-04-10",
      role: PstSlotRole.WFO,
      officerName: "Novanni Indi Pradana",
    },
  ],
};

const ROLE_BASED_EXCLUDED_NAMES: Record<PstSlotRole, string[]> = {
  [PstSlotRole.PST]: [
    "Yuda Agus Irianto",
    "Ari Susilowati",
    "Idhamsyah",
    "Zulkifli",
    "Marinda Saga",
  ],
  [PstSlotRole.WFO]: [
    "Yuda Agus Irianto",
    "Zulkifli",
    "Marinda Saga",
    "Jusman",
    "Anuar",
  ],
};

const normalizeOfficerName = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

const EXCLUDED_NAME_SET_BY_ROLE: Record<PstSlotRole, Set<string>> = {
  [PstSlotRole.PST]: new Set(
    ROLE_BASED_EXCLUDED_NAMES[PstSlotRole.PST].map(normalizeOfficerName)
  ),
  [PstSlotRole.WFO]: new Set(
    ROLE_BASED_EXCLUDED_NAMES[PstSlotRole.WFO].map(normalizeOfficerName)
  ),
};

const isOfficerExcludedForRole = (officerName: string, role: PstSlotRole) =>
  EXCLUDED_NAME_SET_BY_ROLE[role].has(normalizeOfficerName(officerName));

const getMonthlySpecialSchedulingRule = (year: number, month: number) => {
  if (
    year === APRIL_2026_SPECIAL_SCHEDULING_RULE.year &&
    month === APRIL_2026_SPECIAL_SCHEDULING_RULE.month
  ) {
    return APRIL_2026_SPECIAL_SCHEDULING_RULE;
  }

  return null;
};

const isWfoSlotRequired = (
  dateIso: string,
  rule: MonthlySpecialSchedulingRule | null | undefined
) => {
  if (!rule) {
    return true;
  }

  return dateIso >= rule.wfoStartDateIso;
};

const PST_OFFICER_MIN_SELECT = {
  id: true,
  name: true,
  sigapUsername: true,
  whatsappNumber: true,
  priorityNextMonth: true,
  employmentStatus: true,
} satisfies Prisma.PstOfficerCandidateSelect;

const toWeekOfMonth = (day: number) => Math.floor((day - 1) / 7) + 1;

const normalizeDmyToIso = (value: string) => {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value.trim());
  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (day < 1 || day > 31 || month < 1 || month > 12) {
    return null;
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const dateFromIso = (isoDate: string) => {
  const [yearRaw, monthRaw, dayRaw] = isoDate.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);
  return startOfDayInTimeZone(new Date(Date.UTC(year, month - 1, day)));
};

const getWeekdayIso = (date: Date) => {
  const day = date.getDay();
  return day === 0 ? 7 : day;
};

const getHistoryMapKey = (officerId: string, role: PstSlotRole) => `${officerId}:${role}`;

const getMonthStart = (year: number, month: number) =>
  startOfDayInTimeZone(new Date(Date.UTC(year, month - 1, 1)));

const addMonths = (year: number, month: number, delta: number) => {
  const shifted = new Date(Date.UTC(year, month - 1 + delta, 1));
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
  };
};

const toPreviousMonth = (year: number, month: number) => addMonths(year, month, -1);

const daysBetween = (first: Date, second: Date) =>
  Math.floor(Math.abs(first.getTime() - second.getTime()) / (1000 * 60 * 60 * 24));

const getClosestAssignmentDistance = (slotDate: Date, assignedDates: Date[]) => {
  if (assignedDates.length === 0) {
    return null;
  }

  let minDistance = Number.POSITIVE_INFINITY;
  for (const assigned of assignedDates) {
    const distance = daysBetween(slotDate, assigned);
    if (distance < minDistance) {
      minDistance = distance;
    }
  }

  return Number.isFinite(minDistance) ? minDistance : null;
};

const getScheduleStatusFromDocumentStatus = (documentStatus: PstDocumentStatus) =>
  documentStatus === "FINAL" ? PstScheduleStatus.PUBLISHED : PstScheduleStatus.DRAFT;

const readDocumentVersionFromSummary = (summary: Prisma.JsonValue | null) => {
  if (!summary || typeof summary !== "object" || Array.isArray(summary)) {
    return 0;
  }

  const audit = (summary as { audit?: { documentVersion?: unknown } }).audit;
  const versionRaw = audit?.documentVersion;
  const version = Number(versionRaw);
  if (!Number.isInteger(version) || version < 1) {
    return 0;
  }

  return version;
};

const holidayCalendarOrDefault = (calendar?: PstHolidayCalendar) =>
  calendar && calendar.calendar ? calendar : (defaultHolidayCalendar as PstHolidayCalendar);

const mergeHolidayCalendars = (
  ...calendars: Array<PstHolidayCalendar | null | undefined>
): PstHolidayCalendar => {
  const liburanSet = new Set<string>();
  const cutiSet = new Set<string>();

  for (const calendar of calendars) {
    if (!calendar?.calendar) {
      continue;
    }

    for (const value of calendar.calendar.LIBURAN ?? []) {
      const normalized = value.trim();
      if (normalized) {
        liburanSet.add(normalized);
      }
    }

    for (const value of calendar.calendar.CUTI_BERSAMA ?? []) {
      const normalized = value.trim();
      if (normalized) {
        cutiSet.add(normalized);
      }
    }
  }

  return {
    calendar: {
      LIBURAN: [...liburanSet].sort((left, right) => left.localeCompare(right)),
      CUTI_BERSAMA: [...cutiSet].sort((left, right) => left.localeCompare(right)),
    },
  };
};

const toDmyDate = (date: Date) => {
  const [year, month, day] = toIsoDateInTimeZone(date).split("-");
  return `${day}-${month}-${year}`;
};

const getHolidayCalendarFromDutyDayOffs = async (month: number, year: number) => {
  const monthStart = getMonthStart(year, month);
  const nextMonth = addMonths(year, month, 1);
  const nextMonthStart = getMonthStart(nextMonth.year, nextMonth.month);

  const dayOffs = await prisma.dutyDayOff.findMany({
    where: {
      date: {
        gte: monthStart,
        lt: nextMonthStart,
      },
    },
    select: {
      date: true,
      type: true,
    },
  });

  if (dayOffs.length === 0) {
    return null;
  }

  const liburanSet = new Set<string>();
  const cutiBersamaSet = new Set<string>();

  for (const dayOff of dayOffs) {
    const dmy = toDmyDate(dayOff.date);
    if (dayOff.type === DayOffType.LEAVE) {
      cutiBersamaSet.add(dmy);
      continue;
    }
    liburanSet.add(dmy);
  }

  return {
    calendar: {
      LIBURAN: [...liburanSet].sort((left, right) => left.localeCompare(right)),
      CUTI_BERSAMA: [...cutiBersamaSet].sort((left, right) => left.localeCompare(right)),
    },
  } satisfies PstHolidayCalendar;
};

export function buildWorkingSlots(month: number, year: number, holidayCalendar?: PstHolidayCalendar) {
  const normalizedCalendar = holidayCalendarOrDefault(holidayCalendar);
  const specialRule = getMonthlySpecialSchedulingRule(year, month);

  const liburSet = new Set(
    normalizedCalendar.calendar.LIBURAN.map(normalizeDmyToIso).filter(Boolean) as string[]
  );
  const cutiSet = new Set(
    normalizedCalendar.calendar.CUTI_BERSAMA.map(normalizeDmyToIso).filter(Boolean) as string[]
  );

  const totalDays = new Date(year, month, 0).getDate();
  const slots: WorkingSlot[] = [];
  const holidays: HolidayEntry[] = [];

  for (let day = 1; day <= totalDays; day += 1) {
    const date = startOfDayInTimeZone(new Date(Date.UTC(year, month - 1, day)));
    const weekday = getWeekdayIso(date);
    const dateIso = toIsoDateInTimeZone(date);
    const weekOfMonth = toWeekOfMonth(day);
    const dayName = DAY_LABELS[weekday] ?? "-";

    if (weekday > 5) {
      continue;
    }

    if (liburSet.has(dateIso)) {
      holidays.push({
        dateIso,
        dayName,
        weekOfMonth,
        holidayType: "LIBURAN",
      });
      continue;
    }

    if (cutiSet.has(dateIso)) {
      holidays.push({
        dateIso,
        dayName,
        weekOfMonth,
        holidayType: "CUTI_BERSAMA",
      });
      continue;
    }

    if (weekday === 5) {
      slots.push({
        scheduleDate: date,
        dateIso,
        dayName,
        weekOfMonth,
        weekday,
        role: PstSlotRole.PST,
      });
      if (isWfoSlotRequired(dateIso, specialRule)) {
        slots.push({
          scheduleDate: date,
          dateIso,
          dayName,
          weekOfMonth,
          weekday,
          role: PstSlotRole.WFO,
        });
      }
      continue;
    }

    slots.push({
      scheduleDate: date,
      dateIso,
      dayName,
      weekOfMonth,
      weekday,
      role: PstSlotRole.PST,
    });
  }

  return {
    slots,
    holidays,
  };
}

export async function getEligibleOfficers(date: Date, role: PstSlotRole) {
  const dateIso = toIsoDateInTimeZone(date);

  const officers = await prisma.pstOfficerCandidate.findMany({
    where: {
      isActiveCandidate: true,
      employmentStatus: PstOfficerEmploymentStatus.MASUK,
    },
    select: PST_OFFICER_MIN_SELECT,
    orderBy: { name: "asc" },
  });

  if (officers.length === 0) {
    return [];
  }

  const unavailable = await prisma.officerAvailability.findMany({
    where: {
      officerId: { in: officers.map((officer) => officer.id) },
      date: dateFromIso(dateIso),
    },
    select: { officerId: true },
  });

  const unavailableSet = new Set(unavailable.map((item) => item.officerId));
  const sameDateAssignments = await prisma.scheduleDetail.findMany({
    where: {
      scheduleDate: dateFromIso(dateIso),
      officerId: { not: null },
      status: {
        in: [
          PstScheduleDetailStatus.ASSIGNED,
          PstScheduleDetailStatus.REPLACED,
          PstScheduleDetailStatus.SWAPPED,
        ],
      },
    },
    select: { officerId: true, slotRole: true },
  });

  const takenByDate = new Set(
    sameDateAssignments
      .filter((assignment) => assignment.slotRole !== role)
      .map((assignment) => assignment.officerId)
      .filter((officerId): officerId is string => Boolean(officerId))
  );

  return officers.filter(
    (officer) =>
      !isOfficerExcludedForRole(officer.name, role) &&
      !unavailableSet.has(officer.id) &&
      !takenByDate.has(officer.id)
  );
}

export function scoreCandidate(
  candidate: CandidateWithScore["candidate"],
  slot: WorkingSlot,
  history: CandidateScoringContext
) {
  const monthlyRoleCount = history.monthlyRoleCount ?? 0;
  const monthlyFridayRoleCount = history.monthlyFridayRoleCount ?? 0;
  const monthlyFridayTotalCount = history.monthlyFridayTotalCount ?? 0;
  const threeMonthAssignmentCount = history.threeMonthAssignmentCount ?? 0;
  const threeMonthFridayCount = history.threeMonthFridayCount ?? 0;
  const previouslyAssignedLastMonth = history.previouslyAssignedLastMonth ?? false;
  const closestAssignmentDistanceDays = history.closestAssignmentDistanceDays ?? null;
  const historicalPriorityFlag = history.historicalPriorityFlag ?? false;

  let score = 120;

  score -= history.monthlyAssignmentCount * 26;
  score -= monthlyRoleCount * 10;
  score -= threeMonthAssignmentCount * 14;

  if (slot.weekday === 5) {
    score -= monthlyFridayTotalCount * 56;
    score -= monthlyFridayRoleCount * 18;
    score -= threeMonthFridayCount * 16;
  }

  if (!previouslyAssignedLastMonth || historicalPriorityFlag || candidate.priorityNextMonth) {
    score += 48;
  }

  if (candidate.employmentStatus !== PstOfficerEmploymentStatus.MASUK) {
    score -= 40;
  }

  if (history.lastAssignedAt) {
    const distanceDays = daysBetween(slot.scheduleDate, history.lastAssignedAt);
    score += Math.min(distanceDays, 45) * 2;
  } else {
    score += 24;
  }

  if (closestAssignmentDistanceDays !== null) {
    if (closestAssignmentDistanceDays <= 1) {
      score -= 72;
    } else if (closestAssignmentDistanceDays <= 2) {
      score -= 36;
    } else if (closestAssignmentDistanceDays <= 3) {
      score -= 20;
    } else if (closestAssignmentDistanceDays <= 5) {
      score -= 8;
    }
  }

  return Math.max(1, Math.round(score));
}

export function pickCandidateWeightedRandom(candidates: CandidateWithScore[]) {
  if (candidates.length === 0) {
    return null;
  }

  const totalWeight = candidates.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) {
    return candidates[0];
  }

  let cursor = Math.random() * totalWeight;
  for (const candidate of candidates) {
    cursor -= candidate.weight;
    if (cursor <= 0) {
      return candidate;
    }
  }

  return candidates[candidates.length - 1];
}

const buildWeeklyPayload = (params: {
  month: number;
  year: number;
  details: Array<{
    id: string;
    scheduleDate: Date;
    weekOfMonth: number;
    slotRole: PstSlotRole;
    status: PstScheduleDetailStatus;
    notes: string | null;
    officerId: string | null;
    officer: {
      name: string;
      sigapUsername: string | null;
      whatsappNumber: string | null;
    } | null;
  }>;
  holidays: HolidayEntry[];
}): WeeklyScheduleGroup[] => {
  const byWeek = new Map<number, WeeklyScheduleSlot[]>();

  for (const detail of params.details) {
    const isoDate = toIsoDateInTimeZone(detail.scheduleDate);
    const weekday = getWeekdayIso(detail.scheduleDate);
    const item: WeeklyScheduleSlot = {
      scheduleDetailId: detail.id,
      date: isoDate,
      dayName: DAY_LABELS[weekday] ?? "-",
      weekOfMonth: detail.weekOfMonth,
      role: detail.slotRole,
      isHoliday: false,
      holidayType: null,
      holidayName: null,
      officerId: detail.officerId,
      officerName: detail.officer?.name ?? null,
      officerUsername: detail.officer?.sigapUsername ?? null,
      officerWhatsapp: detail.officer?.whatsappNumber ?? null,
      status: detail.status,
      note: detail.notes,
    };

    const bucket = byWeek.get(detail.weekOfMonth) ?? [];
    bucket.push(item);
    byWeek.set(detail.weekOfMonth, bucket);
  }

  for (const holiday of params.holidays) {
    const bucket = byWeek.get(holiday.weekOfMonth) ?? [];
    bucket.push({
      date: holiday.dateIso,
      dayName: holiday.dayName,
      weekOfMonth: holiday.weekOfMonth,
      role: null,
      isHoliday: true,
      holidayType: holiday.holidayType,
      holidayName: holiday.holidayType === "LIBURAN" ? "Libur Nasional" : "Cuti Bersama",
      officerId: null,
      officerName: null,
      officerUsername: null,
      officerWhatsapp: null,
      status: "UNASSIGNED",
      note: holiday.holidayType === "LIBURAN" ? "Libur nasional" : "Cuti bersama",
    });
    byWeek.set(holiday.weekOfMonth, bucket);
  }

  return Array.from(byWeek.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([week, items]) => ({
      week,
      items: items.sort((a, b) => {
        if (a.date === b.date) {
          if (a.role === b.role) return 0;
          if (a.role === null) return 1;
          if (b.role === null) return -1;
          return a.role.localeCompare(b.role);
        }
        return a.date.localeCompare(b.date);
      }),
    }));
};

const toMonthlyScheduleResponse = (params: {
  schedule: {
    id: string;
    month: number;
    year: number;
    status: PstScheduleStatus;
    generatedAt: Date;
    summary: Prisma.JsonValue;
    holidayCalendar: Prisma.JsonValue;
  };
  details: Array<{
    id: string;
    scheduleDate: Date;
    weekOfMonth: number;
    slotRole: PstSlotRole;
    status: PstScheduleDetailStatus;
    notes: string | null;
    officerId: string | null;
    officer: {
      name: string;
      sigapUsername: string | null;
      whatsappNumber: string | null;
    } | null;
  }>;
}) => {
  const holidayCalendar = params.schedule.holidayCalendar as PstHolidayCalendar;
  const generated = buildWorkingSlots(params.schedule.month, params.schedule.year, holidayCalendar);
  const weeks = buildWeeklyPayload({
    month: params.schedule.month,
    year: params.schedule.year,
    details: params.details,
    holidays: generated.holidays,
  });

  return {
    id: params.schedule.id,
    month: params.schedule.month,
    year: params.schedule.year,
    status: params.schedule.status,
    generatedAt: params.schedule.generatedAt,
    summary: params.schedule.summary,
    weeks,
  } as MonthlyScheduleResponse;
};

const hasRoleExclusionViolation = (schedule: MonthlyScheduleResponse) =>
  schedule.weeks.some((week) =>
    week.items.some((item) => {
      if (
        item.isHoliday ||
        (item.role !== PstSlotRole.PST && item.role !== PstSlotRole.WFO) ||
        !item.officerName
      ) {
        return false;
      }

      return isOfficerExcludedForRole(item.officerName, item.role);
    })
  );

export async function generateMonthlySchedule(params: {
  month: number;
  year: number;
  forceRegenerate?: boolean;
  allowSameFridayAssignee?: boolean;
  holidayCalendar?: PstHolidayCalendar;
  generatedById?: string;
  generatedByName?: string | null;
  documentStatus?: PstDocumentStatus;
  changeNotes?: string;
}) {
  const forceRegenerate = params.forceRegenerate === true;
  const allowSameFridayAssignee = params.allowSameFridayAssignee === true;
  const dutyDayOffCalendar =
    params.holidayCalendar === undefined
      ? await getHolidayCalendarFromDutyDayOffs(params.month, params.year)
      : null;
  const normalizedHolidayCalendar = holidayCalendarOrDefault(
    mergeHolidayCalendars(
      defaultHolidayCalendar as PstHolidayCalendar,
      dutyDayOffCalendar,
      params.holidayCalendar
    )
  );
  const specialRule = getMonthlySpecialSchedulingRule(params.year, params.month);
  let requestedDocumentStatus =
    params.documentStatus ?? (forceRegenerate ? "REVISI" : "DRAFT");
  let normalizedChangeNotes =
    params.changeNotes?.trim() ||
    (forceRegenerate
      ? "REVISI TERKENDALI - Regenerasi untuk pembaruan jadwal/perbaikan data."
      : "DRAFT AWAL - Hasil generate bulanan.");

  const existing = await prisma.monthlySchedule.findUnique({
    where: {
      month_year: {
        month: params.month,
        year: params.year,
      },
    },
    select: { id: true, summary: true },
  });

  if (existing && !forceRegenerate) {
    const existingSchedule = await getMonthlySchedule(params.month, params.year);
    if (!existingSchedule) {
      return {
        ok: false as const,
        status: 404,
        error: "Jadwal bulanan ditemukan tetapi detail tidak dapat dibaca",
      };
    }

    if (!hasRoleExclusionViolation(existingSchedule)) {
      return {
        ok: true as const,
        alreadyExists: true,
        schedule: existingSchedule,
      };
    }

    if (!params.documentStatus) {
      requestedDocumentStatus = "REVISI";
    }
    if (!params.changeNotes?.trim()) {
      normalizedChangeNotes =
        "REVISI TERKENDALI - Regenerasi otomatis karena jadwal lama memuat petugas yang dikecualikan untuk role tertentu.";
    }
  }

  const { slots, holidays } = buildWorkingSlots(params.month, params.year, normalizedHolidayCalendar);
  if (slots.length === 0) {
    return {
      ok: false as const,
      status: 400,
      error: "Tidak ada slot kerja untuk bulan dan tahun yang dipilih",
    };
  }

  const officers = await prisma.pstOfficerCandidate.findMany({
    where: {
      isActiveCandidate: true,
      employmentStatus: PstOfficerEmploymentStatus.MASUK,
    },
    select: PST_OFFICER_MIN_SELECT,
    orderBy: [{ priorityNextMonth: "desc" }, { name: "asc" }],
  });

  if (officers.length === 0) {
    return {
      ok: false as const,
      status: 400,
      error: "Belum ada kandidat petugas aktif dari hasil sinkronisasi SIGAP",
    };
  }

  const officerByNormalizedName = new Map(
    officers.map((officer) => [normalizeOfficerName(officer.name), officer] as const)
  );
  const findOfficerByRequestedName = (requestedName: string) => {
    const normalizedRequestedName = normalizeOfficerName(requestedName);
    const exact = officerByNormalizedName.get(normalizedRequestedName);
    if (exact) {
      return exact;
    }

    return (
      officers.find((officer) => {
        const normalizedOfficerName = normalizeOfficerName(officer.name);
        return (
          normalizedOfficerName.includes(normalizedRequestedName) ||
          normalizedRequestedName.includes(normalizedOfficerName)
        );
      }) ?? null
    );
  };

  const forcedAssignmentBySlotKey = new Map<
    string,
    { requestedName: string; officer: (typeof officers)[number] }
  >();
  const fixedLockedOfficerIdSet = new Set<string>();
  if (specialRule) {
    for (const item of specialRule.fixedAssignments) {
      const officer = findOfficerByRequestedName(item.officerName);
      if (!officer) {
        return {
          ok: false as const,
          status: 400,
          error: `Penugasan khusus ${item.dateIso} (${item.role}) gagal: petugas ${item.officerName} tidak ditemukan atau tidak aktif`,
        };
      }
      forcedAssignmentBySlotKey.set(`${item.dateIso}|${item.role}`, {
        requestedName: item.officerName,
        officer,
      });
      fixedLockedOfficerIdSet.add(officer.id);
    }
  }

  const assignableOfficersByRole: Record<PstSlotRole, typeof officers> = {
    [PstSlotRole.PST]: officers.filter(
      (officer) => !isOfficerExcludedForRole(officer.name, PstSlotRole.PST)
    ),
    [PstSlotRole.WFO]: officers.filter(
      (officer) => !isOfficerExcludedForRole(officer.name, PstSlotRole.WFO)
    ),
  };

  const requiredRoles = new Set(slots.map((slot) => slot.role));
  for (const role of requiredRoles) {
    if (assignableOfficersByRole[role].length === 0) {
      return {
        ok: false as const,
        status: 400,
        error: `Tidak ada kandidat yang memenuhi syarat untuk slot ${role}`,
      };
    }
  }

  const assignableOfficerIds = new Set(
    [...assignableOfficersByRole[PstSlotRole.PST], ...assignableOfficersByRole[PstSlotRole.WFO]].map(
      (officer) => officer.id
    )
  );
  const assignableOfficerIdList = Array.from(assignableOfficerIds).sort((left, right) =>
    left.localeCompare(right, "id")
  );

  const uniqueDates = [...new Set(slots.map((slot) => slot.dateIso))].sort((left, right) =>
    left.localeCompare(right)
  );
  const firstDate = dateFromIso(uniqueDates[0]);
  const lastDate = dateFromIso(uniqueDates[uniqueDates.length - 1]);
  const historyWindowStart = (() => {
    const shifted = addMonths(params.year, params.month, -FAIRNESS_HISTORY_WINDOW_MONTHS);
    return getMonthStart(shifted.year, shifted.month);
  })();
  const previousMonthPeriod = toPreviousMonth(params.year, params.month);
  const holidayDateSet = new Set(holidays.map((holiday) => holiday.dateIso));

  const availabilityRecords = await prisma.officerAvailability.findMany({
    where: {
      officerId: { in: officers.map((officer) => officer.id) },
      date: {
        gte: firstDate,
        lte: lastDate,
      },
    },
    select: {
      officerId: true,
      date: true,
    },
  });

  const unavailableSet = new Set(
    availabilityRecords.map((item) => `${item.officerId}|${toIsoDateInTimeZone(item.date)}`)
  );

  const history = await prisma.assignmentHistory.findMany({
    where: {
      officerId: { in: assignableOfficerIdList },
      scheduleDate: {
        lt: firstDate,
      },
    },
    orderBy: { scheduleDate: "desc" },
    select: {
      officerId: true,
      slotRole: true,
      scheduleDate: true,
      month: true,
      year: true,
    },
  });

  const threeMonthCount = new Map<string, number>();
  const threeMonthFridayCount = new Map<string, number>();
  const previousMonthAssigned = new Set<string>();
  const lastAssignedAt = new Map<string, Date>();
  const assignmentDatesByOfficer = new Map<string, Date[]>();

  for (const item of history) {
    if (!lastAssignedAt.has(item.officerId)) {
      lastAssignedAt.set(item.officerId, item.scheduleDate);
    }

    if (item.month === previousMonthPeriod.month && item.year === previousMonthPeriod.year) {
      previousMonthAssigned.add(item.officerId);
    }

    if (item.scheduleDate >= historyWindowStart) {
      threeMonthCount.set(item.officerId, (threeMonthCount.get(item.officerId) ?? 0) + 1);
      if (getWeekdayIso(item.scheduleDate) === 5) {
        threeMonthFridayCount.set(item.officerId, (threeMonthFridayCount.get(item.officerId) ?? 0) + 1);
      }

      const dateBucket = assignmentDatesByOfficer.get(item.officerId) ?? [];
      dateBucket.push(item.scheduleDate);
      assignmentDatesByOfficer.set(item.officerId, dateBucket);
    }
  }

  for (const officerId of assignableOfficerIdList) {
    if (!assignmentDatesByOfficer.has(officerId)) {
      assignmentDatesByOfficer.set(officerId, []);
    }
  }

  const monthlyCount = new Map<string, number>();
  const monthlyRoleCount = new Map<string, number>();
  const monthlyFridayRoleCount = new Map<string, number>();
  const monthlyFridayTotalCount = new Map<string, number>();
  const assignedThisMonth = new Set<string>();
  const assignedByDate = new Map<string, Set<string>>();

  const provisionalDetails: Array<{
    scheduleDate: Date;
    weekOfMonth: number;
    weekday: number;
    slotRole: PstSlotRole;
    officerId: string | null;
    status: PstScheduleDetailStatus;
    notes: string | null;
    score: number | null;
  }> = [];

  for (const slot of slots) {
    const dateKey = slot.dateIso;
    const sameDateAssigned = assignedByDate.get(dateKey) ?? new Set<string>();
    let fridayCapRelaxed = false;
    let fixedAssigneeLockRelaxed = false;
    const forcedAssignment = forcedAssignmentBySlotKey.get(`${dateKey}|${slot.role}`) ?? null;

    if (forcedAssignment) {
      const forcedOfficer = forcedAssignment.officer;

      if (isOfficerExcludedForRole(forcedOfficer.name, slot.role)) {
        return {
          ok: false as const,
          status: 400,
          error: `Penugasan khusus ${dateKey} (${slot.role}) gagal: petugas ${forcedOfficer.name} tidak memenuhi syarat role`,
        };
      }

      if (unavailableSet.has(`${forcedOfficer.id}|${dateKey}`)) {
        return {
          ok: false as const,
          status: 400,
          error: `Penugasan khusus ${dateKey} (${slot.role}) gagal: petugas ${forcedOfficer.name} berstatus unavailable`,
        };
      }

      if (!allowSameFridayAssignee && sameDateAssigned.has(forcedOfficer.id)) {
        return {
          ok: false as const,
          status: 400,
          error: `Penugasan khusus ${dateKey} gagal: petugas ${forcedAssignment.requestedName} sudah terpakai pada tanggal yang sama`,
        };
      }

      provisionalDetails.push({
        scheduleDate: slot.scheduleDate,
        weekOfMonth: slot.weekOfMonth,
        weekday: slot.weekday,
        slotRole: slot.role,
        officerId: forcedOfficer.id,
        status: PstScheduleDetailStatus.ASSIGNED,
        notes: "Penugasan khusus April 2026",
        score: null,
      });

      monthlyCount.set(forcedOfficer.id, (monthlyCount.get(forcedOfficer.id) ?? 0) + 1);
      const roleHistoryKey = getHistoryMapKey(forcedOfficer.id, slot.role);
      monthlyRoleCount.set(roleHistoryKey, (monthlyRoleCount.get(roleHistoryKey) ?? 0) + 1);
      if (slot.weekday === 5) {
        monthlyFridayRoleCount.set(
          roleHistoryKey,
          (monthlyFridayRoleCount.get(roleHistoryKey) ?? 0) + 1
        );
        monthlyFridayTotalCount.set(
          forcedOfficer.id,
          (monthlyFridayTotalCount.get(forcedOfficer.id) ?? 0) + 1
        );
      }
      assignedThisMonth.add(forcedOfficer.id);
      sameDateAssigned.add(forcedOfficer.id);
      assignedByDate.set(dateKey, sameDateAssigned);
      lastAssignedAt.set(forcedOfficer.id, slot.scheduleDate);
      const assignmentDateBucket = assignmentDatesByOfficer.get(forcedOfficer.id) ?? [];
      assignmentDateBucket.push(slot.scheduleDate);
      assignmentDatesByOfficer.set(forcedOfficer.id, assignmentDateBucket);
      continue;
    }

    let eligible = assignableOfficersByRole[slot.role].filter((officer) => {
      if (unavailableSet.has(`${officer.id}|${dateKey}`)) {
        return false;
      }
      if (!allowSameFridayAssignee && sameDateAssigned.has(officer.id)) {
        return false;
      }
      return true;
    });

    if (fixedLockedOfficerIdSet.size > 0 && eligible.length > 0) {
      const unlockedEligible = eligible.filter((officer) => !fixedLockedOfficerIdSet.has(officer.id));
      if (unlockedEligible.length > 0) {
        eligible = unlockedEligible;
      } else {
        fixedAssigneeLockRelaxed = true;
      }
    }

    if (slot.weekday === 5 && eligible.length > 0) {
      const underFridayCap = eligible.filter(
        (officer) =>
          (monthlyFridayTotalCount.get(officer.id) ?? 0) < FRIDAY_ASSIGNMENT_HARD_CAP_PER_OFFICER
      );
      if (underFridayCap.length > 0) {
        eligible = underFridayCap;
      } else {
        fridayCapRelaxed = true;
      }
    }

    if (eligible.length === 0) {
      provisionalDetails.push({
        scheduleDate: slot.scheduleDate,
        weekOfMonth: slot.weekOfMonth,
        weekday: slot.weekday,
        slotRole: slot.role,
        officerId: null,
        status: PstScheduleDetailStatus.UNASSIGNED,
        notes: "Tidak ada kandidat yang memenuhi syarat pada slot ini",
        score: null,
      });
      continue;
    }

    const firstRoundEligible = eligible.filter((officer) => !assignedThisMonth.has(officer.id));
    if (firstRoundEligible.length > 0) {
      eligible = firstRoundEligible;
    } else if (eligible.length > 1) {
      const minMonthlyAssignment = Math.min(
        ...eligible.map((officer) => monthlyCount.get(officer.id) ?? 0)
      );
      eligible = eligible.filter(
        (officer) => (monthlyCount.get(officer.id) ?? 0) === minMonthlyAssignment
      );
    }

    const scoredCandidates: CandidateWithScore[] = eligible.map((candidate) => {
      const monthlyAssignmentCount = monthlyCount.get(candidate.id) ?? 0;
      const roleHistoryKey = getHistoryMapKey(candidate.id, slot.role);
      const context: CandidateScoringContext = {
        monthlyAssignmentCount,
        monthlyRoleCount: monthlyRoleCount.get(roleHistoryKey) ?? 0,
        monthlyFridayRoleCount: monthlyFridayRoleCount.get(roleHistoryKey) ?? 0,
        monthlyFridayTotalCount: monthlyFridayTotalCount.get(candidate.id) ?? 0,
        threeMonthAssignmentCount: threeMonthCount.get(candidate.id) ?? 0,
        threeMonthFridayCount: threeMonthFridayCount.get(candidate.id) ?? 0,
        previouslyAssignedLastMonth: previousMonthAssigned.has(candidate.id),
        closestAssignmentDistanceDays: getClosestAssignmentDistance(
          slot.scheduleDate,
          assignmentDatesByOfficer.get(candidate.id) ?? []
        ),
        historicalPriorityFlag: !previousMonthAssigned.has(candidate.id),
        lastAssignedAt: lastAssignedAt.get(candidate.id) ?? null,
      };
      const score = scoreCandidate(candidate, slot, context);

      return {
        candidate,
        score,
        weight: Math.max(1, score),
        context,
      };
    });

    const picked =
      scoredCandidates.sort((left, right) => {
        if (left.score !== right.score) {
          return right.score - left.score;
        }
        if (left.context.monthlyAssignmentCount !== right.context.monthlyAssignmentCount) {
          return left.context.monthlyAssignmentCount - right.context.monthlyAssignmentCount;
        }
        if (left.context.monthlyRoleCount !== right.context.monthlyRoleCount) {
          return left.context.monthlyRoleCount - right.context.monthlyRoleCount;
        }
        if (slot.weekday === 5) {
          if (left.context.monthlyFridayTotalCount !== right.context.monthlyFridayTotalCount) {
            return left.context.monthlyFridayTotalCount - right.context.monthlyFridayTotalCount;
          }
          if (left.context.monthlyFridayRoleCount !== right.context.monthlyFridayRoleCount) {
            return left.context.monthlyFridayRoleCount - right.context.monthlyFridayRoleCount;
          }
        }

        const leftLast = left.context.lastAssignedAt?.getTime() ?? Number.NEGATIVE_INFINITY;
        const rightLast = right.context.lastAssignedAt?.getTime() ?? Number.NEGATIVE_INFINITY;
        if (leftLast !== rightLast) {
          return leftLast - rightLast;
        }

        return left.candidate.name.localeCompare(right.candidate.name, "id");
      })[0] ?? null;

    if (!picked) {
      provisionalDetails.push({
        scheduleDate: slot.scheduleDate,
        weekOfMonth: slot.weekOfMonth,
        weekday: slot.weekday,
        slotRole: slot.role,
        officerId: null,
        status: PstScheduleDetailStatus.UNASSIGNED,
        notes: "Tidak ada kandidat terpilih",
        score: null,
      });
      continue;
    }

    const noteParts: string[] = [];
    if (picked.context.historicalPriorityFlag || picked.candidate.priorityNextMonth) {
      noteParts.push("Prioritas: belum terpilih bulan sebelumnya");
    }
    if (picked.context.monthlyAssignmentCount > 0) {
      noteParts.push(`Pemerataan penugasan ke-${picked.context.monthlyAssignmentCount + 1}`);
    }
    if (slot.weekday === 5 && picked.context.monthlyFridayRoleCount > 0) {
      noteParts.push("Rotasi Jumat dikendalikan");
    }
    if (slot.weekday === 5 && fridayCapRelaxed) {
      noteParts.push("Bypass batas Jumat karena kandidat terbatas");
    }
    if (fixedAssigneeLockRelaxed) {
      noteParts.push("Bypass lock petugas fixed assignment karena kandidat terbatas");
    }
    if (noteParts.length === 0) {
      noteParts.push("Penugasan sesuai fairness histori");
    }

    provisionalDetails.push({
      scheduleDate: slot.scheduleDate,
      weekOfMonth: slot.weekOfMonth,
      weekday: slot.weekday,
      slotRole: slot.role,
      officerId: picked.candidate.id,
      status: PstScheduleDetailStatus.ASSIGNED,
      notes: noteParts.join(" | "),
      score: picked.score,
    });

    monthlyCount.set(picked.candidate.id, (monthlyCount.get(picked.candidate.id) ?? 0) + 1);
    const roleHistoryKey = getHistoryMapKey(picked.candidate.id, slot.role);
    monthlyRoleCount.set(roleHistoryKey, (monthlyRoleCount.get(roleHistoryKey) ?? 0) + 1);
    if (slot.weekday === 5) {
      monthlyFridayRoleCount.set(
        roleHistoryKey,
        (monthlyFridayRoleCount.get(roleHistoryKey) ?? 0) + 1
      );
      monthlyFridayTotalCount.set(
        picked.candidate.id,
        (monthlyFridayTotalCount.get(picked.candidate.id) ?? 0) + 1
      );
    }
    assignedThisMonth.add(picked.candidate.id);
    sameDateAssigned.add(picked.candidate.id);
    assignedByDate.set(dateKey, sameDateAssigned);
    lastAssignedAt.set(picked.candidate.id, slot.scheduleDate);
    const assignmentDateBucket = assignmentDatesByOfficer.get(picked.candidate.id) ?? [];
    assignmentDateBucket.push(slot.scheduleDate);
    assignmentDatesByOfficer.set(picked.candidate.id, assignmentDateBucket);
  }

  const totalAssigned = provisionalDetails.filter((detail) => Boolean(detail.officerId)).length;
  const totalUnassigned = provisionalDetails.length - totalAssigned;
  const unassignedOfficerIds = assignableOfficerIdList.filter(
    (officerId) => !assignedThisMonth.has(officerId)
  );

  const detailByDate = new Map<
    string,
    {
      dateIso: string;
      pstOfficerId: string | null;
      wfoOfficerId: string | null;
      weekday: number;
      seenOfficerIds: string[];
    }
  >();
  for (const detail of provisionalDetails) {
    const dateIso = toIsoDateInTimeZone(detail.scheduleDate);
    const bucket = detailByDate.get(dateIso) ?? {
      dateIso,
      pstOfficerId: null,
      wfoOfficerId: null,
      weekday: detail.weekday,
      seenOfficerIds: [],
    };

    if (detail.slotRole === PstSlotRole.PST) {
      bucket.pstOfficerId = detail.officerId;
    }
    if (detail.slotRole === PstSlotRole.WFO) {
      bucket.wfoOfficerId = detail.officerId;
    }
    if (detail.officerId) {
      bucket.seenOfficerIds.push(detail.officerId);
    }
    detailByDate.set(dateIso, bucket);
  }

  let duplicateOfficerCount = 0;
  let fridayIncompleteCount = 0;
  for (const value of detailByDate.values()) {
    if (value.seenOfficerIds.length !== new Set(value.seenOfficerIds).size) {
      duplicateOfficerCount += 1;
    }
    const requiresWfoOnFriday = isWfoSlotRequired(value.dateIso, specialRule);
    if (
      value.weekday === 5 &&
      (!value.pstOfficerId || (requiresWfoOnFriday && !value.wfoOfficerId))
    ) {
      fridayIncompleteCount += 1;
    }
  }

  const holidayAssignedCount = provisionalDetails.filter(
    (detail) =>
      Boolean(detail.officerId) && holidayDateSet.has(toIsoDateInTimeZone(detail.scheduleDate))
  ).length;
  const unavailableAssignmentCount = provisionalDetails.filter(
    (detail) =>
      Boolean(detail.officerId) &&
      unavailableSet.has(`${detail.officerId}|${toIsoDateInTimeZone(detail.scheduleDate)}`)
  ).length;
  const chronologicalIssueCount = slots.reduce((count, slot, index) => {
    if (index === 0) {
      return count;
    }
    const previous = slots[index - 1];
    if (!previous) {
      return count;
    }
    return previous.dateIso > slot.dateIso ? count + 1 : count;
  }, 0);
  const effectiveWorkingDayMismatchCount =
    uniqueDates.length === detailByDate.size ? 0 : Math.abs(uniqueDates.length - detailByDate.size);

  const assignedCountByOfficer = new Map<string, number>();
  const fridayCountByOfficer = new Map<string, number>();
  for (const detail of provisionalDetails) {
    if (!detail.officerId) {
      continue;
    }
    assignedCountByOfficer.set(
      detail.officerId,
      (assignedCountByOfficer.get(detail.officerId) ?? 0) + 1
    );
    if (detail.weekday === 5) {
      fridayCountByOfficer.set(
        detail.officerId,
        (fridayCountByOfficer.get(detail.officerId) ?? 0) + 1
      );
    }
  }

  const assignmentCountValues = Array.from(assignedCountByOfficer.values());
  const fridayCountValues = Array.from(fridayCountByOfficer.values());
  const maxAssignedCount = assignmentCountValues.length > 0 ? Math.max(...assignmentCountValues) : 0;
  const minAssignedCount = assignmentCountValues.length > 0 ? Math.min(...assignmentCountValues) : 0;
  const distributionSpread = assignmentCountValues.length > 0 ? maxAssignedCount - minAssignedCount : 0;
  const maxFridayCount = fridayCountValues.length > 0 ? Math.max(...fridayCountValues) : 0;
  const minFridayCount = fridayCountValues.length > 0 ? Math.min(...fridayCountValues) : 0;
  const fridaySpread = fridayCountValues.length > 0 ? maxFridayCount - minFridayCount : 0;
  const coverageRate =
    assignableOfficerIdList.length === 0
      ? 1
      : assignedThisMonth.size / assignableOfficerIdList.length;

  const validationItems: FairnessValidationItem[] = [];
  const fridayRuleLabel = specialRule
    ? `Hari Jumat wajib memiliki slot PST dan WFO mulai ${specialRule.wfoStartDateIso}`
    : "Hari Jumat wajib memiliki slot PST dan WFO";
  const fridayRuleSuccessDetail = specialRule
    ? `Seluruh hari Jumat sejak ${specialRule.wfoStartDateIso} sudah terisi PST dan WFO.`
    : "Seluruh hari Jumat sudah terisi PST dan WFO.";
  const pushValidation = (
    code: string,
    rule: string,
    status: PstValidationLevel,
    detail: string
  ) => {
    validationItems.push({ code, rule, status, detail });
  };

  pushValidation(
    "NO_DUPLICATE_OFFICER",
    "Tidak ada petugas ganda di tanggal yang sama",
    duplicateOfficerCount === 0 ? "OK" : "ERROR",
    duplicateOfficerCount === 0
      ? "Tidak ditemukan petugas ganda."
      : `${duplicateOfficerCount} tanggal terdeteksi petugas ganda.`
  );
  pushValidation(
    "FRIDAY_HAS_PST_WFO",
    fridayRuleLabel,
    fridayIncompleteCount === 0 ? "OK" : "ERROR",
    fridayIncompleteCount === 0
      ? fridayRuleSuccessDetail
      : `${fridayIncompleteCount} hari Jumat belum lengkap.`
  );
  pushValidation(
    "HOLIDAY_EMPTY",
    "Hari libur nasional/cuti bersama harus kosong",
    holidayAssignedCount === 0 ? "OK" : "ERROR",
    holidayAssignedCount === 0
      ? "Semua hari libur/cuti bersama kosong."
      : `${holidayAssignedCount} hari libur/cuti bersama masih memiliki petugas.`
  );
  pushValidation(
    "UNAVAILABLE_FILTER",
    "Petugas unavailable tidak boleh terpilih",
    unavailableAssignmentCount === 0 ? "OK" : "ERROR",
    unavailableAssignmentCount === 0
      ? "Tidak ada petugas unavailable yang terjadwal."
      : `${unavailableAssignmentCount} slot terisi oleh petugas unavailable.`
  );
  pushValidation(
    "DATE_CHRONOLOGICAL",
    "Urutan tanggal harus kronologis",
    chronologicalIssueCount === 0 ? "OK" : "ERROR",
    chronologicalIssueCount === 0
      ? "Urutan tanggal sudah kronologis."
      : `Terdapat ${chronologicalIssueCount} anomali urutan tanggal.`
  );
  pushValidation(
    "EFFECTIVE_WORKING_DAY_CONSISTENCY",
    "Jumlah hari kerja efektif konsisten dengan kalender slot",
    effectiveWorkingDayMismatchCount === 0 ? "OK" : "ERROR",
    effectiveWorkingDayMismatchCount === 0
      ? "Jumlah hari kerja efektif konsisten."
      : `Terdapat selisih ${effectiveWorkingDayMismatchCount} hari kerja efektif.`
  );
  pushValidation(
    "SLOT_COMPLETENESS",
    "Slot kosong harus ditandai jelas",
    totalUnassigned === 0 ? "OK" : "WARNING",
    totalUnassigned === 0
      ? "Semua slot terisi."
      : `${totalUnassigned} slot belum terisi dan sudah ditandai pada keterangan.`
  );

  const totalSlots = provisionalDetails.length;
  const fairnessStatus: PstValidationLevel =
    totalSlots >= assignableOfficerIdList.length && unassignedOfficerIds.length > 0
      ? "ERROR"
      : distributionSpread > 2 || fridaySpread > 2
        ? "WARNING"
        : "OK";
  pushValidation(
    "FAIRNESS_MINIMUM",
    "Distribusi penugasan minimum terpenuhi",
    fairnessStatus,
    fairnessStatus === "OK"
      ? "Distribusi penugasan merata dalam batas aman."
      : fairnessStatus === "WARNING"
        ? `Distribusi masih perlu diratakan (spread total ${distributionSpread}, spread Jumat ${fridaySpread}).`
        : "Slot cukup untuk seluruh petugas, tetapi masih ada petugas yang belum terpilih."
  );

  const levelRank: Record<PstValidationLevel, number> = {
    OK: 1,
    WARNING: 2,
    ERROR: 3,
  };
  const overallStatus = validationItems.reduce<PstValidationLevel>(
    (current, item) => (levelRank[item.status] > levelRank[current] ? item.status : current),
    "OK"
  );

  const previousVersion = readDocumentVersionFromSummary(existing?.summary ?? null);
  const documentVersion = existing ? Math.max(2, previousVersion + 1) : 1;

  const summary: MonthlyScheduleSummary = {
    totalWorkingDays: uniqueDates.length,
    totalSlots,
    totalAssigned,
    totalUnassigned,
    totalFridaySlots: provisionalDetails.filter((detail) => detail.weekday === 5).length,
    unassignedOfficerCount: unassignedOfficerIds.length,
    unassignedOfficerIds,
    generatedMessage:
      totalUnassigned === 0
        ? "Jadwal bulanan berhasil dibuat dengan distribusi fairness yang tervalidasi"
        : `Jadwal bulanan dibuat dengan ${totalUnassigned} slot belum terisi`,
    validation: {
      overallStatus,
      items: validationItems,
    },
    fairness: {
      historyWindowMonths: FAIRNESS_HISTORY_WINDOW_MONTHS,
      distributionSpread,
      fridaySpread,
      assignedOfficerCount: assignedThisMonth.size,
      eligibleOfficerCount: assignableOfficerIdList.length,
      coverageRate: Number((coverageRate * 100).toFixed(2)),
      note:
        fairnessStatus === "OK"
          ? "Distribusi penugasan stabil; prioritas bulan sebelumnya sudah diperhitungkan."
          : fairnessStatus === "WARNING"
            ? "Distribusi masih bisa diratakan pada periode berikutnya."
            : "Terdapat gap fairness yang perlu ditindaklanjuti pada regenerasi berikutnya.",
    },
    audit: {
      generatedAt: new Date().toISOString(),
      generatedById: params.generatedById ?? null,
      generatedByName: params.generatedByName ?? null,
      documentVersion,
      documentStatus: requestedDocumentStatus,
      changeNotes: normalizedChangeNotes,
      previousScheduleId: existing?.id ?? null,
      algorithmVersion: FAIRNESS_ALGORITHM_VERSION,
    },
  };

  const createdSchedule = await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.assignmentHistory.deleteMany({
        where: {
          monthlyScheduleId: existing.id,
        },
      });
      await tx.monthlySchedule.delete({
        where: {
          id: existing.id,
        },
      });
    }

    const schedule = await tx.monthlySchedule.create({
      data: {
        month: params.month,
        year: params.year,
        status: getScheduleStatusFromDocumentStatus(requestedDocumentStatus),
        generatedById: params.generatedById ?? null,
        holidayCalendar: normalizedHolidayCalendar as Prisma.InputJsonValue,
        summary: summary as Prisma.InputJsonValue,
      },
      select: {
        id: true,
        month: true,
        year: true,
        status: true,
        generatedAt: true,
        summary: true,
        holidayCalendar: true,
      },
    });

    const createdDetails: Array<{
      id: string;
      scheduleDate: Date;
      weekOfMonth: number;
      slotRole: PstSlotRole;
      status: PstScheduleDetailStatus;
      notes: string | null;
      officerId: string | null;
      officer: {
        name: string;
        sigapUsername: string | null;
        whatsappNumber: string | null;
      } | null;
    }> = [];

    for (const detail of provisionalDetails) {
      const createdDetail = await tx.scheduleDetail.create({
        data: {
          monthlyScheduleId: schedule.id,
          scheduleDate: detail.scheduleDate,
          weekOfMonth: detail.weekOfMonth,
          weekday: detail.weekday,
          slotRole: detail.slotRole,
          officerId: detail.officerId,
          status: detail.status,
          notes: detail.notes,
        },
        select: {
          id: true,
          scheduleDate: true,
          weekOfMonth: true,
          slotRole: true,
          status: true,
          notes: true,
          officerId: true,
          officer: {
            select: {
              name: true,
              sigapUsername: true,
              whatsappNumber: true,
            },
          },
        },
      });

      createdDetails.push(createdDetail);

      if (detail.officerId) {
        await tx.assignmentHistory.create({
          data: {
            officerId: detail.officerId,
            monthlyScheduleId: schedule.id,
            scheduleDetailId: createdDetail.id,
            scheduleDate: detail.scheduleDate,
            month: params.month,
            year: params.year,
            slotRole: detail.slotRole,
            score: detail.score,
          },
        });
      }
    }

    await tx.pstOfficerCandidate.updateMany({
      where: {
        id: { in: Array.from(assignedThisMonth) },
      },
      data: {
        priorityNextMonth: false,
      },
    });

    if (unassignedOfficerIds.length > 0) {
      await tx.pstOfficerCandidate.updateMany({
        where: {
          id: { in: unassignedOfficerIds },
        },
        data: {
          priorityNextMonth: true,
        },
      });
    }

    return {
      schedule,
      details: createdDetails,
    };
  });

  return {
    ok: true as const,
    alreadyExists: false,
    schedule: toMonthlyScheduleResponse({
      schedule: createdSchedule.schedule,
      details: createdSchedule.details,
    }),
  };
}

export async function repairConflicts(scheduleId: string, performedById?: string) {
  const schedule = await prisma.monthlySchedule.findUnique({
    where: { id: scheduleId },
    include: {
      details: {
        where: {
          officerId: { not: null },
        },
        orderBy: [{ scheduleDate: "asc" }, { slotRole: "asc" }],
      },
    },
  });

  if (!schedule) {
    return {
      ok: false as const,
      status: 404,
      error: "Jadwal bulanan tidak ditemukan",
    };
  }

  let repairedCount = 0;

  const grouped = new Map<string, typeof schedule.details>();
  for (const detail of schedule.details) {
    const key = toIsoDateInTimeZone(detail.scheduleDate);
    const bucket = grouped.get(key) ?? [];
    bucket.push(detail);
    grouped.set(key, bucket);
  }

  for (const [dateIso, details] of grouped.entries()) {
    const assigned = details.filter((detail) => detail.officerId);
    if (assigned.length < 2) {
      continue;
    }

    const officerIds = assigned
      .map((detail) => detail.officerId)
      .filter((officerId): officerId is string => Boolean(officerId));
    const uniqueOfficerIds = new Set(officerIds);
    if (uniqueOfficerIds.size === officerIds.length) {
      continue;
    }

    const duplicatedOfficerId = officerIds[0];
    const candidateToReplace = assigned.find((detail) => detail.slotRole === PstSlotRole.WFO) ?? assigned[1];
    if (!candidateToReplace.officerId) {
      continue;
    }

    const replacementCandidates = await getEligibleOfficers(dateFromIso(dateIso), candidateToReplace.slotRole);
    const replacement = replacementCandidates.find(
      (candidate) => candidate.id !== duplicatedOfficerId && !officerIds.includes(candidate.id)
    );

    if (!replacement) {
      continue;
    }

    await prisma.$transaction(async (tx) => {
      await tx.scheduleDetail.update({
        where: { id: candidateToReplace.id },
        data: {
          officerId: replacement.id,
          status: PstScheduleDetailStatus.REPLACED,
          notes: "Perbaikan konflik otomatis",
        },
      });

      await tx.reshuffleLog.create({
        data: {
          monthlyScheduleId: schedule.id,
          actionType: ReshuffleActionType.AUTO_REPLACE,
          firstScheduleDetailId: candidateToReplace.id,
          oldOfficerId: candidateToReplace.officerId,
          newOfficerId: replacement.id,
          reason: "Perbaikan konflik jadwal otomatis",
          performedById: performedById ?? null,
        },
      });
    });

    repairedCount += 1;
  }

  return {
    ok: true as const,
    repairedCount,
  };
}

export async function reshuffleSingleSlot(
  scheduleDetailId: string,
  options?: { reason?: string; performedById?: string }
) {
  const detail = await prisma.scheduleDetail.findUnique({
    where: { id: scheduleDetailId },
    include: {
      monthlySchedule: {
        select: {
          id: true,
          month: true,
          year: true,
        },
      },
    },
  });

  if (!detail) {
    return {
      ok: false as const,
      status: 404,
      error: "Slot jadwal tidak ditemukan",
    };
  }

  const sameDateDetails = await prisma.scheduleDetail.findMany({
    where: {
      monthlyScheduleId: detail.monthlyScheduleId,
      scheduleDate: detail.scheduleDate,
      id: { not: detail.id },
      officerId: { not: null },
    },
    select: {
      officerId: true,
    },
  });

  const excludedIds = new Set(
    sameDateDetails
      .map((item) => item.officerId)
      .filter((officerId): officerId is string => Boolean(officerId))
  );

  const candidates = await getEligibleOfficers(detail.scheduleDate, detail.slotRole);
  const monthlyCounts = await prisma.scheduleDetail.groupBy({
    by: ["officerId"],
    where: {
      monthlyScheduleId: detail.monthlyScheduleId,
      officerId: { not: null },
    },
    _count: {
      officerId: true,
    },
  });

  const countMap = new Map<string, number>();
  for (const row of monthlyCounts) {
    if (row.officerId) {
      countMap.set(row.officerId, row._count.officerId);
    }
  }

  const replacement = candidates
    .filter((candidate) => candidate.id !== detail.officerId && !excludedIds.has(candidate.id))
    .sort((a, b) => {
      const aCount = countMap.get(a.id) ?? 0;
      const bCount = countMap.get(b.id) ?? 0;
      if (aCount !== bCount) return aCount - bCount;
      return a.name.localeCompare(b.name, "id");
    })[0];

  if (!replacement) {
    return {
      ok: false as const,
      status: 409,
      error: "Tidak ada kandidat pengganti yang memenuhi aturan slot",
    };
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedDetail = await tx.scheduleDetail.update({
      where: { id: detail.id },
      data: {
        officerId: replacement.id,
        status: PstScheduleDetailStatus.REPLACED,
        notes: options?.reason?.trim() || "Reshuffle slot tunggal",
      },
      include: {
        officer: {
          select: {
            id: true,
            name: true,
            sigapUsername: true,
            whatsappNumber: true,
          },
        },
      },
    });

    await tx.reshuffleLog.create({
      data: {
        monthlyScheduleId: detail.monthlyScheduleId,
        actionType: ReshuffleActionType.MANUAL_OVERRIDE,
        firstScheduleDetailId: detail.id,
        oldOfficerId: detail.officerId,
        newOfficerId: replacement.id,
        reason: options?.reason?.trim() || "Reshuffle slot tunggal",
        performedById: options?.performedById ?? null,
      },
    });

    await tx.assignmentHistory.create({
      data: {
        officerId: replacement.id,
        monthlyScheduleId: detail.monthlyScheduleId,
        scheduleDetailId: detail.id,
        scheduleDate: detail.scheduleDate,
        month: detail.monthlySchedule.month,
        year: detail.monthlySchedule.year,
        slotRole: detail.slotRole,
      },
    });

    return updatedDetail;
  });

  return {
    ok: true as const,
    detail: updated,
  };
}

export async function swapSchedule(
  firstScheduleId: string,
  secondScheduleId: string,
  options?: { reason?: string; performedById?: string }
) {
  const [first, second] = await Promise.all([
    prisma.scheduleDetail.findUnique({
      where: { id: firstScheduleId },
      include: { officer: { select: { id: true, name: true } } },
    }),
    prisma.scheduleDetail.findUnique({
      where: { id: secondScheduleId },
      include: { officer: { select: { id: true, name: true } } },
    }),
  ]);

  if (!first || !second) {
    return {
      ok: false as const,
      status: 404,
      error: "Salah satu slot jadwal tidak ditemukan",
    };
  }

  if (first.monthlyScheduleId !== second.monthlyScheduleId) {
    return {
      ok: false as const,
      status: 409,
      error: "Swap hanya bisa dilakukan dalam jadwal bulanan yang sama",
    };
  }

  if (!first.officerId || !second.officerId) {
    return {
      ok: false as const,
      status: 409,
      error: "Kedua slot harus memiliki petugas sebelum swap dilakukan",
    };
  }

  if (first.scheduleDate.getTime() === second.scheduleDate.getTime()) {
    return {
      ok: false as const,
      status: 409,
      error: "Swap antar slot pada tanggal yang sama tidak diperbolehkan",
    };
  }

  if (second.officer?.name && isOfficerExcludedForRole(second.officer.name, first.slotRole)) {
    return {
      ok: false as const,
      status: 409,
      error: `Petugas ${second.officer.name} tidak memenuhi syarat untuk slot ${first.slotRole}`,
    };
  }

  if (first.officer?.name && isOfficerExcludedForRole(first.officer.name, second.slotRole)) {
    return {
      ok: false as const,
      status: 409,
      error: `Petugas ${first.officer.name} tidak memenuhi syarat untuk slot ${second.slotRole}`,
    };
  }

  const result = await prisma.$transaction(async (tx) => {
    const firstUpdated = await tx.scheduleDetail.update({
      where: { id: first.id },
      data: {
        officerId: second.officerId,
        status: PstScheduleDetailStatus.SWAPPED,
        notes: options?.reason?.trim() || "Swap jadwal",
      },
      include: {
        officer: {
          select: {
            id: true,
            name: true,
            sigapUsername: true,
            whatsappNumber: true,
          },
        },
      },
    });

    const secondUpdated = await tx.scheduleDetail.update({
      where: { id: second.id },
      data: {
        officerId: first.officerId,
        status: PstScheduleDetailStatus.SWAPPED,
        notes: options?.reason?.trim() || "Swap jadwal",
      },
      include: {
        officer: {
          select: {
            id: true,
            name: true,
            sigapUsername: true,
            whatsappNumber: true,
          },
        },
      },
    });

    await tx.reshuffleLog.create({
      data: {
        monthlyScheduleId: first.monthlyScheduleId,
        actionType: ReshuffleActionType.SWAP,
        firstScheduleDetailId: first.id,
        secondScheduleDetailId: second.id,
        oldOfficerId: first.officerId,
        newOfficerId: second.officerId,
        reason: options?.reason?.trim() || "Swap jadwal",
        performedById: options?.performedById ?? null,
      },
    });

    await tx.swapRequest.create({
      data: {
        monthlyScheduleId: first.monthlyScheduleId,
        firstScheduleDetailId: first.id,
        secondScheduleDetailId: second.id,
        status: SwapRequestStatus.APPLIED,
        requestedById: options?.performedById ?? null,
        approvedById: options?.performedById ?? null,
        reason: options?.reason?.trim() || "Swap jadwal",
        appliedAt: new Date(),
      },
    });

    return {
      first: firstUpdated,
      second: secondUpdated,
    };
  });

  return {
    ok: true as const,
    swapped: result,
  };
}

export async function getMonthlySchedule(month: number, year: number) {
  const schedule = await prisma.monthlySchedule.findUnique({
    where: {
      month_year: {
        month,
        year,
      },
    },
    select: {
      id: true,
      month: true,
      year: true,
      status: true,
      generatedAt: true,
      summary: true,
      holidayCalendar: true,
      details: {
        orderBy: [{ scheduleDate: "asc" }, { slotRole: "asc" }],
        select: {
          id: true,
          scheduleDate: true,
          weekOfMonth: true,
          slotRole: true,
          status: true,
          notes: true,
          officerId: true,
          officer: {
            select: {
              name: true,
              sigapUsername: true,
              whatsappNumber: true,
            },
          },
        },
      },
    },
  });

  if (!schedule) {
    return null;
  }

  return toMonthlyScheduleResponse({
    schedule,
    details: schedule.details,
  });
}

export async function getMonthlyScheduleById(scheduleId: string) {
  const schedule = await prisma.monthlySchedule.findUnique({
    where: { id: scheduleId },
    select: {
      id: true,
      month: true,
      year: true,
      status: true,
      generatedAt: true,
      summary: true,
      holidayCalendar: true,
      details: {
        orderBy: [{ scheduleDate: "asc" }, { slotRole: "asc" }],
        select: {
          id: true,
          scheduleDate: true,
          weekOfMonth: true,
          slotRole: true,
          status: true,
          notes: true,
          officerId: true,
          officer: {
            select: {
              name: true,
              sigapUsername: true,
              whatsappNumber: true,
            },
          },
        },
      },
    },
  });

  if (!schedule) {
    return null;
  }

  return toMonthlyScheduleResponse({
    schedule,
    details: schedule.details,
  });
}

export async function listMonthlySchedules(limit = 6) {
  const schedules = await prisma.monthlySchedule.findMany({
    orderBy: [{ year: "desc" }, { month: "desc" }],
    take: Math.max(1, Math.min(limit, 24)),
    select: {
      id: true,
      month: true,
      year: true,
      status: true,
      generatedAt: true,
      summary: true,
      holidayCalendar: true,
      details: {
        orderBy: [{ scheduleDate: "asc" }, { slotRole: "asc" }],
        select: {
          id: true,
          scheduleDate: true,
          weekOfMonth: true,
          slotRole: true,
          status: true,
          notes: true,
          officerId: true,
          officer: {
            select: {
              name: true,
              sigapUsername: true,
              whatsappNumber: true,
            },
          },
        },
      },
    },
  });

  return schedules.map((schedule) =>
    toMonthlyScheduleResponse({
      schedule,
      details: schedule.details,
    })
  );
}
