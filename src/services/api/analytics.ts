import { apiFetch } from "./base-client";
import type { AnalyticsSummary } from "@shared/types/analytics";

export const analyticsApi = {
	summary: (params?: { startDate?: string; endDate?: string }) => {
		const search = new URLSearchParams();
		if (params?.startDate) search.set("startDate", params.startDate);
		if (params?.endDate) search.set("endDate", params.endDate);
		const url =
			search.size > 0 ? `/api/analytics?${search.toString()}` : "/api/analytics";
		return apiFetch<AnalyticsSummary>(url);
	},
	export: async (params: { startDate?: string; endDate?: string; format?: "json" | "csv" }) => {
		const search = new URLSearchParams();
		if (params.startDate) search.set("startDate", params.startDate);
		if (params.endDate) search.set("endDate", params.endDate);
		if (params.format) search.set("format", params.format);
		const url =
			search.size > 0 ? `/api/analytics/export?${search.toString()}` : "/api/analytics/export";
		// use fetch directly for stream compatibility
		const res = await fetch(url, { method: "GET" });
		return res;
	},
};
