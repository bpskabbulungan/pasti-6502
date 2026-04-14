import {
  PstOfficerEmploymentStatus,
  PstOfficerSyncStatus,
  Prisma,
  SigapSyncResult,
} from "@prisma/client";
import prisma from "@api/infrastructure/database/prisma";
import type { SigapLoginResponse } from "./sigap-api.client";
import { getSigapApiClient, loginToSigap as loginToSigapService } from "./sigap-auth.service";

const PST_OFFICER_SELECT = {
  id: true,
  sigapContactId: true,
  sigapUsername: true,
  name: true,
  whatsappNumber: true,
  employmentStatus: true,
  sourceStatusRaw: true,
  isActiveCandidate: true,
  syncStatus: true,
  syncMessage: true,
  lastSyncedAt: true,
  priorityNextMonth: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PstOfficerCandidateSelect;

const SIGAP_SYNC_SUMMARY_SELECT = {
  id: true,
  success: true,
  result: true,
  totalFetched: true,
  totalProcessed: true,
  totalSaved: true,
  totalFailed: true,
  totalDuplicates: true,
  message: true,
  errorDetail: true,
  startedAt: true,
  finishedAt: true,
  createdAt: true,
} satisfies Prisma.SigapSyncLogSelect;

type NormalizedSigapContact = {
  sigapContactId: string;
  sigapUsername: string | null;
  name: string;
  whatsappNumber: string | null;
  employmentStatus: PstOfficerEmploymentStatus;
  sourceStatusRaw: string | null;
  isActiveCandidate: boolean;
};

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  return value as Record<string, unknown>;
};

const stringFromUnknown = (value: unknown): string | null => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
};

const firstString = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = stringFromUnknown(record[key]);
    if (value) {
      return value;
    }
  }
  return null;
};

const normalizeStatus = (value: string | null): PstOfficerEmploymentStatus => {
  if (!value) {
    return PstOfficerEmploymentStatus.UNKNOWN;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized.includes("masuk")) return PstOfficerEmploymentStatus.MASUK;
  if (normalized.includes("cuti")) return PstOfficerEmploymentStatus.CUTI;
  if (normalized.includes("sakit")) return PstOfficerEmploymentStatus.SAKIT;
  if (normalized.includes("dinas")) return PstOfficerEmploymentStatus.DINAS;
  if (normalized.includes("nonaktif") || normalized.includes("non aktif")) {
    return PstOfficerEmploymentStatus.NONAKTIF;
  }

  return PstOfficerEmploymentStatus.UNKNOWN;
};

const normalizePhone = (value: string | null) => {
  if (!value) {
    return null;
  }

  const compact = value.replace(/[\s-]+/g, "").trim();
  return compact.length > 0 ? compact : null;
};

const mapSigapContact = (
  value: unknown
):
  | { ok: true; value: NormalizedSigapContact }
  | {
      ok: false;
      error: string;
    } => {
  const record = asRecord(value);
  if (!record) {
    return { ok: false, error: "Format contact SIGAP tidak valid" };
  }

  const contactId = firstString(record, ["id", "contact_id", "contactId", "uuid"]);
  const username = firstString(record, ["username", "user_name", "nip", "nik"]);
  const name = firstString(record, ["nama", "name", "full_name", "fullName"]);
  const whatsapp = firstString(record, [
    "number",
    "whatsapp",
    "wa",
    "phone",
    "nomor",
    "no_hp",
    "nomor_wa",
  ]);
  const statusRaw = firstString(record, ["status", "status_kepegawaian", "employment_status"]);

  const resolvedContactId = contactId ?? username;
  if (!resolvedContactId) {
    return { ok: false, error: "Contact tidak memiliki id/username unik" };
  }

  if (!name) {
    return { ok: false, error: `Contact ${resolvedContactId} tidak memiliki nama` };
  }

  const employmentStatus = normalizeStatus(statusRaw);

  return {
    ok: true,
    value: {
      sigapContactId: resolvedContactId,
      sigapUsername: username,
      name,
      whatsappNumber: normalizePhone(whatsapp),
      employmentStatus,
      sourceStatusRaw: statusRaw,
      isActiveCandidate:
        employmentStatus !== PstOfficerEmploymentStatus.NONAKTIF &&
        employmentStatus !== PstOfficerEmploymentStatus.CUTI &&
        employmentStatus !== PstOfficerEmploymentStatus.SAKIT,
    },
  };
};

const toSyncResult = (saved: number, failed: number): SigapSyncResult => {
  if (saved > 0 && failed === 0) {
    return SigapSyncResult.SUCCESS;
  }
  if (saved > 0 && failed > 0) {
    return SigapSyncResult.PARTIAL;
  }
  return SigapSyncResult.FAILED;
};

export const loginToSigap = () => loginToSigapService();

export const fetchSigapContacts = async (auth: SigapLoginResponse) => {
  const client = getSigapApiClient();
  return client.fetchContacts(auth);
};

export async function listOfficerCandidates() {
  const officers = await prisma.pstOfficerCandidate.findMany({
    select: PST_OFFICER_SELECT,
    orderBy: [{ priorityNextMonth: "desc" }, { name: "asc" }],
  });

  return { officers };
}

export async function getSyncSummary() {
  const syncSummary = await prisma.sigapSyncLog.findFirst({
    select: SIGAP_SYNC_SUMMARY_SELECT,
    orderBy: { createdAt: "desc" },
  });

  return { syncSummary };
}

export async function setOfficerCandidateActive(id: string, isActiveCandidate: boolean) {
  const existing = await prisma.pstOfficerCandidate.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return {
      ok: false as const,
      status: 404,
      error: "Kandidat petugas tidak ditemukan",
    };
  }

  const officer = await prisma.pstOfficerCandidate.update({
    where: { id },
    data: {
      isActiveCandidate,
      syncMessage: isActiveCandidate
        ? "Diaktifkan manual dari dashboard"
        : "Dinonaktifkan manual dari dashboard",
    },
    select: PST_OFFICER_SELECT,
  });

  return {
    ok: true as const,
    officer,
  };
}

export async function syncEligibleOfficers(triggeredById?: string) {
  const startedAt = new Date();
  const initialLog = await prisma.sigapSyncLog.create({
    data: {
      startedAt,
      success: false,
      result: SigapSyncResult.FAILED,
      message: "Sinkronisasi SIGAP sedang diproses",
      triggeredById: triggeredById ?? null,
    },
    select: { id: true },
  });

  try {
    const login = await loginToSigap();
    const contacts = await fetchSigapContacts(login);

    let totalProcessed = 0;
    let totalSaved = 0;
    let totalFailed = 0;
    let totalDuplicates = 0;

    const deduped = new Map<string, NormalizedSigapContact>();
    const mappingErrors: string[] = [];

    for (const contact of contacts) {
      const mapped = mapSigapContact(contact);
      if (!mapped.ok) {
        totalFailed += 1;
        mappingErrors.push(mapped.error);
        continue;
      }

      totalProcessed += 1;
      if (deduped.has(mapped.value.sigapContactId)) {
        totalDuplicates += 1;
      }
      deduped.set(mapped.value.sigapContactId, mapped.value);
    }

    const now = new Date();
    const syncedIds = Array.from(deduped.keys());

    for (const candidate of deduped.values()) {
      try {
        await prisma.pstOfficerCandidate.upsert({
          where: {
            sigapContactId: candidate.sigapContactId,
          },
          create: {
            ...candidate,
            syncStatus: PstOfficerSyncStatus.SYNCED,
            syncMessage: "Sinkronisasi SIGAP berhasil",
            lastSyncedAt: now,
          },
          update: {
            sigapUsername: candidate.sigapUsername,
            name: candidate.name,
            whatsappNumber: candidate.whatsappNumber,
            employmentStatus: candidate.employmentStatus,
            sourceStatusRaw: candidate.sourceStatusRaw,
            isActiveCandidate: candidate.isActiveCandidate,
            syncStatus: PstOfficerSyncStatus.SYNCED,
            syncMessage: "Sinkronisasi SIGAP berhasil",
            lastSyncedAt: now,
          },
        });
        totalSaved += 1;
      } catch {
        totalFailed += 1;
      }
    }

    await prisma.pstOfficerCandidate.updateMany({
      where: {
        NOT: {
          sigapContactId: {
            in: syncedIds.length > 0 ? syncedIds : ["__EMPTY__"],
          },
        },
      },
      data: {
        syncStatus: PstOfficerSyncStatus.SKIPPED,
        syncMessage: "Tidak ditemukan pada sinkronisasi SIGAP terakhir",
      },
    });

    const result = toSyncResult(totalSaved, totalFailed);
    const success = result !== SigapSyncResult.FAILED;
    const syncMessage =
      result === SigapSyncResult.SUCCESS
        ? "Sinkronisasi SIGAP berhasil"
        : result === SigapSyncResult.PARTIAL
          ? "Sinkronisasi SIGAP selesai dengan sebagian data gagal diproses"
          : "Sinkronisasi SIGAP gagal";

    const syncSummary = await prisma.sigapSyncLog.update({
      where: { id: initialLog.id },
      data: {
        finishedAt: new Date(),
        success,
        result,
        totalFetched: contacts.length,
        totalProcessed,
        totalSaved,
        totalFailed,
        totalDuplicates,
        message: syncMessage,
        errorDetail: mappingErrors.length > 0 ? mappingErrors.slice(0, 3).join(" | ") : null,
        rawSummary: {
          mappedCandidates: deduped.size,
          sampleSigapIds: syncedIds.slice(0, 20),
        } as Prisma.InputJsonValue,
      },
      select: SIGAP_SYNC_SUMMARY_SELECT,
    });

    const officers = await prisma.pstOfficerCandidate.findMany({
      select: PST_OFFICER_SELECT,
      orderBy: [{ priorityNextMonth: "desc" }, { name: "asc" }],
    });

    return {
      ok: true as const,
      syncSummary,
      officers,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown SIGAP sync error";

    const syncSummary = await prisma.sigapSyncLog.update({
      where: { id: initialLog.id },
      data: {
        finishedAt: new Date(),
        success: false,
        result: SigapSyncResult.FAILED,
        message: "Sinkronisasi SIGAP gagal",
        errorDetail: errorMessage,
      },
      select: SIGAP_SYNC_SUMMARY_SELECT,
    });

    return {
      ok: false as const,
      status: 400,
      error: errorMessage,
      syncSummary,
    };
  }
}
