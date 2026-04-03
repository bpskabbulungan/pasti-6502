import { Prisma } from "@prisma/client";

const isUniqueConstraintError = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

export const normalizeQueueDate = (date: Date) => {
  const queueDate = new Date(date);
  queueDate.setHours(0, 0, 0, 0);
  return queueDate;
};

export async function allocateNextQueueNumber(tx: Prisma.TransactionClient, date: Date) {
  const queueDate = normalizeQueueDate(date);
  const existingCounter = await tx.queueCounter.findUnique({
    where: { queueDate },
    select: { lastNumber: true },
  });

  if (existingCounter) {
    const updatedCounter = await tx.queueCounter.update({
      where: { queueDate },
      data: {
        lastNumber: {
          increment: 1,
        },
      },
      select: { lastNumber: true },
    });

    return updatedCounter.lastNumber;
  }

  const currentMax = await tx.queue.aggregate({
    where: { queueDate },
    _max: { queueNumber: true },
  });
  const nextQueueNumber = (currentMax._max.queueNumber ?? 0) + 1;

  try {
    const createdCounter = await tx.queueCounter.create({
      data: {
        queueDate,
        lastNumber: nextQueueNumber,
      },
      select: { lastNumber: true },
    });

    return createdCounter.lastNumber;
  } catch (error) {
    if (!isUniqueConstraintError(error)) {
      throw error;
    }

    const updatedCounter = await tx.queueCounter.update({
      where: { queueDate },
      data: {
        lastNumber: {
          increment: 1,
        },
      },
      select: { lastNumber: true },
    });

    return updatedCounter.lastNumber;
  }
}
