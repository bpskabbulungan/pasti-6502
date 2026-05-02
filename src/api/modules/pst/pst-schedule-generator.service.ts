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
const FAIRNESS_ALGORITHM_VERSION = "v3.1-friday-dual-random-prior-month-fairness";
const DEFAULT_MAX_RANDOM_ASSIGNMENTS_PER_MONTH = 1;

type PstPoolType = "NORMAL" | "LOW_PRIORITY" | "EXCLUDED";
type WfoFridayRandomPoolType = "PRIMARY" | "FALLBACK" | "NONE";
type ScheduleSlotType =
  | "PST_REGULAR"
  | "PST_FRIDAY"
  | "WFO_FRIDAY_FIXED"
  | "WFO_FRIDAY_RANDOM";

type OfficerScheduleRule = {
  officerId: string;
  name: string;
  pstPoolType: PstPoolType;
  wfoFridayRandomPoolType: WfoFridayRandomPoolType;
  canRandomPst: boolean;
  canRandomWfoFriday: boolean;
  fixedFridayWfo: boolean;
  fridayWfoOnly: boolean;
  maxRandomAssignmentsPerMonth: number;
};

type GeneratedAssignmentSlot = {
  scheduleDate: Date;
  dateIso: string;
  dayName: string;
  weekOfMonth: number;
  weekday: number;
  slotType: ScheduleSlotType;
  slotRole: PstSlotRole;
};

type ProvisionalAssignment = {
  scheduleDate: Date;
  weekOfMonth: number;
  weekday: number;
  slotRole: PstSlotRole;
  slotType: ScheduleSlotType;
  officerId: string | null;
  status: PstScheduleDetailStatus;
  notes: string | null;
  score: number | null;
  isRandomFairness: boolean;
};

type OfficerFairnessStats = {
  pstCurrentMonth: number;
  pstRegularCurrentMonth: number;
  pstFridayCurrentMonth: number;
  randomWfoFridayCurrentMonth: number;
  fixedWfoFridayCurrentMonth: number;
  fridayRandomBurdenCurrentMonth: number;
  totalCurrentMonthForRandomFairness: number;
  totalOperationalPresence: number;
  previousMonthPstRegular: number;
  previousMonthPstFriday: number;
  previousMonthRandomWfoFriday: number;
  previousMonthFridayBurden: number;
  previousMonthRandomTotal: number;
  historyWindowPstRegular: number;
  historyWindowPstFriday: number;
  historyWindowPst: number;
  historyWindowRandomWfoFriday: number;
  historyWindowFridayBurden: number;
  historyWindowTotalRandomAssignments: number;
  cumulativeRandomFairnessTotal: number;
  lastRandomAssignedDate: Date | null;
  selectedRandomThisMonth: boolean;
};

type CompareCandidatePriorityParams = {
  slotType: ScheduleSlotType;
  leftOfficerId: string;
  rightOfficerId: string;
  leftOfficerName: string;
  rightOfficerName: string;
  leftRule: OfficerScheduleRule;
  rightRule: OfficerScheduleRule;
  leftStats: OfficerFairnessStats;
  rightStats: OfficerFairnessStats;
  leftMonthRandomCount: number;
  rightMonthRandomCount: number;
  periodKey: string;
  dateIso: string;
};

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
  ],
  [PstSlotRole.WFO]: [
    "Yuda Agus Irianto",
    "Zulkifli",
    "Marinda Saga",
    "Marinda Saga Putra",
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

const EXCLUDED_NAME_LIST_BY_ROLE: Record<PstSlotRole, string[]> = {
  [PstSlotRole.PST]: ROLE_BASED_EXCLUDED_NAMES[PstSlotRole.PST].map(normalizeOfficerName),
  [PstSlotRole.WFO]: ROLE_BASED_EXCLUDED_NAMES[PstSlotRole.WFO].map(normalizeOfficerName),
};

const isOfficerExcludedForRole = (officerName: string, role: PstSlotRole) => {
  const normalizedOfficerName = normalizeOfficerName(officerName);
  const excludedNames = EXCLUDED_NAME_LIST_BY_ROLE[role];

  if (EXCLUDED_NAME_SET_BY_ROLE[role].has(normalizedOfficerName)) {
    return true;
  }

  // Backward-compatible alias match: "marinda saga" should match
  // "marinda saga putra" when legacy config used a shortened name.
  return excludedNames.some(
    (excludedName) =>
      normalizedOfficerName.startsWith(`${excludedName} `) ||
      excludedName.startsWith(`${normalizedOfficerName} `)
  );
};

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

const OFFICER_NAME_ALIASES = {
  ZULKIFLI: ["zulkifli"],
  MARINDA: ["marinda saga putra", "marinda saga"],
  ARI: ["ari susilowati"],
  IDHAMSYAH: ["idhamsyah"],
  ANUAR: ["anuar"],
  JUSMAN: ["jusman"],
} as const;

const hasOfficerAlias = (name: string, aliases: readonly string[]) => {
  const normalized = normalizeOfficerName(name);
  return aliases.some((alias) => {
    const normalizedAlias = normalizeOfficerName(alias);
    return (
      normalized === normalizedAlias ||
      normalized.startsWith(`${normalizedAlias} `) ||
      normalizedAlias.startsWith(`${normalized} `)
    );
  });
};

export const getPstPoolRank = (rule: OfficerScheduleRule): number => {
  if (rule.pstPoolType === "NORMAL") return 0;
  if (rule.pstPoolType === "LOW_PRIORITY") return 1;
  return 999;
};

export const getWfoFridayRandomPoolRank = (rule: OfficerScheduleRule): number => {
  if (rule.wfoFridayRandomPoolType === "PRIMARY") return 0;
  if (rule.wfoFridayRandomPoolType === "FALLBACK") return 1;
  return 999;
};

export const isEligibleForRandomWfoFriday = (rule: OfficerScheduleRule): boolean => {
  if (rule.fixedFridayWfo) return false;
  if (!rule.canRandomWfoFriday) return false;
  if (rule.wfoFridayRandomPoolType === "NONE") return false;
  return true;
};

const createOfficerRule = (
  officer: {
    id: string;
    name: string;
  },
  overrides?: Partial<OfficerScheduleRule>
): OfficerScheduleRule => ({
  officerId: officer.id,
  name: officer.name,
  pstPoolType: "NORMAL",
  wfoFridayRandomPoolType: "FALLBACK",
  canRandomPst: true,
  canRandomWfoFriday: true,
  fixedFridayWfo: false,
  fridayWfoOnly: false,
  maxRandomAssignmentsPerMonth: DEFAULT_MAX_RANDOM_ASSIGNMENTS_PER_MONTH,
  ...(overrides ?? {}),
});

export const buildOfficerScheduleRuleMap = (
  officers: Array<{
    id: string;
    name: string;
  }>
) => {
  const map = new Map<string, OfficerScheduleRule>();

  for (const officer of officers) {
    if (hasOfficerAlias(officer.name, OFFICER_NAME_ALIASES.ZULKIFLI)) {
      map.set(
        officer.id,
        createOfficerRule(officer, {
          pstPoolType: "LOW_PRIORITY",
          wfoFridayRandomPoolType: "NONE",
          canRandomPst: true,
          canRandomWfoFriday: false,
          fixedFridayWfo: true,
          fridayWfoOnly: true,
        })
      );
      continue;
    }

    if (hasOfficerAlias(officer.name, OFFICER_NAME_ALIASES.MARINDA)) {
      map.set(
        officer.id,
        createOfficerRule(officer, {
          pstPoolType: "LOW_PRIORITY",
          wfoFridayRandomPoolType: "NONE",
          canRandomPst: true,
          canRandomWfoFriday: false,
          fixedFridayWfo: true,
          fridayWfoOnly: true,
        })
      );
      continue;
    }

    if (hasOfficerAlias(officer.name, OFFICER_NAME_ALIASES.ARI)) {
      map.set(
        officer.id,
        createOfficerRule(officer, {
          pstPoolType: "EXCLUDED",
          wfoFridayRandomPoolType: "PRIMARY",
          canRandomPst: false,
          canRandomWfoFriday: true,
          fixedFridayWfo: false,
          fridayWfoOnly: true,
        })
      );
      continue;
    }

    if (hasOfficerAlias(officer.name, OFFICER_NAME_ALIASES.IDHAMSYAH)) {
      map.set(
        officer.id,
        createOfficerRule(officer, {
          pstPoolType: "EXCLUDED",
          wfoFridayRandomPoolType: "PRIMARY",
          canRandomPst: false,
          canRandomWfoFriday: true,
          fixedFridayWfo: false,
          fridayWfoOnly: true,
        })
      );
      continue;
    }

    // Anuar, Jusman, and everyone else are normal PST candidates and WFO fallback.
    map.set(officer.id, createOfficerRule(officer));
  }

  return map;
};

export const stableHash = (input: string) => {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
};

export const compareCandidatePriority = (params: CompareCandidatePriorityParams) => {
  const {
    slotType,
    leftOfficerId,
    rightOfficerId,
    leftOfficerName,
    rightOfficerName,
    leftRule,
    rightRule,
    leftStats,
    rightStats,
    leftMonthRandomCount,
    rightMonthRandomCount,
    periodKey,
    dateIso,
  } = params;

  if (leftMonthRandomCount !== rightMonthRandomCount) {
    return leftMonthRandomCount - rightMonthRandomCount;
  }

  if (slotType === "WFO_FRIDAY_RANDOM") {
    const leftPool = getWfoFridayRandomPoolRank(leftRule);
    const rightPool = getWfoFridayRandomPoolRank(rightRule);
    if (leftPool !== rightPool) return leftPool - rightPool;
    if (leftStats.previousMonthFridayBurden !== rightStats.previousMonthFridayBurden) {
      return leftStats.previousMonthFridayBurden - rightStats.previousMonthFridayBurden;
    }
    if (leftStats.previousMonthRandomTotal !== rightStats.previousMonthRandomTotal) {
      return leftStats.previousMonthRandomTotal - rightStats.previousMonthRandomTotal;
    }
    if (leftStats.historyWindowFridayBurden !== rightStats.historyWindowFridayBurden) {
      return leftStats.historyWindowFridayBurden - rightStats.historyWindowFridayBurden;
    }
    if (
      leftStats.historyWindowTotalRandomAssignments !==
      rightStats.historyWindowTotalRandomAssignments
    ) {
      return (
        leftStats.historyWindowTotalRandomAssignments -
        rightStats.historyWindowTotalRandomAssignments
      );
    }
    if (leftStats.historyWindowRandomWfoFriday !== rightStats.historyWindowRandomWfoFriday) {
      return leftStats.historyWindowRandomWfoFriday - rightStats.historyWindowRandomWfoFriday;
    }
  } else if (slotType === "PST_FRIDAY") {
    const leftPool = getPstPoolRank(leftRule);
    const rightPool = getPstPoolRank(rightRule);
    if (leftPool !== rightPool) return leftPool - rightPool;
    if (leftStats.previousMonthFridayBurden !== rightStats.previousMonthFridayBurden) {
      return leftStats.previousMonthFridayBurden - rightStats.previousMonthFridayBurden;
    }
    if (leftStats.previousMonthRandomTotal !== rightStats.previousMonthRandomTotal) {
      return leftStats.previousMonthRandomTotal - rightStats.previousMonthRandomTotal;
    }
    if (leftStats.historyWindowFridayBurden !== rightStats.historyWindowFridayBurden) {
      return leftStats.historyWindowFridayBurden - rightStats.historyWindowFridayBurden;
    }
    if (
      leftStats.historyWindowTotalRandomAssignments !==
      rightStats.historyWindowTotalRandomAssignments
    ) {
      return (
        leftStats.historyWindowTotalRandomAssignments -
        rightStats.historyWindowTotalRandomAssignments
      );
    }
    if (leftStats.historyWindowPstFriday !== rightStats.historyWindowPstFriday) {
      return leftStats.historyWindowPstFriday - rightStats.historyWindowPstFriday;
    }
  } else {
    const leftPool = getPstPoolRank(leftRule);
    const rightPool = getPstPoolRank(rightRule);
    if (leftPool !== rightPool) return leftPool - rightPool;
    if (leftStats.previousMonthRandomTotal !== rightStats.previousMonthRandomTotal) {
      return leftStats.previousMonthRandomTotal - rightStats.previousMonthRandomTotal;
    }
    if (
      leftStats.historyWindowTotalRandomAssignments !==
      rightStats.historyWindowTotalRandomAssignments
    ) {
      return (
        leftStats.historyWindowTotalRandomAssignments -
        rightStats.historyWindowTotalRandomAssignments
      );
    }
    if (leftStats.historyWindowPst !== rightStats.historyWindowPst) {
      return leftStats.historyWindowPst - rightStats.historyWindowPst;
    }
  }

  const leftLast = leftStats.lastRandomAssignedDate?.getTime() ?? Number.NEGATIVE_INFINITY;
  const rightLast = rightStats.lastRandomAssignedDate?.getTime() ?? Number.NEGATIVE_INFINITY;
  if (leftLast !== rightLast) {
    return leftLast - rightLast;
  }

  const leftHash = stableHash(`${leftOfficerId}|${periodKey}|${slotType}|${dateIso}`);
  const rightHash = stableHash(`${rightOfficerId}|${periodKey}|${slotType}|${dateIso}`);
  if (leftHash !== rightHash) {
    return leftHash - rightHash;
  }

  return leftOfficerName.localeCompare(rightOfficerName, "id");
};

const formatSlotTypeLabel = (slotType: ScheduleSlotType) => `[SLOT:${slotType}]`;

const appendSlotTypeNote = (notes: string | null, slotType: ScheduleSlotType) => {
  const slotToken = formatSlotTypeLabel(slotType);
  if (!notes) {
    return slotToken;
  }
  if (notes.includes(slotToken)) {
    return notes;
  }
  return `${notes} | ${slotToken}`;
};

const isRandomWfoDetail = (detail: { slotRole: PstSlotRole; weekday?: number; notes?: string | null }) => {
  if (detail.slotRole !== PstSlotRole.WFO) {
    return false;
  }

  const noteText = detail.notes ?? "";
  if (noteText.includes(formatSlotTypeLabel("WFO_FRIDAY_RANDOM"))) {
    return true;
  }

  // Backward compatibility for legacy schedules: Friday WFO was random.
  return detail.weekday === 5;
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

type FridayRoleNormalizationDetail = {
  scheduleDate: Date;
  weekday: number;
  slotRole: PstSlotRole;
  officerId: string | null;
  notes: string | null;
};

const appendNote = (previous: string | null, note: string) => {
  const normalized = previous?.trim();
  if (!normalized) {
    return note;
  }
  if (normalized.includes(note)) {
    return normalized;
  }
  return `${normalized} | ${note}`;
};

const swapFridayAssignments = (
  pstDetail: FridayRoleNormalizationDetail,
  wfoDetail: FridayRoleNormalizationDetail,
  reason: string
) => {
  const previousPstOfficerId = pstDetail.officerId;
  pstDetail.officerId = wfoDetail.officerId;
  wfoDetail.officerId = previousPstOfficerId;
  pstDetail.notes = appendNote(pstDetail.notes, reason);
  wfoDetail.notes = appendNote(wfoDetail.notes, reason);
};

export function normalizeFridayRoleAssignmentsByPstHistory(
  details: FridayRoleNormalizationDetail[],
  historicalPstCountBeforeMonth: Map<string, number>,
  options?: { random?: () => number }
) {
  const random = options?.random ?? Math.random;
  const byDate = new Map<string, FridayRoleNormalizationDetail[]>();
  for (const detail of details) {
    if (detail.weekday !== 5) {
      continue;
    }
    const dateIso = toIsoDateInTimeZone(detail.scheduleDate);
    const bucket = byDate.get(dateIso) ?? [];
    bucket.push(detail);
    byDate.set(dateIso, bucket);
  }

  for (const items of byDate.values()) {
    const pstDetail = items.find((item) => item.slotRole === PstSlotRole.PST) ?? null;
    const wfoDetail = items.find((item) => item.slotRole === PstSlotRole.WFO) ?? null;
    if (!pstDetail || !wfoDetail || !pstDetail.officerId || !wfoDetail.officerId) {
      continue;
    }
    if (pstDetail.officerId === wfoDetail.officerId) {
      continue;
    }

    const hasLockedNote =
      (pstDetail.notes ?? "").includes("Penugasan khusus") ||
      (wfoDetail.notes ?? "").includes("Penugasan khusus");
    if (hasLockedNote) {
      continue;
    }

    const pstOfficerHistoricalPstCount =
      historicalPstCountBeforeMonth.get(pstDetail.officerId) ?? 0;
    const wfoOfficerHistoricalPstCount =
      historicalPstCountBeforeMonth.get(wfoDetail.officerId) ?? 0;

    const reasonPriority =
      "Role Jumat disesuaikan: petugas yang belum pernah PST diprioritaskan ke slot PST.";
    const reasonRandom =
      "Role Jumat diacak: kedua petugas sama-sama sudah punya histori PST.";

    if (pstOfficerHistoricalPstCount > 0 && wfoOfficerHistoricalPstCount === 0) {
      swapFridayAssignments(pstDetail, wfoDetail, reasonPriority);
      continue;
    }

    if (pstOfficerHistoricalPstCount === 0 && wfoOfficerHistoricalPstCount > 0) {
      continue;
    }

    if (pstOfficerHistoricalPstCount > 0 && wfoOfficerHistoricalPstCount > 0) {
      const keepCurrentPst = random() < 0.5;
      if (!keepCurrentPst) {
        swapFridayAssignments(pstDetail, wfoDetail, reasonRandom);
      }
    }
  }
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

  const { slots, holidays } = buildWorkingSlots(
    params.month,
    params.year,
    normalizedHolidayCalendar
  );
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

  const officerRuleMap = buildOfficerScheduleRuleMap(
    officers.map((officer) => ({ id: officer.id, name: officer.name }))
  );
  const officerById = new Map(officers.map((officer) => [officer.id, officer] as const));
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

  const assignmentSlots: GeneratedAssignmentSlot[] = [];
  for (const slot of slots) {
    if (slot.role !== PstSlotRole.PST) {
      continue;
    }

    if (slot.weekday === 5) {
      assignmentSlots.push({
        scheduleDate: slot.scheduleDate,
        dateIso: slot.dateIso,
        dayName: slot.dayName,
        weekOfMonth: slot.weekOfMonth,
        weekday: slot.weekday,
        slotType: "PST_FRIDAY",
        slotRole: PstSlotRole.PST,
      });

      if (isWfoSlotRequired(slot.dateIso, specialRule)) {
        assignmentSlots.push({
          scheduleDate: slot.scheduleDate,
          dateIso: slot.dateIso,
          dayName: slot.dayName,
          weekOfMonth: slot.weekOfMonth,
          weekday: slot.weekday,
          slotType: "WFO_FRIDAY_RANDOM",
          slotRole: PstSlotRole.WFO,
        });
      }
      continue;
    }

    assignmentSlots.push({
      scheduleDate: slot.scheduleDate,
      dateIso: slot.dateIso,
      dayName: slot.dayName,
      weekOfMonth: slot.weekOfMonth,
      weekday: slot.weekday,
      slotType: "PST_REGULAR",
      slotRole: PstSlotRole.PST,
    });
  }

  const fridaySlots = assignmentSlots.filter((slot) => slot.slotType === "PST_FRIDAY");
  const regularSlots = assignmentSlots.filter((slot) => slot.slotType === "PST_REGULAR");
  const randomWfoFridaySlots = assignmentSlots.filter(
    (slot) => slot.slotType === "WFO_FRIDAY_RANDOM"
  );
  const orderedSlots = [...fridaySlots, ...randomWfoFridaySlots, ...regularSlots].sort(
    (left, right) => {
      const dateCompare = left.dateIso.localeCompare(right.dateIso);
      if (dateCompare !== 0) {
        return dateCompare;
      }
      const order: Record<ScheduleSlotType, number> = {
        WFO_FRIDAY_FIXED: 0,
        PST_FRIDAY: 1,
        WFO_FRIDAY_RANDOM: 2,
        PST_REGULAR: 3,
      };
      return order[left.slotType] - order[right.slotType];
    }
  );

  const uniqueDates = [...new Set(orderedSlots.map((slot) => slot.dateIso))].sort((left, right) =>
    left.localeCompare(right)
  );
  const firstDate = dateFromIso(uniqueDates[0]);
  const lastDate = dateFromIso(uniqueDates[uniqueDates.length - 1]);
  const previousMonthPeriod = toPreviousMonth(params.year, params.month);
  const historyWindowStart = (() => {
    const shifted = addMonths(params.year, params.month, -FAIRNESS_HISTORY_WINDOW_MONTHS);
    return getMonthStart(shifted.year, shifted.month);
  })();
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

  const manualLockedBySlotKey = new Map<
    string,
    { officerId: string; reason: string; source: "manual" | "special" }
  >();
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

      manualLockedBySlotKey.set(`${item.dateIso}|${item.role}`, {
        officerId: officer.id,
        reason: "Penugasan khusus",
        source: "special",
      });
    }
  }

  if (existing && forceRegenerate) {
    const existingDetails = await prisma.scheduleDetail.findMany({
      where: {
        monthlyScheduleId: existing.id,
        officerId: { not: null },
      },
      select: {
        scheduleDate: true,
        slotRole: true,
        officerId: true,
        status: true,
        notes: true,
      },
    });

    for (const detail of existingDetails) {
      if (!detail.officerId) {
        continue;
      }
      const noteText = (detail.notes ?? "").toLowerCase();
      const isManualLike =
        detail.status === PstScheduleDetailStatus.SWAPPED ||
        detail.status === PstScheduleDetailStatus.REPLACED ||
        noteText.includes("manual") ||
        noteText.includes("swap") ||
        noteText.includes("reshuffle") ||
        noteText.includes("override");
      if (!isManualLike) {
        continue;
      }

      const dateIso = toIsoDateInTimeZone(detail.scheduleDate);
      manualLockedBySlotKey.set(`${dateIso}|${detail.slotRole}`, {
        officerId: detail.officerId,
        reason: detail.notes?.trim() || "Manual lock dari jadwal sebelumnya",
        source: "manual",
      });
    }
  }

  const historyDetails = await prisma.scheduleDetail.findMany({
    where: {
      officerId: { in: officers.map((officer) => officer.id) },
      scheduleDate: {
        lt: firstDate,
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
      weekday: true,
      scheduleDate: true,
      notes: true,
      monthlySchedule: {
        select: {
          month: true,
          year: true,
        },
      },
    },
    orderBy: [{ scheduleDate: "desc" }],
  });

  const fairnessByOfficer = new Map<string, OfficerFairnessStats>();
  for (const officer of officers) {
    fairnessByOfficer.set(officer.id, {
      pstCurrentMonth: 0,
      pstRegularCurrentMonth: 0,
      pstFridayCurrentMonth: 0,
      randomWfoFridayCurrentMonth: 0,
      fixedWfoFridayCurrentMonth: 0,
      fridayRandomBurdenCurrentMonth: 0,
      totalCurrentMonthForRandomFairness: 0,
      totalOperationalPresence: 0,
      previousMonthPstRegular: 0,
      previousMonthPstFriday: 0,
      previousMonthRandomWfoFriday: 0,
      previousMonthFridayBurden: 0,
      previousMonthRandomTotal: 0,
      historyWindowPstRegular: 0,
      historyWindowPstFriday: 0,
      historyWindowPst: 0,
      historyWindowRandomWfoFriday: 0,
      historyWindowFridayBurden: 0,
      historyWindowTotalRandomAssignments: 0,
      cumulativeRandomFairnessTotal: 0,
      lastRandomAssignedDate: null,
      selectedRandomThisMonth: false,
    });
  }

  for (const item of historyDetails) {
    if (!item.officerId) {
      continue;
    }
    const bucket = fairnessByOfficer.get(item.officerId);
    if (!bucket) {
      continue;
    }

    const isRandomAssignment =
      item.slotRole === PstSlotRole.PST ||
      isRandomWfoDetail({ slotRole: item.slotRole, weekday: item.weekday, notes: item.notes });
    if (!isRandomAssignment) {
      continue;
    }

    if (!bucket.lastRandomAssignedDate) {
      bucket.lastRandomAssignedDate = item.scheduleDate;
    }

    const withinWindow = item.scheduleDate >= historyWindowStart;
    if (withinWindow) {
      bucket.historyWindowTotalRandomAssignments += 1;
      if (item.slotRole === PstSlotRole.PST) {
        bucket.historyWindowPst += 1;
        if (item.weekday === 5) {
          bucket.historyWindowPstFriday += 1;
          bucket.historyWindowFridayBurden += 1;
        } else {
          bucket.historyWindowPstRegular += 1;
        }
      } else if (item.weekday === 5) {
        bucket.historyWindowRandomWfoFriday += 1;
        bucket.historyWindowFridayBurden += 1;
      }
    }

    const sourceMonth = item.monthlySchedule?.month ?? 0;
    const sourceYear = item.monthlySchedule?.year ?? 0;
    if (sourceMonth === previousMonthPeriod.month && sourceYear === previousMonthPeriod.year) {
      bucket.previousMonthRandomTotal += 1;
      if (item.slotRole === PstSlotRole.PST) {
        if (item.weekday === 5) {
          bucket.previousMonthPstFriday += 1;
          bucket.previousMonthFridayBurden += 1;
        } else {
          bucket.previousMonthPstRegular += 1;
        }
      } else if (item.weekday === 5) {
        bucket.previousMonthRandomWfoFriday += 1;
        bucket.previousMonthFridayBurden += 1;
      }
    }
  }

  const monthlyRandomCount = new Map<string, number>();
  for (const officer of officers) {
    monthlyRandomCount.set(officer.id, 0);
  }
  const assignedByDate = new Map<string, Set<string>>();
  const generationWarnings: string[] = [];

  const fixedFridayOfficerIds = officers
    .filter((officer) => officerRuleMap.get(officer.id)?.fixedFridayWfo)
    .map((officer) => officer.id);
  const fixedWfoByFridayDate = new Map<string, string[]>();

  for (const friday of fridaySlots) {
    const availableFixedNames: string[] = [];
    for (const officerId of fixedFridayOfficerIds) {
      const officer = officerById.get(officerId);
      if (!officer) {
        continue;
      }
      if (unavailableSet.has(`${officerId}|${friday.dateIso}`)) {
        generationWarnings.push(`WFO Jumat Tetap tidak tersedia: ${officer.name} (${friday.dateIso})`);
        continue;
      }
      availableFixedNames.push(officer.name);
      const bucket = fairnessByOfficer.get(officerId);
      if (bucket) {
        bucket.fixedWfoFridayCurrentMonth += 1;
      }
    }
    fixedWfoByFridayDate.set(friday.dateIso, availableFixedNames);
  }

  const updateStatsForRandomAssignment = (
    officerId: string,
    slot: GeneratedAssignmentSlot
  ) => {
    const bucket = fairnessByOfficer.get(officerId);
    if (!bucket) {
      return;
    }

    if (slot.slotType === "PST_REGULAR" || slot.slotType === "PST_FRIDAY") {
      bucket.pstCurrentMonth += 1;
      if (slot.slotType === "PST_FRIDAY") {
        bucket.pstFridayCurrentMonth += 1;
        bucket.fridayRandomBurdenCurrentMonth += 1;
      } else {
        bucket.pstRegularCurrentMonth += 1;
      }
    }
    if (slot.slotType === "WFO_FRIDAY_RANDOM") {
      bucket.randomWfoFridayCurrentMonth += 1;
      bucket.fridayRandomBurdenCurrentMonth += 1;
    }
    bucket.totalCurrentMonthForRandomFairness += 1;
    bucket.selectedRandomThisMonth = true;
    bucket.lastRandomAssignedDate = slot.scheduleDate;
    monthlyRandomCount.set(officerId, (monthlyRandomCount.get(officerId) ?? 0) + 1);
  };

  const candidatePoolForSlot = (slot: GeneratedAssignmentSlot) => {
    let base = officers.filter((officer) => {
      const rule = officerRuleMap.get(officer.id);
      if (!rule) {
        return false;
      }
      if (unavailableSet.has(`${officer.id}|${slot.dateIso}`)) {
        return false;
      }
      if (!allowSameFridayAssignee) {
        const sameDateSet = assignedByDate.get(slot.dateIso);
        if (sameDateSet?.has(officer.id)) {
          return false;
        }
      }

      if (slot.slotType === "PST_REGULAR") {
        return rule.canRandomPst && rule.pstPoolType !== "EXCLUDED";
      }
      if (slot.slotType === "PST_FRIDAY") {
        return (
          rule.canRandomPst &&
          rule.pstPoolType !== "EXCLUDED" &&
          !rule.fridayWfoOnly &&
          !rule.fixedFridayWfo
        );
      }
      if (slot.slotType === "WFO_FRIDAY_RANDOM") {
        return isEligibleForRandomWfoFriday(rule);
      }
      return false;
    });

    const filterWithFallback = (
      source: typeof base,
      predicate: (officer: (typeof base)[number]) => boolean
    ) => {
      const filtered = source.filter(predicate);
      return filtered.length > 0 ? filtered : source;
    };

    // Hard rule: utamakan kandidat yang belum melebihi batas random bulanan.
    base = filterWithFallback(base, (officer) => {
      const rule = officerRuleMap.get(officer.id) as OfficerScheduleRule;
      const assignedCount = monthlyRandomCount.get(officer.id) ?? 0;
      return assignedCount < rule.maxRandomAssignmentsPerMonth;
    });

    // Hard rule: selama masih ada yang belum kebagian random bulan aktif, jangan ulang.
    base = filterWithFallback(base, (officer) => (monthlyRandomCount.get(officer.id) ?? 0) === 0);

    // Hard rule lintas bulan: prioritaskan yang belum dapat random bulan sebelumnya.
    base = filterWithFallback(base, (officer) => {
      const stats = fairnessByOfficer.get(officer.id);
      return (stats?.previousMonthRandomTotal ?? 0) === 0;
    });

    if (slot.slotType === "PST_FRIDAY" || slot.slotType === "WFO_FRIDAY_RANDOM") {
      // Hard rule rotasi Jumat lintas bulan.
      base = filterWithFallback(base, (officer) => {
        const stats = fairnessByOfficer.get(officer.id);
        return (stats?.previousMonthFridayBurden ?? 0) === 0;
      });
    }

    // Setelah hard filter, baru terapkan prioritas pool (utama lalu fallback/cadangan).
    if (slot.slotType === "PST_REGULAR" || slot.slotType === "PST_FRIDAY") {
      const normal = base.filter(
        (officer) => getPstPoolRank(officerRuleMap.get(officer.id) as OfficerScheduleRule) === 0
      );
      if (normal.length > 0) {
        base = normal;
      }
    }

    if (slot.slotType === "WFO_FRIDAY_RANDOM") {
      const primary = base.filter(
        (officer) =>
          getWfoFridayRandomPoolRank(officerRuleMap.get(officer.id) as OfficerScheduleRule) === 0
      );
      if (primary.length > 0) {
        base = primary;
      }
    }

    return base;
  };

  const compareCandidates = (
    slot: GeneratedAssignmentSlot,
    left: (typeof officers)[number],
    right: (typeof officers)[number]
  ) => {
    const leftRule = officerRuleMap.get(left.id) as OfficerScheduleRule;
    const rightRule = officerRuleMap.get(right.id) as OfficerScheduleRule;
    const leftStats = fairnessByOfficer.get(left.id) as OfficerFairnessStats;
    const rightStats = fairnessByOfficer.get(right.id) as OfficerFairnessStats;
    const leftMonth = monthlyRandomCount.get(left.id) ?? 0;
    const rightMonth = monthlyRandomCount.get(right.id) ?? 0;

    return compareCandidatePriority({
      slotType: slot.slotType,
      leftOfficerId: left.id,
      rightOfficerId: right.id,
      leftOfficerName: left.name,
      rightOfficerName: right.name,
      leftRule,
      rightRule,
      leftStats,
      rightStats,
      leftMonthRandomCount: leftMonth,
      rightMonthRandomCount: rightMonth,
      periodKey: `${params.year}-${params.month}`,
      dateIso: slot.dateIso,
    });
  };

  const provisionalDetails: ProvisionalAssignment[] = [];
  for (const slot of orderedSlots) {
    const key = `${slot.dateIso}|${slot.slotRole}`;
    const sameDateAssigned = assignedByDate.get(slot.dateIso) ?? new Set<string>();
    const manualLock = manualLockedBySlotKey.get(key) ?? null;

    if (manualLock) {
      const lockedOfficer = officerById.get(manualLock.officerId) ?? null;
      if (!lockedOfficer) {
        generationWarnings.push(
          `Manual lock ${slot.dateIso} (${slot.slotRole}) diabaikan karena petugas tidak aktif`
        );
      } else {
        const rule = officerRuleMap.get(lockedOfficer.id) as OfficerScheduleRule;
        const warnings: string[] = [];
        if (unavailableSet.has(`${lockedOfficer.id}|${slot.dateIso}`)) {
          warnings.push("petugas unavailable");
        }
        if (!allowSameFridayAssignee && sameDateAssigned.has(lockedOfficer.id)) {
          warnings.push("petugas bentrok dengan slot lain di tanggal sama");
        }
        if (
          slot.slotType === "WFO_FRIDAY_RANDOM" &&
          !isEligibleForRandomWfoFriday(rule)
        ) {
          warnings.push("melanggar pool WFO Jumat random");
        }
        if (
          (slot.slotType === "PST_REGULAR" || slot.slotType === "PST_FRIDAY") &&
          (!rule.canRandomPst || rule.pstPoolType === "EXCLUDED")
        ) {
          warnings.push("melanggar pool PST");
        }
        if (slot.slotType === "PST_FRIDAY" && (rule.fridayWfoOnly || rule.fixedFridayWfo)) {
          warnings.push("petugas tidak boleh PST Jumat");
        }
        if (warnings.length > 0) {
          generationWarnings.push(
            `Manual lock ${slot.dateIso} (${slot.slotType}) untuk ${lockedOfficer.name}: ${warnings.join(
              ", "
            )}`
          );
        }

        const fixedCoverageNames = slot.slotType === "PST_FRIDAY"
          ? fixedWfoByFridayDate.get(slot.dateIso) ?? []
          : [];
        const fridayFixedInfo =
          slot.slotType === "PST_FRIDAY"
            ? fixedCoverageNames.length > 0
              ? `WFO Tetap: ${fixedCoverageNames.join(", ")}`
              : "WFO Jumat Tetap tidak tersedia"
            : null;
        const manualSuffix =
          warnings.length > 0 ? `WARNING: ${warnings.join(", ")}` : "Manual lock diterapkan";
        const note = [manualLock.reason, manualSuffix, fridayFixedInfo]
          .filter(Boolean)
          .join(" | ");
        const finalizedNote = appendSlotTypeNote(note, slot.slotType);

        provisionalDetails.push({
          scheduleDate: slot.scheduleDate,
          weekOfMonth: slot.weekOfMonth,
          weekday: slot.weekday,
          slotRole: slot.slotRole,
          slotType: slot.slotType,
          officerId: lockedOfficer.id,
          status: PstScheduleDetailStatus.ASSIGNED,
          notes: finalizedNote,
          score: null,
          isRandomFairness: true,
        });

        if (!allowSameFridayAssignee || !sameDateAssigned.has(lockedOfficer.id)) {
          sameDateAssigned.add(lockedOfficer.id);
          assignedByDate.set(slot.dateIso, sameDateAssigned);
        }
        updateStatsForRandomAssignment(lockedOfficer.id, slot);
        continue;
      }
    }

    const candidates = candidatePoolForSlot(slot);
    if (candidates.length === 0) {
      const fixedCoverageNames = slot.slotType === "PST_FRIDAY"
        ? fixedWfoByFridayDate.get(slot.dateIso) ?? []
        : [];
      const fridayFixedInfo =
        slot.slotType === "PST_FRIDAY"
          ? fixedCoverageNames.length > 0
            ? `WFO Tetap: ${fixedCoverageNames.join(", ")}`
            : "WFO Jumat Tetap tidak tersedia"
          : null;
      const note = appendSlotTypeNote(
        ["Tidak ada kandidat yang memenuhi syarat pada slot ini", fridayFixedInfo]
          .filter(Boolean)
          .join(" | "),
        slot.slotType
      );
      provisionalDetails.push({
        scheduleDate: slot.scheduleDate,
        weekOfMonth: slot.weekOfMonth,
        weekday: slot.weekday,
        slotRole: slot.slotRole,
        slotType: slot.slotType,
        officerId: null,
        status: PstScheduleDetailStatus.UNASSIGNED,
        notes: note,
        score: null,
        isRandomFairness: true,
      });
      continue;
    }

    const picked = [...candidates].sort((left, right) =>
      compareCandidates(slot, left, right)
    )[0];
    if (!picked) {
      continue;
    }

    const sameDaySet = assignedByDate.get(slot.dateIso) ?? new Set<string>();
    sameDaySet.add(picked.id);
    assignedByDate.set(slot.dateIso, sameDaySet);

    const fixedCoverageNames = slot.slotType === "PST_FRIDAY"
      ? fixedWfoByFridayDate.get(slot.dateIso) ?? []
      : [];
    const noteParts: string[] = [];
    if (slot.slotType === "WFO_FRIDAY_RANDOM") {
      const rule = officerRuleMap.get(picked.id) as OfficerScheduleRule;
      if (rule.wfoFridayRandomPoolType === "FALLBACK") {
        noteParts.push("Fallback pool digunakan karena kandidat primary tidak tersedia");
      } else {
        noteParts.push("Dipilih dari pool utama WFO Jumat random");
      }
    } else {
      noteParts.push("Dipilih berdasarkan fairness random deterministik");
    }
    if (slot.slotType === "PST_FRIDAY") {
      noteParts.push(
        fixedCoverageNames.length > 0
          ? `WFO Tetap: ${fixedCoverageNames.join(", ")}`
          : "WFO Jumat Tetap tidak tersedia"
      );
    }

    const note = appendSlotTypeNote(noteParts.join(" | "), slot.slotType);
    provisionalDetails.push({
      scheduleDate: slot.scheduleDate,
      weekOfMonth: slot.weekOfMonth,
      weekday: slot.weekday,
      slotRole: slot.slotRole,
      slotType: slot.slotType,
      officerId: picked.id,
      status: PstScheduleDetailStatus.ASSIGNED,
      notes: note,
      score: null,
      isRandomFairness: true,
    });
    updateStatsForRandomAssignment(picked.id, slot);
  }

  for (const bucket of fairnessByOfficer.values()) {
    bucket.totalOperationalPresence =
      bucket.totalCurrentMonthForRandomFairness + bucket.fixedWfoFridayCurrentMonth;
    bucket.cumulativeRandomFairnessTotal =
      bucket.historyWindowTotalRandomAssignments + bucket.totalCurrentMonthForRandomFairness;
  }

  const totalAssigned = provisionalDetails.filter((detail) => Boolean(detail.officerId)).length;
  const totalUnassigned = provisionalDetails.length - totalAssigned;
  const randomEligibleOfficerIds = officers
    .filter((officer) => {
      const rule = officerRuleMap.get(officer.id);
      if (!rule) {
        return false;
      }
      return rule.canRandomPst || isEligibleForRandomWfoFriday(rule);
    })
    .map((officer) => officer.id);
  const unassignedOfficerIds = randomEligibleOfficerIds.filter(
    (officerId) => !((monthlyRandomCount.get(officerId) ?? 0) > 0)
  );

  const detailByDate = new Map<
    string,
    {
      dateIso: string;
      weekday: number;
      pstOfficerId: string | null;
      wfoRandomOfficerId: string | null;
      seenOfficerIds: string[];
    }
  >();
  for (const detail of provisionalDetails) {
    const dateIso = toIsoDateInTimeZone(detail.scheduleDate);
    const row = detailByDate.get(dateIso) ?? {
      dateIso,
      weekday: detail.weekday,
      pstOfficerId: null,
      wfoRandomOfficerId: null,
      seenOfficerIds: [],
    };
    if (detail.slotRole === PstSlotRole.PST) {
      row.pstOfficerId = detail.officerId;
    }
    if (detail.slotType === "WFO_FRIDAY_RANDOM") {
      row.wfoRandomOfficerId = detail.officerId;
    }
    if (detail.officerId) {
      row.seenOfficerIds.push(detail.officerId);
    }
    detailByDate.set(dateIso, row);
  }

  let duplicateOfficerCount = 0;
  let fridayIncompleteCount = 0;
  for (const dateIso of [...new Set(fridaySlots.map((slot) => slot.dateIso))]) {
    const row = detailByDate.get(dateIso);
    const hasPst = Boolean(row?.pstOfficerId);
    const hasRandomWfo = Boolean(row?.wfoRandomOfficerId);
    if (!hasPst || !hasRandomWfo) {
      fridayIncompleteCount += 1;
    }
    if (row && row.pstOfficerId && row.wfoRandomOfficerId && row.pstOfficerId === row.wfoRandomOfficerId) {
      duplicateOfficerCount += 1;
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
  const chronologicalIssueCount = orderedSlots.reduce((count, slot, index) => {
    if (index === 0) return count;
    const previous = orderedSlots[index - 1];
    if (!previous) return count;
    return previous.dateIso > slot.dateIso ? count + 1 : count;
  }, 0);
  const effectiveWorkingDayMismatchCount =
    uniqueDates.length === detailByDate.size ? 0 : Math.abs(uniqueDates.length - detailByDate.size);

  const currentRandomTotals = randomEligibleOfficerIds.map(
    (officerId) =>
      fairnessByOfficer.get(officerId)?.totalCurrentMonthForRandomFairness ?? 0
  );
  const distributionSpread =
    currentRandomTotals.length > 0
      ? Math.max(...currentRandomTotals) - Math.min(...currentRandomTotals)
      : 0;

  const fridayRandomEligibleIds = officers
    .filter((officer) => {
      const rule = officerRuleMap.get(officer.id) as OfficerScheduleRule;
      const eligiblePstFriday =
        rule.canRandomPst &&
        rule.pstPoolType !== "EXCLUDED" &&
        !rule.fridayWfoOnly &&
        !rule.fixedFridayWfo;
      const eligibleWfoFridayRandom = isEligibleForRandomWfoFriday(rule);
      return eligiblePstFriday || eligibleWfoFridayRandom;
    })
    .map((officer) => officer.id);
  const fridayRandomTotals = fridayRandomEligibleIds.map(
    (officerId) => fairnessByOfficer.get(officerId)?.fridayRandomBurdenCurrentMonth ?? 0
  );
  const fridaySpread =
    fridayRandomTotals.length > 0
      ? Math.max(...fridayRandomTotals) - Math.min(...fridayRandomTotals)
      : 0;
  const coverageRate =
    randomEligibleOfficerIds.length === 0
      ? 1
      : randomEligibleOfficerIds.filter((officerId) => (monthlyRandomCount.get(officerId) ?? 0) > 0)
          .length / randomEligibleOfficerIds.length;
  const totalPstSlots = assignmentSlots.filter(
    (slot) => slot.slotType === "PST_REGULAR" || slot.slotType === "PST_FRIDAY"
  ).length;
  const totalWfoFridayRandomSlots = assignmentSlots.filter(
    (slot) => slot.slotType === "WFO_FRIDAY_RANDOM"
  ).length;
  const totalRandomSlots = totalPstSlots + totalWfoFridayRandomSlots;
  const totalFixedWfoOperational = Array.from(fairnessByOfficer.values()).reduce(
    (sum, stats) => sum + stats.fixedWfoFridayCurrentMonth,
    0
  );
  const totalOperationalPresence = totalRandomSlots + totalFixedWfoOperational;

  const validationItems: FairnessValidationItem[] = [];
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
    "FRIDAY_COVERAGE_MINIMUM",
    "Jumat wajib memiliki PST Jumat dan WFO Jumat Random",
    fridayIncompleteCount === 0 ? "OK" : "ERROR",
    fridayIncompleteCount === 0
      ? "Semua Jumat efektif memiliki PST Jumat dan WFO Jumat Random."
      : `${fridayIncompleteCount} Jumat efektif belum lengkap PST/WFO random.`
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
  pushValidation(
    "DETERMINISTIC_TIEBREAKER",
    "Generate deterministik untuk input yang sama",
    "OK",
    "Tie breaker menggunakan stable hash officerId+periode+slotType+tanggal."
  );
  if (generationWarnings.length > 0) {
    pushValidation(
      "MANUAL_OR_FIXED_WARNINGS",
      "Manual assignment/fixed coverage warning harus ditampilkan",
      "WARNING",
      generationWarnings.join(" | ")
    );
  }

  const fairnessStatus: PstValidationLevel =
    distributionSpread > 2 || fridaySpread > 2 ? "WARNING" : "OK";
  pushValidation(
    "FAIRNESS_MINIMUM",
    "Distribusi penugasan random minimum terpenuhi",
    fairnessStatus,
    fairnessStatus === "OK"
      ? "Distribusi random bulanan masih dalam batas aman."
      : `Distribusi random masih bisa diratakan (spread total ${distributionSpread}, spread beban Jumat random ${fridaySpread}).`
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

  const toIso = (value: Date | null) => (value ? toIsoDateInTimeZone(value) : null);
  const hasEligibleWfoCandidateWithZeroPreviousFridayBurden = officers.some((officer) => {
    const rule = officerRuleMap.get(officer.id) as OfficerScheduleRule;
    const stats = fairnessByOfficer.get(officer.id) as OfficerFairnessStats;
    return (
      isEligibleForRandomWfoFriday(rule) &&
      !stats.selectedRandomThisMonth &&
      stats.previousMonthFridayBurden === 0
    );
  });
  const officerRows = officers
    .map((officer) => {
      const rule = officerRuleMap.get(officer.id) as OfficerScheduleRule;
      const stats = fairnessByOfficer.get(officer.id) as OfficerFairnessStats;
      const poolPstLabel =
        rule.pstPoolType === "NORMAL"
          ? "Normal"
          : rule.pstPoolType === "LOW_PRIORITY"
            ? "Cadangan"
            : "Tidak Random";
      const poolWfoFridayRandomLabel =
        rule.wfoFridayRandomPoolType === "PRIMARY"
          ? "Random Utama"
          : rule.wfoFridayRandomPoolType === "FALLBACK"
            ? "Random Fallback"
            : "Tidak Random";
      const statusWfoFriday = rule.fixedFridayWfo
        ? "Tetap / Non-random"
        : poolWfoFridayRandomLabel;

      let fairnessStatusText = "Sesuai";
      let nextPriorityRole = "Tidak";
      let priorityReason = "Sudah mendapat penugasan random bulan ini";

      if (rule.fixedFridayWfo) {
        fairnessStatusText = "Sesuai";
        nextPriorityRole = "Tidak";
        priorityReason = "WFO Jumat tetap, tidak masuk pool random WFO";
      } else if (
        rule.wfoFridayRandomPoolType === "PRIMARY" &&
        stats.randomWfoFridayCurrentMonth === 0
      ) {
        if (
          hasEligibleWfoCandidateWithZeroPreviousFridayBurden &&
          stats.previousMonthFridayBurden > 0
        ) {
          fairnessStatusText = "Sesuai";
          nextPriorityRole = "Tidak";
          priorityReason =
            "Sudah terkena beban Jumat bulan lalu; prioritas diarahkan ke kandidat lain yang belum terkena beban Jumat";
        } else {
          fairnessStatusText = "Kurang";
          nextPriorityRole = "WFO Jumat Random";
          priorityReason = "Pool utama WFO Jumat random belum terjadwal";
        }
      } else if (!stats.selectedRandomThisMonth) {
        fairnessStatusText = "Kurang";
        if (rule.canRandomPst && rule.pstPoolType !== "EXCLUDED") {
          nextPriorityRole = "PST";
          priorityReason = "Belum mendapat assignment random bulan ini";
        } else if (isEligibleForRandomWfoFriday(rule)) {
          nextPriorityRole = "WFO Jumat Random";
          priorityReason = "Tidak random PST, hanya eligible WFO Jumat Random";
        } else {
          nextPriorityRole = "Tidak";
          priorityReason = "Tidak eligible untuk slot random";
        }
      }

      return {
        officerId: officer.id,
        name: officer.name,
        poolPstLabel,
        poolWfoFridayRandomLabel,
        fixedWfoFridayLabel: rule.fixedFridayWfo ? "Tetap" : "Tidak",
        statusWfoFriday,
        pstCurrentMonthDisplay:
          rule.pstPoolType === "EXCLUDED" ? "-" : String(stats.pstRegularCurrentMonth),
        pstFridayCurrentMonthDisplay:
          rule.pstPoolType === "EXCLUDED" ? "-" : String(stats.pstFridayCurrentMonth),
        randomWfoFridayCurrentMonthDisplay:
          rule.wfoFridayRandomPoolType === "NONE"
            ? "-"
            : String(stats.randomWfoFridayCurrentMonth),
        fixedWfoFridayCurrentMonthDisplay: rule.fixedFridayWfo
          ? String(stats.fixedWfoFridayCurrentMonth)
          : "-",
        pstCurrentMonth: stats.pstCurrentMonth,
        pstRegularCurrentMonth: stats.pstRegularCurrentMonth,
        pstFridayCurrentMonth: stats.pstFridayCurrentMonth,
        randomWfoFridayCurrentMonth: stats.randomWfoFridayCurrentMonth,
        fixedWfoFridayCurrentMonth: stats.fixedWfoFridayCurrentMonth,
        fridayRandomBurdenCurrentMonth: stats.fridayRandomBurdenCurrentMonth,
        totalCurrentMonthForRandomFairness: stats.totalCurrentMonthForRandomFairness,
        totalOperationalPresence: stats.totalOperationalPresence,
        previousMonthPstRegular: stats.previousMonthPstRegular,
        previousMonthPstFriday: stats.previousMonthPstFriday,
        previousMonthRandomWfoFriday: stats.previousMonthRandomWfoFriday,
        previousMonthFridayBurden: stats.previousMonthFridayBurden,
        previousMonthRandomTotal: stats.previousMonthRandomTotal,
        historyWindowPstRegular: stats.historyWindowPstRegular,
        historyWindowPstFriday: stats.historyWindowPstFriday,
        historyWindowPst: stats.historyWindowPst,
        historyWindowRandomWfoFriday: stats.historyWindowRandomWfoFriday,
        historyWindowFridayBurden: stats.historyWindowFridayBurden,
        historyWindowTotalRandomAssignments: stats.historyWindowTotalRandomAssignments,
        cumulativeRandomFairnessTotal: stats.cumulativeRandomFairnessTotal,
        lastRandomAssignedDate: toIso(stats.lastRandomAssignedDate),
        selectedRandomThisMonth: stats.selectedRandomThisMonth,
        fairnessStatus: fairnessStatusText,
        nextPriorityRole,
        priorityReason,
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name, "id"));

  const sortByTotalPriority = (left: typeof officerRows[number], right: typeof officerRows[number]) => {
    if (left.cumulativeRandomFairnessTotal !== right.cumulativeRandomFairnessTotal) {
      return left.cumulativeRandomFairnessTotal - right.cumulativeRandomFairnessTotal;
    }
    if (left.historyWindowTotalRandomAssignments !== right.historyWindowTotalRandomAssignments) {
      return (
        left.historyWindowTotalRandomAssignments - right.historyWindowTotalRandomAssignments
      );
    }
    if (left.previousMonthRandomTotal !== right.previousMonthRandomTotal) {
      return left.previousMonthRandomTotal - right.previousMonthRandomTotal;
    }
    const leftLast = left.lastRandomAssignedDate ? Date.parse(left.lastRandomAssignedDate) : Number.NEGATIVE_INFINITY;
    const rightLast = right.lastRandomAssignedDate ? Date.parse(right.lastRandomAssignedDate) : Number.NEGATIVE_INFINITY;
    if (leftLast !== rightLast) {
      return leftLast - rightLast;
    }
    return stableHash(`${left.officerId}|priority-total|${params.year}-${params.month}`) -
      stableHash(`${right.officerId}|priority-total|${params.year}-${params.month}`);
  };

  const priorityPstNormal = officerRows
    .filter((row) => {
      const rule = officerRuleMap.get(row.officerId) as OfficerScheduleRule;
      return rule.canRandomPst && rule.pstPoolType === "NORMAL" && !row.selectedRandomThisMonth;
    })
    .sort(sortByTotalPriority);
  const priorityPstLow = officerRows
    .filter((row) => {
      const rule = officerRuleMap.get(row.officerId) as OfficerScheduleRule;
      return rule.canRandomPst && rule.pstPoolType === "LOW_PRIORITY" && !row.selectedRandomThisMonth;
    })
    .sort(sortByTotalPriority);
  const priorityPstNext = [
    ...priorityPstNormal,
    ...(priorityPstNormal.length === 0 ? priorityPstLow : []),
  ].map((row) => ({
    officerId: row.officerId,
    name: row.name,
    label: row.poolPstLabel,
    reason: row.priorityReason,
  }));

  const priorityWfoPrimary = officerRows
    .filter((row) => {
      const rule = officerRuleMap.get(row.officerId) as OfficerScheduleRule;
      return (
        isEligibleForRandomWfoFriday(rule) &&
        rule.wfoFridayRandomPoolType === "PRIMARY" &&
        !row.selectedRandomThisMonth
      );
    })
    .sort((left, right) => {
      if (left.previousMonthFridayBurden !== right.previousMonthFridayBurden) {
        return left.previousMonthFridayBurden - right.previousMonthFridayBurden;
      }
      if (left.historyWindowRandomWfoFriday !== right.historyWindowRandomWfoFriday) {
        return left.historyWindowRandomWfoFriday - right.historyWindowRandomWfoFriday;
      }
      return sortByTotalPriority(left, right);
    });
  const priorityWfoFallback = officerRows
    .filter((row) => {
      const rule = officerRuleMap.get(row.officerId) as OfficerScheduleRule;
      return (
        isEligibleForRandomWfoFriday(rule) &&
        rule.wfoFridayRandomPoolType === "FALLBACK" &&
        !row.selectedRandomThisMonth
      );
    })
    .sort((left, right) => {
      if (left.previousMonthFridayBurden !== right.previousMonthFridayBurden) {
        return left.previousMonthFridayBurden - right.previousMonthFridayBurden;
      }
      if (left.historyWindowRandomWfoFriday !== right.historyWindowRandomWfoFriday) {
        return left.historyWindowRandomWfoFriday - right.historyWindowRandomWfoFriday;
      }
      return sortByTotalPriority(left, right);
    });
  const hasAnyEligibleWfoWithZeroPreviousFriday = [...priorityWfoPrimary, ...priorityWfoFallback].some(
    (row) => row.previousMonthFridayBurden === 0
  );
  const effectivePriorityWfoPrimary = hasAnyEligibleWfoWithZeroPreviousFriday
    ? priorityWfoPrimary.filter((row) => row.previousMonthFridayBurden === 0)
    : priorityWfoPrimary;
  const effectivePriorityWfoFallback = hasAnyEligibleWfoWithZeroPreviousFriday
    ? priorityWfoFallback.filter((row) => row.previousMonthFridayBurden === 0)
    : priorityWfoFallback;
  const priorityWfoNext = [
    ...effectivePriorityWfoPrimary,
    ...(effectivePriorityWfoPrimary.length === 0 ? effectivePriorityWfoFallback : []),
  ].map((row) => ({
    officerId: row.officerId,
    name: row.name,
    label: row.poolWfoFridayRandomLabel,
    reason: row.priorityReason,
  }));

  const priorityFridayBurdenNext = officerRows
    .filter((row) => {
      const rule = officerRuleMap.get(row.officerId) as OfficerScheduleRule;
      return (rule.canRandomPst || isEligibleForRandomWfoFriday(rule)) && !row.selectedRandomThisMonth;
    })
    .sort((left, right) => {
      if (left.previousMonthFridayBurden !== right.previousMonthFridayBurden) {
        return left.previousMonthFridayBurden - right.previousMonthFridayBurden;
      }
      if (left.historyWindowFridayBurden !== right.historyWindowFridayBurden) {
        return left.historyWindowFridayBurden - right.historyWindowFridayBurden;
      }
      return sortByTotalPriority(left, right);
    })
    .map((row) => ({
      officerId: row.officerId,
      name: row.name,
      label: "Prioritas Beban Jumat",
      reason: row.priorityReason,
    }));

  const priorityTotalNext = officerRows
    .filter((row) => {
      const rule = officerRuleMap.get(row.officerId) as OfficerScheduleRule;
      return (rule.canRandomPst || isEligibleForRandomWfoFriday(rule)) && !row.selectedRandomThisMonth;
    })
    .sort(sortByTotalPriority)
    .map((row) => ({
      officerId: row.officerId,
      name: row.name,
      label: "Prioritas Kumulatif",
      reason: row.priorityReason,
    }));

  const previousVersion = readDocumentVersionFromSummary(existing?.summary ?? null);
  const documentVersion = existing ? Math.max(2, previousVersion + 1) : 1;

  const summary: MonthlyScheduleSummary = {
    totalWorkingDays: uniqueDates.length,
    totalSlots: provisionalDetails.length,
    totalAssigned,
    totalUnassigned,
    totalFridaySlots: fridaySlots.length,
    unassignedOfficerCount: unassignedOfficerIds.length,
    unassignedOfficerIds,
    generatedMessage:
      totalUnassigned === 0
        ? "Jadwal bulanan berhasil dibuat dengan fairness random, fixed WFO Jumat, dan prioritas bulan berikutnya yang tervalidasi"
        : `Jadwal bulanan dibuat dengan ${totalUnassigned} slot belum terisi`,
    validation: {
      overallStatus,
      items: validationItems,
    },
    fairness: {
      historyWindowMonths: FAIRNESS_HISTORY_WINDOW_MONTHS,
      distributionSpread,
      fridaySpread,
      assignedOfficerCount: randomEligibleOfficerIds.filter(
        (officerId) => (monthlyRandomCount.get(officerId) ?? 0) > 0
      ).length,
      eligibleOfficerCount: randomEligibleOfficerIds.length,
      coverageRate: Number((coverageRate * 100).toFixed(2)),
      note:
        fairnessStatus === "OK"
          ? "Fairness random stabil. Histori memakai snapshot final scheduleDetail."
          : "Fairness random masih bisa diratakan pada periode berikutnya.",
      poolSummary: [
        {
          pool: "PST Normal",
          meaning: "Masuk pool utama random PST",
          officers: "Petugas reguler, termasuk Anuar dan Jusman jika tidak ada aturan lain",
        },
        {
          pool: "PST Cadangan",
          meaning: "Bisa PST tetapi tidak diprioritaskan",
          officers: "Zulkifli, Marinda Saga Putra",
        },
        {
          pool: "Tidak Random PST",
          meaning: "Tidak ikut random PST",
          officers: "Ari Susilowati, Idhamsyah",
        },
        {
          pool: "WFO Jumat Tetap",
          meaning: "WFO Jumat non-random; tidak masuk fairness random WFO",
          officers: "Zulkifli, Marinda Saga Putra",
        },
        {
          pool: "WFO Jumat Random Utama",
          meaning: "Pool utama WFO Jumat yang dipilih generator",
          officers: "Ari Susilowati, Idhamsyah",
        },
        {
          pool: "WFO Jumat Random Fallback",
          meaning: "Dipakai hanya jika random utama tidak tersedia",
          officers: "Petugas lain, termasuk Anuar dan Jusman jika eligible",
        },
      ],
      officerDetails: officerRows,
      nextMonthPriority: {
        pst: priorityPstNext,
        wfoFridayRandom: priorityWfoNext,
        fridayBurden: priorityFridayBurdenNext,
        randomTotal: priorityTotalNext,
      },
      denominator: {
        randomEligibleOfficerCount: randomEligibleOfficerIds.length,
        fridayRandomEligibleOfficerCount: fridayRandomEligibleIds.length,
      },
      monthlyOperationalSummary: {
        totalPstSlots,
        totalWfoFridayRandomSlots,
        totalRandomSlots,
        totalWfoFridayFixed: totalFixedWfoOperational,
        totalOperationalPresence,
      },
      warnings: generationWarnings,
    } as MonthlyScheduleSummary["fairness"],
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
        id: { in: officers.map((officer) => officer.id) },
      },
      data: {
        priorityNextMonth: false,
      },
    });

    const nextPriorityOfficerIds = priorityTotalNext.map((item) => item.officerId);
    if (nextPriorityOfficerIds.length > 0) {
      await tx.pstOfficerCandidate.updateMany({
        where: {
          id: { in: nextPriorityOfficerIds },
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
