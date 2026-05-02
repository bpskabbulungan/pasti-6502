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
    poolSummary?: Array<{
      pool: string;
      meaning: string;
      officers: string;
    }>;
    officerDetails?: Array<{
      officerId: string;
      name: string;
      poolPstLabel: string;
      poolWfoFridayRandomLabel: string;
      fixedWfoFridayLabel: string;
      statusWfoFriday: string;
      pstCurrentMonthDisplay: string;
      pstFridayCurrentMonthDisplay: string;
      randomWfoFridayCurrentMonthDisplay: string;
      fixedWfoFridayCurrentMonthDisplay: string;
      pstCurrentMonth: number;
      pstRegularCurrentMonth: number;
      pstFridayCurrentMonth: number;
      randomWfoFridayCurrentMonth: number;
      fixedWfoFridayCurrentMonth: number;
      fridayRandomBurdenCurrentMonth: number;
      totalCurrentMonthForRandomFairness: number;
      totalOperationalPresence: number;
      previousMonthPstRegular: number;
      previousMonthPstFriday: number;
      previousMonthRandomWfoFriday: number;
      previousMonthFridayBurden: number;
      previousMonthRandomTotal: number;
      historyWindowPstRegular: number;
      historyWindowPstFriday: number;
      historyWindowPst: number;
      historyWindowRandomWfoFriday: number;
      historyWindowFridayBurden: number;
      historyWindowTotalRandomAssignments: number;
      cumulativeRandomFairnessTotal: number;
      lastRandomAssignedDate: string | null;
      selectedRandomThisMonth: boolean;
      fairnessStatus: string;
      nextPriorityRole: string;
      priorityReason: string;
    }>;
    nextMonthPriority?: {
      pst: Array<{ officerId: string; name: string; label: string; reason: string }>;
      wfoFridayRandom: Array<{ officerId: string; name: string; label: string; reason: string }>;
      fridayBurden?: Array<{ officerId: string; name: string; label: string; reason: string }>;
      randomTotal: Array<{ officerId: string; name: string; label: string; reason: string }>;
    };
    denominator?: {
      randomEligibleOfficerCount: number;
      fridayRandomEligibleOfficerCount: number;
    };
    monthlyOperationalSummary?: {
      totalPstSlots: number;
      totalWfoFridayRandomSlots: number;
      totalRandomSlots: number;
      totalWfoFridayFixed: number;
      totalOperationalPresence: number;
    };
    warnings?: string[];
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
