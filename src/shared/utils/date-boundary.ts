const DEFAULT_APP_TIMEZONE = "Asia/Makassar";

type DateInput = Date | string | number;

type TimeZoneParts = {
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
	second: number;
};

const formatterCache = new Map<string, Intl.DateTimeFormat>();

const getTimeZone = (timeZone?: string) =>
	timeZone?.trim() || process.env.APP_TIMEZONE?.trim() || DEFAULT_APP_TIMEZONE;

const getFormatter = (timeZone: string) => {
	const cached = formatterCache.get(timeZone);
	if (cached) {
		return cached;
	}

	const formatter = new Intl.DateTimeFormat("en-US", {
		timeZone,
		hour12: false,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});

	formatterCache.set(timeZone, formatter);
	return formatter;
};

const toDate = (value: DateInput) => new Date(value);

const getTimeZoneParts = (value: DateInput, timeZone: string): TimeZoneParts => {
	const date = toDate(value);
	const formatter = getFormatter(timeZone);
	const parts = formatter.formatToParts(date);

	const byType = Object.fromEntries(parts.map((part) => [part.type, part.value])) as Record<
		string,
		string
	>;

	return {
		year: Number(byType.year),
		month: Number(byType.month),
		day: Number(byType.day),
		hour: Number(byType.hour),
		minute: Number(byType.minute),
		second: Number(byType.second),
	};
};

const getOffsetMs = (value: DateInput, timeZone: string) => {
	const date = toDate(value);
	const parts = getTimeZoneParts(date, timeZone);
	const asUtc = Date.UTC(
		parts.year,
		parts.month - 1,
		parts.day,
		parts.hour,
		parts.minute,
		parts.second,
		0
	);
	return asUtc - date.getTime();
};

const zonedDateTimeToUtc = (
	parts: {
		year: number;
		month: number;
		day: number;
		hour?: number;
		minute?: number;
		second?: number;
		millisecond?: number;
	},
	timeZone: string
) => {
	const hour = parts.hour ?? 0;
	const minute = parts.minute ?? 0;
	const second = parts.second ?? 0;
	const millisecond = parts.millisecond ?? 0;

	const utcGuess = Date.UTC(
		parts.year,
		parts.month - 1,
		parts.day,
		hour,
		minute,
		second,
		millisecond
	);
	let date = new Date(utcGuess);
	let offset = getOffsetMs(date, timeZone);
	date = new Date(utcGuess - offset);
	offset = getOffsetMs(date, timeZone);
	return new Date(utcGuess - offset);
};

export const startOfDayInTimeZone = (value: DateInput, timeZone?: string) => {
	const tz = getTimeZone(timeZone);
	const parts = getTimeZoneParts(value, tz);
	return zonedDateTimeToUtc(
		{
			year: parts.year,
			month: parts.month,
			day: parts.day,
			hour: 0,
			minute: 0,
			second: 0,
			millisecond: 0,
		},
		tz
	);
};

export const addDaysInTimeZone = (value: DateInput, days: number, timeZone?: string) => {
	const tz = getTimeZone(timeZone);
	const start = startOfDayInTimeZone(value, tz);
	const parts = getTimeZoneParts(start, tz);
	return zonedDateTimeToUtc(
		{
			year: parts.year,
			month: parts.month,
			day: parts.day + days,
			hour: 0,
			minute: 0,
			second: 0,
			millisecond: 0,
		},
		tz
	);
};

export const getDayRangeInTimeZone = (value: DateInput, timeZone?: string) => {
	const start = startOfDayInTimeZone(value, timeZone);
	const end = addDaysInTimeZone(start, 1, timeZone);
	return { start, end };
};

export const parseDateOnlyInTimeZone = (value: string, timeZone?: string) => {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
	if (!match) {
		return null;
	}

	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
		return null;
	}

	const tz = getTimeZone(timeZone);
	const date = zonedDateTimeToUtc({ year, month, day }, tz);
	const normalizedParts = getTimeZoneParts(date, tz);
	if (
		normalizedParts.year !== year ||
		normalizedParts.month !== month ||
		normalizedParts.day !== day
	) {
		return null;
	}

	return date;
};

export const toIsoDateInTimeZone = (value: DateInput, timeZone?: string) => {
	const tz = getTimeZone(timeZone);
	const parts = getTimeZoneParts(value, tz);
	return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(
		2,
		"0"
	)}`;
};

export const addHours = (value: DateInput, hours: number) => {
	const date = toDate(value);
	return new Date(date.getTime() + hours * 60 * 60 * 1000);
};
