import { apiFetch } from "./base-client";
import type {
	GuestbookListParams,
	GuestbookListResponse,
} from "@shared/types/guestbook";

export const guestbookApi = {
	list: (params?: GuestbookListParams) => {
		const searchParams = new URLSearchParams();
		if (params?.status && params.status !== "ALL") {
			searchParams.set("status", params.status);
		}
		if (params?.purpose && params.purpose !== "ALL") {
			searchParams.set("purpose", params.purpose);
		}
		if (params?.dateFilter) {
			searchParams.set("dateFilter", params.dateFilter);
		}
		if (params?.search) {
			searchParams.set("search", params.search);
		}
		if (params?.limit) {
			searchParams.set("limit", String(params.limit));
		}
		if (params?.offset) {
			searchParams.set("offset", String(params.offset));
		}

		const url =
			searchParams.size > 0
				? `/api/guestbook?${searchParams}`
				: "/api/guestbook";
		return apiFetch<GuestbookListResponse>(url);
	},
};
