import type { QueueStatus, QueueType } from "@/generated/prisma";

export type VisitorQueueDetail = {
	id: string;
	queueNumber: number;
	status: QueueStatus;
	queueType: QueueType;
	serviceName: string;
	visitorName: string;
	createdAt: Date;
	startTime: Date | null;
	endTime: Date | null;
};
