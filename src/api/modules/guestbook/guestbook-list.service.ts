import { createHash } from "crypto";
import { QueueStatus, Prisma } from "@prisma/client";
import prisma from "@api/infrastructure/database/prisma";
import type { GuestbookEntry, GuestbookListResponse } from "@shared/types/guestbook";
import {
  getDayRangeInTimeZone,
  parseDateOnlyInTimeZone,
  toIsoDateInTimeZone,
} from "@shared/utils/date-boundary";
import { formatGuestQueueCode } from "@shared/utils/guest-queue-code";

type DateFilter = "today" | "all" | "year" | "month" | "quarter" | "semester";
type GuestbookSortBy =
  | "createdAt"
  | "fullName"
  | "serviceName"
  | "queueCode"
  | "officerName"
  | "filledSKD";
type GuestbookSortOrder = "asc" | "desc";

type GuestbookListParams = {
  status?: string | null;
  dateFilter?: DateFilter;
  year?: string | null;
  month?: string | null;
  quarter?: string | null;
  semester?: string | null;
  sortBy?: string | null;
  sortOrder?: string | null;
  search?: string | null;
  limit?: string | null;
  offset?: string | null;
  clientHash?: string | null;
};

const ALLOWED_STATUSES: QueueStatus[] = [QueueStatus.COMPLETED, QueueStatus.CANCELED];

const hashPayload = (payload: unknown) =>
  createHash("sha256").update(JSON.stringify(payload)).digest("hex");

const guestbookQueueWithRelations = {
  include: {
    guest: true,
    service: { select: { name: true } },
    admin: { select: { name: true } },
    dutyStaff: { select: { name: true } },
  },
} satisfies Prisma.QueueFindManyArgs;

type GuestbookQueueWithRelations = Prisma.QueueGetPayload<typeof guestbookQueueWithRelations>;

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

const sanitizeYear = (value?: string | null) => {
  if (value === null || typeof value === "undefined") return undefined;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return undefined;
  if (parsed < 2000 || parsed > 2100) return undefined;
  return parsed;
};

const sanitizeMonth = (value?: string | null) => {
  if (value === null || typeof value === "undefined") return undefined;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return undefined;
  if (parsed < 1 || parsed > 12) return undefined;
  return parsed;
};

const sanitizeQuarter = (value?: string | null) => {
  if (value === null || typeof value === "undefined") return undefined;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return undefined;
  if (parsed < 1 || parsed > 4) return undefined;
  return parsed;
};

const sanitizeSemester = (value?: string | null) => {
  if (value === null || typeof value === "undefined") return undefined;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return undefined;
  if (parsed < 1 || parsed > 2) return undefined;
  return parsed;
};

const parseStatus = (value?: string | null) => {
  if (!value || value === "ALL") return null;
  const normalized = value.toUpperCase();
  return ALLOWED_STATUSES.includes(normalized as QueueStatus) ? (normalized as QueueStatus) : null;
};

const parseSortBy = (value?: string | null): GuestbookSortBy => {
  if (!value) return "createdAt";
  if (
    value === "createdAt" ||
    value === "fullName" ||
    value === "serviceName" ||
    value === "queueCode" ||
    value === "officerName" ||
    value === "filledSKD"
  ) {
    return value;
  }
  return "createdAt";
};

const parseSortOrder = (value?: string | null): GuestbookSortOrder => {
  if (!value) return "desc";
  return value === "asc" ? "asc" : "desc";
};

const parseDateFilter = (value?: string | null): DateFilter => {
  if (
    value === "today" ||
    value === "all" ||
    value === "year" ||
    value === "month" ||
    value === "quarter" ||
    value === "semester"
  ) {
    return value;
  }
  return "today";
};

const createDateOnly = (year: number, month: number, day: number) =>
  `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const resolvePeriodRange = ({
  dateFilter,
  year,
  month,
  quarter,
  semester,
}: {
  dateFilter: DateFilter;
  year?: number;
  month?: number;
  quarter?: number;
  semester?: number;
}) => {
  if (dateFilter === "all") {
    return null;
  }

  if (dateFilter === "today") {
    return getDayRangeInTimeZone(new Date());
  }

  const [currentYearText, currentMonthText] = toIsoDateInTimeZone(new Date()).split("-");
  const currentYear = Number.parseInt(currentYearText ?? "", 10);
  const currentMonth = Number.parseInt(currentMonthText ?? "", 10);

  const normalizedYear = year ?? (Number.isNaN(currentYear) ? new Date().getFullYear() : currentYear);
  const normalizedMonth = month ?? (Number.isNaN(currentMonth) ? new Date().getMonth() + 1 : currentMonth);
  const normalizedQuarter =
    quarter ?? (Number.isNaN(currentMonth) ? Math.ceil((new Date().getMonth() + 1) / 3) : Math.ceil(currentMonth / 3));
  const normalizedSemester =
    semester ?? (Number.isNaN(currentMonth) ? (new Date().getMonth() + 1 <= 6 ? 1 : 2) : currentMonth <= 6 ? 1 : 2);

  const startYear = normalizedYear;
  let startMonth = 1;
  let endYear = normalizedYear + 1;
  let endMonth = 1;

  if (dateFilter === "month") {
    startMonth = normalizedMonth;
    if (normalizedMonth === 12) {
      endYear = normalizedYear + 1;
      endMonth = 1;
    } else {
      endYear = normalizedYear;
      endMonth = normalizedMonth + 1;
    }
  }

  if (dateFilter === "quarter") {
    startMonth = (normalizedQuarter - 1) * 3 + 1;
    const computedEndMonth = startMonth + 3;
    if (computedEndMonth > 12) {
      endYear = normalizedYear + 1;
      endMonth = computedEndMonth - 12;
    } else {
      endYear = normalizedYear;
      endMonth = computedEndMonth;
    }
  }

  if (dateFilter === "semester") {
    startMonth = normalizedSemester === 1 ? 1 : 7;
    if (normalizedSemester === 1) {
      endYear = normalizedYear;
      endMonth = 7;
    } else {
      endYear = normalizedYear + 1;
      endMonth = 1;
    }
  }

  const start = parseDateOnlyInTimeZone(createDateOnly(startYear, startMonth, 1));
  const end = parseDateOnlyInTimeZone(createDateOnly(endYear, endMonth, 1));
  if (!start || !end) {
    return null;
  }

  return { start, end };
};

const buildOrderBy = ({
  sortBy,
  sortOrder,
}: {
  sortBy: GuestbookSortBy;
  sortOrder: GuestbookSortOrder;
}): Prisma.QueueOrderByWithRelationInput[] => {
  if (sortBy === "fullName") {
    return [{ guest: { fullName: sortOrder } }, { createdAt: "desc" }, { id: "asc" }];
  }

  if (sortBy === "serviceName") {
    return [{ service: { name: sortOrder } }, { createdAt: "desc" }, { id: "asc" }];
  }

  if (sortBy === "queueCode") {
    return [{ service: { name: sortOrder } }, { queueNumber: sortOrder }, { createdAt: "desc" }, { id: "asc" }];
  }

  if (sortBy === "officerName") {
    return [
      { dutyStaff: { name: sortOrder } },
      { admin: { name: sortOrder } },
      { createdAt: "desc" },
      { id: "asc" },
    ];
  }

  if (sortBy === "filledSKD") {
    return [{ filledSKD: sortOrder }, { createdAt: "desc" }, { id: "asc" }];
  }

  return [{ createdAt: sortOrder }, { id: sortOrder }];
};

const buildGuestbookBaseWhere = ({
  dateFilter,
  year,
  month,
  quarter,
  semester,
  search,
}: Pick<
  GuestbookListParams,
  "dateFilter" | "year" | "month" | "quarter" | "semester" | "search"
>) => {
  const normalizedDateFilter = parseDateFilter(dateFilter);
  const periodRange = resolvePeriodRange({
    dateFilter: normalizedDateFilter,
    year: sanitizeYear(year),
    month: sanitizeMonth(month),
    quarter: sanitizeQuarter(quarter),
    semester: sanitizeSemester(semester),
  });
  const searchTerm = search?.trim() ?? "";

  const baseWhere: Prisma.QueueWhereInput = {
    guestId: { not: null },
    status: { in: ALLOWED_STATUSES },
  };

  if (periodRange) {
    baseWhere.queueDate = { gte: periodRange.start, lt: periodRange.end };
  }

  if (searchTerm) {
    const numericSearch = Number.parseInt(searchTerm, 10);
    const searchFilters: Prisma.QueueWhereInput[] = [
      {
        guest: {
          is: {
            fullName: { contains: searchTerm },
          },
        },
      },
      {
        guest: {
          is: {
            phone: { contains: searchTerm },
          },
        },
      },
      {
        guest: {
          is: {
            institution: { contains: searchTerm },
          },
        },
      },
      {
        guest: {
          is: {
            email: { contains: searchTerm },
          },
        },
      },
      {
        admin: {
          is: {
            name: { contains: searchTerm },
          },
        },
      },
      {
        dutyStaff: {
          is: {
            name: { contains: searchTerm },
          },
        },
      },
    ];

    if (!Number.isNaN(numericSearch)) {
      searchFilters.push({ queueNumber: numericSearch });
    }

    baseWhere.OR = searchFilters;
  }

  return baseWhere;
};

const toGuestbookEntry = (queue: GuestbookQueueWithRelations): GuestbookEntry => {
  const guest = queue.guest;

  return {
    id: queue.id,
    guestId: guest?.id ?? "",
    fullName: guest?.fullName ?? "-",
    email: guest?.email ?? null,
    phone: guest?.phone ?? "-",
    address: guest?.address ?? null,
    age: guest?.age ?? null,
    institution: guest?.institution ?? null,
    gender: guest?.gender ?? null,
    lastEducation: guest?.lastEducation ?? null,
    occupation: guest?.occupation ?? null,
    queueCode: formatGuestQueueCode(queue.service, queue.queueNumber),
    status: queue.status,
    serviceName: queue.service.name,
    officerName: queue.dutyStaff?.name ?? queue.admin?.name ?? null,
    createdAt: queue.createdAt,
    startTime: queue.startTime,
    filledSKD: queue.filledSKD ?? false,
    trackingLink: queue.trackingLink ?? null,
  };
};

export async function getGuestbookEntries({
  status,
  dateFilter = "today",
  year,
  month,
  quarter,
  semester,
  sortBy: sortByParam,
  sortOrder: sortOrderParam,
  search,
  limit: limitParam,
  offset: offsetParam,
  clientHash,
}: GuestbookListParams): Promise<GuestbookListResponse> {
  const limit = sanitizeLimit(limitParam);
  const offset = sanitizeOffset(offsetParam);
  const normalizedStatus = parseStatus(status);
  const sortBy = parseSortBy(sortByParam);
  const sortOrder = parseSortOrder(sortOrderParam);
  const orderBy = buildOrderBy({ sortBy, sortOrder });
  const baseWhere = buildGuestbookBaseWhere({
    dateFilter,
    year,
    month,
    quarter,
    semester,
    search,
  });

  const listWhere: Prisma.QueueWhereInput = normalizedStatus
    ? { ...baseWhere, status: normalizedStatus }
    : baseWhere;

  const summaryWhere: Prisma.QueueWhereInput = { ...baseWhere };

  const [summaryAggregate, listAggregate, statusGroups, skdPendingCount] = await Promise.all([
    prisma.queue.aggregate({
      where: summaryWhere,
      _count: { _all: true },
      _max: { updatedAt: true },
    }),
    normalizedStatus
      ? prisma.queue.aggregate({
          where: listWhere,
          _count: { _all: true },
          _max: { updatedAt: true },
        })
      : Promise.resolve(null),
    prisma.queue.groupBy({
      by: ["status"],
      _count: { _all: true },
      where: summaryWhere,
    }),
    prisma.queue.count({
      where: { ...summaryWhere, filledSKD: false },
    }),
  ]);

  const statusSummary = {
    completed: 0,
    canceled: 0,
  };

  statusGroups.forEach((group) => {
    switch (group.status) {
      case QueueStatus.COMPLETED:
        statusSummary.completed = group._count._all;
        break;
      case QueueStatus.CANCELED:
        statusSummary.canceled = group._count._all;
        break;
      default:
        break;
    }
  });

  const summaryTotal = summaryAggregate._count._all;
  const total = normalizedStatus ? (listAggregate?._count._all ?? 0) : summaryTotal;
  const hash = hashPayload({
    pagination: {
      total,
      limit: limit ?? total,
      offset: offset ?? 0,
    },
    summary: {
      total: summaryTotal,
      completed: statusSummary.completed,
      canceled: statusSummary.canceled,
      skdPending: skdPendingCount,
    },
    sorting: {
      sortBy,
      sortOrder,
    },
    latestUpdatedAt:
      (normalizedStatus
        ? listAggregate?._max.updatedAt
        : summaryAggregate._max.updatedAt
      )?.toISOString() ?? null,
  });
  const hasChanges = !clientHash || clientHash !== hash;

  const pagination = {
    total,
    limit: limit ?? total,
    offset: offset ?? 0,
    hasMore: limit !== undefined && offset !== undefined ? offset + limit < total : false,
  };

  const summary = {
    total: summaryTotal,
    completed: statusSummary.completed,
    canceled: statusSummary.canceled,
    skdPending: skdPendingCount,
  };

  if (!hasChanges) {
    return {
      entries: [],
      pagination,
      summary,
      hash,
      hasChanges,
    };
  }

  const queues = await prisma.queue.findMany({
    ...guestbookQueueWithRelations,
    where: listWhere,
    orderBy,
    take: limit,
    skip: offset,
  });

  const entries = queues.map(toGuestbookEntry);

  return {
    entries,
    pagination,
    summary,
    hash,
    hasChanges,
  };
}
