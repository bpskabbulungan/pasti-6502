import { Role } from "@prisma/client";
import bcryptjs from "bcryptjs";
import prisma from "@api/infrastructure/database/prisma";

type CreateUserInput = {
  name: string;
  username: string;
  password: string;
  phone?: string | null;
  role?: Role;
};

type UpdateUserInput = {
  name?: string;
  username?: string;
  password?: string;
  phone?: string | null;
};

export async function listUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return { users };
}

export async function createUser(input: CreateUserInput) {
  const { name, username, password, role, phone } = input;

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
      phone: phone ?? null,
      role: role || Role.PETUGAS,
    },
    select: {
      id: true,
      name: true,
      username: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return { ok: true as const, user };
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    return { ok: false as const, status: 404, error: "User not found" };
  }

  if (existingUser.role === Role.ADMIN) {
    return { ok: false as const, status: 403, error: "Cannot update admin account" };
  }

  if (input.username && input.username !== existingUser.username) {
    const usernameExists = await prisma.user.findUnique({
      where: { username: input.username },
    });

    if (usernameExists) {
      return { ok: false as const, status: 409, error: "Username already exists" };
    }
  }

  const updateData: Partial<{
    name: string;
    username: string;
    password: string;
    phone: string | null;
  }> = {};

  if (input.name) {
    updateData.name = input.name;
  }
  if (input.username) {
    updateData.username = input.username;
  }
  if (input.password) {
    updateData.password = await bcryptjs.hash(input.password, 10);
  }
  if (input.phone !== undefined) {
    updateData.phone = input.phone || null;
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      username: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return { ok: true as const, user };
}

export async function deleteUser(id: string) {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    return { ok: false as const, status: 404, error: "User not found" };
  }

  if (existingUser.role === Role.ADMIN) {
    return { ok: false as const, status: 403, error: "Cannot delete admin account" };
  }

  await prisma.user.delete({
    where: { id },
  });

  return { ok: true as const };
}

export async function listQueueDisplayAdmins() {
  const admins = await prisma.user.findMany({
    where: {
      OR: [{ role: Role.ADMIN }, { role: Role.PETUGAS }],
    },
    select: {
      id: true,
      name: true,
      role: true,
    },
    orderBy: {
      role: "asc",
    },
  });

  return { admins };
}
