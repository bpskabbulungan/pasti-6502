import { Role } from "@/generated/prisma";
import bcryptjs from "bcryptjs";
import prisma from "@api/infrastructure/database/prisma";

type CreateUserInput = {
	name: string;
	username: string;
	password: string;
	role?: Role;
};

export async function listUsers() {
	const users = await prisma.user.findMany({
		select: {
			id: true,
			name: true,
			username: true,
			role: true,
			createdAt: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return { users };
}

export async function createUser(input: CreateUserInput) {
	const { name, username, password, role } = input;

	if (!name || !username || !password) {
		return {
			ok: false as const,
			status: 400,
			error: "Name, username, and password are required",
		};
	}

	const existingUser = await prisma.user.findUnique({
		where: { username },
	});

	if (existingUser) {
		return { ok: false as const, status: 409, error: "Username already exists" };
	}

	const hashedPassword = await bcryptjs.hash(password, 10);

	const user = await prisma.user.create({
		data: {
			name,
			username,
			password: hashedPassword,
			role: role || Role.ADMIN,
		},
		select: {
			id: true,
			name: true,
			username: true,
			role: true,
			createdAt: true,
		},
	});

	return { ok: true as const, user };
}
