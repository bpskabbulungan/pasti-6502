import { getRedisClient } from "@/api/infrastructure/cache/redis";

type CounterSnapshot = {
  count: number;
  expiresAt: number;
};

type LoginAttemptStatus = {
  blocked: boolean;
  resetAt: number;
};

type LoginAttemptStore = {
  read: (key: string) => Promise<CounterSnapshot | null>;
  increment: (key: string, windowMs: number) => Promise<CounterSnapshot>;
  clear: (key: string) => Promise<void>;
};

type AuthRequestHeaders = Headers | Record<string, string | string[] | undefined> | undefined;

const IP_ATTEMPT_LIMIT = 10;
const IP_ATTEMPT_WINDOW_MS = 10 * 60_000;
const USER_ATTEMPT_LIMIT = 6;
const USER_ATTEMPT_WINDOW_MS = 15 * 60_000;
const MEMORY_BUCKET_CLEANUP_INTERVAL_MS = 60_000;

const memoryBuckets = new Map<string, CounterSnapshot>();
let lastMemoryBucketCleanupAt = 0;

const normalizeUsernameForKey = (username: string) => username.trim().toLowerCase();

const sanitizeIpAddress = (value: string | null | undefined) => {
  if (!value) return "unknown";
  return value.split(",")[0]?.trim() || "unknown";
};

const readHeaderFromObject = (
  headers: Record<string, string | string[] | undefined>,
  key: string
) => {
  const value = headers[key];
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
};

const getHeaderValue = (headers: AuthRequestHeaders, key: string): string | null => {
  if (!headers) {
    return null;
  }

  if (headers instanceof Headers) {
    return headers.get(key);
  }

  const loweredKey = key.toLowerCase();
  return (
    readHeaderFromObject(headers, loweredKey) ??
    readHeaderFromObject(headers, key) ??
    readHeaderFromObject(headers, key.toUpperCase())
  );
};

export const getAuthRequestIp = (headers: AuthRequestHeaders): string => {
  const xForwardedFor = sanitizeIpAddress(getHeaderValue(headers, "x-forwarded-for"));
  if (xForwardedFor !== "unknown") {
    return xForwardedFor;
  }

  const xRealIp = sanitizeIpAddress(getHeaderValue(headers, "x-real-ip"));
  if (xRealIp !== "unknown") {
    return xRealIp;
  }

  return "unknown";
};

const cleanupExpiredMemoryBuckets = (now: number) => {
  if (now - lastMemoryBucketCleanupAt < MEMORY_BUCKET_CLEANUP_INTERVAL_MS) {
    return;
  }

  lastMemoryBucketCleanupAt = now;
  for (const [key, snapshot] of memoryBuckets.entries()) {
    if (snapshot.expiresAt <= now) {
      memoryBuckets.delete(key);
    }
  }
};

const memoryStore: LoginAttemptStore = {
  async read(key) {
    const now = Date.now();
    cleanupExpiredMemoryBuckets(now);
    const snapshot = memoryBuckets.get(key);
    if (!snapshot || snapshot.expiresAt <= now) {
      memoryBuckets.delete(key);
      return null;
    }
    return snapshot;
  },
  async increment(key, windowMs) {
    const now = Date.now();
    cleanupExpiredMemoryBuckets(now);

    const existing = memoryBuckets.get(key);
    if (!existing || existing.expiresAt <= now) {
      const snapshot = {
        count: 1,
        expiresAt: now + windowMs,
      };
      memoryBuckets.set(key, snapshot);
      return snapshot;
    }

    const next = {
      count: existing.count + 1,
      expiresAt: existing.expiresAt,
    };
    memoryBuckets.set(key, next);
    return next;
  },
  async clear(key) {
    memoryBuckets.delete(key);
  },
};

const buildRedisStore = (): LoginAttemptStore | null => {
  let redis: ReturnType<typeof getRedisClient>;
  try {
    redis = getRedisClient();
  } catch (error) {
    console.error("Login attempt Redis store unavailable", error);
    return null;
  }

  if (!redis) {
    return null;
  }

  return {
    async read(key) {
      const redisKey = `auth:login:attempts:${key}`;
      const [countRaw, ttlMs] = await Promise.all([redis.get(redisKey), redis.pttl(redisKey)]);
      const count = Number.parseInt(countRaw ?? "", 10);
      if (!Number.isFinite(count) || count <= 0 || ttlMs <= 0) {
        return null;
      }
      return {
        count,
        expiresAt: Date.now() + ttlMs,
      };
    },
    async increment(key, windowMs) {
      const redisKey = `auth:login:attempts:${key}`;
      const count = await redis.incr(redisKey);
      await redis.pexpire(redisKey, windowMs, "NX");
      const ttlMs = await redis.pttl(redisKey);
      const safeTtlMs = ttlMs > 0 ? ttlMs : windowMs;
      return {
        count,
        expiresAt: Date.now() + safeTtlMs,
      };
    },
    async clear(key) {
      const redisKey = `auth:login:attempts:${key}`;
      await redis.del(redisKey);
    },
  };
};

const resolveStore = (): LoginAttemptStore => {
  const redisStore = buildRedisStore();
  if (redisStore) {
    return redisStore;
  }
  return memoryStore;
};

const ipKey = (ip: string) => `ip:${ip}`;
const usernameKey = (username: string) => `username:${normalizeUsernameForKey(username)}`;

const evaluateSnapshots = (
  ipSnapshot: CounterSnapshot | null,
  usernameSnapshot: CounterSnapshot | null
): LoginAttemptStatus => {
  const blockedByIp = (ipSnapshot?.count ?? 0) >= IP_ATTEMPT_LIMIT;
  const blockedByUsername = (usernameSnapshot?.count ?? 0) >= USER_ATTEMPT_LIMIT;
  if (!blockedByIp && !blockedByUsername) {
    return { blocked: false, resetAt: 0 };
  }

  const resetCandidates = [
    blockedByIp ? (ipSnapshot?.expiresAt ?? 0) : 0,
    blockedByUsername ? (usernameSnapshot?.expiresAt ?? 0) : 0,
  ].filter((value) => value > 0);

  return {
    blocked: true,
    resetAt: resetCandidates.length > 0 ? Math.min(...resetCandidates) : 0,
  };
};

export const getFailedLoginAttemptStatus = async (
  ip: string,
  username: string
): Promise<LoginAttemptStatus> => {
  const store = resolveStore();
  const [ipSnapshot, usernameSnapshot] = await Promise.all([
    store.read(ipKey(ip)),
    store.read(usernameKey(username)),
  ]);

  return evaluateSnapshots(ipSnapshot, usernameSnapshot);
};

export const registerFailedLoginAttempt = async (
  ip: string,
  username: string
): Promise<LoginAttemptStatus> => {
  const store = resolveStore();
  const [ipSnapshot, usernameSnapshot] = await Promise.all([
    store.increment(ipKey(ip), IP_ATTEMPT_WINDOW_MS),
    store.increment(usernameKey(username), USER_ATTEMPT_WINDOW_MS),
  ]);

  return evaluateSnapshots(ipSnapshot, usernameSnapshot);
};

export const clearFailedLoginAttempts = async (ip: string, username: string) => {
  const store = resolveStore();
  await Promise.all([store.clear(ipKey(ip)), store.clear(usernameKey(username))]);
};
