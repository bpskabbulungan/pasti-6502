import { createHash } from "crypto";
import prisma from "@api/infrastructure/database/prisma";
import { QueueStatus } from "@prisma/client";
import { getDayRangeInTimeZone } from "@shared/utils/date-boundary";

const hashPayload = (payload: unknown) =>
  createHash("md5").update(JSON.stringify(payload)).digest("hex");

export async function getDashboardStats(clientHash?: string | null) {
  const { start: startOfToday, end: endOfToday } = getDayRangeInTimeZone(new Date());
  const whereRange = {
    queueDate: { gte: startOfToday, lt: endOfToday },
  };

  const [queueAggregate, statusGroups] = await Promise.all([
    prisma.queue.aggregate({
      where: whereRange,
      _count: { _all: true },
      _max: { updatedAt: true },
    }),
    prisma.queue.groupBy({
      by: ["status"],
      _count: { _all: true },
      where: whereRange,
    }),
  ]);

  const counts = {
    waiting: 0,
    serving: 0,
    completed: 0,
    canceled: 0,
    total: queueAggregate._count._all,
  };

  statusGroups.forEach((group) => {
    switch (group.status) {
      case QueueStatus.WAITING:
        counts.waiting = group._count._all;
        break;
      case QueueStatus.SERVING:
        counts.serving = group._count._all;
        break;
      case QueueStatus.COMPLETED:
        counts.completed = group._count._all;
        break;
      case QueueStatus.CANCELED:
        counts.canceled = group._count._all;
        break;
      default:
        break;
    }
  });

  const hash = hashPayload({
    counts,
    latestUpdatedAt: queueAggregate._max.updatedAt?.toISOString() ?? null,
  });
  const hasChanges = !clientHash || clientHash !== hash;

  if (!hasChanges) {
    return {
      counts,
      averages: {
        waitTimeMinutes: 0,
        serviceTimeMinutes: 0,
      },
      hash,
      hasChanges,
    };
  }

  const completedQueues = await prisma.queue.findMany({
    where: {
      ...whereRange,
      status: {
        in: [QueueStatus.COMPLETED, QueueStatus.SERVING],
      },
      startTime: {
        not: null,
      },
    },
    select: {
      createdAt: true,
      startTime: true,
    },
  });

  let totalWaitTimeMs = 0;
  let waitCount = 0;

  completedQueues.forEach((queue) => {
    if (queue.startTime) {
      const waitTimeMs = new Date(queue.startTime).getTime() - new Date(queue.createdAt).getTime();
      totalWaitTimeMs += waitTimeMs;
      waitCount++;
    }
  });

  const averages = {
    waitTimeMinutes: waitCount > 0 ? Math.round(totalWaitTimeMs / waitCount / (1000 * 60)) : 0,
    serviceTimeMinutes: 0, // Service time calculation removed since endTime field was removed
  };

  const statsData = {
    counts,
    averages,
  };

  return { ...statsData, hash, hasChanges };
}
