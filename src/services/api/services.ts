import { apiFetch } from "./base-client";
import type {
	ServiceDeleteResponse,
	ServiceResponse,
	ServicesListResponse,
} from "@shared/types/service";

export const servicesApi = {
	list: (status?: string) =>
		apiFetch<ServicesListResponse>(`/api/services${status ? `?status=${status}` : ""}`),
	create: (name: string) =>
		apiFetch<ServiceResponse>("/api/services", { method: "POST", body: { name } }),
	get: (id: string) => apiFetch<ServiceResponse>(`/api/services/${id}`),
	update: (id: string, payload: { name?: string; status?: string | boolean }) =>
		apiFetch<ServiceResponse>(`/api/services/${id}`, { method: "PATCH", body: payload }),
	delete: (id: string) =>
		apiFetch<ServiceDeleteResponse>(`/api/services/${id}`, { method: "DELETE" }),
};
