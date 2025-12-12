import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@/generated/prisma";
import { getQueueDetail } from "@api/modules/queues";
import type { QueueDetail } from "@shared/types/queue";

export async function GET(req: Request) {
	const pathname = new URL(req.url).pathname;
	const segments = pathname.split("/").filter(Boolean);
	const queueId = segments[segments.length - 1];

	if (!queueId) {
		return NextResponse.json({ error: "Queue ID is required" }, { status: 400 });
	}

	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (![Role.ADMIN, Role.SUPERADMIN].includes(session.user.role)) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const result = await getQueueDetail(queueId);
		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status });
		}

		return NextResponse.json<QueueDetail>(result.queue);
	} catch (error) {
		console.error("Error fetching queue status:", error);
		return NextResponse.json(
			{ error: "Failed to fetch queue status" },
			{ status: 500 }
		);
	}
}
