import { apiFetch } from "./base-client";

export const servicesApi = {
	list: (status?: string) =>
		apiFetch(`/api/services${status ? `?status=${status}` : ""}`),
	create: (name: string) =>
		apiFetch("/api/services", { method: "POST", body: { name } }),
	get: (id: string) => apiFetch(`/api/services/${id}`),
	update: (id: string, payload: { name?: string; status?: string | boolean }) =>
		apiFetch(`/api/services/${id}`, { method: "PATCH", body: payload }),
	delete: (id: string) => apiFetch(`/api/services/${id}`, { method: "DELETE" }),
};
