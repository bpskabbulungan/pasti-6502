import { apiFetch } from "./base-client";
import type {
	GuestbookListParams,
	GuestbookListResponse,
} from "@shared/types/guestbook";

const buildGuestbookListUrl = (params?: GuestbookListParams) => {
	const searchParams = new URLSearchParams();
	if (params?.status && params.status !== "ALL") {
		searchParams.set("status", params.status);
	}
	if (params?.dateFilter) {
		searchParams.set("dateFilter", params.dateFilter);
	}
	if (typeof params?.year === "number") {
		searchParams.set("year", String(params.year));
	}
	if (typeof params?.month === "number") {
		searchParams.set("month", String(params.month));
	}
	if (typeof params?.quarter === "number") {
		searchParams.set("quarter", String(params.quarter));
	}
	if (typeof params?.semester === "number") {
		searchParams.set("semester", String(params.semester));
	}
	if (params?.sortBy) {
		searchParams.set("sortBy", params.sortBy);
	}
	if (params?.sortOrder) {
		searchParams.set("sortOrder", params.sortOrder);
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

	return searchParams.size > 0 ? `/api/guestbook?${searchParams}` : "/api/guestbook";
};

export const guestbookApi = {
	listUrl: buildGuestbookListUrl,
	list: (params?: GuestbookListParams) =>
		apiFetch<GuestbookListResponse>(buildGuestbookListUrl(params)),
};
