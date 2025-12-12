import { NextRequest } from "next/server";
import { getRedisClient } from "./redis";

type Bucket = {
	count: number;
	expiresAt: number;
};

const buckets = new Map<string, Bucket>();

const DEFAULT_LIMIT = 10;
const DEFAULT_WINDOW_MS = 60_000;

const getClientIp = (req: NextRequest): string => {
	const xfwd = req.headers.get("x-forwarded-for");
	const forwardedIp = xfwd?.split(",")[0]?.trim();
	const directIp = (req as NextRequest & { ip?: string | null }).ip;
	const realIp = req.headers.get("x-real-ip");
	return directIp ?? forwardedIp ?? realIp ?? "unknown";
};

type RateLimitResult = {
	allowed: boolean;
	remaining: number;
	resetAt: number;
};

const redisRateLimit = async (
	cacheKey: string,
	limit: number,
	windowMs: number
): Promise<RateLimitResult | null> => {
	const redis = getRedisClient();
	if (!redis) return null;

	try {
		const now = Date.now();
		const redisKey = `rl:${cacheKey}`;
		const [[, count]] = (await redis
			.multi()
			.incr(redisKey)
			.pexpire(redisKey, windowMs, "NX")
			.exec()) as [[null, number]];

		const ttl = await redis.pttl(redisKey);
		const remainingTtl = ttl > 0 ? ttl : windowMs;
		const remaining = Math.max(0, limit - count);

		return {
			allowed: count <= limit,
			remaining,
			resetAt: now + remainingTtl,
		};
	} catch (error) {
		console.error("Redis rate limit failed, falling back to memory", error);
		return null;
	}
};

const memoryRateLimit = (
	cacheKey: string,
	limit: number,
	windowMs: number
): RateLimitResult => {
	const now = Date.now();
	const bucket = buckets.get(cacheKey);

	if (!bucket || bucket.expiresAt <= now) {
		buckets.set(cacheKey, { count: 1, expiresAt: now + windowMs });
		return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
	}

	if (bucket.count >= limit) {
		return { allowed: false, remaining: 0, resetAt: bucket.expiresAt };
	}

	bucket.count += 1;
	buckets.set(cacheKey, bucket);
	return {
		allowed: true,
		remaining: limit - bucket.count,
		resetAt: bucket.expiresAt,
	};
};

/**
 * IP-based rate limiter. Uses Redis when configured (REDIS_URL), falls back to in-memory.
 */
export async function rateLimit(
	req: NextRequest,
	key: string,
	{
		limit = DEFAULT_LIMIT,
		windowMs = DEFAULT_WINDOW_MS,
	}: { limit?: number; windowMs?: number } = {}
): Promise<RateLimitResult> {
	const ip = getClientIp(req);
	const cacheKey = `${key}:${ip}`;

	const redisResult = await redisRateLimit(cacheKey, limit, windowMs);
	if (redisResult) return redisResult;

	return memoryRateLimit(cacheKey, limit, windowMs);
}
