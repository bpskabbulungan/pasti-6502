import type {
  Gender,
  LastEducation,
  Purpose,
  QueueStatus,
  QueueType,
} from "@/shared/constants/enums";

export type GuestbookEntry = {
  id: string;
  guestId: string;
  fullName: string;
  email: string | null;
  phone: string;
  address: string | null;
  age: number | null;
  institution: string | null;
  gender: Gender | null;
  lastEducation: LastEducation | null;
  occupation: string | null;
  purpose: Purpose | null;
  queueNumber: number;
  queueCode: string;
  status: QueueStatus;
  queueType: QueueType;
  serviceName: string;
  officerName: string | null;
  createdAt: string | Date;
  endTime: string | Date | null;
  filledSKD: boolean;
  trackingLink: string | null;
};

export type GuestbookSummary = {
  total: number;
  completed: number;
  canceled: number;
  skdPending: number;
};

export type GuestbookListResponse = {
  entries: GuestbookEntry[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  summary: GuestbookSummary;
  hash?: string;
  hasChanges?: boolean;
};

export type GuestbookListParams = {
  status?: Extract<QueueStatus, "COMPLETED" | "CANCELED"> | "ALL";
  purpose?: Purpose | "ALL";
  dateFilter?: "today" | "all" | "year" | "month" | "quarter" | "semester";
  year?: number;
  month?: number;
  quarter?: number;
  semester?: number;
  sortBy?: "createdAt" | "fullName" | "serviceName" | "queueNumber";
  sortOrder?: "asc" | "desc";
  search?: string;
  limit?: number;
  offset?: number;
};
