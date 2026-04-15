export type PstSlotRole = "PST" | "WFO";
export type PstScheduleDetailStatus = "ASSIGNED" | "UNASSIGNED" | "SWAPPED" | "REPLACED";
export type PstScheduleStatus = "DRAFT" | "PUBLISHED" | "CANCELLED";
export type PstDocumentStatus = "DRAFT" | "FINAL" | "REVISI";
export type PstValidationLevel = "OK" | "WARNING" | "ERROR";

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
  note: string | null;
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
  validation?: {
    overallStatus: PstValidationLevel;
    items: Array<{
      code: string;
      rule: string;
      status: PstValidationLevel;
      detail: string;
    }>;
  };
  fairness?: {
    historyWindowMonths: number;
    distributionSpread: number;
    fridaySpread: number;
    assignedOfficerCount: number;
    eligibleOfficerCount: number;
    coverageRate: number;
    note: string;
  };
  audit?: {
    generatedAt: string;
    generatedById: string | null;
    generatedByName: string | null;
    documentVersion: number;
    documentStatus: PstDocumentStatus;
    changeNotes: string;
    previousScheduleId: string | null;
    algorithmVersion: string;
  };
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

export type PstGenerateAttemptStatus = "PROCESSING" | "SUCCESS" | "FAILED";

export type PstGenerateAttemptLog = {
  id: string;
  month: number;
  year: number;
  downloadPdf: boolean;
  forceRegenerate: boolean;
  allowSameFridayAssignee: boolean;
  status: PstGenerateAttemptStatus;
  alreadyExists: boolean | null;
  errorMessage: string | null;
  requestedById: string | null;
  requestedByName: string | null;
  monthlyScheduleId: string | null;
  startedAt: string | Date;
  finishedAt: string | Date | null;
  createdAt: string | Date;
};

export type GenerateMonthlyScheduleResponse = {
  schedule: MonthlyScheduleResponse;
  alreadyExists: boolean;
  pdf: MonthlySchedulePdfMeta;
};
