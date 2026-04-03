import type { Role } from "@/shared/constants/enums";

export type UserSummary = {
	id: string;
	name: string;
	username: string;
	phone: string | null;
	role: Role;
	createdAt: string | Date;
	updatedAt: string | Date;
};

export type UsersListResponse = {
	users: UserSummary[];
};

export type UserMutationResponse = {
	message: string;
	user: UserSummary;
};

export type UserDeleteResponse = {
	message: string;
};
