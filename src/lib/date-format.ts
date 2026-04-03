import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

type DateInput = Date | string | number;

const toValidDate = (value: DateInput): Date | null => {
	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateValue = (
	value: DateInput,
	pattern: string,
	fallback: string
): string => {
	const date = toValidDate(value);
	if (!date) {
		return fallback;
	}
	return format(date, pattern, { locale: localeId });
};

export const formatDisplayDate = (value: DateInput, fallback = "-"): string =>
	formatDateValue(value, "dd-MMMM-yyyy", fallback);

export const formatDisplayDateTime = (
	value: DateInput,
	fallback = "-"
): string => formatDateValue(value, "dd-MMMM-yyyy HH:mm", fallback);

export const formatDisplayDateTimeWithSeconds = (
	value: DateInput,
	fallback = "-"
): string => formatDateValue(value, "dd-MMMM-yyyy HH:mm:ss", fallback);
