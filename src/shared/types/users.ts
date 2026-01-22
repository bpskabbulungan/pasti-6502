import type { Role } from "@/shared/constants/enums";

export type UserSummary = {
	id: string;
	name: string;
	username: string;
	role: Role;
	createdAt: string | Date;
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
