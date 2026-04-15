import { apiFetch } from "./base-client";
import type {
  DutyDayOff,
  DutyScheduleBootstrapResponse,
  DutyReminderLog,
  DutyScheduleSettings,
  DutyScheduleSummary,
  DutyStaffMember,
  DutySummaryResponse,
} from "@shared/types/duty-schedule";

type DateRangeParams = {
  from?: string;
  to?: string;
};

type DutyDayOffSyncSummary = {
  inserted: number;
  updated: number;
  removed: number;
  total: number;
  sourceTotal: number;
  skipped: boolean;
};

const withQuery = (base: string, params: Record<string, string | undefined>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });
  return searchParams.size > 0 ? `${base}?${searchParams.toString()}` : base;
};

export const dutyScheduleApi = {
  bootstrap: (date?: string) =>
    apiFetch<DutyScheduleBootstrapResponse>(withQuery("/api/schedule/bootstrap", { date })),
  listStaff: () => apiFetch<{ staff: DutyStaffMember[] }>("/api/schedule/staff"),
  listSchedules: (params?: DateRangeParams) =>
    apiFetch<{ schedules: DutyScheduleSummary[] }>(
      withQuery("/api/schedule", {
        from: params?.from,
        to: params?.to,
      })
    ),
  generateSchedule: (date?: string) =>
    apiFetch<{ schedule: DutyScheduleSummary; alreadyExists: boolean }>("/api/schedule/generate", {
      method: "POST",
      body: { date },
    }),
  getSettings: () => apiFetch<{ settings: DutyScheduleSettings }>("/api/schedule/settings"),
  updateSettings: (payload: Partial<DutyScheduleSettings>) =>
    apiFetch<{ settings: DutyScheduleSettings }>("/api/schedule/settings", {
      method: "PUT",
      body: payload,
    }),
  listDayOffs: (params?: DateRangeParams) =>
    apiFetch<{ dayOffs: DutyDayOff[] }>(
      withQuery("/api/schedule/day-offs", {
        from: params?.from,
        to: params?.to,
      })
    ),
  syncDayOffsFromSigap: () =>
    apiFetch<{ summary: DutyDayOffSyncSummary; dayOffs: DutyDayOff[] }>(
      "/api/schedule/day-offs/sync",
      {
        method: "POST",
      }
    ),
  createDayOff: (payload: {
    date: string;
    name: string;
    type?: "HOLIDAY" | "LEAVE";
    note?: string | null;
  }) =>
    apiFetch<{ dayOff: DutyDayOff }>("/api/schedule/day-offs", {
      method: "POST",
      body: payload,
    }),
  deleteDayOff: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/schedule/day-offs/${id}`, {
      method: "DELETE",
    }),
  getSummary: (date?: string) =>
    apiFetch<{ summary: DutySummaryResponse }>(withQuery("/api/schedule/summary", { date })),
  runReminder: (payload?: { date?: string; force?: boolean }) =>
    apiFetch<{
      skipped?: boolean;
      reason?: string;
      log?: DutyReminderLog;
    }>("/api/schedule/reminders/run", {
      method: "POST",
      body: payload ?? {},
    }),
  listReminderLogs: (params?: DateRangeParams) =>
    apiFetch<{ logs: DutyReminderLog[] }>(
      withQuery("/api/schedule/reminders/logs", {
        from: params?.from,
        to: params?.to,
      })
    ),
};
