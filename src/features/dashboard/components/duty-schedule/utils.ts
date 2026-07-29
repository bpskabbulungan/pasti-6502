import { formatDisplayDate, formatDisplayDateTime } from "@/lib/date-format";
import { pstScheduleApi } from "@/services/api/pst-schedule";
import type { DutyScheduleSummary } from "@shared/types/duty-schedule";
import type { MonthlySchedulePdfMeta, MonthlyScheduleResponse } from "@shared/types/pst-schedule";

export const toInputDate = (date: string | Date) => {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const toInputMonth = (date: string | Date) => {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
};

export const formatDate = (date: string | Date) => formatDisplayDate(date);

export const formatDateTime = (date: string | Date) => formatDisplayDateTime(date);

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }
  return fallback;
};

export const getErrorStatus = (error: unknown) => {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = Number((error as { status?: unknown }).status);
    if (Number.isInteger(status)) {
      return status;
    }
  }
  return null;
};

export const getErrorDetails = (error: unknown) => {
  if (typeof error === "object" && error !== null && "details" in error) {
    return (error as { details?: unknown }).details;
  }
  return undefined;
};

export const triggerFileDownload = (blob: Blob, fileName: string) => {
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(objectUrl);
};

export const triggerUrlDownload = (url: string) => {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
};

export type HistoryReminderFilter = "ALL" | "SUCCESS" | "FAILED" | "PENDING";
export type HistorySortKey =
  | "scheduleDate"
  | "staffName"
  | "staffPoints"
  | "cycleId"
  | "reminderStatus"
  | "createdAt";
export type HistorySortDirection = "asc" | "desc";

export const HISTORY_SORT_DEFAULT_DIRECTION: Record<HistorySortKey, HistorySortDirection> = {
  scheduleDate: "desc",
  staffName: "asc",
  staffPoints: "desc",
  cycleId: "asc",
  reminderStatus: "desc",
  createdAt: "desc",
};

export const compareText = (first: string, second: string) =>
  first.localeCompare(second, "id-ID", { sensitivity: "base" });

export const toScheduleReminderStatus = (schedule: DutyScheduleSummary) => {
  if (!schedule.reminderLogs?.[0]) return "PENDING";
  return schedule.reminderLogs[0].success ? "SUCCESS" : "FAILED";
};

export const toReminderStatusWeight = (status: Exclude<HistoryReminderFilter, "ALL">) => {
  if (status === "SUCCESS") return 2;
  if (status === "FAILED") return 1;
  return 0;
};

export const toMonthlyPeriodValue = (month: number, year: number) =>
  `${year}-${String(month).padStart(2, "0")}`;

export const formatMonthPeriodLabel = (month: number, year: number) =>
  new Date(year, month - 1, 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

export const formatAttemptDuration = (startedAt: string | Date, finishedAt: string | Date | null) => {
  if (!finishedAt) {
    return "-";
  }

  const startMs = new Date(startedAt).getTime();
  const finishMs = new Date(finishedAt).getTime();

  if (Number.isNaN(startMs) || Number.isNaN(finishMs) || finishMs < startMs) {
    return "-";
  }

  const diffSeconds = Math.floor((finishMs - startMs) / 1000);
  if (diffSeconds < 60) {
    return `${diffSeconds} dtk`;
  }

  const minutes = Math.floor(diffSeconds / 60);
  const seconds = diffSeconds % 60;
  return `${minutes}m ${seconds}d`;
};

export const toFallbackPstMonthlyPdfMeta = (
  schedule: MonthlyScheduleResponse
): MonthlySchedulePdfMeta => ({
  scheduleId: schedule.id,
  fileName: `Jadwal_PST_WFO_${String(schedule.month).padStart(2, "0")}_${schedule.year}.pdf`,
  path: "",
  htmlPath: "",
  metadataPath: "",
  month: schedule.month,
  year: schedule.year,
  generatedAt: schedule.generatedAt,
  generatedById: null,
  downloadUrl: pstScheduleApi.getMonthlyPdfDownloadUrl(schedule.id),
});
