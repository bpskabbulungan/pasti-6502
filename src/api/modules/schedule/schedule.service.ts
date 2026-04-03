import { DayOffType, DutyCycleStatus, Prisma, ReminderChannel, Role } from "@prisma/client";
import { z } from "zod";
import prisma from "@api/infrastructure/database/prisma";
import { sendWhatsAppFonnteReminder } from "@api/modules/reminders";
import { formatDisplayDate } from "@/lib/date-format";

const DEFAULT_WORK_DAYS = [1, 2, 3, 4, 5];
const DEFAULT_TIMEZONE = "Asia/Makassar";
const DEFAULT_REMINDER_TEMPLATE =
  "Assalamu'alaikum/selamat pagi {{nama_petugas}}.\n\n" +
  "Pengingat jadwal PST {{hari}}, {{tanggal}}.\n" +
  "Anda dijadwalkan bertugas layanan {{layanan}} di {{lokasi}}.\n\n" +
  "Mohon hadir tepat waktu. Terima kasih.";
const AVAILABLE_TEMPLATE_PLACEHOLDERS = [
  "{{nama_petugas}}",
  "{{hari}}",
  "{{tanggal}}",
  "{{tanggal_iso}}",
  "{{layanan}}",
  "{{lokasi}}",
];

const WEEKDAY_LABELS: Record<number, string> = {
  1: "Senin",
  2: "Selasa",
  3: "Rabu",
  4: "Kamis",
  5: "Jumat",
  6: "Sabtu",
  7: "Minggu",
};

const DUTY_STAFF_SELECT = {
  id: true,
  name: true,
  username: true,
  phone: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const scheduleSettingsSchema = z.object({
  workDays: z.array(z.number().int().min(1).max(7)).min(1).max(7).optional(),
  reminderEnabled: z.boolean().optional(),
  autoAssignEnabled: z.boolean().optional(),
  reminderTemplate: z.string().trim().min(1).optional(),
  timezone: z.string().trim().min(1).optional(),
});

const dayOffSchema = z.object({
  date: z.string().trim().min(1, "Tanggal wajib diisi"),
  name: z.string().trim().min(1, "Nama hari libur/cuti wajib diisi"),
  type: z.nativeEnum(DayOffType).optional(),
  note: z.string().trim().optional().nullable(),
});

const ensureDateAtStartOfDay = (date: Date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const parseInputDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    return new Date(year, month, day);
  }
  return new Date(value);
};

const toIsoDate = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

const toIsoWeekday = (date: Date) => {
  const value = date.getDay();
  return value === 0 ? 7 : value;
};

const getWeekdayLabel = (date: Date) => WEEKDAY_LABELS[toIsoWeekday(date)] ?? "-";

const parseScheduleDate = (dateParam?: string | null) => {
  const scheduleDate = dateParam ? parseInputDate(dateParam) : new Date();
  if (Number.isNaN(scheduleDate.getTime())) {
    return {
      ok: false as const,
      status: 400,
      error: "Tanggal tidak valid, gunakan format YYYY-MM-DD",
    };
  }
  return { ok: true as const, scheduleDate: ensureDateAtStartOfDay(scheduleDate) };
};

const normalizeStaffOrder = (value: Prisma.JsonValue): string[] => {
  if (Array.isArray(value)) {
    return value.filter((id): id is string => typeof id === "string");
  }
  return [];
};

const normalizeWorkDays = (value: Prisma.JsonValue): number[] => {
  if (!Array.isArray(value)) {
    return [...DEFAULT_WORK_DAYS];
  }

  const normalized = [
    ...new Set(
      value
        .filter((item): item is number => typeof item === "number")
        .map((item) => Math.trunc(item))
        .filter((item) => item >= 1 && item <= 7)
    ),
  ].sort((a, b) => a - b);

  return normalized.length > 0 ? normalized : [...DEFAULT_WORK_DAYS];
};

const resolveNextStaff = (
  staffOrder: string[],
  activeStaffIds: Set<string>,
  startIndex: number
) => {
  if (staffOrder.length === 0) {
    return { staffId: null, nextIndex: startIndex };
  }

  let index = startIndex;
  for (let checked = 0; checked < staffOrder.length; checked++) {
    const staffId = staffOrder[index];
    if (activeStaffIds.has(staffId)) {
      return { staffId, nextIndex: index + 1 };
    }
    index = (index + 1) % staffOrder.length;
  }

  return { staffId: null, nextIndex: startIndex };
};

const renderTemplate = (
  template: string,
  params: {
    staffName: string;
    scheduleDate: Date;
  }
) => {
  return template
    .replaceAll("{{nama_petugas}}", params.staffName)
    .replaceAll("{{hari}}", getWeekdayLabel(params.scheduleDate))
    .replaceAll("{{tanggal}}", formatDisplayDate(params.scheduleDate))
    .replaceAll("{{tanggal_iso}}", toIsoDate(params.scheduleDate))
    .replaceAll("{{layanan}}", "Pelayanan Statistik Terpadu")
    .replaceAll("{{lokasi}}", "BPS Kabupaten Bulungan");
};

const toPrismaJson = (value: unknown): Prisma.InputJsonValue => {
  if (value === undefined || value === null) {
    return {} as Prisma.InputJsonValue;
  }

  try {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  } catch {
    return { value: String(value) } as Prisma.InputJsonValue;
  }
};

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
      workDays: [...DEFAULT_WORK_DAYS],
      reminderEnabled: true,
      autoAssignEnabled: true,
      reminderTemplate: DEFAULT_REMINDER_TEMPLATE,
      timezone: DEFAULT_TIMEZONE,
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
    const startDate = fromParam ? new Date(fromParam) : new Date();
    const endDate = toParam ? new Date(toParam) : new Date();
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return {
        ok: false as const,
        status: 400,
        error: "Rentang tanggal tidak valid, gunakan format YYYY-MM-DD",
      };
    }
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    endDate.setDate(endDate.getDate() + 1);

    whereClause.scheduleDate = {
      gte: startDate,
      lt: endDate,
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
    settings: {
      ...settings,
      workDays: normalizeWorkDays(settings.workDays),
      availableTemplatePlaceholders: AVAILABLE_TEMPLATE_PLACEHOLDERS,
    },
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
    settings: {
      ...updated,
      workDays: normalizeWorkDays(updated.workDays),
      availableTemplatePlaceholders: AVAILABLE_TEMPLATE_PLACEHOLDERS,
    },
  };
}

export async function listDutyDayOffs(fromParam?: string | null, toParam?: string | null) {
  const whereClause: Prisma.DutyDayOffWhereInput = {};

  if (fromParam || toParam) {
    const startDate = fromParam ? new Date(fromParam) : new Date();
    const endDate = toParam ? new Date(toParam) : new Date();
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return {
        ok: false as const,
        status: 400,
        error: "Rentang tanggal tidak valid, gunakan format YYYY-MM-DD",
      };
    }
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    endDate.setDate(endDate.getDate() + 1);
    whereClause.date = { gte: startDate, lt: endDate };
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
    const startDate = fromParam ? new Date(fromParam) : new Date();
    const endDate = toParam ? new Date(toParam) : new Date();
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return {
        ok: false as const,
        status: 400,
        error: "Rentang tanggal tidak valid, gunakan format YYYY-MM-DD",
      };
    }
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    endDate.setDate(endDate.getDate() + 1);
    whereClause.reminderDate = { gte: startDate, lt: endDate };
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
        ...settings,
        workDays,
        availableTemplatePlaceholders: AVAILABLE_TEMPLATE_PLACEHOLDERS,
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
    summary: {
      date: scheduleDate,
      dateLabel: formatDisplayDate(scheduleDate),
      isWorkingDay: eligibility.ok,
      reason: eligibility.ok ? null : eligibility.reason,
      settings: {
        workDays: normalizeWorkDays(settings.workDays),
        reminderEnabled: settings.reminderEnabled,
        autoAssignEnabled: settings.autoAssignEnabled,
      },
      schedule: schedule ?? null,
    },
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
        title: "Pengingat Jadwal PST",
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
      title: "Pengingat Jadwal PST Gagal",
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
