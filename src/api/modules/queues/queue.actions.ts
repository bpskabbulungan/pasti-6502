import prisma from "@api/infrastructure/database/prisma";
import { QueueStatus as PrismaQueueStatus, Role, Prisma } from "@prisma/client";
import { sendWhatsAppBotReminder } from "@api/modules/reminders";
import { QueueStatus as SharedQueueStatus } from "@shared/constants/enums";
import type { QueueDetail } from "@shared/types/queue";

const formatQueueDate = (date: Date): string => {
	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	return `${day}${month}`;
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
	const queue = await prisma.queue.findUnique({
		where: { id: queueId },
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

	const adminUser = await prisma.user.findUnique({
		where: { id: adminId },
		select: { id: true, name: true },
	});

	if (!adminUser) {
		return { ok: false as const, status: 404, error: "Admin user not found in database" };
	}

	const dutySchedule = await prisma.dutySchedule.findUnique({
		where: { scheduleDate: queue.queueDate },
		select: { staffId: true },
	});

	const updatedQueue = await prisma.queue.update({
		where: { id: queueId },
		data: {
			status: PrismaQueueStatus.SERVING,
			startTime: new Date(),
			adminId,
			dutyStaffId: dutySchedule?.staffId ?? null,
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
			dutyStaff: {
				select: {
					name: true,
				},
			},
		},
	});

	createNotificationAsync({
		type: "QUEUE_SERVING",
		title: "Antrean Sedang Dilayani",
		message: `Antrean #${updatedQueue.queueNumber}-${formatQueueDate(
			new Date(updatedQueue.createdAt)
		)} (${
			updatedQueue.queueType === "ONLINE" ? "Online" : "Offline"
		}) sedang dilayani oleh ${adminUser.name}`,
		isRead: false,
	});

	return { ok: true as const, queue: updatedQueue };
}

export async function completeQueue(queueId: string, userId: string, role: Role) {
	const queue = await prisma.queue.findUnique({
		where: { id: queueId },
	});

	if (!queue) {
		return { ok: false as const, status: 404, error: "Queue not found" };
	}

	if (queue.status !== PrismaQueueStatus.SERVING) {
		return { ok: false as const, status: 400, error: "Queue is not currently being served" };
	}

	if (role !== Role.ADMIN && queue.adminId !== userId) {
		return { ok: false as const, status: 403, error: "You are not authorized to complete this queue" };
	}

	const updatedQueue = await prisma.queue.update({
		where: { id: queueId },
		data: {
			status: PrismaQueueStatus.COMPLETED,
			endTime: new Date(),
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
			dutyStaff: {
				select: {
					name: true,
				},
			},
		},
	});

	createNotificationAsync({
		type: "QUEUE_COMPLETED",
		title: "Antrean Selesai",
		message: `Antrean #${updatedQueue.queueNumber}-${formatQueueDate(
			new Date(updatedQueue.createdAt)
		)} (${
			updatedQueue.queueType === "ONLINE" ? "Online" : "Offline"
		}) telah selesai dilayani untuk ${updatedQueue.service.name}`,
		isRead: false,
		userId,
	});

	const dayStart = new Date(queue.queueDate);
	dayStart.setHours(0, 0, 0, 0);
	const dayEnd = new Date(dayStart);
	dayEnd.setDate(dayEnd.getDate() + 1);

	const nextQueue = await prisma.queue.findFirst({
		where: {
			status: PrismaQueueStatus.WAITING,
			queueDate: {
				gte: dayStart,
				lt: dayEnd,
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
			dutyStaff: {
				select: {
					name: true,
				},
			},
		},
		orderBy: {
			queueNumber: "asc",
		},
	});

	return { ok: true as const, queue: updatedQueue, nextQueue: nextQueue ?? null };
}

export async function cancelQueue(queueId: string, userId: string, role: Role) {
	const queue = await prisma.queue.findUnique({
		where: { id: queueId },
	});

	if (!queue) {
		return { ok: false as const, status: 404, error: "Queue not found" };
	}

	const allowedStatuses: PrismaQueueStatus[] = [
		PrismaQueueStatus.WAITING,
		PrismaQueueStatus.SERVING,
	];
	if (!allowedStatuses.includes(queue.status)) {
		return { ok: false as const, status: 400, error: "Queue cannot be canceled in its current state" };
	}

	if (
		queue.status === PrismaQueueStatus.SERVING &&
		role !== Role.ADMIN &&
		queue.adminId !== userId
	) {
		return { ok: false as const, status: 403, error: "You are not authorized to cancel this queue" };
	}

	const updatedQueue = await prisma.queue.update({
		where: { id: queueId },
		data: {
			status: PrismaQueueStatus.CANCELED,
			endTime: new Date(),
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
			dutyStaff: {
				select: {
					name: true,
				},
			},
		},
	});

	createNotificationAsync({
		type: "QUEUE_CANCELED",
		title: "Antrean Dibatalkan",
		message: `Antrean #${updatedQueue.queueNumber}-${formatQueueDate(
			new Date(updatedQueue.createdAt)
		)} (${
			updatedQueue.queueType === "ONLINE" ? "Online" : "Offline"
		}) untuk layanan ${updatedQueue.service.name} telah dibatalkan`,
		isRead: false,
		userId,
	});

	return { ok: true as const, queue: updatedQueue };
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
			service: {
				select: {
					name: true,
				},
			},
		},
	});

	if (!queue) {
		return { ok: false as const, status: 404, error: "Queue not found" };
	}

	let phoneNumber = queue.visitor.phone.replace(/\s+/g, "");
	if (phoneNumber.startsWith("+62")) {
		phoneNumber = phoneNumber.substring(1);
	} else if (phoneNumber.startsWith("0")) {
		phoneNumber = "62" + phoneNumber.substring(1);
	} else if (!phoneNumber.startsWith("62")) {
		phoneNumber = "62" + phoneNumber;
	}

	const skdLink =
		process.env.NEXT_PUBLIC_SKD_LINK ?? "s.bps.go.id/skd2025_bpsbusel";
	const defaultMessage = `Halo ${queue.visitor.name}, mohon kesediaannya untuk mengisi Survei Kebutuhan Data (SKD) BPS Bulungan melalui link berikut: ${skdLink}`;
	const reminderMessage = message || defaultMessage;

	const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
		reminderMessage
	)}`;

	return {
		ok: true as const,
		data: {
			whatsappUrl,
			visitorName: queue.visitor.name,
			phone: queue.visitor.phone,
		},
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

	const skdLink =
		process.env.NEXT_PUBLIC_SKD_LINK ?? "s.bps.go.id/skd2025_bpsbusel";
	const defaultMessage = `Halo ${queue.visitor.name}, mohon kesediaannya untuk mengisi Survei Kebutuhan Data (SKD) BPS Bulungan melalui link berikut: ${skdLink}`;
	const reminderMessage = message || defaultMessage;

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
