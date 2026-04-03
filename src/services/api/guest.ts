import { apiFetch } from "./base-client";
import type { GuestQueueDetail, GuestSubmissionResponse } from "@shared/types/guest";

export const guestApi = {
	detailUrl: (queueId: string) => `/api/guest/queue/${queueId}`,
	submit: (payload: unknown) =>
		apiFetch<GuestSubmissionResponse>("/api/guest", {
			method: "POST",
			body: payload,
		}),
	detail: (queueId: string) =>
		apiFetch<GuestQueueDetail>(`/api/guest/queue/${queueId}`),
};
