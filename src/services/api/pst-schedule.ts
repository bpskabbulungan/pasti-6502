import { apiFetch } from "./base-client";
import type {
  GenerateMonthlyScheduleResponse,
  MonthlyScheduleResponse,
  PstGenerateAttemptLog,
  PstHolidayCalendar,
} from "@shared/types/pst-schedule";

const withQuery = (base: string, params: Record<string, string | undefined>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  return searchParams.size > 0 ? `${base}?${searchParams.toString()}` : base;
};

const getErrorMessageFromResponse = async (response: Response) => {
  try {
    const payload = (await response.json()) as { error?: string; message?: string };
    if (payload.error) {
      return payload.error;
    }
    if (payload.message) {
      return payload.message;
    }
  } catch {
    // ignore JSON parsing failure
  }

  return response.statusText || "Request failed";
};

const parseFileNameFromContentDisposition = (headerValue: string | null) => {
  if (!headerValue) {
    return null;
  }

  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(headerValue);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const plainMatch = /filename="([^"]+)"/i.exec(headerValue);
  if (plainMatch?.[1]) {
    return plainMatch[1];
  }

  return null;
};

const PDF_DOWNLOAD_TIMEOUT_MS =
  process.env.NODE_ENV === "development" ? 0 : 30_000;

export const pstScheduleApi = {
  listMonthly: (limit = 6) =>
    apiFetch<{ schedules: MonthlyScheduleResponse[] }>(
      withQuery("/api/pst/schedules/monthly", { limit: String(limit) })
    ),
  getMonthly: (month: number, year: number) =>
    apiFetch<{ schedule: MonthlyScheduleResponse }>(
      withQuery("/api/pst/schedules/monthly", {
        month: String(month),
        year: String(year),
      })
    ),
  listGenerateAttempts: (params?: {
    month?: number;
    year?: number;
    limit?: number;
  }) =>
    apiFetch<{ logs: PstGenerateAttemptLog[] }>(
      withQuery("/api/pst/schedules/monthly/generate", {
        month: params?.month ? String(params.month) : undefined,
        year: params?.year ? String(params.year) : undefined,
        limit: params?.limit ? String(params.limit) : undefined,
      })
    ),
  generateMonthly: (payload: {
    month: number;
    year: number;
    forceRegenerate?: boolean;
    allowSameFridayAssignee?: boolean;
    holidayCalendar?: PstHolidayCalendar;
    documentStatus?: "DRAFT" | "FINAL" | "REVISI";
    changeNotes?: string;
    downloadPdf?: boolean;
  }) =>
    apiFetch<GenerateMonthlyScheduleResponse>(
      "/api/pst/schedules/monthly/generate",
      {
        method: "POST",
        body: payload,
      }
    ),
  generateMonthlyAndDownloadPdf: async (payload: {
    month: number;
    year: number;
    forceRegenerate?: boolean;
    allowSameFridayAssignee?: boolean;
    holidayCalendar?: PstHolidayCalendar;
    documentStatus?: "DRAFT" | "FINAL" | "REVISI";
    changeNotes?: string;
  }) => {
    const response = await fetch("/api/pst/schedules/monthly/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        downloadPdf: true,
      }),
    });

    if (!response.ok) {
      const message = await getErrorMessageFromResponse(response);
      throw {
        status: response.status,
        message,
      };
    }

    const blob = await response.blob();
    const fileName =
      parseFileNameFromContentDisposition(response.headers.get("content-disposition")) ||
      `Jadwal_PST_WFO_${String(payload.month).padStart(2, "0")}_${payload.year}.pdf`;

    return {
      blob,
      fileName,
    };
  },
  getMonthlyPdfDownloadUrl: (scheduleId: string) =>
    `/api/pst/schedules/monthly/${encodeURIComponent(scheduleId)}/pdf`,
  downloadMonthlyPdf: async (scheduleId: string) => {
    const controller = new AbortController();
    const timeoutId =
      PDF_DOWNLOAD_TIMEOUT_MS > 0
        ? setTimeout(() => controller.abort(), PDF_DOWNLOAD_TIMEOUT_MS)
        : null;
    let response: Response;
    try {
      response = await fetch(
        `/api/pst/schedules/monthly/${encodeURIComponent(scheduleId)}/pdf`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        }
      );
    } catch (error) {
      const isAbort =
        error instanceof DOMException
          ? error.name === "AbortError"
          : typeof error === "object" &&
            error !== null &&
            "name" in error &&
            (error as { name?: unknown }).name === "AbortError";

      if (isAbort) {
        throw {
          status: 0,
          message: "Permintaan download dibatalkan sebelum selesai.",
        };
      }

      throw {
        status: 0,
        message: "Gagal menghubungkan ke server saat download PDF.",
      };
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }

    if (!response.ok) {
      const message = await getErrorMessageFromResponse(response);
      throw {
        status: response.status,
        message,
      };
    }

    const blob = await response.blob();
    const fileName =
      parseFileNameFromContentDisposition(response.headers.get("content-disposition")) ||
      `Jadwal_PST_WFO_${scheduleId}.pdf`;

    return {
      blob,
      fileName,
    };
  },
  reshuffleSlot: (scheduleDetailId: string, reason?: string) =>
    apiFetch<{ detail: unknown }>(`/api/pst/schedules/slots/${scheduleDetailId}/reshuffle`, {
      method: "POST",
      body: { reason },
    }),
  swap: (firstScheduleId: string, secondScheduleId: string, reason?: string) =>
    apiFetch<{ swapped: unknown }>("/api/pst/schedules/swap", {
      method: "POST",
      body: {
        firstScheduleId,
        secondScheduleId,
        reason,
      },
    }),
};
