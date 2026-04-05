import { DayOffType, DutyCycleStatus, Prisma, ReminderChannel, Role } from "@prisma/client";
import prisma from "@api/infrastructure/database/prisma";
import { sendWhatsAppFonnteReminder } from "@api/modules/reminders";
import { formatDisplayDate } from "@/lib/date-format";
import {
	addOneDayAtStartOfDay,
	DUTY_STAFF_SELECT,
	SCHEDULE_DEFAULTS,
	ensureDateAtStartOfDay,
	getWeekdayLabel,
	normalizeStaffOrder,
	normalizeWorkDays,
	parseInputDate,
	parseScheduleDate,
	renderTemplate,
	resolveNextStaff,
	toIsoDate,
	toIsoWeekday,
	toPrismaJson,
} from "./schedule.helper";
import { dayOffSchema, scheduleSettingsSchema } from "./schedule.schema";
import { toDutySettingsViewModel, toDutySummaryViewModel } from "./schedule.view-model";

async function getOrCreateDutySettings() {
  const existing = await prisma.dutySettings.findUnique({
    where: { id: "default" },
  });
  if (existing) {
    return existing;
  }

  return prisma.dutySettings.create({
    data: {
      id: "default",
      workDays: [...SCHEDULE_DEFAULTS.DEFAULT_WORK_DAYS],
      reminderEnabled: true,
      autoAssignEnabled: true,
      reminderTemplate: SCHEDULE_DEFAULTS.DEFAULT_REMINDER_TEMPLATE,
      timezone: SCHEDULE_DEFAULTS.DEFAULT_TIMEZONE,
    },
  });
}

async function checkScheduleDateEligibility(scheduleDate: Date) {
  const settings = await getOrCreateDutySettings();
  const workDays = normalizeWorkDays(settings.workDays);
  const weekday = toIsoWeekday(scheduleDate);

  if (!workDays.includes(weekday)) {
    return {
      ok: false as const,
      reason: `${getWeekdayLabel(scheduleDate)} bukan hari kerja yang aktif`,
      settings,
      dayOff: null,
    };
  }

  const dayOff = await prisma.dutyDayOff.findUnique({
    where: { date: scheduleDate },
  });

  if (dayOff) {
    return {
      ok: false as const,
      reason: `${formatDisplayDate(scheduleDate)} ditandai sebagai ${
        dayOff.type === DayOffType.LEAVE ? "cuti" : "hari libur"
      }: ${dayOff.name}`,
      settings,
      dayOff,
    };
  }

  return { ok: true as const, settings, dayOff: null };
}

async function createCycleWithOrder(staffOrder: string[]) {
  const lastCycle = await prisma.dutyCycle.findFirst({
    orderBy: { createdAt: "desc" },
    select: { cycleNumber: true },
  });
  const cycleNumber = (lastCycle?.cycleNumber ?? 0) + 1;

  return prisma.dutyCycle.create({
    data: {
      cycleNumber,
      status: DutyCycleStatus.ACTIVE,
      staffOrder,
      currentIndex: 0,
    },
  });
}

async function createSchedule(
  scheduleDate: Date,
  staffId: string,
  cycleId: string,
  staffOrder: string[],
  nextIndex: number
) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const schedule = await tx.dutySchedule.create({
          data: {
            scheduleDate,
            staffId,
            cycleId,
          },
          include: { staff: { select: DUTY_STAFF_SELECT }, cycle: true },
        });

        const isCycleComplete = nextIndex >= staffOrder.length;

        await tx.dutyCycle.update({
          where: { id: cycleId },
          data: {
            currentIndex: isCycleComplete ? staffOrder.length : nextIndex,
            status: isCycleComplete ? DutyCycleStatus.COMPLETED : DutyCycleStatus.ACTIVE,
            completedAt: isCycleComplete ? new Date() : null,
          },
        });

        return schedule;
      });

      return { ok: true as const, schedule: result, alreadyExists: false };
    } catch (error) {
      if ((error as { code?: string }).code === "P2002" && attempt < 1) {
        const existing = await prisma.dutySchedule.findUnique({
          where: { scheduleDate },
          include: { staff: { select: DUTY_STAFF_SELECT }, cycle: true },
        });
        if (existing) {
          return { ok: true as const, schedule: existing, alreadyExists: true };
        }
        continue;
      }
      throw error;
    }
  }

  return {
    ok: false as const,
    status: 409,
    error: "Gagal membuat jadwal, silakan coba lagi.",
  };
}

export async function generateDailySchedule(dateParam?: string | null) {
  const parsedDate = parseScheduleDate(dateParam);
  if (!parsedDate.ok) {
    return parsedDate;
  }

  const { scheduleDate } = parsedDate;

  const existing = await prisma.dutySchedule.findUnique({
    where: { scheduleDate },
    include: { staff: { select: DUTY_STAFF_SELECT }, cycle: true },
  });
  if (existing) {
    return { ok: true as const, schedule: existing, alreadyExists: true };
  }

  const eligibility = await checkScheduleDateEligibility(scheduleDate);
  if (!eligibility.ok) {
    return {
      ok: false as const,
      status: 409,
      error: eligibility.reason,
    };
  }

  const activeStaff = await prisma.user.findMany({
    where: { role: Role.PETUGAS },
    orderBy: { createdAt: "asc" },
  });

  if (activeStaff.length === 0) {
    return {
      ok: false as const,
      status: 400,
      error: "Belum ada petugas dari daftar pengguna untuk dijadwalkan",
    };
  }

  const activeStaffIds = new Set(activeStaff.map((staff) => staff.id));

  let cycle = await prisma.dutyCycle.findFirst({
    where: { status: DutyCycleStatus.ACTIVE },
    orderBy: { createdAt: "desc" },
  });

  if (!cycle) {
    cycle = await createCycleWithOrder(activeStaff.map((staff) => staff.id));
  }

  let staffOrder = normalizeStaffOrder(cycle.staffOrder);
  if (staffOrder.length === 0) {
    cycle = await createCycleWithOrder(activeStaff.map((staff) => staff.id));
    staffOrder = normalizeStaffOrder(cycle.staffOrder);
  }

  const { staffId, nextIndex } = resolveNextStaff(staffOrder, activeStaffIds, cycle.currentIndex);

  if (!staffId) {
    await prisma.dutyCycle.update({
      where: { id: cycle.id },
      data: {
        status: DutyCycleStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
    cycle = await createCycleWithOrder(activeStaff.map((staff) => staff.id));
    staffOrder = normalizeStaffOrder(cycle.staffOrder);
    const resolved = resolveNextStaff(staffOrder, activeStaffIds, cycle.currentIndex);
    if (!resolved.staffId) {
      return {
        ok: false as const,
        status: 400,
        error: "Tidak ada pegawai aktif yang bisa dijadwalkan",
      };
    }
    return createSchedule(scheduleDate, resolved.staffId, cycle.id, staffOrder, resolved.nextIndex);
  }

  return createSchedule(scheduleDate, staffId, cycle.id, staffOrder, nextIndex);
}

export async function listSchedules(fromParam?: string | null, toParam?: string | null) {
  const whereClause: Prisma.DutyScheduleWhereInput = {};

  if (fromParam || toParam) {
    const startDate = fromParam ? parseInputDate(fromParam) : new Date();
    const endDate = toParam ? parseInputDate(toParam) : new Date();
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return {
        ok: false as const,
        status: 400,
        error: "Rentang tanggal tidak valid, gunakan format YYYY-MM-DD",
      };
    }
    const normalizedStartDate = ensureDateAtStartOfDay(startDate);
    const normalizedEndDate = addOneDayAtStartOfDay(endDate);

    whereClause.scheduleDate = {
      gte: normalizedStartDate,
      lt: normalizedEndDate,
    };
  }

  const schedules = await prisma.dutySchedule.findMany({
    where: whereClause,
    include: {
      staff: { select: DUTY_STAFF_SELECT },
      cycle: true,
      reminderLogs: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { scheduleDate: "desc" },
  });

  return { ok: true as const, schedules };
}

export async function listDutyStaff() {
  const staff = await prisma.user.findMany({
    where: { role: Role.PETUGAS },
    select: DUTY_STAFF_SELECT,
    orderBy: { createdAt: "asc" },
  });

  return { ok: true as const, staff };
}

export async function getDutySettings() {
  const settings = await getOrCreateDutySettings();
  return {
    ok: true as const,
    settings: toDutySettingsViewModel(
      settings,
      normalizeWorkDays,
      SCHEDULE_DEFAULTS.AVAILABLE_TEMPLATE_PLACEHOLDERS
    ),
  };
}

export async function updateDutySettings(payload: unknown) {
  const parsed = scheduleSettingsSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false as const,
      status: 400,
      error: "Data pengaturan jadwal tidak valid",
      details: parsed.error.flatten().fieldErrors,
    };
  }

  const settings = await getOrCreateDutySettings();

  const workDays = parsed.data.workDays
    ? [...new Set(parsed.data.workDays)].sort((a, b) => a - b)
    : normalizeWorkDays(settings.workDays);

  const updated = await prisma.dutySettings.update({
    where: { id: settings.id },
    data: {
      workDays,
      reminderEnabled: parsed.data.reminderEnabled ?? settings.reminderEnabled,
      autoAssignEnabled: parsed.data.autoAssignEnabled ?? settings.autoAssignEnabled,
      reminderTemplate: parsed.data.reminderTemplate ?? settings.reminderTemplate,
      timezone: parsed.data.timezone ?? settings.timezone,
    },
  });

  return {
    ok: true as const,
    settings: toDutySettingsViewModel(
      updated,
      normalizeWorkDays,
      SCHEDULE_DEFAULTS.AVAILABLE_TEMPLATE_PLACEHOLDERS
    ),
  };
}

export async function listDutyDayOffs(fromParam?: string | null, toParam?: string | null) {
  const whereClause: Prisma.DutyDayOffWhereInput = {};

  if (fromParam || toParam) {
    const startDate = fromParam ? parseInputDate(fromParam) : new Date();
    const endDate = toParam ? parseInputDate(toParam) : new Date();
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return {
        ok: false as const,
        status: 400,
        error: "Rentang tanggal tidak valid, gunakan format YYYY-MM-DD",
      };
    }
    whereClause.date = {
      gte: ensureDateAtStartOfDay(startDate),
      lt: addOneDayAtStartOfDay(endDate),
    };
  }

  const dayOffs = await prisma.dutyDayOff.findMany({
    where: whereClause,
    orderBy: { date: "asc" },
  });

  return { ok: true as const, dayOffs };
}

export async function createDutyDayOff(payload: unknown) {
  const parsed = dayOffSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false as const,
      status: 400,
      error: "Data hari libur/cuti tidak valid",
      details: parsed.error.flatten().fieldErrors,
    };
  }

  const date = parseInputDate(parsed.data.date);
  if (Number.isNaN(date.getTime())) {
    return {
      ok: false as const,
      status: 400,
      error: "Tanggal tidak valid, gunakan format YYYY-MM-DD",
    };
  }

  const normalizedDate = ensureDateAtStartOfDay(date);
  const settings = await getOrCreateDutySettings();

  try {
    const dayOff = await prisma.dutyDayOff.create({
      data: {
        date: normalizedDate,
        name: parsed.data.name,
        type: parsed.data.type ?? DayOffType.HOLIDAY,
        note: parsed.data.note ?? null,
        settingsId: settings.id,
      },
    });

    return { ok: true as const, dayOff };
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      return {
        ok: false as const,
        status: 409,
        error: "Tanggal tersebut sudah ditandai sebagai hari libur/cuti",
      };
    }
    throw error;
  }
}

export async function removeDutyDayOff(id: string) {
  const existing = await prisma.dutyDayOff.findUnique({ where: { id } });
  if (!existing) {
    return {
      ok: false as const,
      status: 404,
      error: "Data hari libur/cuti tidak ditemukan",
    };
  }

  await prisma.dutyDayOff.delete({ where: { id } });
  return { ok: true as const };
}

export async function listDutyReminderLogs(fromParam?: string | null, toParam?: string | null) {
  const whereClause: Prisma.DutyReminderLogWhereInput = {};

  if (fromParam || toParam) {
    const startDate = fromParam ? parseInputDate(fromParam) : new Date();
    const endDate = toParam ? parseInputDate(toParam) : new Date();
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return {
        ok: false as const,
        status: 400,
        error: "Rentang tanggal tidak valid, gunakan format YYYY-MM-DD",
      };
    }
    whereClause.reminderDate = {
      gte: ensureDateAtStartOfDay(startDate),
      lt: addOneDayAtStartOfDay(endDate),
    };
  }

  const logs = await prisma.dutyReminderLog.findMany({
    where: whereClause,
    include: {
      staff: { select: DUTY_STAFF_SELECT },
      schedule: {
        select: {
          id: true,
          scheduleDate: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return { ok: true as const, logs };
}

export async function getDutyScheduleBootstrap(dateParam?: string | null) {
  const parsedDate = parseScheduleDate(dateParam);
  if (!parsedDate.ok) {
    return parsedDate;
  }

  const { scheduleDate } = parsedDate;
  const [settings, staffResult, schedulesResult, dayOffsResult, logsResult, schedule] =
    await Promise.all([
      getOrCreateDutySettings(),
      listDutyStaff(),
      listSchedules(),
      listDutyDayOffs(),
      listDutyReminderLogs(),
      prisma.dutySchedule.findUnique({
        where: { scheduleDate },
        include: {
          staff: { select: DUTY_STAFF_SELECT },
          cycle: true,
          reminderLogs: {
            where: { reminderDate: scheduleDate },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      }),
    ]);

  if (!schedulesResult.ok) {
    return schedulesResult;
  }
  if (!dayOffsResult.ok) {
    return dayOffsResult;
  }
  if (!logsResult.ok) {
    return logsResult;
  }

  const workDays = normalizeWorkDays(settings.workDays);
  const matchingDayOff =
    dayOffsResult.dayOffs.find(
      (dayOff) => ensureDateAtStartOfDay(new Date(dayOff.date)).getTime() === scheduleDate.getTime()
    ) ?? null;

  let isWorkingDay = workDays.includes(toIsoWeekday(scheduleDate));
  let reason: string | null = null;

  if (!isWorkingDay) {
    reason = `${getWeekdayLabel(scheduleDate)} bukan hari kerja yang aktif`;
  } else if (matchingDayOff) {
    isWorkingDay = false;
    reason = `${formatDisplayDate(scheduleDate)} ditandai sebagai ${
      matchingDayOff.type === DayOffType.LEAVE ? "cuti" : "hari libur"
    }: ${matchingDayOff.name}`;
  }

  return {
    ok: true as const,
    bootstrap: {
      summary: {
        date: scheduleDate,
        dateLabel: formatDisplayDate(scheduleDate),
        isWorkingDay,
        reason,
        settings: {
          workDays,
          reminderEnabled: settings.reminderEnabled,
          autoAssignEnabled: settings.autoAssignEnabled,
        },
        schedule: schedule ?? null,
      },
      settings: {
        ...toDutySettingsViewModel(
          settings,
          normalizeWorkDays,
          SCHEDULE_DEFAULTS.AVAILABLE_TEMPLATE_PLACEHOLDERS
        ),
      },
      staff: staffResult.staff,
      schedules: schedulesResult.schedules,
      dayOffs: dayOffsResult.dayOffs,
      logs: logsResult.logs,
    },
  };
}

export async function getDutySummary(dateParam?: string | null) {
  const parsedDate = parseScheduleDate(dateParam);
  if (!parsedDate.ok) {
    return parsedDate;
  }

  const { scheduleDate } = parsedDate;
  const settings = await getOrCreateDutySettings();
  const eligibility = await checkScheduleDateEligibility(scheduleDate);

  const schedule = await prisma.dutySchedule.findUnique({
    where: { scheduleDate },
    include: {
      staff: { select: DUTY_STAFF_SELECT },
      cycle: true,
      reminderLogs: {
        where: { reminderDate: scheduleDate },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return {
    ok: true as const,
    summary: toDutySummaryViewModel({
      scheduleDate,
      eligibility,
      settings,
      schedule: schedule ?? null,
      normalizeWorkDays,
    }),
  };
}

export async function runDutyReminder(dateParam?: string | null, force = false) {
  const parsedDate = parseScheduleDate(dateParam);
  if (!parsedDate.ok) {
    return parsedDate;
  }

  const scheduleDate = parsedDate.scheduleDate;
  const settings = await getOrCreateDutySettings();
  const eligibility = await checkScheduleDateEligibility(scheduleDate);

  if (!settings.reminderEnabled && !force) {
    return {
      ok: true as const,
      skipped: true,
      reason: "Pengingat otomatis sedang dinonaktifkan",
    };
  }

  if (!eligibility.ok && !force) {
    return { ok: true as const, skipped: true, reason: eligibility.reason };
  }

  let schedule = await prisma.dutySchedule.findUnique({
    where: { scheduleDate },
    include: { staff: { select: DUTY_STAFF_SELECT }, cycle: true },
  });

  if (!schedule) {
    if (!settings.autoAssignEnabled && !force) {
      return {
        ok: false as const,
        status: 409,
        error: "Penugasan otomatis dinonaktifkan dan jadwal belum tersedia",
      };
    }

    const generated = await generateDailySchedule(toIsoDate(scheduleDate));
    if (!generated.ok) {
      return generated;
    }
    schedule = generated.schedule;
  }

  const reminderDate = scheduleDate;
  const upsertWhere = {
    reminderDate_staffId_channel: {
      reminderDate,
      staffId: schedule.staffId,
      channel: ReminderChannel.FONNTE,
    },
  };

  const existingLog = await prisma.dutyReminderLog.findUnique({
    where: upsertWhere,
  });
  if (existingLog?.success && !force) {
    return {
      ok: true as const,
      skipped: true,
      reason: "Pengingat sudah pernah dikirim untuk tanggal ini",
      log: existingLog,
    };
  }

  const message = renderTemplate(settings.reminderTemplate, {
    staffName: schedule.staff.name,
    scheduleDate,
  });

  if (!schedule.staff.phone) {
    const log = await prisma.dutyReminderLog.upsert({
      where: upsertWhere,
      create: {
        reminderDate,
        staffId: schedule.staffId,
        scheduleId: schedule.id,
        settingsId: settings.id,
        phoneNumber: null,
        message,
        channel: ReminderChannel.FONNTE,
        success: false,
        errorMessage: "Nomor WhatsApp petugas belum diisi",
      },
      update: {
        scheduleId: schedule.id,
        settingsId: settings.id,
        phoneNumber: null,
        message,
        success: false,
        providerResponse: Prisma.JsonNull,
        errorMessage: "Nomor WhatsApp petugas belum diisi",
      },
    });

    return {
      ok: false as const,
      status: 400,
      error: "Nomor WhatsApp petugas belum diisi",
      log,
    };
  }

  const sendResult = await sendWhatsAppFonnteReminder(schedule.staff.phone, message);
  const log = await prisma.dutyReminderLog.upsert({
    where: upsertWhere,
    create: {
      reminderDate,
      staffId: schedule.staffId,
      scheduleId: schedule.id,
      settingsId: settings.id,
      phoneNumber: schedule.staff.phone,
      message,
      channel: ReminderChannel.FONNTE,
      success: sendResult.success,
      providerResponse: sendResult.success ? toPrismaJson(sendResult.data) : Prisma.JsonNull,
      errorMessage: sendResult.success ? null : sendResult.message,
    },
    update: {
      scheduleId: schedule.id,
      settingsId: settings.id,
      phoneNumber: schedule.staff.phone,
      message,
      success: sendResult.success,
      providerResponse: sendResult.success ? toPrismaJson(sendResult.data) : Prisma.JsonNull,
      errorMessage: sendResult.success ? null : sendResult.message,
    },
  });

  if (sendResult.success) {
    await prisma.notification.create({
      data: {
        type: "DUTY_REMINDER_SENT",
        title: "Pengingat Jadwal PASTI 6502",
        message: `Pengingat jadwal ${formatDisplayDate(scheduleDate)} terkirim ke ${
          schedule.staff.name
        }`,
        isRead: false,
      },
    });
    return {
      ok: true as const,
      skipped: false,
      log,
      result: sendResult,
    };
  }

  await prisma.notification.create({
    data: {
      type: "DUTY_REMINDER_FAILED",
      title: "Pengingat Jadwal PASTI 6502 Gagal",
      message: `Pengingat jadwal ${formatDisplayDate(scheduleDate)} gagal dikirim ke ${
        schedule.staff.name
      }: ${sendResult.message}`,
      isRead: false,
    },
  });

  return {
    ok: false as const,
    status: 400,
    error: sendResult.message,
    log,
  };
}
