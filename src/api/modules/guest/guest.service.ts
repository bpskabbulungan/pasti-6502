import { nanoid } from "nanoid";
import { Purpose, QueueStatus, QueueType, ServiceStatus } from "@/generated/prisma";
import prisma from "@api/infrastructure/database/prisma";
import { guestSchema } from "@shared/schemas/guest";

const purposeToServiceName: Record<Purpose, string> = {
	[Purpose.KONSULTASI_STATISTIK]: "Konsultasi Statistik",
	[Purpose.PERPUSTAKAAN]: "Perpustakaan",
	[Purpose.REKOMENDASI_STATISTIK]: "Rekomendasi Statistik",
	[Purpose.LAINNYA]: "Konsultasi Statistik",
};

const formatQueueDate = (date: Date): string => {
	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	return `${day}${month}`;
};

export type GuestSubmissionResult = {
	queueId: string;
	queueNumber: number;
	queueCode: string;
	status: QueueStatus;
	purpose: Purpose | null;
	serviceName: string;
	guestName: string;
	trackingLink: string | null;
};

export async function processGuestSubmission(body: unknown) {
	const parsed = guestSchema.safeParse(body);

	if (!parsed.success) {
		return {
			ok: false as const,
			status: 400,
			error: "Data tidak valid",
			details: parsed.error.flatten().fieldErrors,
		};
	}

	const data = parsed.data;
	const sanitized = {
		...data,
		fullName: data.fullName.trim(),
		email: data.email?.trim() ?? null,
		address: data.address?.trim(),
		phone: data.phone.trim(),
		institution: data.institution.trim(),
		occupation: data.occupation.trim(),
	};

	const queueDate = new Date();
	queueDate.setHours(0, 0, 0, 0);

	let result: GuestSubmissionResult | null = null;

	for (let attempt = 0; attempt < 3; attempt++) {
		try {
			const transactionResult = await prisma.$transaction(async (tx) => {
				const preferredServiceName = purposeToServiceName[sanitized.purpose];
				const preferredService = await tx.service.findFirst({
					where: {
						name: preferredServiceName,
						status: ServiceStatus.ACTIVE,
					},
				});

				const fallbackService =
					preferredService ??
					(await tx.service.findFirst({
						where: { status: ServiceStatus.ACTIVE },
						orderBy: { createdAt: "asc" },
					}));

				if (!fallbackService) {
					throw new Error("NO_ACTIVE_SERVICE");
				}

				const latestQueue = await tx.queue.findFirst({
					where: {
						queueDate,
					},
					select: { queueNumber: true },
					orderBy: { queueNumber: "desc" },
				});

				const nextQueueNumber = latestQueue ? latestQueue.queueNumber + 1 : 1;

				const guest = await tx.guest.create({
					data: {
						fullName: sanitized.fullName,
						email: sanitized.email,
						address: sanitized.address,
						phone: sanitized.phone,
						age: sanitized.age,
						institution: sanitized.institution,
						gender: sanitized.gender,
						lastEducation: sanitized.lastEducation,
						occupation: sanitized.occupation,
						purpose: sanitized.purpose,
					},
				});

				const visitor = await tx.visitor.create({
					data: {
						name: sanitized.fullName,
						phone: sanitized.phone,
						institution: sanitized.institution,
						email: sanitized.email,
					},
				});

				const queue = await tx.queue.create({
					data: {
						queueNumber: nextQueueNumber,
						queueDate,
						status: QueueStatus.WAITING,
						queueType: QueueType.OFFLINE,
						visitorId: visitor.id,
						guestId: guest.id,
						serviceId: fallbackService.id,
						trackingLink: nanoid(10),
						filledSKD: false,
					},
					include: { service: true },
				});

				return { guest, queue };
			});

			result = {
				queueId: transactionResult.queue.id,
				queueNumber: transactionResult.queue.queueNumber,
				queueCode: `${transactionResult.queue.queueNumber}-${formatQueueDate(
					new Date(transactionResult.queue.createdAt)
				)}`,
				status: transactionResult.queue.status,
				purpose: transactionResult.guest.purpose,
				serviceName: transactionResult.queue.service.name,
				guestName: transactionResult.guest.fullName,
				trackingLink: transactionResult.queue.trackingLink,
			};
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
		data: result,
	};
}
