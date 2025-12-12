import { createHash } from "crypto";
import prisma from "@api/infrastructure/database/prisma";
import { Prisma, QueueStatus } from "@/generated/prisma";

const generateHash = (data: unknown) => {
	const dataString = JSON.stringify(data);
	return createHash("sha256").update(dataString).digest("hex");
};

type DateFilter = "today" | "all";

export async function getQueueDisplay(params: {
	adminId?: string | null;
	dateFilter?: DateFilter;
	clientHash?: string;
}) {
	const { adminId, dateFilter = "today", clientHash = "" } = params;

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const servingWhereClause: Prisma.QueueWhereInput = {
		status: QueueStatus.SERVING,
	};

	const nextQueueWhereClause: Prisma.QueueWhereInput = {
		status: QueueStatus.WAITING,
	};

	if (dateFilter === "today") {
		const tomorrow = new Date(today);
		tomorrow.setDate(today.getDate() + 1);

		servingWhereClause.queueDate = {
			gte: today,
			lt: tomorrow,
		};
		nextQueueWhereClause.queueDate = {
			gte: today,
			lt: tomorrow,
		};
	}

	if (adminId && adminId !== "all") {
		servingWhereClause.adminId = adminId;
	}

	const servingQueues = await prisma.queue.findMany({
		where: servingWhereClause,
		include: {
			service: {
				select: {
					name: true,
				},
			},
			admin: {
				select: {
					name: true,
				},
			},
		},
		orderBy: {
			startTime: "asc",
		},
	});

	const nextQueue = await prisma.queue.findFirst({
		where: nextQueueWhereClause,
		include: {
			service: {
				select: {
					name: true,
				},
			},
		},
		orderBy: {
			queueNumber: "asc",
		},
	});

	const responseData = {
		servingQueues,
		nextQueue: nextQueue || null,
	};

	const hash = generateHash(responseData);
	const hasChanges = !clientHash || clientHash !== hash;

	return { ...responseData, hash, hasChanges };
}
