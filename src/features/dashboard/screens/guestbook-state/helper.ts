import { formatDisplayDateTime } from "@/lib/date-format";
import { serializeErrorForLog } from "@/lib/error-log";
import type { ErrorResponse } from "@shared/types/api";

export const getGuestbookErrorMessage = (error: unknown, fallback: string) => {
	if (typeof error !== "object" || !error) {
		return fallback;
	}

	const errorDetails = (error as { details?: ErrorResponse }).details;
	if (errorDetails?.error) {
		return errorDetails.error;
	}

	const message = (error as { message?: string }).message;
	return message || fallback;
};

export const getGuestbookErrorLogPayload = (error: unknown) => {
	return serializeErrorForLog(error);
};

export const formatGuestbookDateTime = (value: string | Date) => formatDisplayDateTime(value);

export const getFilenameFromContentDisposition = (value: string | null) => {
	if (!value) return null;
	const match = value.match(/filename="?([^"]+)"?/i);
	return match?.[1] ?? null;
};
