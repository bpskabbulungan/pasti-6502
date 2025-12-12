import { Prisma, QueueStatus } from "@/generated/prisma";
import prisma from "@api/infrastructure/database/prisma";
import { generateQueueHash } from "./queue.utils";
import type { QueueDetail } from "@shared/types/queue";

type DateFilter = "today" | "all";

const sanitizeLimit = (limitParam?: string | null) => {
	if (limitParam === null || typeof limitParam === "undefined") return undefined;
	const parsed = Number.parseInt(limitParam, 10);
	if (Number.isNaN(parsed)) return undefined;
	return Math.min(Math.max(parsed, 1), 500);
};

const sanitizeOffset = (offsetParam?: string | null) => {
	if (offsetParam === null || typeof offsetParam === "undefined") return undefined;
	const parsed = Number.parseInt(offsetParam, 10);
	if (Number.isNaN(parsed)) return undefined;
	return Math.max(parsed, 0);
};

type QueueListParams = {
	status: QueueStatus;
	dateFilter?: DateFilter;
	clientHash?: string;
	limit?: string | null;
	offset?: string | null;
};

type QueueListResult = {
	queues: QueueDetail[];
	hash: string;
	hasChanges: boolean;
	pagination: {
		total: number;
		limit: number;
		offset: number;
		hasMore: boolean;
	};
};

export async function getQueues({
	status,
	dateFilter = "today",
	clientHash = "",
	limit: limitParam,
	offset: offsetParam,
}: QueueListParams): Promise<QueueListResult> {
	const limit = sanitizeLimit(limitParam);
	const offset = sanitizeOffset(offsetParam);

	const whereClause: Prisma.QueueWhereInput = {
		status,
	};

	if (dateFilter === "today") {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(today.getDate() + 1);

		whereClause.queueDate = {
			gte: today,
			lt: tomorrow,
		};
	}

	const [queues, total] = await Promise.all([
		prisma.queue.findMany({
			where: whereClause,
			include: {
				visitor: {
					select: {
						name: true,
						phone: true,
						institution: true,
					},
				},
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
				queueNumber: "asc",
			},
			take: limit,
			skip: offset,
		}),
		prisma.queue.count({ where: whereClause }),
	]);

	const serverHash = generateQueueHash(queues);
	const hasChanges = !clientHash || clientHash !== serverHash;

	return {
		queues,
		hash: serverHash,
		hasChanges,
		pagination: {
			total,
			limit: limit ?? total,
			offset: offset ?? 0,
			hasMore:
				limit !== undefined && offset !== undefined
					? offset + limit < total
					: false,
		},
	};
}

type AllQueuesParams = {
	clientHash?: string;
};

export async function getAllQueuesToday({
	clientHash = "",
}: AllQueuesParams): Promise<{
	queues: QueueDetail[];
	hash: string;
	hasChanges: boolean;
}> {
	const startOfToday = new Date();
	startOfToday.setHours(0, 0, 0, 0);
	const endOfToday = new Date(startOfToday);
	endOfToday.setDate(endOfToday.getDate() + 1);

	const queues = await prisma.queue.findMany({
		where: {
			queueDate: {
				gte: startOfToday,
				lt: endOfToday,
			},
		},
		include: {
			visitor: {
				select: {
					name: true,
					phone: true,
					institution: true,
				},
			},
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
			queueNumber: "asc",
		},
	});

	const serverHash = generateQueueHash(queues);
	const hasChanges = !clientHash || clientHash !== serverHash;

	return {
		queues,
		hash: serverHash,
		hasChanges,
	};
}
