import { QueueStatus, QueueType } from "@/generated/prisma";

export type QueueTracking = {
	queueNumber: number;
	serviceName: string;
	visitorName: string;
	status: QueueStatus;
	queueType: QueueType;
	waitingBefore: number;
	estimated: number;
	createdAt: string | Date;
	startTime: string | Date | null;
	endTime: string | Date | null;
	filledSKD: boolean;
};

export type QueueDetail = {
	id: string;
	queueNumber: number;
	status: QueueStatus;
	queueType: QueueType;
	createdAt: string | Date;
	startTime: string | Date | null;
	endTime: string | Date | null;
	updatedAt: string | Date;
	queueDate?: string | Date | null;
	filledSKD?: boolean;
	trackingLink?: string | null;
	tempUuid?: string | null;
	service: { name: string };
	visitor: { name: string; phone: string; institution: string | null };
	admin: { name: string } | null;
	serviceName?: string;
	visitorName?: string;
};

export type QueueListResponse = {
	queues: QueueDetail[];
	hash: string;
	hasChanges: boolean;
	pagination?: {
		total: number;
		limit: number;
		offset: number;
		hasMore: boolean;
	};
};

export type QueueDisplayResponse = {
	servingQueues: Array<{
		id: string;
		queueNumber: number;
		status: QueueStatus;
		queueType: QueueType;
		service: { name: string };
		admin: { name: string } | null;
		createdAt: Date;
		startTime: Date | null;
		endTime: Date | null;
	}>;
	nextQueue: {
		id: string;
		queueNumber: number;
		status: QueueStatus;
		queueType: QueueType;
		service: { name: string };
		admin?: { name: string } | null;
		createdAt: Date;
		startTime: Date | null;
		endTime: Date | null;
	} | null;
	hash?: string;
	hasChanges?: boolean;
};

export type QueueListParams = {
	status?: QueueStatus;
	dateFilter?: "today" | "all";
	hash?: string;
	limit?: number;
	offset?: number;
};
