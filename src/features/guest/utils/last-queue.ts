import type { QueueStatus } from "@/shared/constants/enums";

export const LAST_GUEST_QUEUE_STORAGE_KEY = "pasti:last-guest-queue";

export type LastGuestQueue = {
  queueId: string;
  queueCode?: string | null;
  status?: QueueStatus | null;
  updatedAt: string;
};

const isQueueStatus = (value: unknown): value is QueueStatus =>
  value === "WAITING" || value === "SERVING" || value === "COMPLETED" || value === "CANCELED";

const sanitizeString = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

export const readLastGuestQueue = (): LastGuestQueue | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(LAST_GUEST_QUEUE_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<LastGuestQueue> | null;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const queueId = sanitizeString(parsed.queueId);
    if (!queueId) {
      return null;
    }

    const queueCode = sanitizeString(parsed.queueCode);
    const status = isQueueStatus(parsed.status) ? parsed.status : null;
    const updatedAt = sanitizeString(parsed.updatedAt) ?? new Date().toISOString();

    return {
      queueId,
      queueCode,
      status,
      updatedAt,
    };
  } catch {
    return null;
  }
};

export const saveLastGuestQueue = (
  payload: Pick<LastGuestQueue, "queueId" | "queueCode" | "status"> & {
    updatedAt?: string;
  }
) => {
  if (typeof window === "undefined") {
    return;
  }

  const queueId = sanitizeString(payload.queueId);
  if (!queueId) {
    return;
  }

  const nextPayload: LastGuestQueue = {
    queueId,
    queueCode: sanitizeString(payload.queueCode),
    status: isQueueStatus(payload.status) ? payload.status : null,
    updatedAt: sanitizeString(payload.updatedAt) ?? new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(LAST_GUEST_QUEUE_STORAGE_KEY, JSON.stringify(nextPayload));
  } catch {
    // Ignore write failures (private mode, quota, etc)
  }
};

