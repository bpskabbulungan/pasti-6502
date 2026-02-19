import { Purpose, QueueStatus, Prisma } from "@prisma/client";
import prisma from "@api/infrastructure/database/prisma";
import type { GuestbookListResponse } from "@shared/types/guestbook";

type DateFilter = "today" | "all";

type GuestbookListParams = {
	status?: string | null;
	purpose?: string | null;
	dateFilter?: DateFilter;
	search?: string | null;
	limit?: string | null;
	offset?: string | null;
};

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

const formatQueueDate = (date: Date): string => {
	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	return `${day}${month}`;
};

const parseStatus = (value?: string | null) => {
	if (!value || value === "ALL") return null;
	const normalized = value.toUpperCase();
	return Object.values(QueueStatus).includes(normalized as QueueStatus)
		? (normalized as QueueStatus)
		: null;
};

const parsePurpose = (value?: string | null) => {
	if (!value || value === "ALL") return null;
	const normalized = value.toUpperCase();
	return Object.values(Purpose).includes(normalized as Purpose)
		? (normalized as Purpose)
		: null;
};

export async function getGuestbookEntries({
	status,
	purpose,
	dateFilter = "today",
	search,
	limit: limitParam,
	offset: offsetParam,
}: GuestbookListParams): Promise<GuestbookListResponse> {
	const limit = sanitizeLimit(limitParam);
	const offset = sanitizeOffset(offsetParam);
	const normalizedStatus = parseStatus(status);
	const normalizedPurpose = parsePurpose(purpose);
	const searchTerm = search?.trim() ?? "";

	const baseWhere: Prisma.QueueWhereInput = {
		guestId: { not: null },
	};

	if (dateFilter === "today") {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(today.getDate() + 1);
		baseWhere.queueDate = { gte: today, lt: tomorrow };
	}

	if (normalizedPurpose) {
		baseWhere.guest = { is: { purpose: normalizedPurpose } };
	}

	if (searchTerm) {
		const numericSearch = Number.parseInt(searchTerm, 10);
		const searchFilters: Prisma.QueueWhereInput[] = [
			{
				guest: {
					is: {
						fullName: { contains: searchTerm, mode: "insensitive" },
					},
				},
			},
			{
				guest: {
					is: {
						phone: { contains: searchTerm },
					},
				},
			},
			{
				guest: {
					is: {
						institution: { contains: searchTerm, mode: "insensitive" },
					},
				},
			},
			{
				guest: {
					is: {
						email: { contains: searchTerm, mode: "insensitive" },
					},
				},
			},
		];

		if (!Number.isNaN(numericSearch)) {
			searchFilters.push({ queueNumber: numericSearch });
		}

		baseWhere.OR = searchFilters;
	}

	const listWhere: Prisma.QueueWhereInput = normalizedStatus
		? { ...baseWhere, status: normalizedStatus }
		: baseWhere;

	const summaryWhere: Prisma.QueueWhereInput = { ...baseWhere };

	const [queues, total, summaryTotal, statusGroups, skdPendingCount] =
		await Promise.all([
			prisma.queue.findMany({
				where: listWhere,
				include: {
					guest: true,
					service: { select: { name: true } },
				},
				orderBy: { createdAt: "desc" },
				take: limit,
				skip: offset,
			}),
			prisma.queue.count({ where: listWhere }),
			prisma.queue.count({ where: summaryWhere }),
			prisma.queue.groupBy({
				by: ["status"],
				_count: { _all: true },
				where: summaryWhere,
			}),
			prisma.queue.count({
				where: { ...summaryWhere, filledSKD: false },
			}),
		]);

	const statusSummary = {
		waiting: 0,
		serving: 0,
		completed: 0,
		canceled: 0,
	};

	statusGroups.forEach((group) => {
		switch (group.status) {
			case QueueStatus.WAITING:
				statusSummary.waiting = group._count._all;
				break;
			case QueueStatus.SERVING:
				statusSummary.serving = group._count._all;
				break;
			case QueueStatus.COMPLETED:
				statusSummary.completed = group._count._all;
				break;
			case QueueStatus.CANCELED:
				statusSummary.canceled = group._count._all;
				break;
			default:
				break;
		}
	});

	const entries = queues.map((queue) => {
		const guest = queue.guest;
		const createdAt = new Date(queue.createdAt);
		return {
			id: queue.id,
			guestId: guest?.id ?? "",
			fullName: guest?.fullName ?? "-",
			email: guest?.email ?? null,
			phone: guest?.phone ?? "-",
			address: guest?.address ?? null,
			age: guest?.age ?? null,
			institution: guest?.institution ?? null,
			gender: guest?.gender ?? null,
			lastEducation: guest?.lastEducation ?? null,
			occupation: guest?.occupation ?? null,
			purpose: guest?.purpose ?? null,
			queueNumber: queue.queueNumber,
			queueCode: `${queue.queueNumber}-${formatQueueDate(createdAt)}`,
			status: queue.status,
			queueType: queue.queueType,
			serviceName: queue.service.name,
			createdAt: queue.createdAt,
			filledSKD: queue.filledSKD ?? false,
			trackingLink: queue.trackingLink ?? null,
		};
	});

	return {
		entries,
		pagination: {
			total,
			limit: limit ?? total,
			offset: offset ?? 0,
			hasMore:
				limit !== undefined && offset !== undefined
					? offset + limit < total
					: false,
		},
		summary: {
			total: summaryTotal,
			waiting: statusSummary.waiting,
			serving: statusSummary.serving,
			completed: statusSummary.completed,
			canceled: statusSummary.canceled,
			skdPending: skdPendingCount,
		},
	};
}
