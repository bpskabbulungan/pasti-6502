import {
  AnalyticsExportFormat as PrismaAnalyticsExportFormat,
  Prisma,
  AnalyticsExportStatus,
} from "@prisma/client";
import prisma from "@api/infrastructure/database/prisma";
import { logger } from "@api/core/logger";
import {
  enqueueAnalyticsExportJob,
  startAnalyticsExportWorker,
} from "@api/infrastructure/queues/analytics-export.queue";
import {
  buildAnalyticsExportStorageKey,
  deleteAnalyticsExportObject,
  getAnalyticsExportObject,
  putAnalyticsExportObject,
} from "@api/infrastructure/storage/object-storage";
import { exportAnalytics } from "./analytics.service";

type DateRange = {
  startDate: Date;
  endDate: Date;
};

const EXPORT_JOB_TTL_MS = 24 * 60 * 60 * 1000;
const EXPORT_CLEANUP_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;
const EXPORT_QUEUE_UNAVAILABLE_ERROR = "Sistem antrean export tidak tersedia";
const MAX_ANALYTICS_EXPORT_ROWS = (() => {
  const parsed = Number.parseInt(process.env.ANALYTICS_EXPORT_MAX_ROWS ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 10000;
})();
let isExportWorkerStarted = false;

const toExportFileName = (jobId: string, range: DateRange, format: PrismaAnalyticsExportFormat) => {
  const startDate = range.startDate.toISOString().slice(0, 10);
  const endDate = new Date(range.endDate.getTime() - 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const extension = format === PrismaAnalyticsExportFormat.PDF ? "pdf" : "xlsx";
  return `pst-analytics-${startDate}-${endDate}-${jobId}.${extension}`;
};

const serializeAnalyticsExportJob = (job: {
  id: string;
  status: AnalyticsExportStatus;
  format: PrismaAnalyticsExportFormat;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  expiresAt: Date | null;
  errorMessage: string | null;
  fileName: string | null;
}) => ({
  id: job.id,
  status: job.status,
  format: job.format === PrismaAnalyticsExportFormat.PDF ? "pdf" : "xlsx",
  createdAt: job.createdAt,
  updatedAt: job.updatedAt,
  completedAt: job.completedAt,
  expiresAt: job.expiresAt,
  errorMessage: job.errorMessage,
  fileName: job.fileName,
  downloadUrl:
    job.status === AnalyticsExportStatus.COMPLETED
      ? `/api/analytics/export/${job.id}/download`
      : null,
});

async function cleanupOldAnalyticsExportData() {
  const now = new Date();
  const retentionCutoff = new Date(now.getTime() - EXPORT_CLEANUP_RETENTION_MS);
  const staleJobWhere: Prisma.AnalyticsExportJobWhereInput = {
    OR: [
      { expiresAt: { lt: now } },
      { status: AnalyticsExportStatus.FAILED, createdAt: { lt: retentionCutoff } },
      { status: AnalyticsExportStatus.PENDING, createdAt: { lt: retentionCutoff } },
      { status: AnalyticsExportStatus.PROCESSING, createdAt: { lt: retentionCutoff } },
    ],
  };

  const staleJobs = await prisma.analyticsExportJob.findMany({
    where: staleJobWhere,
    select: {
      id: true,
      storageKey: true,
    },
  });

  if (staleJobs.length === 0) {
    return;
  }

  await prisma.analyticsExportJob.deleteMany({
    where: {
      id: {
        in: staleJobs.map((job) => job.id),
      },
    },
  });

  await Promise.all(
    staleJobs.map(async (job) => {
      if (!job.storageKey) {
        return;
      }
      try {
        await deleteAnalyticsExportObject(job.storageKey);
      } catch (error) {
        logger.warn("Failed to delete stale analytics export object", {
          jobId: job.id,
          storageKey: job.storageKey,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    })
  );
}

const ensureAnalyticsExportWorker = () => {
  if (isExportWorkerStarted) {
    return true;
  }

  const started = startAnalyticsExportWorker(processAnalyticsExportJob);
  isExportWorkerStarted = started;
  if (!started) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Analytics export worker is unavailable in production");
    }
    logger.warn("Analytics export worker unavailable, using inline fallback");
  }

  return started;
};

async function markAnalyticsExportAsFailed(jobId: string, errorMessage: string) {
  await prisma.analyticsExportJob.updateMany({
    where: { id: jobId },
    data: {
      status: AnalyticsExportStatus.FAILED,
      errorMessage: errorMessage.slice(0, 191),
    },
  });
}

export async function processAnalyticsExportJob(jobId: string) {
  const claim = await prisma.analyticsExportJob.updateMany({
    where: {
      id: jobId,
      status: AnalyticsExportStatus.PENDING,
    },
    data: {
      status: AnalyticsExportStatus.PROCESSING,
      errorMessage: null,
      storageKey: null,
      payload: null,
      contentType: null,
      fileName: null,
      completedAt: null,
      expiresAt: null,
    },
  });

  if (claim.count === 0) {
    return;
  }

  const job = await prisma.analyticsExportJob.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      format: true,
      startDate: true,
      endDate: true,
    },
  });

  if (!job) {
    return;
  }

  try {
    const exportFormat = job.format === PrismaAnalyticsExportFormat.PDF ? "pdf" : "xlsx";
    const result = await exportAnalytics(
      {
        startDate: job.startDate,
        endDate: job.endDate,
      },
      exportFormat
    );

    if (!result.ok) {
      await markAnalyticsExportAsFailed(jobId, result.error);
      return;
    }

    const bodyBuffer = Buffer.isBuffer(result.body) ? result.body : Buffer.from(result.body);
    const storageKey = buildAnalyticsExportStorageKey(job.id, exportFormat);
    await putAnalyticsExportObject(storageKey, bodyBuffer);

    await prisma.analyticsExportJob.update({
      where: { id: jobId },
      data: {
        status: AnalyticsExportStatus.COMPLETED,
        storageKey,
        payload: null,
        contentType: result.headers["Content-Type"],
        fileName: toExportFileName(job.id, job, job.format),
        completedAt: new Date(),
        expiresAt: new Date(Date.now() + EXPORT_JOB_TTL_MS),
      },
    });

    logger.info("Analytics export completed", {
      jobId,
      storageKey,
      format: exportFormat,
    });
  } catch (error) {
    logger.error("Error processing analytics export job", {
      jobId,
      error: error instanceof Error ? error.message : String(error),
    });
    await markAnalyticsExportAsFailed(
      jobId,
      error instanceof Error ? error.message : "Gagal menyiapkan export analitik"
    );
  }
}

export async function triggerAnalyticsExportJob(jobId: string) {
  try {
    const hasQueueWorker = ensureAnalyticsExportWorker();
    const enqueued = await enqueueAnalyticsExportJob(jobId);
    if (enqueued.ok) {
      return { ok: true as const };
    }

    if (process.env.NODE_ENV === "production") {
      await markAnalyticsExportAsFailed(jobId, EXPORT_QUEUE_UNAVAILABLE_ERROR);
      return {
        ok: false as const,
        status: 503,
        error: EXPORT_QUEUE_UNAVAILABLE_ERROR,
      };
    }

    logger.warn("Analytics export queue unavailable, running job inline", {
      jobId,
      reason: enqueued.error,
      hasQueueWorker,
    });
    void processAnalyticsExportJob(jobId);

    return { ok: true as const };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Analytics export queue is unavailable";

    if (process.env.NODE_ENV === "production") {
      await markAnalyticsExportAsFailed(jobId, EXPORT_QUEUE_UNAVAILABLE_ERROR);
      return {
        ok: false as const,
        status: 503,
        error: EXPORT_QUEUE_UNAVAILABLE_ERROR,
      };
    }

    logger.warn("Failed to enqueue analytics export job, running inline", {
      jobId,
      error: message,
    });
    void processAnalyticsExportJob(jobId);

    return { ok: true as const };
  }
}

export async function createAnalyticsExportJob(
  requestedById: string,
  range: DateRange,
  format: "xlsx" | "pdf"
) {
  if (
    Number.isNaN(range.startDate.getTime()) ||
    Number.isNaN(range.endDate.getTime()) ||
    range.endDate.getTime() <= range.startDate.getTime()
  ) {
    return {
      ok: false as const,
      status: 400,
      error: "Rentang tanggal export tidak valid",
    };
  }

  await cleanupOldAnalyticsExportData();

  const totalRows = await prisma.queue.count({
    where: {
      queueDate: {
        gte: range.startDate,
        lt: range.endDate,
      },
    },
  });

  if (totalRows === 0) {
    return {
      ok: false as const,
      status: 404,
      error: "No data to export for the selected date range",
    };
  }

  if (totalRows > MAX_ANALYTICS_EXPORT_ROWS) {
    return {
      ok: false as const,
      status: 413,
      error: `Jumlah data export melebihi batas (${MAX_ANALYTICS_EXPORT_ROWS} baris). Persempit rentang tanggal.`,
    };
  }

  const job = await prisma.analyticsExportJob.create({
    data: {
      requestedById,
      startDate: range.startDate,
      endDate: range.endDate,
      format: format === "pdf" ? PrismaAnalyticsExportFormat.PDF : PrismaAnalyticsExportFormat.XLSX,
    },
    select: {
      id: true,
      status: true,
      format: true,
      createdAt: true,
      updatedAt: true,
      completedAt: true,
      expiresAt: true,
      errorMessage: true,
      fileName: true,
    },
  });

  const enqueueResult = await triggerAnalyticsExportJob(job.id);
  if (!enqueueResult.ok) {
    return enqueueResult;
  }

  return { ok: true as const, job: serializeAnalyticsExportJob(job) };
}

export async function getAnalyticsExportJob(jobId: string, requestedById: string) {
  const job = await prisma.analyticsExportJob.findFirst({
    where: {
      id: jobId,
      requestedById,
    },
    select: {
      id: true,
      status: true,
      format: true,
      createdAt: true,
      updatedAt: true,
      completedAt: true,
      expiresAt: true,
      errorMessage: true,
      fileName: true,
    },
  });

  if (!job) {
    return { ok: false as const, status: 404, error: "Job export tidak ditemukan" };
  }

  if (job.status === AnalyticsExportStatus.PENDING) {
    void triggerAnalyticsExportJob(job.id);
  }

  return {
    ok: true as const,
    job: serializeAnalyticsExportJob(job),
  };
}

export async function getAnalyticsExportDownload(jobId: string, requestedById: string) {
  const job = await prisma.analyticsExportJob.findFirst({
    where: {
      id: jobId,
      requestedById,
    },
    select: {
      id: true,
      status: true,
      fileName: true,
      storageKey: true,
      contentType: true,
      payload: true,
      expiresAt: true,
    },
  });

  if (!job) {
    return { ok: false as const, status: 404, error: "Job export tidak ditemukan" };
  }

  if (job.status !== AnalyticsExportStatus.COMPLETED) {
    return {
      ok: false as const,
      status: 409,
      error: "File export belum siap diunduh",
    };
  }

  if (job.expiresAt && job.expiresAt.getTime() < Date.now()) {
    return {
      ok: false as const,
      status: 410,
      error: "File export sudah kedaluwarsa, silakan buat export baru",
    };
  }

  if (job.storageKey) {
    const body = await getAnalyticsExportObject(job.storageKey);
    if (!body) {
      return {
        ok: false as const,
        status: 410,
        error: "File export tidak tersedia lagi, silakan buat export baru",
      };
    }

    return {
      ok: true as const,
      fileName: job.fileName ?? `analytics-export-${job.id}.bin`,
      contentType: job.contentType ?? "application/octet-stream",
      body,
    };
  }

  if (!job.payload) {
    return {
      ok: false as const,
      status: 410,
      error: "File export tidak tersedia lagi, silakan buat export baru",
    };
  }

  return {
    ok: true as const,
    fileName: job.fileName ?? `analytics-export-${job.id}.bin`,
    contentType: job.contentType ?? "application/octet-stream",
    body: job.payload,
  };
}
