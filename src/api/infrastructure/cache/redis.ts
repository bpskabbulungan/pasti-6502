import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
	redisClient?: Redis;
};

const createRedisClient = () => {
	const url = process.env.REDIS_URL;
	if (!url) return null;

	const client =
		globalForRedis.redisClient ??
		new Redis(url, {
			maxRetriesPerRequest: 2,
		});

	globalForRedis.redisClient = client;
	return client;
};

export const getRedisClient = () => {
	try {
		return createRedisClient();
	} catch (error) {
		console.error("Failed to init Redis client", error);
		return null;
	}
};
