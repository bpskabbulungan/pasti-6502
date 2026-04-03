import { DayOffType, DutyCycleStatus, Prisma } from "@prisma/client";
import { formatDisplayDate } from "@/lib/date-format";
import {
	addDaysInTimeZone,
	parseDateOnlyInTimeZone,
	startOfDayInTimeZone,
	toIsoDateInTimeZone,
} from "@shared/utils/date-boundary";

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

export const DUTY_STAFF_SELECT = {
	id: true,
	name: true,
	username: true,
	phone: true,
	role: true,
	createdAt: true,
	updatedAt: true,
} satisfies Prisma.UserSelect;

export const ensureDateAtStartOfDay = (date: Date) => {
	return startOfDayInTimeZone(date);
};

export const parseInputDate = (value: string) => {
	const normalized = value.trim();
	const parsedDateOnly = parseDateOnlyInTimeZone(normalized);
	if (parsedDateOnly) {
		return parsedDateOnly;
	}
	return new Date(normalized);
};

export const toIsoDate = (date: Date) => {
	return toIsoDateInTimeZone(date);
};

export const addOneDayAtStartOfDay = (date: Date) =>
	addDaysInTimeZone(ensureDateAtStartOfDay(date), 1);

export const toIsoWeekday = (date: Date) => {
	const value = date.getDay();
	return value === 0 ? 7 : value;
};

export const getWeekdayLabel = (date: Date) => WEEKDAY_LABELS[toIsoWeekday(date)] ?? "-";

export const parseScheduleDate = (dateParam?: string | null) => {
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

export const normalizeStaffOrder = (value: Prisma.JsonValue): string[] => {
	if (Array.isArray(value)) {
		return value.filter((id): id is string => typeof id === "string");
	}
	return [];
};

export const normalizeWorkDays = (value: Prisma.JsonValue): number[] => {
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

export const resolveNextStaff = (
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

export const renderTemplate = (
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

export const toPrismaJson = (value: unknown): Prisma.InputJsonValue => {
	if (value === undefined || value === null) {
		return {} as Prisma.InputJsonValue;
	}

	try {
		return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
	} catch {
		return { value: String(value) } as Prisma.InputJsonValue;
	}
};

export const SCHEDULE_DEFAULTS = {
	DEFAULT_WORK_DAYS,
	DEFAULT_TIMEZONE,
	DEFAULT_REMINDER_TEMPLATE,
	AVAILABLE_TEMPLATE_PLACEHOLDERS,
} as const;

export const SCHEDULE_ENUMS = {
	DayOffType,
	DutyCycleStatus,
} as const;
