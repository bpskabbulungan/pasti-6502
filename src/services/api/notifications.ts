import { apiFetch } from "./base-client";
import type { NotificationListResponse } from "@shared/types/notification";

export const notificationsApi = {
	list: (hash?: string) =>
		apiFetch<NotificationListResponse>(
			`/api/notifications${hash ? `?hash=${hash}` : ""}`
		),
	markAllRead: () =>
		apiFetch<NotificationListResponse>("/api/notifications", {
			method: "POST",
		}),
	markOneRead: (id: string) =>
		apiFetch<NotificationListResponse>(`/api/notifications/${id}`, {
			method: "POST",
		}),
};
