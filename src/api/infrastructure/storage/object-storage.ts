import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

const DEFAULT_STORAGE_ROOT = path.join(process.cwd(), ".next", "cache", "analytics-exports");

const storageRoot = path.resolve(
	process.env.ANALYTICS_EXPORT_STORAGE_PATH?.trim() || DEFAULT_STORAGE_ROOT
);

const normalizeStorageKey = (storageKey: string) => storageKey.replace(/\\/g, "/").trim();

const resolveStoragePath = (storageKey: string) => {
	const normalizedKey = normalizeStorageKey(storageKey);
	if (!normalizedKey || normalizedKey.includes("..")) {
		throw new Error("Invalid storage key");
	}

	const resolvedPath = path.resolve(storageRoot, normalizedKey);
	if (resolvedPath !== storageRoot && !resolvedPath.startsWith(`${storageRoot}${path.sep}`)) {
		throw new Error("Storage key resolves outside storage root");
	}

	return resolvedPath;
};

export const buildAnalyticsExportStorageKey = (jobId: string, format: "xlsx" | "pdf") => {
	const extension = format === "pdf" ? "pdf" : "xlsx";
	const dayBucket = new Date().toISOString().slice(0, 10);
	return path.posix.join("analytics", dayBucket, `${jobId}-${randomUUID()}.${extension}`);
};

export async function putAnalyticsExportObject(storageKey: string, body: Buffer) {
	const targetPath = resolveStoragePath(storageKey);
	await fs.mkdir(path.dirname(targetPath), { recursive: true });
	await fs.writeFile(targetPath, body);
}

export async function getAnalyticsExportObject(storageKey: string) {
	const targetPath = resolveStoragePath(storageKey);
	try {
		return await fs.readFile(targetPath);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			return null;
		}
		throw error;
	}
}

export async function deleteAnalyticsExportObject(storageKey: string) {
	const targetPath = resolveStoragePath(storageKey);
	try {
		await fs.rm(targetPath, { force: true });
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
			throw error;
		}
	}
}
