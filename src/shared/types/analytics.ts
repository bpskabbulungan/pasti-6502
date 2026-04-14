import type { QueueStatus } from "@/shared/constants/enums";

export type AnalyticsDistributionItem = {
  name: string;
  count: number;
  percentage: number;
};

export type AnalyticsServiceDistribution = AnalyticsDistributionItem;

export type AnalyticsQueueTypeDistribution = AnalyticsDistributionItem;

export type AnalyticsVisitorOccupationDistribution = AnalyticsDistributionItem;

export type AnalyticsVisitorGenderDistribution = AnalyticsDistributionItem;

export type AnalyticsVisitorEducationDistribution = AnalyticsDistributionItem;

export type AnalyticsOfficerPerformance = {
  officerId: string;
  officerName: string;
  completedCount: number;
  averageServiceTime: number;
  averageWaitTime: number;
};

export type AnalyticsOfficerServiceFrequency = {
  serviceName: string;
  count: number;
  percentage: number;
};

export type AnalyticsOfficerTopService = {
  serviceName: string;
  count: number;
  percentage: number;
};

export type OfficerFeedbackRating = 1 | 2 | 3 | 4 | 5;

export type OfficerFeedbackSentiment = "positive" | "neutral" | "negative";

export type OfficerFeedbackSummary = {
  averageRating: number;
  totalReviews: number;
  latestFeedbackAt: string | null;
  positiveRate: number | null;
};

export type OfficerFeedbackCommentItem = {
  id: string;
  officerId: string;
  rating: OfficerFeedbackRating;
  comment: string;
  sentiment: OfficerFeedbackSentiment | null;
  submittedAt: string;
  serviceName: string | null;
};

export type OfficerFeedbackListParams = {
  officerId: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
};

export type OfficerFeedbackListResponse = {
  officerId: string;
  summary: OfficerFeedbackSummary;
  items: OfficerFeedbackCommentItem[];
  page: number;
  pageSize: number;
  totalItems: number;
};

export type OfficerFeedbackCreateRequest = {
  queueId: string;
  officerId: string;
  rating: OfficerFeedbackRating;
  comment?: string;
};

export type OfficerFeedbackCreateResponse = {
  feedback: OfficerFeedbackCommentItem;
};

export type AnalyticsOfficerDetail = {
  officerId: string;
  officerName: string;
  totalHandled: number;
  averageWaitTime: number;
  averageServiceTime: number;
  serviceBreakdown: AnalyticsOfficerServiceFrequency[];
  topService: AnalyticsOfficerTopService | null;
  feedbackSummary?: OfficerFeedbackSummary | null;
};

export type AnalyticsTimeAnalysis = {
  hourOfDay: number;
  count: number;
};

export type AnalyticsDailyTrend = {
  date: string;
  waiting: number;
  completed: number;
  canceled: number;
};

export type AnalyticsInsight = {
  mostPopularService: {
    serviceName: string;
    count: number;
    percentage: number;
  } | null;
  mostActiveOfficer: {
    officerId: string;
    officerName: string;
    completedCount: number;
  } | null;
  onlineVsOffline: {
    online: number;
    offline: number;
    onlinePercentage: number;
    offlinePercentage: number;
  };
  averageServicesPerOfficer: number;
};

export type AnalyticsSelectedPeriod = {
  startDate: string;
  endDate: string;
  totalDays: number;
};

export type AnalyticsSummary = {
  summary: {
    totalVisitors: number;
    completedServices: number;
    canceledServices: number;
    averageWaitTimeMinutes: number;
    averageServiceTimeMinutes: number;
  };
  serviceDistribution: AnalyticsServiceDistribution[];
  queueTypeDistribution: AnalyticsQueueTypeDistribution[];
  occupationDistribution: AnalyticsVisitorOccupationDistribution[];
  genderDistribution: AnalyticsVisitorGenderDistribution[];
  educationDistribution: AnalyticsVisitorEducationDistribution[];
  officerPerformance: AnalyticsOfficerPerformance[];
  officerDetails: AnalyticsOfficerDetail[];
  insights: AnalyticsInsight;
  selectedPeriod: AnalyticsSelectedPeriod;
  timeAnalysis: AnalyticsTimeAnalysis[];
  dailyTrends: AnalyticsDailyTrend[];
  hash?: string;
  hasChanges?: boolean;
  dataLastUpdatedAt?: string;
  trackLastUpdated?: string;
};

export type AnalyticsExportRow = {
  queueNumber: number;
  serviceType: string;
  visitorName: string;
  phoneNumber: string;
  createdAt: string;
  startTime: string | "";
  endTime: string | "";
  status: QueueStatus;
  servedBy: string;
  waitTimeMinutes: number | "";
  serviceTimeMinutes: number | "";
};

export type AnalyticsExportFormat = "xlsx" | "pdf";

export type AnalyticsExportJob = {
  id: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  format: AnalyticsExportFormat;
  createdAt: string | Date;
  updatedAt: string | Date;
  completedAt: string | Date | null;
  expiresAt: string | Date | null;
  errorMessage: string | null;
  fileName: string | null;
  downloadUrl: string | null;
};
