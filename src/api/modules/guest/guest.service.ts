import { createHash } from "crypto";
import { nanoid } from "nanoid";
import { Purpose, QueueStatus, QueueType, ServiceStatus } from "@prisma/client";
import prisma from "@api/infrastructure/database/prisma";
import { createGuestParticipantPair } from "@api/modules/participants";
import {
  allocateNextQueueNumber,
  normalizeQueueDate,
} from "@api/modules/queues/queue-counter.service";
import { guestSchema } from "@shared/schemas/guest";
import { formatGuestQueueCode } from "@shared/utils/guest-queue-code";

const purposeToServiceName: Record<Purpose, string> = {
  [Purpose.KONSULTASI_STATISTIK]: "Konsultasi Statistik",
  [Purpose.PERPUSTAKAAN]: "Perpustakaan",
  [Purpose.REKOMENDASI_STATISTIK]: "Rekomendasi Statistik",
  [Purpose.LAINNYA]: "Konsultasi Statistik",
};

const hashPayload = (payload: unknown) =>
  createHash("sha256").update(JSON.stringify(payload)).digest("hex");

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

export async function getGuestQueueDetail(queueId: string, clientHash?: string | null) {
  const queue = await prisma.queue.findUnique({
    where: { id: queueId },
    include: {
      service: { select: { name: true, updatedAt: true } },
      guest: { select: { fullName: true, purpose: true, updatedAt: true } },
      visitor: { select: { name: true, updatedAt: true } },
    },
  });

  if (!queue) {
    return { ok: false as const, status: 404, error: "Queue not found" };
  }
  if (!queue.guest) {
    return { ok: false as const, status: 404, error: "Queue not found" };
  }

  const guestName = queue.guest?.fullName ?? queue.visitor?.name ?? "Pengunjung";
  const data = {
    queueId: queue.id,
    queueNumber: queue.queueNumber,
    queueCode: formatGuestQueueCode(queue.guest?.purpose, queue.queueNumber),
    status: queue.status,
    purpose: queue.guest?.purpose ?? null,
    serviceName: queue.service.name,
    guestName,
    trackingLink: queue.trackingLink,
  } satisfies GuestSubmissionResult;
  const hash = hashPayload({
    queueId: queue.id,
    queueUpdatedAt: queue.updatedAt.toISOString(),
    serviceUpdatedAt: queue.service.updatedAt.toISOString(),
    guestUpdatedAt: queue.guest?.updatedAt?.toISOString() ?? null,
    visitorUpdatedAt: queue.visitor?.updatedAt?.toISOString() ?? null,
    data,
  });
  const hasChanges = !clientHash || clientHash !== hash;

  return {
    ok: true as const,
    data: {
      ...data,
      hash,
      hasChanges,
    },
    hash,
    hasChanges,
  };
}

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

  const queueDate = normalizeQueueDate(new Date());

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

    const nextQueueNumber = await allocateNextQueueNumber(tx, queueDate);
    const { visitor, guest } = await createGuestParticipantPair(tx, {
      fullName: sanitized.fullName,
      phone: sanitized.phone,
      institution: sanitized.institution,
      email: sanitized.email,
      address: sanitized.address ?? null,
      age: sanitized.age,
      gender: sanitized.gender,
      lastEducation: sanitized.lastEducation,
      occupation: sanitized.occupation,
      purpose: sanitized.purpose,
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

  const result: GuestSubmissionResult = {
    queueId: transactionResult.queue.id,
    queueNumber: transactionResult.queue.queueNumber,
    queueCode: formatGuestQueueCode(
      transactionResult.guest.purpose,
      transactionResult.queue.queueNumber
    ),
    status: transactionResult.queue.status,
    purpose: transactionResult.guest.purpose,
    serviceName: transactionResult.queue.service.name,
    guestName: transactionResult.guest.fullName,
    trackingLink: transactionResult.queue.trackingLink,
  };

  return {
    ok: true as const,
    data: result,
  };
}
