import { apiFetch } from "./base-client";
import type { QueueDisplayResponse } from "@shared/types/queue";

export const queueDisplayApi = {
	get: (params?: { adminId?: string; dateFilter?: string; hash?: string }) => {
		const searchParams = new URLSearchParams();
		if (params?.adminId && params.adminId !== "all") {
			searchParams.set("adminId", params.adminId);
		}
		if (params?.dateFilter) {
			searchParams.set("dateFilter", params.dateFilter);
		}
		const url =
			searchParams.size > 0
				? `/api/queue-display?${searchParams.toString()}`
				: "/api/queue-display";
		return apiFetch<QueueDisplayResponse>(url, {
			headers: params?.hash ? { "x-queue-hash": params.hash } : undefined,
		});
	},
};
