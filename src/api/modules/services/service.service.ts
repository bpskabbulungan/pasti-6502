import { ServiceStatus } from "@prisma/client";
import prisma from "@api/infrastructure/database/prisma";
import {
	generateUniqueServiceCode,
	normalizeServiceCode,
} from "@/shared/constants/service-catalog";

type ServiceCreateInput = {
	name: string;
	code?: string;
	status?: ServiceStatus;
};

type ServiceUpdateInput = {
	name?: string;
	code?: string;
	status?: ServiceStatus;
};

export async function listServices(status?: ServiceStatus | null) {
	const where = status ? { status } : {};
	const services = await prisma.service.findMany({
		where,
		orderBy: {
			createdAt: "desc",
		},
	});
	return { services };
}

export async function createService(input: ServiceCreateInput) {
	if (!input.name) {
		return {
			ok: false as const,
			status: 400,
			error: "Service name is required",
		};
	}

	const requestedCode = input.code ? normalizeServiceCode(input.code) : "";
  if (input.code && !requestedCode) {
    return {
      ok: false as const,
      status: 400,
      error: "Service code is invalid",
    };
  }

	const existingCodes = await prisma.service.findMany({
		select: { code: true },
	});

	const finalCode =
		requestedCode ||
		generateUniqueServiceCode(
			input.name,
			existingCodes.map((service) => service.code)
		);

	if (requestedCode) {
		const conflictByCode = await prisma.service.findFirst({
			where: { code: requestedCode },
			select: { id: true },
		});

		if (conflictByCode) {
			return {
				ok: false as const,
				status: 409,
				error: "Service code already exists",
			};
		}
	}

	const service = await prisma.service.create({
		data: {
			name: input.name,
			code: finalCode,
			status: input.status ?? ServiceStatus.ACTIVE,
		},
	});

	return { ok: true as const, service };
}

export async function getService(id: string) {
	const service = await prisma.service.findUnique({
		where: { id },
	});

	if (!service) {
		return { ok: false as const, status: 404, error: "Service not found" };
	}

	return { ok: true as const, service };
}

export async function updateService(id: string, input: ServiceUpdateInput) {
	if (!input.name && input.status === undefined && input.code === undefined) {
		return { ok: false as const, status: 400, error: "No updates provided" };
	}

	const existing = await prisma.service.findUnique({
		where: { id },
	});

	if (!existing) {
		return { ok: false as const, status: 404, error: "Service not found" };
	}

	const dataToUpdate: { name?: string; code?: string; status?: ServiceStatus } = {};
	if (input.name !== undefined) {
		dataToUpdate.name = input.name;
	}
	if (input.status !== undefined) {
		dataToUpdate.status = input.status;
	}

	if (input.code !== undefined) {
		const normalizedCode = normalizeServiceCode(input.code);
		if (!normalizedCode) {
			return { ok: false as const, status: 400, error: "Service code is invalid" };
		}

		const conflictByCode = await prisma.service.findFirst({
			where: {
				code: normalizedCode,
				id: { not: id },
			},
			select: { id: true },
		});

		if (conflictByCode) {
			return {
				ok: false as const,
				status: 409,
				error: "Service code already exists",
			};
		}

		dataToUpdate.code = normalizedCode;
	}

	const service = await prisma.service.update({
		where: { id },
		data: dataToUpdate,
	});

	return { ok: true as const, service };
}

export async function deleteService(id: string) {
	const existing = await prisma.service.findUnique({
		where: { id },
	});

	if (!existing) {
		return { ok: false as const, status: 404, error: "Service not found" };
	}

	await prisma.service.delete({
		where: { id },
	});

	return { ok: true as const };
}
