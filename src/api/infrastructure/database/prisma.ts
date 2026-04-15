import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
	prisma?: PrismaClient;
};

const hasPstDelegates = (client: PrismaClient | undefined) => {
	if (!client) {
		return false;
	}

	const runtimeClient = client as PrismaClient & {
		pstOfficerCandidate?: { findMany?: unknown };
		sigapSyncLog?: { findFirst?: unknown };
	};

	return (
		typeof runtimeClient.pstOfficerCandidate?.findMany === "function" &&
		typeof runtimeClient.sigapSyncLog?.findFirst === "function"
	);
};

const prisma =
	hasPstDelegates(globalForPrisma.prisma) && globalForPrisma.prisma
		? globalForPrisma.prisma
		: new PrismaClient();

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}

export default prisma;
