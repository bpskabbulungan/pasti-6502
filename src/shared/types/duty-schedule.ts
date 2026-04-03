import type { DayOffType } from "@prisma/client";

export type DutyStaffMember = {
  id: string;
  name: string;
  username: string;
  phone: string | null;
  role: "PETUGAS" | "ADMIN";
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type DutyScheduleSettings = {
  id: string;
  workDays: number[];
  reminderEnabled: boolean;
  autoAssignEnabled: boolean;
  reminderTemplate: string;
  timezone: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  availableTemplatePlaceholders?: string[];
};

export type DutyDayOff = {
  id: string;
  date: string | Date;
  name: string;
  type: DayOffType;
  note: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type DutyScheduleSummary = {
  id: string;
  scheduleDate: string | Date;
  staffId: string;
  staff: DutyStaffMember;
  cycleId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  reminderLogs?: Array<{
    id: string;
    success: boolean;
    createdAt: string | Date;
    errorMessage: string | null;
  }>;
};

export type DutyReminderLog = {
  id: string;
  reminderDate: string | Date;
  staffId: string;
  scheduleId: string | null;
  settingsId: string;
  phoneNumber: string | null;
  message: string;
  channel: "FONNTE";
  success: boolean;
  providerResponse: unknown;
  errorMessage: string | null;
  createdAt: string | Date;
  staff: DutyStaffMember;
  schedule: {
    id: string;
    scheduleDate: string | Date;
  } | null;
};

export type DutySummaryResponse = {
  date: string | Date;
  dateLabel: string;
  isWorkingDay: boolean;
  reason: string | null;
  settings: {
    workDays: number[];
    reminderEnabled: boolean;
    autoAssignEnabled: boolean;
  };
  schedule: DutyScheduleSummary | null;
};

export type DutyScheduleBootstrapResponse = {
  summary: DutySummaryResponse;
  settings: DutyScheduleSettings;
  staff: DutyStaffMember[];
  schedules: DutyScheduleSummary[];
  dayOffs: DutyDayOff[];
  logs: DutyReminderLog[];
};
