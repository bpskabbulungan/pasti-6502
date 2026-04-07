import prisma from "@api/infrastructure/database/prisma";
import { QueueStatus as PrismaQueueStatus, Role, Prisma } from "@prisma/client";
import { sendWhatsAppBotReminder } from "@api/modules/reminders";
import { QueueStatus as SharedQueueStatus } from "@shared/constants/enums";
import type { QueueDetail } from "@shared/types/queue";
import {
	canUserManageServingQueue,
	getQueueTransitionConflictResult,
	isTransitionConflict,
} from "./queue.transition-policy";
import { getDayRangeInTimeZone } from "@shared/utils/date-boundary";

const formatQueueDate = (date: Date): string => {
	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	return `${day}${month}`;
};

const formatQueueLabel = (queueNumber: number, createdAt: Date) =>
	`#${queueNumber}-${formatQueueDate(new Date(createdAt))}`;

const buildDefaultSkdReminderMessage = (visitorName: string) => {
	const skdLink =
		process.env.NEXT_PUBLIC_SKD_LINK ?? "s.bps.go.id/skd2025_bpsbusel";
	return `Halo ${visitorName}, mohon kesediaannya untuk mengisi Survei Kebutuhan Data (SKD) BPS Bulungan melalui link berikut: ${skdLink}`;
};

const normalizeWhatsappPhoneNumber = (phoneNumber: string) => {
	let normalizedPhoneNumber = phoneNumber.replace(/\s+/g, "");
	if (normalizedPhoneNumber.startsWith("+62")) {
		normalizedPhoneNumber = normalizedPhoneNumber.substring(1);
	} else if (normalizedPhoneNumber.startsWith("0")) {
		normalizedPhoneNumber = "62" + normalizedPhoneNumber.substring(1);
	} else if (!normalizedPhoneNumber.startsWith("62")) {
		normalizedPhoneNumber = "62" + normalizedPhoneNumber;
	}
	return normalizedPhoneNumber;
};

const queueDetailInclude = {
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
	dutyStaff: {
		select: {
			name: true,
		},
	},
} satisfies Prisma.QueueInclude;

const loadQueueDetail = (tx: Prisma.TransactionClient, queueId: string) =>
	tx.queue.findUnique({
		where: { id: queueId },
		include: queueDetailInclude,
	});

const createSkdReminderPreview = ({
	visitorName,
	visitorPhone,
	message,
}: {
	visitorName: string;
	visitorPhone: string;
	message?: string;
}) => {
	const reminderMessage =
		message?.trim() && message.trim().length > 0
			? message.trim()
			: buildDefaultSkdReminderMessage(visitorName);
	const phoneNumber = normalizeWhatsappPhoneNumber(visitorPhone);
	const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
		reminderMessage
	)}`;

	return {
		whatsappUrl,
		visitorName,
		phone: visitorPhone,
		phoneNumber,
		message: reminderMessage,
	};
};

const createNotificationAsync = (data: Prisma.NotificationUncheckedCreateInput) => {
	void prisma.notification.create({ data }).catch((error) => {
		console.error("Failed to persist notification", error);
	});
};

export async function getQueueDetail(id: string) {
	const queue = await prisma.queue.findUnique({
		where: { id },
		include: {
			service: { select: { name: true } },
			visitor: {
				select: {
					name: true,
					phone: true,
					institution: true,
				},
			},
			guest: {
				select: {
					fullName: true,
					phone: true,
					institution: true,
				},
			},
			admin: {
				select: {
					name: true,
				},
			},
			dutyStaff: {
				select: {
					name: true,
				},
			},
		},
	});

	if (!queue) {
		return { ok: false as const, status: 404, error: "Queue not found" };
	}

	const visitorName = queue.visitor?.name || queue.guest?.fullName || "Pengunjung";
	const visitorPhone = queue.visitor?.phone || queue.guest?.phone || "";
	const visitorInstitution =
		queue.visitor?.institution !== undefined
			? queue.visitor.institution
			: queue.guest?.institution ?? null;
	const normalizedStatus =
		(queue.status as string) === "CALLED"
			? SharedQueueStatus.WAITING
			: (queue.status as SharedQueueStatus);

	return {
		ok: true as const,
		queue: {
			...queue,
			status: normalizedStatus,
			service: { name: queue.service.name },
			visitor: {
				name: visitorName,
				phone: visitorPhone,
				institution: visitorInstitution,
			},
			admin: queue.admin ? { name: queue.admin.name } : null,
			dutyStaff: queue.dutyStaff ? { name: queue.dutyStaff.name } : null,
		} satisfies QueueDetail,
	};
}

export async function serveQueue(queueId: string, adminId: string) {
	const adminUser = await prisma.user.findUnique({
		where: { id: adminId },
		select: { id: true, name: true },
	});

	if (!adminUser) {
		return { ok: false as const, status: 404, error: "Admin user not found in database" };
	}

	const transitionResult = await prisma.$transaction(async (tx) => {
		const queue = await tx.queue.findUnique({
			where: { id: queueId },
			select: {
				id: true,
				status: true,
				queueDate: true,
			},
		});

		if (!queue) {
			return { ok: false as const, status: 404, error: "Queue not found" };
		}

		if (queue.status !== PrismaQueueStatus.WAITING) {
			return {
				ok: false as const,
				status: 400,
				error: "Queue is not in waiting status",
			};
		}

		const dutySchedule = await tx.dutySchedule.findUnique({
			where: { scheduleDate: queue.queueDate },
			select: { staffId: true },
		});

		const updated = await tx.queue.updateMany({
			where: {
				id: queueId,
				status: PrismaQueueStatus.WAITING,
			},
			data: {
				status: PrismaQueueStatus.SERVING,
				startTime: new Date(),
				adminId,
				dutyStaffId: dutySchedule?.staffId ?? null,
			},
		});

		if (isTransitionConflict(updated.count)) {
			return getQueueTransitionConflictResult();
		}

		const updatedQueue = await loadQueueDetail(tx, queueId);

		if (!updatedQueue) {
			return { ok: false as const, status: 404, error: "Queue not found" };
		}

		return { ok: true as const, queue: updatedQueue };
	});

	if (!transitionResult.ok) {
		return transitionResult;
	}

	createNotificationAsync({
		type: "QUEUE_SERVING",
		title: "Antrean Sedang Dilayani",
		message: `Antrean ${formatQueueLabel(
			transitionResult.queue.queueNumber,
			transitionResult.queue.createdAt
		)} sedang dilayani oleh ${adminUser.name}`,
		isRead: false,
	});

	return transitionResult;
}

export async function completeQueue(queueId: string, userId: string, role: Role) {
	const transitionResult = await prisma.$transaction(async (tx) => {
		const queue = await tx.queue.findUnique({
			where: { id: queueId },
			select: {
				id: true,
				status: true,
				adminId: true,
				queueDate: true,
			},
		});

		if (!queue) {
			return { ok: false as const, status: 404, error: "Queue not found" };
		}

		if (queue.status !== PrismaQueueStatus.SERVING) {
			return { ok: false as const, status: 400, error: "Queue is not currently being served" };
		}

		if (!canUserManageServingQueue(role, queue.adminId, userId)) {
			return {
				ok: false as const,
				status: 403,
				error: "You are not authorized to complete this queue",
			};
		}

		const whereClause: Prisma.QueueWhereInput = {
			id: queueId,
			status: PrismaQueueStatus.SERVING,
		};
		if (role !== Role.ADMIN) {
			whereClause.adminId = userId;
		}

		const updated = await tx.queue.updateMany({
			where: whereClause,
			data: {
				status: PrismaQueueStatus.COMPLETED,
				endTime: new Date(),
			},
		});

		if (isTransitionConflict(updated.count)) {
			return getQueueTransitionConflictResult();
		}

		const updatedQueue = await loadQueueDetail(tx, queueId);

		if (!updatedQueue) {
			return { ok: false as const, status: 404, error: "Queue not found" };
		}

		const { start: dayStart, end: dayEnd } = getDayRangeInTimeZone(queue.queueDate);

		const nextQueue = await tx.queue.findFirst({
			where: {
				status: PrismaQueueStatus.WAITING,
				queueDate: {
					gte: dayStart,
					lt: dayEnd,
				},
			},
			include: queueDetailInclude,
			orderBy: {
				queueNumber: "asc",
			},
		});

		return { ok: true as const, queue: updatedQueue, nextQueue: nextQueue ?? null };
	});

	if (!transitionResult.ok) {
		return transitionResult;
	}

	createNotificationAsync({
		type: "QUEUE_COMPLETED",
		title: "Antrean Selesai",
		message: `Antrean ${formatQueueLabel(
			transitionResult.queue.queueNumber,
			transitionResult.queue.createdAt
		)} telah selesai dilayani untuk ${transitionResult.queue.service.name}`,
		isRead: false,
		userId,
	});

	return transitionResult;
}

export async function cancelQueue(queueId: string, userId: string, role: Role) {
	const transitionResult = await prisma.$transaction(async (tx) => {
		const queue = await tx.queue.findUnique({
			where: { id: queueId },
			select: {
				id: true,
				status: true,
				adminId: true,
			},
		});

		if (!queue) {
			return { ok: false as const, status: 404, error: "Queue not found" };
		}

		const allowedStatuses: PrismaQueueStatus[] = [
			PrismaQueueStatus.WAITING,
			PrismaQueueStatus.SERVING,
		];
		if (!allowedStatuses.includes(queue.status)) {
			return {
				ok: false as const,
				status: 400,
				error: "Queue cannot be canceled in its current state",
			};
		}

		if (
			queue.status === PrismaQueueStatus.SERVING &&
			!canUserManageServingQueue(role, queue.adminId, userId)
		) {
			return {
				ok: false as const,
				status: 403,
				error: "You are not authorized to cancel this queue",
			};
		}

		const whereClause: Prisma.QueueWhereInput = {
			id: queueId,
			status: queue.status,
		};
		if (queue.status === PrismaQueueStatus.SERVING && role !== Role.ADMIN) {
			whereClause.adminId = userId;
		}

		const updated = await tx.queue.updateMany({
			where: whereClause,
			data: {
				status: PrismaQueueStatus.CANCELED,
				endTime: new Date(),
			},
		});

		if (isTransitionConflict(updated.count)) {
			return getQueueTransitionConflictResult();
		}

		const updatedQueue = await loadQueueDetail(tx, queueId);

		if (!updatedQueue) {
			return { ok: false as const, status: 404, error: "Queue not found" };
		}

		return { ok: true as const, queue: updatedQueue };
	});

	if (!transitionResult.ok) {
		return transitionResult;
	}

	createNotificationAsync({
		type: "QUEUE_CANCELED",
		title: "Antrean Dibatalkan",
		message: `Antrean ${formatQueueLabel(
			transitionResult.queue.queueNumber,
			transitionResult.queue.createdAt
		)} untuk layanan ${transitionResult.queue.service.name} telah dibatalkan`,
		isRead: false,
		userId,
	});

	return transitionResult;
}

export async function prepareSkdReminder(queueId: string, message?: string) {
	const queue = await prisma.queue.findUnique({
		where: { id: queueId },
		include: {
			visitor: {
				select: {
					name: true,
					phone: true,
				},
			},
		},
	});

	if (!queue) {
		return { ok: false as const, status: 404, error: "Queue not found" };
	}

	if (queue.filledSKD) {
		return {
			ok: false as const,
			status: 400,
			error: "SKD sudah diisi, pengingat tidak diperlukan",
		};
	}

	const preview = createSkdReminderPreview({
		visitorName: queue.visitor.name,
		visitorPhone: queue.visitor.phone,
		message,
	});

	return {
		ok: true as const,
		data: preview,
	};
}

export async function updateSkdStatusByQueueId(queueId: string, filled: boolean) {
	const queue = await prisma.queue.findUnique({
		where: { id: queueId },
		include: {
			visitor: { select: { name: true } },
		},
	});

	if (!queue) {
		return { ok: false as const, status: 404, error: "Queue not found" };
	}

	const updatedQueue = await prisma.queue.update({
		where: { id: queueId },
		data: { filledSKD: filled },
	});

	if (filled) {
		createNotificationAsync({
			type: "SKD_FILLED",
			title: "SKD Diisi",
			message: `Pengunjung ${queue.visitor.name} telah mengisi form SKD untuk antrean #${
				queue.queueNumber
			}-${formatQueueDate(new Date(queue.createdAt))} `,
			isRead: false,
		});
	}

	return {
		ok: true as const,
		message: filled ? "SKD form marked as filled" : "SKD form marked as not filled",
		queue: updatedQueue,
	};
}

export async function triggerSkdReminderBot(queueId: string, message?: string) {
	const queue = await prisma.queue.findUnique({
		where: { id: queueId },
		include: {
			visitor: {
				select: {
					name: true,
					phone: true,
				},
			},
		},
	});

	if (!queue) {
		return { ok: false as const, status: 404, error: "Queue not found" };
	}

	if (queue.filledSKD) {
		return {
			ok: false as const,
			status: 400,
			error: "SKD sudah diisi, pengingat tidak diperlukan",
		};
	}

	const reminderMessage =
		message?.trim() && message.trim().length > 0
			? message.trim()
			: buildDefaultSkdReminderMessage(queue.visitor.name);

	const result = await sendWhatsAppBotReminder(queue.visitor.phone, reminderMessage);

	if (result.success) {
		createNotificationAsync({
			type: "REMINDER_SKD",
			title: "Pengingat SKD",
			message: `Pengingat SKD telah dikirim ke ${queue.visitor.name}`,
			isRead: false,
		});
	}

	if (!result.success) {
		return { ok: false as const, status: 400, error: result.message };
	}

	return { ok: true as const, data: result.data };
}
