import { Queue, Worker, type ConnectionOptions, type Job } from "bullmq";
import { logger } from "@api/core/logger";

type AnalyticsExportJobPayload = {
	jobId: string;
};

type ExportJobProcessor = (jobId: string) => Promise<void>;

const EXPORT_QUEUE_NAME = "analytics-export";
const EXPORT_JOB_NAME = "process-analytics-export";

const globalForAnalyticsExportQueue = globalThis as unknown as {
	analyticsExportConnection?: ConnectionOptions | null;
	analyticsExportQueue?: Queue<AnalyticsExportJobPayload, unknown, string> | null;
	analyticsExportWorker?: Worker<AnalyticsExportJobPayload, unknown, string> | null;
};

const parseRedisUrl = (rawUrl: string): ConnectionOptions => {
	const url = new URL(rawUrl);
	const port = url.port ? Number(url.port) : 6379;
	const dbFromPath = url.pathname?.replace("/", "");
	const db = dbFromPath ? Number(dbFromPath) : undefined;

	return {
		host: url.hostname,
		port: Number.isFinite(port) ? port : 6379,
		username: url.username || undefined,
		password: url.password || undefined,
		db: Number.isFinite(db) ? db : undefined,
		tls: url.protocol === "rediss:" ? {} : undefined,
		maxRetriesPerRequest: null,
	};
};

const resolveConnection = (): ConnectionOptions | null => {
	if (globalForAnalyticsExportQueue.analyticsExportConnection !== undefined) {
		return globalForAnalyticsExportQueue.analyticsExportConnection;
	}

	const redisUrl = process.env.REDIS_URL?.trim();
	if (!redisUrl) {
		if (process.env.NODE_ENV === "production") {
			throw new Error("REDIS_URL is required for analytics export queue in production");
		}
		globalForAnalyticsExportQueue.analyticsExportConnection = null;
		return null;
	}

	const connection = parseRedisUrl(redisUrl);
	globalForAnalyticsExportQueue.analyticsExportConnection = connection;
	return connection;
};

const getQueue = () => {
	if (globalForAnalyticsExportQueue.analyticsExportQueue !== undefined) {
		return globalForAnalyticsExportQueue.analyticsExportQueue;
	}

	const connection = resolveConnection();
	if (!connection) {
		globalForAnalyticsExportQueue.analyticsExportQueue = null;
		return null;
	}

	const queue = new Queue<AnalyticsExportJobPayload, unknown, string>(EXPORT_QUEUE_NAME, {
		connection,
		defaultJobOptions: {
			attempts: 3,
			backoff: {
				type: "exponential",
				delay: 1_000,
			},
			removeOnComplete: 500,
			removeOnFail: 500,
		},
	});

	globalForAnalyticsExportQueue.analyticsExportQueue = queue;
	return queue;
};

const getWorkerConcurrency = () => {
	const parsed = Number.parseInt(process.env.ANALYTICS_EXPORT_WORKER_CONCURRENCY ?? "", 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

export async function enqueueAnalyticsExportJob(jobId: string) {
	const queue = getQueue();
	if (!queue) {
		return {
			ok: false as const,
			error: "Analytics export queue is unavailable",
		};
	}

	try {
		await queue.add(
			EXPORT_JOB_NAME,
			{ jobId },
			{
				jobId,
			}
		);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		if (message.includes("Job is already waiting") || message.includes("Job is already active")) {
			return { ok: true as const };
		}
		throw error;
	}

	return { ok: true as const };
}

export function startAnalyticsExportWorker(processor: ExportJobProcessor) {
	if (globalForAnalyticsExportQueue.analyticsExportWorker) {
		return true;
	}

	const connection = resolveConnection();
	if (!connection) {
		return false;
	}

	const worker = new Worker<AnalyticsExportJobPayload, unknown, string>(
		EXPORT_QUEUE_NAME,
		async (job: Job<AnalyticsExportJobPayload>) => {
			await processor(job.data.jobId);
		},
		{
			connection,
			concurrency: getWorkerConcurrency(),
		}
	);

	worker.on("failed", (job, error) => {
		logger.error("Analytics export worker failed", {
			jobId: job?.data.jobId ?? null,
			error: error.message,
		});
	});

	worker.on("completed", (job) => {
		logger.info("Analytics export worker completed", {
			jobId: job.data.jobId,
		});
	});

	globalForAnalyticsExportQueue.analyticsExportWorker = worker;
	return true;
}
