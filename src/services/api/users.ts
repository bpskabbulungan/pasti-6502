import { apiFetch } from "./base-client";
import type { Role } from "@/shared/constants/enums";
import type {
	UserDeleteResponse,
	UserMutationResponse,
	UsersListResponse,
} from "@shared/types/users";

type UserCreatePayload = {
	name: string;
	username: string;
	password: string;
	phone?: string | null;
	role?: Role;
};

type UserUpdatePayload = {
	name?: string;
	username?: string;
	password?: string;
	phone?: string | null;
};

export const usersApi = {
	list: () => apiFetch<UsersListResponse>("/api/users"),
	create: (payload: UserCreatePayload) =>
		apiFetch<UserMutationResponse>("/api/users", {
			method: "POST",
			body: payload,
		}),
	update: (id: string, payload: UserUpdatePayload) =>
		apiFetch<UserMutationResponse>(`/api/users/${id}`, {
			method: "PATCH",
			body: payload,
		}),
	remove: (id: string) =>
		apiFetch<UserDeleteResponse>(`/api/users/${id}`, { method: "DELETE" }),
};
