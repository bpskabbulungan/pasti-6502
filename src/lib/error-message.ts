import type { ErrorResponse } from "@shared/types/api";

/**
 * Extract a human-readable error message from an unknown error object.
 *
 * Checks, in order:
 *   1. `error.details.error`  (API `ErrorResponse` shape)
 *   2. `error.message`        (standard `Error` shape)
 *   3. the provided `fallback`
 */
export const getErrorMessage = (error: unknown, fallback: string): string => {
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
