import { ServiceStatus } from "@/generated/prisma";
import prisma from "@api/infrastructure/database/prisma";

type ServiceCreateInput = {
	name: string;
	status?: ServiceStatus;
};

type ServiceUpdateInput = {
	name?: string;
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

	const service = await prisma.service.create({
		data: {
			name: input.name,
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
	if (!input.name && input.status === undefined) {
		return { ok: false as const, status: 400, error: "No updates provided" };
	}

	const existing = await prisma.service.findUnique({
		where: { id },
	});

	if (!existing) {
		return { ok: false as const, status: 404, error: "Service not found" };
	}

	const service = await prisma.service.update({
		where: { id },
		data: input,
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
