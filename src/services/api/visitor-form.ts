import { apiFetch } from "./base-client";

export const visitorFormApi = {
	getDynamicUuid: (staticUuid: string) =>
		apiFetch(`/api/visitor-form/${staticUuid}`),
	getServices: (visitorUuid: string) =>
		apiFetch("/api/visitor-form/services", {
			headers: { "x-visitor-uuid": visitorUuid },
		}),
	submit: (payload: unknown) =>
		apiFetch("/api/visitor-form/submit", {
			method: "POST",
			body: payload,
		}),
	track: (visitorUuid: string, hash?: string) =>
		apiFetch("/api/visitor-form/track", {
			headers: {
				"x-visitor-uuid": visitorUuid,
				...(hash ? { "x-queue-hash": hash } : {}),
			},
		}),
	markSkd: (tempUuid: string, filled: boolean) =>
		apiFetch("/api/visitor-form/skd", {
			method: "POST",
			body: { tempUuid, filled },
		}),
};
