export type PstSlotRole = "PST" | "WFO";
export type PstScheduleDetailStatus = "ASSIGNED" | "UNASSIGNED" | "SWAPPED" | "REPLACED";
export type PstScheduleStatus = "DRAFT" | "PUBLISHED" | "CANCELLED";

export type PstHolidayCalendar = {
  calendar: {
    LIBURAN: string[];
    CUTI_BERSAMA: string[];
  };
};

export type WeeklyScheduleSlot = {
  scheduleDetailId?: string;
  date: string;
  dayName: string;
  weekOfMonth: number;
  role: PstSlotRole | null;
  isHoliday: boolean;
  holidayType: "LIBURAN" | "CUTI_BERSAMA" | null;
  holidayName: string | null;
  officerId: string | null;
  officerName: string | null;
  officerUsername: string | null;
  officerWhatsapp: string | null;
  status: PstScheduleDetailStatus;
};

export type WeeklyScheduleGroup = {
  week: number;
  items: WeeklyScheduleSlot[];
};

export type MonthlyScheduleSummary = {
  totalWorkingDays: number;
  totalSlots: number;
  totalAssigned: number;
  totalUnassigned: number;
  totalFridaySlots: number;
  unassignedOfficerCount: number;
  unassignedOfficerIds: string[];
  generatedMessage: string;
};

export type MonthlyScheduleResponse = {
  id: string;
  month: number;
  year: number;
  status: PstScheduleStatus;
  generatedAt: string | Date;
  summary: MonthlyScheduleSummary;
  weeks: WeeklyScheduleGroup[];
};

export type MonthlySchedulePdfMeta = {
  scheduleId: string;
  fileName: string;
  path: string;
  htmlPath: string;
  metadataPath: string;
  month: number;
  year: number;
  generatedAt: string | Date;
  generatedById: string | null;
  downloadUrl: string;
};

export type GenerateMonthlyScheduleResponse = {
  schedule: MonthlyScheduleResponse;
  alreadyExists: boolean;
  pdf: MonthlySchedulePdfMeta;
};
