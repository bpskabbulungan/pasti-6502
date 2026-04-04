import type { ErrorResponse } from "@shared/types/api";

export const getVisitorFormErrorMessage = (error: unknown, fallback: string) => {
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

export const isVisitorFormApiError = (error: unknown): error is { status: number } => {
	return (
		typeof error === "object" &&
		error !== null &&
		"status" in error &&
		typeof (error as { status?: number }).status === "number"
	);
};

export const formatQueueTime = (isoDateString: string | Date): string => {
	const date = new Date(isoDateString);
	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	return `${day}${month}`;
};
