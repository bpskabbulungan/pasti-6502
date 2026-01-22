import { z } from "zod";
import prisma from "@api/infrastructure/database/prisma";

const staffCreateSchema = z.object({
	name: z.string().trim().min(1, "Nama wajib diisi"),
	phone: z.string().trim().optional().nullable(),
});

const staffUpdateSchema = z.object({
	name: z.string().trim().min(1).optional(),
	phone: z.string().trim().optional().nullable(),
	isActive: z.boolean().optional(),
});

export async function listStaff(includeInactive = false) {
	const staff = await prisma.staffMember.findMany({
		where: includeInactive ? undefined : { isActive: true },
		orderBy: { createdAt: "asc" },
	});

	return { staff };
}

export async function getStaffById(id: string) {
	const staff = await prisma.staffMember.findUnique({ where: { id } });
	if (!staff) {
		return { ok: false as const, status: 404, error: "Pegawai tidak ditemukan" };
	}
	return { ok: true as const, staff };
}

export async function createStaff(payload: unknown) {
	const parsed = staffCreateSchema.safeParse(payload);
	if (!parsed.success) {
		return {
			ok: false as const,
			status: 400,
			error: "Data tidak valid",
			details: parsed.error.flatten().fieldErrors,
		};
	}

	const staff = await prisma.staffMember.create({
		data: {
			name: parsed.data.name,
			phone: parsed.data.phone ?? null,
		},
	});

	return { ok: true as const, staff };
}

export async function updateStaff(id: string, payload: unknown) {
	const parsed = staffUpdateSchema.safeParse(payload);
	if (!parsed.success) {
		return {
			ok: false as const,
			status: 400,
			error: "Data tidak valid",
			details: parsed.error.flatten().fieldErrors,
		};
	}

	const existing = await prisma.staffMember.findUnique({ where: { id } });
	if (!existing) {
		return { ok: false as const, status: 404, error: "Pegawai tidak ditemukan" };
	}

	const staff = await prisma.staffMember.update({
		where: { id },
		data: {
			name: parsed.data.name ?? existing.name,
			phone:
				parsed.data.phone !== undefined ? parsed.data.phone : existing.phone,
			isActive:
				typeof parsed.data.isActive === "boolean"
					? parsed.data.isActive
					: existing.isActive,
		},
	});

	return { ok: true as const, staff };
}

export async function deactivateStaff(id: string) {
	const existing = await prisma.staffMember.findUnique({ where: { id } });
	if (!existing) {
		return { ok: false as const, status: 404, error: "Pegawai tidak ditemukan" };
	}

	const staff = await prisma.staffMember.update({
		where: { id },
		data: { isActive: false },
	});

	return { ok: true as const, staff };
}
