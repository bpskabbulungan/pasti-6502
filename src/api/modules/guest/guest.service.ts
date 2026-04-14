import { createHash } from "crypto";
import { nanoid } from "nanoid";
import { QueueStatus, ServiceStatus } from "@prisma/client";
import prisma from "@api/infrastructure/database/prisma";
import { createGuestParticipantPair } from "@api/modules/participants";
import {
  allocateNextQueueNumber,
  normalizeQueueDate,
} from "@api/modules/queues/queue-counter.service";
import { guestSchema } from "@shared/schemas/guest";
import { formatGuestQueueCode } from "@shared/utils/guest-queue-code";

export type GuestSubmissionResult = {
  queueId: string;
  queueNumber: number;
  queueCode: string;
  status: QueueStatus;
  serviceName: string;
  guestName: string;
  trackingLink: string | null;
  officerName?: string | null;
};

type GuestQueueDetailResult = GuestSubmissionResult & {
  filledSKD: boolean;
  serviceRating: number | null;
  serviceFeedback: string | null;
  feedbackSubmittedAt: string | null;
};

type GuestFeedbackInput = {
  rating: number;
  comment?: string;
};

const hashPayload = (payload: unknown) =>
  createHash("sha1").update(JSON.stringify(payload)).digest("hex");

export async function listActiveGuestServices() {
  const services = await prisma.service.findMany({
    where: { status: ServiceStatus.ACTIVE },
    select: {
      id: true,
      name: true,
      status: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return { ok: true as const, services };
}

export async function getGuestQueueDetail(queueId: string, clientHash?: string | null) {
  const queue = await prisma.queue.findUnique({
    where: { id: queueId },
    include: {
      service: { select: { name: true, updatedAt: true } },
      guest: { select: { fullName: true, updatedAt: true } },
      visitor: { select: { name: true, updatedAt: true } },
      admin: { select: { name: true, updatedAt: true } },
      dutyStaff: { select: { name: true, updatedAt: true } },
    },
  });

  if (!queue) {
    return { ok: false as const, status: 404, error: "Queue not found" };
  }
  if (!queue.guest) {
    return { ok: false as const, status: 404, error: "Queue not found" };
  }

  const guestName = queue.guest?.fullName ?? queue.visitor?.name ?? "Pengunjung";
  const dutySchedule = await prisma.dutySchedule.findUnique({
    where: { scheduleDate: queue.queueDate },
    select: {
      updatedAt: true,
      staff: {
        select: {
          name: true,
          updatedAt: true,
        },
      },
    },
  });
  const officerName =
    queue.dutyStaff?.name ?? queue.admin?.name ?? dutySchedule?.staff?.name ?? null;
  const data = {
    queueId: queue.id,
    queueNumber: queue.queueNumber,
    queueCode: formatGuestQueueCode(queue.service, queue.queueNumber),
    status: queue.status,
    serviceName: queue.service.name,
    guestName,
    trackingLink: queue.trackingLink,
    officerName,
    filledSKD: Boolean(queue.filledSKD),
    serviceRating: queue.serviceRating ?? null,
    serviceFeedback: queue.serviceFeedback ?? null,
    feedbackSubmittedAt: queue.feedbackSubmittedAt?.toISOString() ?? null,
  } satisfies GuestQueueDetailResult;
  const hash = hashPayload({
    queueId: queue.id,
    queueUpdatedAt: queue.updatedAt.toISOString(),
    serviceUpdatedAt: queue.service.updatedAt.toISOString(),
    guestUpdatedAt: queue.guest?.updatedAt?.toISOString() ?? null,
    visitorUpdatedAt: queue.visitor?.updatedAt?.toISOString() ?? null,
    adminUpdatedAt: queue.admin?.updatedAt?.toISOString() ?? null,
    dutyStaffUpdatedAt: queue.dutyStaff?.updatedAt?.toISOString() ?? null,
    dutyScheduleUpdatedAt: dutySchedule?.updatedAt?.toISOString() ?? null,
    dutyScheduleStaffUpdatedAt: dutySchedule?.staff?.updatedAt?.toISOString() ?? null,
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

export async function submitGuestQueueFeedback(queueId: string, payload: GuestFeedbackInput) {
  const normalizedComment = payload.comment?.trim() ?? "";

  const queue = await prisma.queue.findUnique({
    where: { id: queueId },
    select: {
      id: true,
      guestId: true,
      status: true,
      serviceRating: true,
    },
  });

  if (!queue || !queue.guestId) {
    return { ok: false as const, status: 404, error: "Queue not found" };
  }

  if (queue.status !== QueueStatus.COMPLETED) {
    return { ok: false as const, status: 400, error: "Feedback hanya bisa diisi setelah layanan selesai" };
  }

  if (queue.serviceRating !== null) {
    return { ok: false as const, status: 409, error: "Feedback untuk antrean ini sudah tersimpan" };
  }

  const updated = await prisma.queue.update({
    where: { id: queueId },
    data: {
      serviceRating: payload.rating,
      serviceFeedback: normalizedComment.length > 0 ? normalizedComment : null,
      feedbackSubmittedAt: new Date(),
    },
    select: {
      id: true,
      serviceRating: true,
      serviceFeedback: true,
      feedbackSubmittedAt: true,
    },
  });

  if (!updated.feedbackSubmittedAt || updated.serviceRating === null) {
    return { ok: false as const, status: 500, error: "Failed to save feedback" };
  }

  return {
    ok: true as const,
    data: {
      queueId: updated.id,
      serviceRating: updated.serviceRating,
      serviceFeedback: updated.serviceFeedback ?? null,
      feedbackSubmittedAt: updated.feedbackSubmittedAt.toISOString(),
    },
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
    email: data.email.trim(),
    address: data.address.trim(),
    phone: data.phone.trim(),
    institution: data.institution.trim(),
    occupation: data.occupation.trim(),
    serviceId: data.serviceId.trim(),
  };

  const selectedService = await prisma.service.findFirst({
    where: {
      id: sanitized.serviceId,
      status: ServiceStatus.ACTIVE,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!selectedService) {
    return {
      ok: false as const,
      status: 400,
      error: "Layanan tidak tersedia atau tidak aktif",
      details: undefined,
    };
  }

  const queueDate = normalizeQueueDate(new Date());

  const transactionResult = await prisma.$transaction(async (tx) => {
    const nextQueueNumber = await allocateNextQueueNumber(tx, queueDate);
    const { visitor, guest } = await createGuestParticipantPair(tx, {
      fullName: sanitized.fullName,
      phone: sanitized.phone,
      institution: sanitized.institution,
      email: sanitized.email,
      address: sanitized.address,
      age: sanitized.age,
      gender: sanitized.gender,
      lastEducation: sanitized.lastEducation,
      occupation: sanitized.occupation,
    });

    const queue = await tx.queue.create({
      data: {
        queueNumber: nextQueueNumber,
        queueDate,
        status: QueueStatus.WAITING,
        visitorId: visitor.id,
        guestId: guest.id,
        serviceId: selectedService.id,
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
      transactionResult.queue.service,
      transactionResult.queue.queueNumber
    ),
    status: transactionResult.queue.status,
    serviceName: transactionResult.queue.service.name,
    guestName: transactionResult.guest.fullName,
    trackingLink: transactionResult.queue.trackingLink,
  };

  return {
    ok: true as const,
    data: result,
  };
}
