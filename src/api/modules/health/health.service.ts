import prisma from "@api/infrastructure/database/prisma";
import { checkWhatsAppBotEnv } from "@/api/config/env-checker";
import { getRedisClient } from "@api/infrastructure/cache/redis";
import { logger } from "@api/core/logger";
import type {
	HealthServiceStatus,
	HealthStatusResponse,
} from "@shared/types/health";

export async function getHealthStatus(): Promise<HealthStatusResponse> {
	const waCheck = checkWhatsAppBotEnv();

	let dbStatus: "ok" | "error" = "ok";
	let redisStatus: "ok" | "error" | "disabled" = "disabled";

	try {
		await prisma.$queryRaw`SELECT 1`;
	} catch (error) {
		dbStatus = "error";
		logger.error("Health check: database not reachable", {
			error: error instanceof Error ? error.message : String(error),
		});
	}

	const redis = getRedisClient();
	if (redis) {
		try {
			const pong = await redis.ping();
			redisStatus = pong === "PONG" ? "ok" : "error";
		} catch (error) {
			redisStatus = "error";
			logger.error("Health check: redis not reachable", {
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}

	const whatsappStatus: HealthServiceStatus = waCheck.isValid ? "ok" : "error";

	const services = {
		database: {
			status: dbStatus,
			message:
				dbStatus === "ok"
					? "Database connection is active"
					: "Database unreachable",
		},
		whatsapp: {
			status: whatsappStatus,
			message: waCheck.isValid ? "WhatsApp Bot is configured" : waCheck.message,
		},
		api: {
			status: "ok" as const,
			message: "API is responding",
		},
		redis: {
			status: redisStatus,
			message:
				redisStatus === "ok"
					? "Redis reachable"
					: redisStatus === "disabled"
					? "Redis not configured"
					: "Redis unreachable",
		},
	};

	const allServicesOk = Object.values(services).every(
		(service) => service.status === "ok" || service.status === "disabled"
	);

	logger.info("Health check executed", {
		status: allServicesOk ? "ok" : "degraded",
		db: services.database.status,
		redis: services.redis.status,
		whatsapp: services.whatsapp.status,
	});

	return {
		status: allServicesOk ? "ok" : "degraded",
		message: allServicesOk
			? "All services are operational"
			: "Some services have issues",
		timestamp: new Date().toISOString(),
		services,
	};
}
