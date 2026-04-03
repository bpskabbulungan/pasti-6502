import { apiFetch } from "./base-client";
import type {
  AnalyticsExportFormat,
  AnalyticsExportJob,
  AnalyticsSummary,
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
};
