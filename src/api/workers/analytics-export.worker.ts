import { logger } from "@api/core/logger";
import { startAnalyticsExportWorker } from "@api/infrastructure/queues/analytics-export.queue";
import { processAnalyticsExportJob } from "@api/modules/analytics/analytics-export-job.service";

const started = startAnalyticsExportWorker(processAnalyticsExportJob);

if (!started) {
	logger.error("Failed to start analytics export worker", {
		reason: "Redis connection unavailable",
	});
	process.exit(1);
}

logger.info("Analytics export worker started");
