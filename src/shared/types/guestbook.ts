import type {
	Gender,
	LastEducation,
	Purpose,
	QueueStatus,
	QueueType,
} from "@/shared/constants/enums";

export type GuestbookEntry = {
	id: string;
	guestId: string;
	fullName: string;
	email: string | null;
	phone: string;
	address: string | null;
	age: number | null;
	institution: string | null;
	gender: Gender | null;
	lastEducation: LastEducation | null;
	occupation: string | null;
	purpose: Purpose | null;
	queueNumber: number;
	queueCode: string;
	status: QueueStatus;
	queueType: QueueType;
	serviceName: string;
	createdAt: string | Date;
	filledSKD: boolean;
	trackingLink: string | null;
};

export type GuestbookSummary = {
	total: number;
	waiting: number;
	serving: number;
	completed: number;
	canceled: number;
	skdPending: number;
};

export type GuestbookListResponse = {
	entries: GuestbookEntry[];
	pagination: {
		total: number;
		limit: number;
		offset: number;
		hasMore: boolean;
	};
	summary: GuestbookSummary;
};

export type GuestbookListParams = {
	status?: QueueStatus | "ALL";
	purpose?: Purpose | "ALL";
	dateFilter?: "today" | "all";
	search?: string;
	limit?: number;
	offset?: number;
};
