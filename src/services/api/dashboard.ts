import { apiFetch } from "./base-client";
import type { DashboardStatsResponse } from "@shared/types/dashboard";

const buildDashboardStatsUrl = (hash?: string) =>
	`/api/dashboard/stats${hash ? `?hash=${hash}` : ""}`;

export const dashboardApi = {
	statsUrl: buildDashboardStatsUrl,
	stats: (hash?: string) =>
		apiFetch<DashboardStatsResponse>(buildDashboardStatsUrl(hash)),
};
