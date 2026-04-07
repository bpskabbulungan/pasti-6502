import { apiFetch } from "./base-client";
import type {
	QueueActionResponse,
	QueueDetail,
	QueueListParams,
	QueueListResponse,
} from "@shared/types/queue";
import type { ReminderResponse } from "@shared/types/reminder";

const buildQueueListUrl = (params?: QueueListParams) => {
	const searchParams = new URLSearchParams();
	if (params?.status) searchParams.set("status", params.status);
	if (params?.dateFilter) searchParams.set("dateFilter", params.dateFilter);
	if (params?.hash) searchParams.set("hash", params.hash);
	if (params?.limit) searchParams.set("limit", String(params.limit));
	if (params?.offset) searchParams.set("offset", String(params.offset));
	return searchParams.size > 0 ? `/api/queue?${searchParams}` : "/api/queue";
};

export const queuesApi = {
	listUrl: buildQueueListUrl,
	detailUrl: (id: string) => `/api/queue/${id}`,
	serve: (id: string) =>
		apiFetch<QueueActionResponse>(`/api/queue/${id}/serve`, { method: "POST" }),
	complete: (id: string) =>
		apiFetch<QueueActionResponse>(`/api/queue/${id}/complete`, { method: "POST" }),
	cancel: (id: string) =>
		apiFetch<QueueActionResponse>(`/api/queue/${id}/cancel`, { method: "POST" }),
	previewSkdReminder: (id: string, message?: string) =>
		apiFetch<ReminderResponse>(`/api/queue/${id}/remind-skd`, {
			method: "POST",
			body: { message },
		}),
	remindSkd: (id: string, message?: string) =>
		apiFetch<ReminderResponse>(`/api/queue/${id}/remind-skd`, {
			method: "POST",
			body: { message },
		}),
	remindSkdBot: (id: string, message?: string) =>
		apiFetch<ReminderResponse>(`/api/queue/${id}/remind-skd-bot`, {
			method: "POST",
			body: { message },
		}),
	updateSkdStatus: (id: string, status: "BELUM_MENGISI" | "SUDAH_MENGISI") =>
		apiFetch(`/api/queue/${id}/skd`, {
			method: "PATCH",
			body: { status },
		}),
	detail: (id: string) => apiFetch<QueueDetail>(`/api/queue/${id}`),
	list: (params?: QueueListParams) => apiFetch<QueueListResponse>(buildQueueListUrl(params)),
};
