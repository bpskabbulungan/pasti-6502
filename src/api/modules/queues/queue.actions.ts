import prisma from "@api/infrastructure/database/prisma";
import { QueueStatus, Role } from "@/generated/prisma";
import type { QueueDetail } from "@shared/types/queue";

const formatQueueDate = (date: Date): string => {
	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	return `${day}${month}`;
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

	return {
		ok: true as const,
		queue: {
			...queue,
			service: { name: queue.service.name },
			visitor: {
				name: visitorName,
				phone: visitorPhone,
				institution: visitorInstitution,
			},
			admin: queue.admin ? { name: queue.admin.name } : null,
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
	if (queue.status !== QueueStatus.WAITING) {
		return { ok: false as const, status: 400, error: "Queue is not in waiting status" };
	}

	const adminUser = await prisma.user.findUnique({
		where: { id: adminId },
		select: { id: true, name: true },
	});

	if (!adminUser) {
		return { ok: false as const, status: 404, error: "Admin user not found in database" };
	}

	const updatedQueue = await prisma.queue.update({
		where: { id: queueId },
		data: {
			status: QueueStatus.SERVING,
			startTime: new Date(),
			adminId,
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
	});

	await prisma.notification.create({
		data: {
			type: "QUEUE_SERVING",
			title: "Antrean Sedang Dilayani",
			message: `Antrean #${updatedQueue.queueNumber}-${formatQueueDate(
				new Date(updatedQueue.createdAt)
			)} (${
				updatedQueue.queueType === "ONLINE" ? "Online" : "Offline"
			}) sedang dilayani oleh ${adminUser.name}`,
			isRead: false,
		},
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

	if (queue.status !== QueueStatus.SERVING) {
		return { ok: false as const, status: 400, error: "Queue is not currently being served" };
	}

	if (role !== Role.SUPERADMIN && queue.adminId !== userId) {
		return { ok: false as const, status: 403, error: "You are not authorized to complete this queue" };
	}

	const updatedQueue = await prisma.queue.update({
		where: { id: queueId },
		data: {
			status: QueueStatus.COMPLETED,
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
		},
	});

	await prisma.notification.create({
		data: {
			type: "QUEUE_COMPLETED",
			title: "Antrean Selesai",
			message: `Antrean #${updatedQueue.queueNumber}-${formatQueueDate(
				new Date(updatedQueue.createdAt)
			)} (${
				updatedQueue.queueType === "ONLINE" ? "Online" : "Offline"
			}) telah selesai dilayani untuk ${updatedQueue.service.name}`,
			isRead: false,
			userId,
		},
	});

	return { ok: true as const, queue: updatedQueue };
}

export async function cancelQueue(queueId: string, userId: string, role: Role) {
	const queue = await prisma.queue.findUnique({
		where: { id: queueId },
	});

	if (!queue) {
		return { ok: false as const, status: 404, error: "Queue not found" };
	}

	const allowedStatuses: QueueStatus[] = [QueueStatus.WAITING, QueueStatus.SERVING];
	if (!allowedStatuses.includes(queue.status)) {
		return { ok: false as const, status: 400, error: "Queue cannot be canceled in its current state" };
	}

	if (
		queue.status === QueueStatus.SERVING &&
		role !== Role.SUPERADMIN &&
		queue.adminId !== userId
	) {
		return { ok: false as const, status: 403, error: "You are not authorized to cancel this queue" };
	}

	const updatedQueue = await prisma.queue.update({
		where: { id: queueId },
		data: {
			status: QueueStatus.CANCELED,
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
		},
	});

	await prisma.notification.create({
		data: {
			type: "QUEUE_CANCELED",
			title: "Antrean Dibatalkan",
			message: `Antrean #${updatedQueue.queueNumber}-${formatQueueDate(
				new Date(updatedQueue.createdAt)
			)} (${
				updatedQueue.queueType === "ONLINE" ? "Online" : "Offline"
			}) untuk layanan ${updatedQueue.service.name} telah dibatalkan`,
			isRead: false,
			userId,
		},
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

	const defaultMessage = `Halo ${queue.visitor.name}, mohon kesediaannya untuk mengisi Survei Kebutuhan Data (SKD) 2025 BPS Bulungan melalui link berikut: s.bps.go.id/skd2025_bpsbusel`;
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
