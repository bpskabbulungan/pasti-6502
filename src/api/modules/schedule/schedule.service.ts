import { Prisma, DutyCycleStatus } from "@prisma/client";
import prisma from "@api/infrastructure/database/prisma";

const parseScheduleDate = (dateParam?: string | null) => {
	const scheduleDate = dateParam ? new Date(dateParam) : new Date();
	if (Number.isNaN(scheduleDate.getTime())) {
		return {
			ok: false as const,
			status: 400,
			error: "Tanggal tidak valid, gunakan format YYYY-MM-DD",
		};
	}
	scheduleDate.setHours(0, 0, 0, 0);
	return { ok: true as const, scheduleDate };
};

const normalizeStaffOrder = (value: Prisma.JsonValue): string[] => {
	if (Array.isArray(value)) {
		return value.filter((id): id is string => typeof id === "string");
	}
	return [];
};

const resolveNextStaff = (
	staffOrder: string[],
	activeStaffIds: Set<string>,
	startIndex: number
) => {
	if (staffOrder.length === 0) {
		return { staffId: null, nextIndex: startIndex };
	}

	let index = startIndex;
	for (let checked = 0; checked < staffOrder.length; checked++) {
		const staffId = staffOrder[index];
		if (activeStaffIds.has(staffId)) {
			return { staffId, nextIndex: index + 1 };
		}
		index = (index + 1) % staffOrder.length;
	}

	return { staffId: null, nextIndex: startIndex };
};

async function createCycleWithOrder(staffOrder: string[]) {
	const lastCycle = await prisma.dutyCycle.findFirst({
		orderBy: { createdAt: "desc" },
		select: { cycleNumber: true },
	});
	const cycleNumber = (lastCycle?.cycleNumber ?? 0) + 1;

	return prisma.dutyCycle.create({
		data: {
			cycleNumber,
			status: DutyCycleStatus.ACTIVE,
			staffOrder,
			currentIndex: 0,
		},
	});
}

export async function generateDailySchedule(dateParam?: string | null) {
	const parsedDate = parseScheduleDate(dateParam);
	if (!parsedDate.ok) {
		return parsedDate;
	}

	const { scheduleDate } = parsedDate;

	const existing = await prisma.dutySchedule.findUnique({
		where: { scheduleDate },
		include: { staff: true, cycle: true },
	});
	if (existing) {
		return { ok: true as const, schedule: existing, alreadyExists: true };
	}

	const activeStaff = await prisma.staffMember.findMany({
		where: { isActive: true },
		orderBy: { createdAt: "asc" },
	});

	if (activeStaff.length === 0) {
		return {
			ok: false as const,
			status: 400,
			error: "Belum ada pegawai aktif untuk dijadwalkan",
		};
	}

	const activeStaffIds = new Set(activeStaff.map((staff) => staff.id));

	let cycle = await prisma.dutyCycle.findFirst({
		where: { status: DutyCycleStatus.ACTIVE },
		orderBy: { createdAt: "desc" },
	});

	if (!cycle) {
		cycle = await createCycleWithOrder(activeStaff.map((staff) => staff.id));
	}

	let staffOrder = normalizeStaffOrder(cycle.staffOrder);
	if (staffOrder.length === 0) {
		cycle = await createCycleWithOrder(activeStaff.map((staff) => staff.id));
		staffOrder = normalizeStaffOrder(cycle.staffOrder);
	}

	const { staffId, nextIndex } = resolveNextStaff(
		staffOrder,
		activeStaffIds,
		cycle.currentIndex
	);

	if (!staffId) {
		await prisma.dutyCycle.update({
			where: { id: cycle.id },
			data: {
				status: DutyCycleStatus.COMPLETED,
				completedAt: new Date(),
			},
		});
		cycle = await createCycleWithOrder(activeStaff.map((staff) => staff.id));
		staffOrder = normalizeStaffOrder(cycle.staffOrder);
		const resolved = resolveNextStaff(
			staffOrder,
			activeStaffIds,
			cycle.currentIndex
		);
		if (!resolved.staffId) {
			return {
				ok: false as const,
				status: 400,
				error: "Tidak ada pegawai aktif yang bisa dijadwalkan",
			};
		}
		return createSchedule(scheduleDate, resolved.staffId, cycle.id, staffOrder, resolved.nextIndex);
	}

	return createSchedule(scheduleDate, staffId, cycle.id, staffOrder, nextIndex);
}

async function createSchedule(
	scheduleDate: Date,
	staffId: string,
	cycleId: string,
	staffOrder: string[],
	nextIndex: number
) {
	for (let attempt = 0; attempt < 2; attempt++) {
		try {
			const result = await prisma.$transaction(async (tx) => {
				const schedule = await tx.dutySchedule.create({
					data: {
						scheduleDate,
						staffId,
						cycleId,
					},
					include: { staff: true, cycle: true },
				});

				const isCycleComplete = nextIndex >= staffOrder.length;

				await tx.dutyCycle.update({
					where: { id: cycleId },
					data: {
						currentIndex: isCycleComplete ? staffOrder.length : nextIndex,
						status: isCycleComplete ? DutyCycleStatus.COMPLETED : DutyCycleStatus.ACTIVE,
						completedAt: isCycleComplete ? new Date() : null,
					},
				});

				return schedule;
			});

			return { ok: true as const, schedule: result, alreadyExists: false };
		} catch (error) {
			if ((error as { code?: string }).code === "P2002" && attempt < 1) {
				const existing = await prisma.dutySchedule.findUnique({
					where: { scheduleDate },
					include: { staff: true, cycle: true },
				});
				if (existing) {
					return { ok: true as const, schedule: existing, alreadyExists: true };
				}
				continue;
			}
			throw error;
		}
	}

	return {
		ok: false as const,
		status: 409,
		error: "Gagal membuat jadwal, silakan coba lagi.",
	};
}

export async function listSchedules(fromParam?: string | null, toParam?: string | null) {
	const whereClause: Prisma.DutyScheduleWhereInput = {};

	if (fromParam || toParam) {
		const startDate = fromParam ? new Date(fromParam) : new Date();
		const endDate = toParam ? new Date(toParam) : new Date();
		if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
			return {
				ok: false as const,
				status: 400,
				error: "Rentang tanggal tidak valid, gunakan format YYYY-MM-DD",
			};
		}
		startDate.setHours(0, 0, 0, 0);
		endDate.setHours(0, 0, 0, 0);
		endDate.setDate(endDate.getDate() + 1);

		whereClause.scheduleDate = {
			gte: startDate,
			lt: endDate,
		};
	}

	const schedules = await prisma.dutySchedule.findMany({
		where: whereClause,
		include: {
			staff: true,
			cycle: true,
		},
		orderBy: { scheduleDate: "desc" },
	});

	return { ok: true as const, schedules };
}
