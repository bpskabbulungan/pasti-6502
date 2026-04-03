import { Role } from "@prisma/client";

export const QUEUE_TRANSITION_CONFLICT_ERROR = "Queue was modified by another request";

export const isTransitionConflict = (updatedCount: number) => updatedCount === 0;

export const getQueueTransitionConflictResult = () =>
	({
		ok: false as const,
		status: 409 as const,
		error: QUEUE_TRANSITION_CONFLICT_ERROR,
	});

export const canUserManageServingQueue = (role: Role, queueAdminId: string | null, userId: string) =>
	role === Role.ADMIN || queueAdminId === userId;
