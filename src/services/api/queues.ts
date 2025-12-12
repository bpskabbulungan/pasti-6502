import { apiFetch } from "./base-client";
import type { QueueListParams, QueueListResponse } from "@shared/types/queue";
import type { ReminderResponse } from "@shared/types/reminder";

export const queuesApi = {
	serve: (id: string) =>
		apiFetch(`/api/queue/${id}/serve`, { method: "POST" }),
	complete: (id: string) =>
		apiFetch(`/api/queue/${id}/complete`, { method: "POST" }),
	cancel: (id: string) =>
		apiFetch(`/api/queue/${id}/cancel`, { method: "POST" }),
	remindSkd: (id: string, message?: string) =>
		apiFetch<ReminderResponse>(`/api/queue/${id}/remind-skd`, {
			method: "POST",
			body: { message },
		}),
	detail: (id: string) => apiFetch(`/api/queue/${id}`),
	list: (params?: QueueListParams) => {
		const searchParams = new URLSearchParams();
		if (params?.status) searchParams.set("status", params.status);
		if (params?.dateFilter) searchParams.set("dateFilter", params.dateFilter);
		if (params?.hash) searchParams.set("hash", params.hash);
		if (params?.limit) searchParams.set("limit", String(params.limit));
		if (params?.offset) searchParams.set("offset", String(params.offset));
		const url =
			searchParams.size > 0 ? `/api/queue?${searchParams}` : "/api/queue";
		return apiFetch<QueueListResponse>(url);
	},
	listAllToday: (hash?: string) =>
		apiFetch<QueueListResponse>(`/api/queue/all${hash ? `?hash=${hash}` : ""}`),
};
