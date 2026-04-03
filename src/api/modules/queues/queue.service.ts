import { Prisma, QueueStatus } from "@prisma/client";
import prisma from "@api/infrastructure/database/prisma";
import { generateQueueHash } from "./queue.utils";
import type { QueueDetail } from "@shared/types/queue";

type DateFilter = "today" | "all";

const sanitizeLimit = (limitParam?: string | null) => {
  if (limitParam === null || typeof limitParam === "undefined") return undefined;
  const parsed = Number.parseInt(limitParam, 10);
  if (Number.isNaN(parsed)) return undefined;
  return Math.min(Math.max(parsed, 1), 500);
};

const sanitizeOffset = (offsetParam?: string | null) => {
  if (offsetParam === null || typeof offsetParam === "undefined") return undefined;
  const parsed = Number.parseInt(offsetParam, 10);
  if (Number.isNaN(parsed)) return undefined;
  return Math.max(parsed, 0);
};

type QueueListParams = {
  status: QueueStatus;
  dateFilter?: DateFilter;
  clientHash?: string;
  limit?: string | null;
  offset?: string | null;
};

type QueueListResult = {
  queues: QueueDetail[];
  hash: string;
  hasChanges: boolean;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
};

export async function getQueues({
  status,
  dateFilter = "today",
  clientHash = "",
  limit: limitParam,
  offset: offsetParam,
}: QueueListParams): Promise<QueueListResult> {
  const limit = sanitizeLimit(limitParam);
  const offset = sanitizeOffset(offsetParam);

  const whereClause: Prisma.QueueWhereInput = {
    status,
  };

  if (dateFilter === "today") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    whereClause.queueDate = {
      gte: today,
      lt: tomorrow,
    };
  }

  const queueAggregate = await prisma.queue.aggregate({
    where: whereClause,
    _count: { _all: true },
    _max: { updatedAt: true },
  });

  const total = queueAggregate._count._all;
  const serverHash = generateQueueHash([
    {
      total,
      latestUpdatedAt: queueAggregate._max.updatedAt?.toISOString() ?? null,
      limit: limit ?? total,
      offset: offset ?? 0,
    },
  ]);
  const hasChanges = !clientHash || clientHash !== serverHash;

  const pagination = {
    total,
    limit: limit ?? total,
    offset: offset ?? 0,
    hasMore: limit !== undefined && offset !== undefined ? offset + limit < total : false,
  };

  if (!hasChanges) {
    return {
      queues: [],
      hash: serverHash,
      hasChanges,
      pagination,
    };
  }

  const queues = await prisma.queue.findMany({
    where: whereClause,
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
    take: limit,
    skip: offset,
  });

  return {
    queues,
    hash: serverHash,
    hasChanges,
    pagination,
  };
}
