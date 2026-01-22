import { apiFetch } from "./base-client";
import type { GuestSubmissionResponse } from "@shared/types/guest";

export const guestApi = {
	submit: (payload: unknown) =>
		apiFetch<GuestSubmissionResponse>("/api/guest", {
			method: "POST",
			body: payload,
		}),
};
