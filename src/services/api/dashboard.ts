import { apiFetch } from "./base-client";
import type { DashboardStatsResponse } from "@shared/types/dashboard";

export const dashboardApi = {
	stats: (hash?: string) =>
		apiFetch<DashboardStatsResponse>(
			`/api/dashboard/stats${hash ? `?hash=${hash}` : ""}`
		),
};
