export type SigapSyncResult = "SUCCESS" | "PARTIAL" | "FAILED";
export type PstOfficerEmploymentStatus =
  | "MASUK"
  | "CUTI"
  | "SAKIT"
  | "DINAS"
  | "NONAKTIF"
  | "UNKNOWN";
export type PstOfficerSyncStatus = "SYNCED" | "FAILED" | "SKIPPED";

export type PstOfficerCandidateSummary = {
  id: string;
  sigapContactId: string;
  sigapUsername: string | null;
  name: string;
  whatsappNumber: string | null;
  number?: string | null;
  employmentStatus: PstOfficerEmploymentStatus;
  sourceStatusRaw: string | null;
  isActiveCandidate: boolean;
  syncStatus: PstOfficerSyncStatus;
  syncMessage: string | null;
  lastSyncedAt: string | Date | null;
  priorityNextMonth: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type SigapSyncSummary = {
  id: string;
  success: boolean;
  result: SigapSyncResult;
  totalFetched: number;
  totalProcessed: number;
  totalSaved: number;
  totalFailed: number;
  totalDuplicates: number;
  message: string | null;
  errorDetail: string | null;
  startedAt: string | Date;
  finishedAt: string | Date | null;
  createdAt: string | Date;
};

export type PstOfficersListResponse = {
  officers: PstOfficerCandidateSummary[];
  syncSummary: SigapSyncSummary | null;
};

export type PstSyncResponse = {
  syncSummary: SigapSyncSummary;
  officers: PstOfficerCandidateSummary[];
};
