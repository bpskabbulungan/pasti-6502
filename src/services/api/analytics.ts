import { apiFetch } from "./base-client";
import type {
  AnalyticsExportFormat,
  AnalyticsExportJob,
  AnalyticsSummary,
  OfficerFeedbackCreateRequest,
  OfficerFeedbackCreateResponse,
  OfficerFeedbackListParams,
  OfficerFeedbackListResponse,
} from "@shared/types/analytics";

const buildAnalyticsSummaryUrl = (params?: {
  startDate?: string;
  endDate?: string;
  hash?: string;
}) => {
  const search = new URLSearchParams();
  if (params?.startDate) search.set("startDate", params.startDate);
  if (params?.endDate) search.set("endDate", params.endDate);
  if (params?.hash) search.set("hash", params.hash);
  return search.size > 0 ? `/api/analytics?${search.toString()}` : "/api/analytics";
};

const OFFICER_FEEDBACK_BASE_URL = "/api/analytics/officer-feedback";

const buildOfficerFeedbackListUrl = (params: OfficerFeedbackListParams) => {
  const search = new URLSearchParams();
  search.set("officerId", params.officerId);
  if (params.startDate) search.set("startDate", params.startDate);
  if (params.endDate) search.set("endDate", params.endDate);
  if (typeof params.page === "number") search.set("page", String(params.page));
  if (typeof params.pageSize === "number") search.set("pageSize", String(params.pageSize));

  return `${OFFICER_FEEDBACK_BASE_URL}?${search.toString()}`;
};

export const analyticsApi = {
  summaryUrl: buildAnalyticsSummaryUrl,
  summary: (params?: { startDate?: string; endDate?: string; hash?: string }) =>
    apiFetch<AnalyticsSummary>(buildAnalyticsSummaryUrl(params)),
  createExportJob: (params: {
    startDate?: string;
    endDate?: string;
    format?: AnalyticsExportFormat;
  }) =>
    apiFetch<{ job: AnalyticsExportJob }>("/api/analytics/export", {
      method: "POST",
      body: params,
    }),
  getExportJob: (id: string) =>
    apiFetch<{ job: AnalyticsExportJob }>(`/api/analytics/export/${id}`),
  downloadUrl: (id: string) => `/api/analytics/export/${id}/download`,
  listOfficerFeedback: (params: OfficerFeedbackListParams) =>
    apiFetch<OfficerFeedbackListResponse>(buildOfficerFeedbackListUrl(params)),
  createOfficerFeedback: (payload: OfficerFeedbackCreateRequest) =>
    apiFetch<OfficerFeedbackCreateResponse>(OFFICER_FEEDBACK_BASE_URL, {
      method: "POST",
      body: payload,
    }),
};
