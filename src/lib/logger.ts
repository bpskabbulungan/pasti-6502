import { logger } from "@/api/core/logger";

const formatMeta = (meta?: Record<string, unknown>) =>
	meta ? { meta } : undefined;

export const logInfo = (message: string, meta?: Record<string, unknown>) => {
	logger.info(message, formatMeta(meta));
};

export const logWarn = (message: string, meta?: Record<string, unknown>) => {
	logger.warn(message, formatMeta(meta));
};

export const logError = (message: string, meta?: Record<string, unknown>) => {
	logger.error(message, formatMeta(meta));
};

export { logger };
