import { Role } from "@prisma/client";
// import NextAuth from "next-auth";

declare module "next-auth" {
	interface User {
		id: string;
		username: string;
		name: string;
		role: Role;
	}

	interface Session {
		user: User;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		id: string;
		username: string;
		role: Role;
	}
}
