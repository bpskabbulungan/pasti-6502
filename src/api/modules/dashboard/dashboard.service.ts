import { createHash } from "crypto";
import prisma from "@api/infrastructure/database/prisma";
import { QueueStatus } from "@/generated/prisma";

const hashPayload = (payload: unknown) =>
	createHash("md5").update(JSON.stringify(payload)).digest("hex");

export async function getDashboardStats(clientHash?: string | null) {
	const startOfToday = new Date();
	startOfToday.setHours(0, 0, 0, 0);
	const endOfToday = new Date(startOfToday);
	endOfToday.setDate(endOfToday.getDate() + 1);

	const [waitingCount, servingCount, completedCount, canceledCount] =
		await Promise.all([
			prisma.queue.count({
				where: {
					status: QueueStatus.WAITING,
					queueDate: { gte: startOfToday, lt: endOfToday },
				},
			}),
			prisma.queue.count({
				where: {
					status: QueueStatus.SERVING,
					queueDate: { gte: startOfToday, lt: endOfToday },
				},
			}),
			prisma.queue.count({
				where: {
					status: QueueStatus.COMPLETED,
					queueDate: { gte: startOfToday, lt: endOfToday },
				},
			}),
			prisma.queue.count({
				where: {
					status: QueueStatus.CANCELED,
					queueDate: { gte: startOfToday, lt: endOfToday },
				},
			}),
		]);

	const totalCount = waitingCount + servingCount + completedCount + canceledCount;

	const completedQueues = await prisma.queue.findMany({
		where: {
			status: {
				in: [QueueStatus.COMPLETED, QueueStatus.SERVING],
			},
			queueDate: {
				gte: startOfToday,
				lt: endOfToday,
			},
			startTime: {
				not: null,
			},
		},
		select: {
			createdAt: true,
			startTime: true,
			endTime: true,
		},
	});

	let totalWaitTimeMs = 0;
	let totalServiceTimeMs = 0;
	let waitCount = 0;
	let serviceCount = 0;

	completedQueues.forEach((queue) => {
		if (queue.startTime) {
			const waitTimeMs =
				new Date(queue.startTime).getTime() - new Date(queue.createdAt).getTime();
			totalWaitTimeMs += waitTimeMs;
			waitCount++;

			if (queue.endTime) {
				const serviceTimeMs =
					new Date(queue.endTime).getTime() -
					new Date(queue.startTime).getTime();
				totalServiceTimeMs += serviceTimeMs;
				serviceCount++;
			}
		}
	});

	const averages = {
		waitTimeMinutes:
			waitCount > 0 ? Math.round(totalWaitTimeMs / waitCount / (1000 * 60)) : 0,
		serviceTimeMinutes:
			serviceCount > 0
				? Math.round(totalServiceTimeMs / serviceCount / (1000 * 60))
				: 0,
	};

	const statsData = {
		counts: {
			waiting: waitingCount,
			serving: servingCount,
			completed: completedCount,
			canceled: canceledCount,
			total: totalCount,
		},
		averages,
	};

	const hash = hashPayload(statsData);
	const hasChanges = !clientHash || clientHash !== hash;

	return { ...statsData, hash, hasChanges };
}
