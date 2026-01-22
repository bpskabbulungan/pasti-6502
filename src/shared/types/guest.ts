import type { QueueStatus } from "@/shared/constants/enums";

export type GuestSubmissionResponse = {
	success: true;
	message: string;
	data: {
		queueId: string;
		queueNumber: number;
		queueCode: string;
		status: QueueStatus;
		purpose: string | null;
		serviceName: string;
		guestName: string;
		trackingLink: string | null;
	};
};
