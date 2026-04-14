import {
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
  MonthlyScheduleResponse,
  PstHolidayCalendar,
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
  fridayRoleCount: number;
  totalHistoryCount: number;
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

const holidayCalendarOrDefault = (calendar?: PstHolidayCalendar) =>
  calendar && calendar.calendar ? calendar : (defaultHolidayCalendar as PstHolidayCalendar);

export function buildWorkingSlots(month: number, year: number, holidayCalendar?: PstHolidayCalendar) {
  const normalizedCalendar = holidayCalendarOrDefault(holidayCalendar);

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
      slots.push({
        scheduleDate: date,
        dateIso,
        dayName,
        weekOfMonth,
        weekday,
        role: PstSlotRole.WFO,
      });
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
    (officer) => !unavailableSet.has(officer.id) && !takenByDate.has(officer.id)
  );
}

export function scoreCandidate(
  candidate: CandidateWithScore["candidate"],
  slot: WorkingSlot,
  history: CandidateScoringContext
) {
  let score = 100;

  score -= history.monthlyAssignmentCount * 22;
  score -= history.totalHistoryCount * 4;

  if (slot.weekday === 5) {
    score -= history.fridayRoleCount * 12;
  }

  if (candidate.priorityNextMonth) {
    score += 26;
  }

  if (candidate.employmentStatus !== PstOfficerEmploymentStatus.MASUK) {
    score -= 40;
  }

  if (history.lastAssignedAt) {
    const distanceMs = Math.abs(slot.scheduleDate.getTime() - history.lastAssignedAt.getTime());
    const distanceDays = Math.floor(distanceMs / (1000 * 60 * 60 * 24));

    if (distanceDays <= 1) {
      score -= 40;
    } else if (distanceDays <= 3) {
      score -= 15;
    }
  }

  return Math.max(1, score);
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

export async function generateMonthlySchedule(params: {
  month: number;
  year: number;
  forceRegenerate?: boolean;
  allowSameFridayAssignee?: boolean;
  holidayCalendar?: PstHolidayCalendar;
  generatedById?: string;
}) {
  const forceRegenerate = params.forceRegenerate === true;
  const allowSameFridayAssignee = params.allowSameFridayAssignee === true;
  const normalizedHolidayCalendar = holidayCalendarOrDefault(params.holidayCalendar);

  const existing = await prisma.monthlySchedule.findUnique({
    where: {
      month_year: {
        month: params.month,
        year: params.year,
      },
    },
    select: { id: true },
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

    return {
      ok: true as const,
      alreadyExists: true,
      schedule: existingSchedule,
    };
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

  const uniqueDates = [...new Set(slots.map((slot) => slot.dateIso))];
  const firstDate = dateFromIso(uniqueDates[0]);
  const lastDate = dateFromIso(uniqueDates[uniqueDates.length - 1]);

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
      officerId: { in: officers.map((officer) => officer.id) },
      scheduleDate: {
        lt: firstDate,
      },
    },
    orderBy: { scheduleDate: "desc" },
    select: {
      officerId: true,
      slotRole: true,
      scheduleDate: true,
    },
  });

  const totalHistoryCount = new Map<string, number>();
  const fridayRoleCount = new Map<string, number>();
  const lastAssignedAt = new Map<string, Date>();

  for (const item of history) {
    totalHistoryCount.set(item.officerId, (totalHistoryCount.get(item.officerId) ?? 0) + 1);
    if (item.slotRole === PstSlotRole.PST || item.slotRole === PstSlotRole.WFO) {
      const key = getHistoryMapKey(item.officerId, item.slotRole);
      fridayRoleCount.set(key, (fridayRoleCount.get(key) ?? 0) + 1);
    }
    if (!lastAssignedAt.has(item.officerId)) {
      lastAssignedAt.set(item.officerId, item.scheduleDate);
    }
  }

  const monthlyCount = new Map<string, number>();
  const monthlyFridayRoleCount = new Map<string, number>();
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

    let eligible = officers.filter((officer) => {
      if (unavailableSet.has(`${officer.id}|${dateKey}`)) {
        return false;
      }
      if (!allowSameFridayAssignee && sameDateAssigned.has(officer.id)) {
        return false;
      }
      return true;
    });

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
    }

    const scoredCandidates: CandidateWithScore[] = eligible.map((candidate) => {
      const monthlyAssignmentCount = monthlyCount.get(candidate.id) ?? 0;
      const fridayRoleCountKey = getHistoryMapKey(candidate.id, slot.role);
      const fridayRoleAssignmentCount = monthlyFridayRoleCount.get(fridayRoleCountKey) ?? 0;
      const historyCount = totalHistoryCount.get(candidate.id) ?? 0;

      const score = scoreCandidate(candidate, slot, {
        monthlyAssignmentCount,
        fridayRoleCount: fridayRoleAssignmentCount,
        totalHistoryCount: historyCount,
        lastAssignedAt: lastAssignedAt.get(candidate.id) ?? null,
      });

      return {
        candidate,
        score,
        weight: Math.max(1, score),
      };
    });

    const picked = pickCandidateWeightedRandom(scoredCandidates);
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

    provisionalDetails.push({
      scheduleDate: slot.scheduleDate,
      weekOfMonth: slot.weekOfMonth,
      weekday: slot.weekday,
      slotRole: slot.role,
      officerId: picked.candidate.id,
      status: PstScheduleDetailStatus.ASSIGNED,
      notes: null,
      score: picked.score,
    });

    monthlyCount.set(picked.candidate.id, (monthlyCount.get(picked.candidate.id) ?? 0) + 1);
    const fridayRoleCountKey = getHistoryMapKey(picked.candidate.id, slot.role);
    monthlyFridayRoleCount.set(
      fridayRoleCountKey,
      (monthlyFridayRoleCount.get(fridayRoleCountKey) ?? 0) + 1
    );
    assignedThisMonth.add(picked.candidate.id);
    sameDateAssigned.add(picked.candidate.id);
    assignedByDate.set(dateKey, sameDateAssigned);
    lastAssignedAt.set(picked.candidate.id, slot.scheduleDate);
  }

  const totalAssigned = provisionalDetails.filter((detail) => detail.officerId).length;
  const totalUnassigned = provisionalDetails.length - totalAssigned;
  const unassignedOfficerIds = officers
    .filter((officer) => !assignedThisMonth.has(officer.id))
    .map((officer) => officer.id);

  const summary = {
    totalWorkingDays: uniqueDates.length,
    totalSlots: provisionalDetails.length,
    totalAssigned,
    totalUnassigned,
    totalFridaySlots: provisionalDetails.filter((detail) => detail.weekday === 5).length,
    unassignedOfficerCount: unassignedOfficerIds.length,
    unassignedOfficerIds,
    generatedMessage:
      totalUnassigned === 0
        ? "Jadwal bulanan berhasil dibuat tanpa konflik slot"
        : `Jadwal bulanan dibuat dengan ${totalUnassigned} slot belum terisi`,
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
        status: PstScheduleStatus.DRAFT,
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
    prisma.scheduleDetail.findUnique({ where: { id: firstScheduleId } }),
    prisma.scheduleDetail.findUnique({ where: { id: secondScheduleId } }),
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
