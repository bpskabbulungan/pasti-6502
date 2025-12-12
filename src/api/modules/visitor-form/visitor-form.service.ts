import { createHash } from "crypto";
import { v4 as uuidv4 } from "uuid";
import { nanoid } from "nanoid";
import prisma from "@api/infrastructure/database/prisma";
import {
	QueueStatus,
	QueueType,
	ServiceStatus,
} from "@/generated/prisma";
import { visitorSubmissionSchema } from "@shared/schemas/visitor-form";
import type { VisitorFormTrackResponse } from "@shared/types/visitor-form";

const hashPayload = (payload: unknown) =>
	createHash("sha256").update(JSON.stringify(payload)).digest("hex");

const formatQueueDate = (date: Date): string => {
	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	return `${day}${month}`;
};

export async function generateDynamicUuid(staticUuid: string) {
	const qrCode = await prisma.qRCode.findUnique({
		where: { staticUuid },
	});

	if (!qrCode) {
		const tempVisitorLink = await prisma.tempVisitorLink.findUnique({
			where: { uuid: staticUuid },
		});
		if (!tempVisitorLink) {
			return { ok: false as const, status: 400, error: "Invalid visitor UUID" };
		}
		return { ok: false as const, status: 404, error: "Invalid QR code" };
	}

	const dynamicUuid = uuidv4();
	const expiresAt = new Date();
	expiresAt.setHours(expiresAt.getHours() + 1);

	await prisma.tempVisitorLink.create({
		data: {
			uuid: dynamicUuid,
			expiresAt,
			used: false,
		},
	});

	return { ok: true as const, dynamicUuid };
}

export async function getVisitorServices(visitorUuid: string) {
	const tempVisitorLink = await prisma.tempVisitorLink.findUnique({
		where: { uuid: visitorUuid },
	});

	if (!tempVisitorLink) {
		return { ok: false as const, status: 400, error: "Invalid visitor UUID" };
	}

	if (new Date() > tempVisitorLink.expiresAt) {
		return { ok: false as const, status: 400, error: "Link has expired" };
	}

	if (tempVisitorLink.used) {
		return { ok: false as const, status: 400, error: "Link has already been used" };
	}

	const services = await prisma.service.findMany({
		where: {
			status: ServiceStatus.ACTIVE,
		},
		select: {
			id: true,
			name: true,
			status: true,
		},
	});

	return { ok: true as const, services };
}

export async function submitVisitorForm(body: unknown) {
	const parsed = visitorSubmissionSchema.safeParse(body);

	if (!parsed.success) {
		return {
			ok: false as const,
			status: 400,
			error: "Data tidak valid",
			details: parsed.error.flatten().fieldErrors,
		};
	}

	const {
		name,
		phone,
		institution,
		email,
		address,
		age,
		gender,
		lastEducation,
		occupation,
		purpose,
		serviceId,
		tempUuid,
		queueType,
	} = parsed.data;

	const sanitized = {
		name: name.trim(),
		phone: phone.trim(),
		institution: institution.trim(),
		email: email.trim(),
		address: address.trim(),
		age,
		gender,
		lastEducation,
		occupation: occupation.trim(),
		purpose,
		serviceId: serviceId.trim(),
		tempUuid: tempUuid.trim(),
		queueType,
	};

	const tempVisitorLink = await prisma.tempVisitorLink.findUnique({
		where: { uuid: sanitized.tempUuid },
	});

	if (!tempVisitorLink) {
		return { ok: false as const, status: 400, error: "Invalid temporary link" };
	}

	if (tempVisitorLink.used) {
		return { ok: false as const, status: 400, error: "This form has already been submitted" };
	}

	if (new Date() > tempVisitorLink.expiresAt) {
		return { ok: false as const, status: 400, error: "Link has expired" };
	}

	const queueDate = new Date();
	queueDate.setHours(0, 0, 0, 0);

	let result: {
		visitor: { name: string };
		queue: {
			queueNumber: number;
			createdAt: Date;
			queueType: QueueType;
			service: { name: string };
		};
	} | null = null;

	for (let attempt = 0; attempt < 3; attempt++) {
		try {
			result = await prisma.$transaction(async (tx) => {
				const latestQueue = await tx.queue.findFirst({
					where: {
						queueDate,
					},
					orderBy: {
						queueNumber: "desc",
					},
					select: { queueNumber: true },
				});

				const nextQueueNumber = latestQueue ? latestQueue.queueNumber + 1 : 1;

				const visitor = await tx.visitor.create({
					data: {
						name: sanitized.name,
						phone: sanitized.phone,
						institution: sanitized.institution,
						email: sanitized.email,
						address: sanitized.address,
						age: sanitized.age,
						gender: sanitized.gender,
						lastEducation: sanitized.lastEducation,
						occupation: sanitized.occupation,
						purpose: sanitized.purpose,
					},
				});

				const trackingLink = `${nanoid(10)}`;
				const queue = await tx.queue.create({
					data: {
						queueNumber: nextQueueNumber,
						queueDate,
						status: QueueStatus.WAITING,
						queueType:
							sanitized.queueType === "ONLINE"
								? QueueType.ONLINE
								: QueueType.OFFLINE,
						visitorId: visitor.id,
						serviceId: sanitized.serviceId,
						tempUuid: sanitized.tempUuid,
						trackingLink: trackingLink,
						filledSKD: false,
					},
					include: {
						service: true,
					},
				});

				await tx.tempVisitorLink.update({
					where: { uuid: sanitized.tempUuid },
					data: { used: true },
				});

				await tx.notification.create({
					data: {
						type: "NEW_QUEUE",
						title: "Antrean Baru",
						message: `Antrean baru #${queue.queueNumber}-${formatQueueDate(
							new Date(queue.createdAt)
						)} (${queue.queueType === "ONLINE" ? "Online" : "Offline"}) dari ${
							visitor.name
						} untuk layanan ${queue.service.name}`,
						isRead: false,
					},
				});

				return { visitor, queue };
			});
			break;
		} catch (error) {
			if ((error as { code?: string }).code === "P2002" && attempt < 2) {
				continue;
			}
			throw error;
		}
	}

	if (!result) {
		return {
			ok: false as const,
			status: 409,
			error: "Gagal menetapkan nomor antrean, coba lagi.",
		};
	}

	return {
		ok: true as const,
		data: {
			queueNumber: result.queue.queueNumber,
			serviceName: result.queue.service.name,
			visitorName: result.visitor.name,
			createdAt: result.queue.createdAt,
			queueType: result.queue.queueType,
			redirectUrl: `/visitor-form/${sanitized.tempUuid}`,
		},
	};
}

export async function trackVisitorQueue(
	visitorUuid: string,
	clientHash?: string | null
): Promise<
	| { ok: true; data: VisitorFormTrackResponse }
	| { ok: false; status: number; error: string }
> {
	const tempVisitorLink = await prisma.tempVisitorLink.findUnique({
		where: { uuid: visitorUuid },
	});

	if (!tempVisitorLink) {
		return { ok: false as const, status: 400, error: "Invalid visitor UUID" };
	}

	const queue = await prisma.queue.findFirst({
		where: { tempUuid: visitorUuid },
		include: {
			service: {
				select: {
					name: true,
				},
			},
			visitor: {
				select: {
					name: true,
					phone: true,
				},
			},
		},
	});

	if (!queue) {
		if (!tempVisitorLink.used) {
			return {
				ok: true as const,
				data: {
					tracking: {
						status: "NOT_SUBMITTED",
						message: "Form belum diisi, silahkan isi formulir terlebih dahulu",
					},
					hash: hashPayload({ status: "NOT_SUBMITTED" }),
					hasChanges: true,
				},
			};
		}

		return { ok: false as const, status: 404, error: "Antrean tidak ditemukan" };
	}

	const currentDate = new Date();
	currentDate.setHours(0, 0, 0, 0);
	const tomorrow = new Date(currentDate);
	tomorrow.setDate(currentDate.getDate() + 1);

	const waitingQueuesBeforeThis = await prisma.queue.count({
		where: {
			queueDate: {
				gte: currentDate,
				lt: tomorrow,
			},
			queueNumber: { lt: queue.queueNumber },
			status: "WAITING",
		},
	});

	const trackingData = {
		queueNumber: queue.queueNumber,
		serviceName: queue.service.name,
		visitorName: queue.visitor.name,
		status: queue.status,
		queueType: queue.queueType,
		waitingBefore: waitingQueuesBeforeThis,
		estimated: waitingQueuesBeforeThis * 10,
		createdAt: queue.createdAt,
		startTime: queue.startTime,
		endTime: queue.endTime,
		filledSKD: queue.filledSKD || false,
	};

	const serverHash = hashPayload(trackingData);
	const hasChanges = !clientHash || clientHash !== serverHash;

	return {
		ok: true as const,
		data: {
			tracking: {
				status: "SUCCESS",
				queue: trackingData,
			},
			hash: serverHash,
			hasChanges,
		},
	};
}

export async function markSkdFilled(tempUuid: string, filled: boolean) {
	const updatedQueue = await prisma.queue.update({
		where: { tempUuid },
		data: { filledSKD: filled },
		include: {
			visitor: {
				select: {
					name: true,
				},
			},
		},
	});

	if (!updatedQueue) {
		return { ok: false as const, status: 404, error: "Queue not found" };
	}

	if (filled) {
		await prisma.notification.create({
			data: {
				type: "SKD_FILLED",
				title: "SKD Diisi",
				message: `Pengunjung ${
					updatedQueue.visitor.name
				} telah mengisi form SKD untuk antrean #${
					updatedQueue.queueNumber
				}-${formatQueueDate(new Date(updatedQueue.createdAt))} `,
				isRead: false,
			},
		});
	}

	return {
		ok: true as const,
		message: filled ? "SKD form marked as filled" : "SKD form marked as not filled",
	};
}
