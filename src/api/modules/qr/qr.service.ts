import { v4 as uuidv4 } from "uuid";
import prisma from "@api/infrastructure/database/prisma";

export async function getStaticUuid() {
	const envStatic = process.env.NEXT_PUBLIC_STATIC_UUID;
	if (envStatic) {
		return { ok: true as const, staticUuid: envStatic, source: "env" as const };
	}

	const existing = await prisma.qRCode.findFirst({
		orderBy: { createdAt: "desc" },
	});

	if (existing) {
		return {
			ok: true as const,
			staticUuid: existing.staticUuid,
			source: "database" as const,
		};
	}

	const generated = uuidv4();
	await prisma.qRCode.create({
		data: {
			staticUuid: generated,
			path: "/qrcodes/pst-qrcode.png",
		},
	});

	return {
		ok: true as const,
		staticUuid: generated,
		source: "generated" as const,
	};
}
