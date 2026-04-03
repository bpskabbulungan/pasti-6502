import {
  AnalyticsExportFormat as PrismaAnalyticsExportFormat,
  AnalyticsExportStatus,
} from "@prisma/client";
import prisma from "@api/infrastructure/database/prisma";
import { exportAnalytics } from "./analytics.service";

type DateRange = {
  startDate: Date;
  endDate: Date;
};

const EXPORT_JOB_TTL_MS = 24 * 60 * 60 * 1000;

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

async function processAnalyticsExportJob(jobId: string) {
  const claim = await prisma.analyticsExportJob.updateMany({
    where: {
      id: jobId,
      status: AnalyticsExportStatus.PENDING,
    },
    data: {
      status: AnalyticsExportStatus.PROCESSING,
      errorMessage: null,
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
      await prisma.analyticsExportJob.update({
        where: { id: jobId },
        data: {
          status: AnalyticsExportStatus.FAILED,
          errorMessage: result.error,
        },
      });
      return;
    }

    await prisma.analyticsExportJob.update({
      where: { id: jobId },
      data: {
        status: AnalyticsExportStatus.COMPLETED,
        payload: Buffer.isBuffer(result.body) ? result.body : Buffer.from(result.body),
        contentType: result.headers["Content-Type"],
        fileName: toExportFileName(job.id, job, job.format),
        completedAt: new Date(),
        expiresAt: new Date(Date.now() + EXPORT_JOB_TTL_MS),
      },
    });
  } catch (error) {
    console.error("Error processing analytics export job:", error);
    await prisma.analyticsExportJob.update({
      where: { id: jobId },
      data: {
        status: AnalyticsExportStatus.FAILED,
        errorMessage:
          error instanceof Error ? error.message.slice(0, 191) : "Gagal menyiapkan export analitik",
      },
    });
  }
}

export function triggerAnalyticsExportJob(jobId: string) {
  void processAnalyticsExportJob(jobId);
}

export async function createAnalyticsExportJob(
  requestedById: string,
  range: DateRange,
  format: "xlsx" | "pdf"
) {
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

  triggerAnalyticsExportJob(job.id);

  return { job: serializeAnalyticsExportJob(job) };
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
    triggerAnalyticsExportJob(job.id);
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
      contentType: true,
      payload: true,
      expiresAt: true,
    },
  });

  if (!job) {
    return { ok: false as const, status: 404, error: "Job export tidak ditemukan" };
  }

  if (job.status !== AnalyticsExportStatus.COMPLETED || !job.payload) {
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

  return {
    ok: true as const,
    fileName: job.fileName ?? `analytics-export-${job.id}.bin`,
    contentType: job.contentType ?? "application/octet-stream",
    body: job.payload,
  };
}
