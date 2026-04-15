import { PstGenerateAttemptStatus } from "@prisma/client";
import prisma from "@api/infrastructure/database/prisma";
import type { PstGenerateAttemptLog } from "@shared/types/pst-schedule";

type CreatePstGenerateAttemptLogParams = {
  month: number;
  year: number;
  downloadPdf: boolean;
  forceRegenerate: boolean;
  allowSameFridayAssignee: boolean;
  requestedById?: string | null;
};

type FinalizePstGenerateAttemptLogParams = {
  id: string;
  status: PstGenerateAttemptStatus;
  alreadyExists?: boolean | null;
  monthlyScheduleId?: string | null;
  errorMessage?: string | null;
};

type ListPstGenerateAttemptLogsParams = {
  month?: number;
  year?: number;
  limit?: number;
};

const toPstGenerateAttemptLogResponse = (item: {
  id: string;
  month: number;
  year: number;
  downloadPdf: boolean;
  forceRegenerate: boolean;
  allowSameFridayAssignee: boolean;
  status: PstGenerateAttemptStatus;
  alreadyExists: boolean | null;
  errorMessage: string | null;
  requestedById: string | null;
  monthlyScheduleId: string | null;
  startedAt: Date;
  finishedAt: Date | null;
  createdAt: Date;
  requestedBy: {
    name: string;
  } | null;
}): PstGenerateAttemptLog => ({
  id: item.id,
  month: item.month,
  year: item.year,
  downloadPdf: item.downloadPdf,
  forceRegenerate: item.forceRegenerate,
  allowSameFridayAssignee: item.allowSameFridayAssignee,
  status: item.status,
  alreadyExists: item.alreadyExists,
  errorMessage: item.errorMessage,
  requestedById: item.requestedById,
  requestedByName: item.requestedBy?.name ?? null,
  monthlyScheduleId: item.monthlyScheduleId,
  startedAt: item.startedAt,
  finishedAt: item.finishedAt,
  createdAt: item.createdAt,
});

export async function createPstGenerateAttemptLog(params: CreatePstGenerateAttemptLogParams) {
  const created = await prisma.pstGenerateAttemptLog.create({
    data: {
      month: params.month,
      year: params.year,
      downloadPdf: params.downloadPdf,
      forceRegenerate: params.forceRegenerate,
      allowSameFridayAssignee: params.allowSameFridayAssignee,
      requestedById: params.requestedById ?? null,
      status: PstGenerateAttemptStatus.PROCESSING,
    },
    select: {
      id: true,
    },
  });

  return created.id;
}

export async function finalizePstGenerateAttemptLog(params: FinalizePstGenerateAttemptLogParams) {
  try {
    await prisma.pstGenerateAttemptLog.update({
      where: {
        id: params.id,
      },
      data: {
        status: params.status,
        alreadyExists: params.alreadyExists ?? null,
        monthlyScheduleId: params.monthlyScheduleId ?? null,
        errorMessage: params.errorMessage ?? null,
        finishedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error finalizing PST generate attempt log:", error);
  }
}

export async function listPstGenerateAttemptLogs(params: ListPstGenerateAttemptLogsParams = {}) {
  const safeLimit = Math.max(1, Math.min(params.limit ?? 50, 200));
  const where = {
    ...(Number.isInteger(params.month) ? { month: params.month } : {}),
    ...(Number.isInteger(params.year) ? { year: params.year } : {}),
  };

  const logs = await prisma.pstGenerateAttemptLog.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    take: safeLimit,
    select: {
      id: true,
      month: true,
      year: true,
      downloadPdf: true,
      forceRegenerate: true,
      allowSameFridayAssignee: true,
      status: true,
      alreadyExists: true,
      errorMessage: true,
      requestedById: true,
      monthlyScheduleId: true,
      startedAt: true,
      finishedAt: true,
      createdAt: true,
      requestedBy: {
        select: {
          name: true,
        },
      },
    },
  });

  return logs.map(toPstGenerateAttemptLogResponse);
}
