import { apiFetch } from "./base-client";

export const guestApi = {
	submit: (payload: unknown) =>
		apiFetch("/api/guest", {
			method: "POST",
			body: payload,
		}),
};
