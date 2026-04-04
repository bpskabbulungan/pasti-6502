import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireApiGuard } from "@/lib/api-guard";
import { getQueueDetail } from "@api/modules/queues/queue.actions";
import type { QueueDetail } from "@shared/types/queue";

export async function GET(req: Request) {
	const pathname = new URL(req.url).pathname;
	const segments = pathname.split("/").filter(Boolean);
	const queueId = segments[segments.length - 1];

	if (!queueId) {
		return NextResponse.json({ error: "Queue ID is required" }, { status: 400 });
	}

	try {
		const guard = await requireApiGuard({
			request: req,
			roles: [Role.ADMIN, Role.PETUGAS],
		});
		if (!guard.ok) {
			return guard.response;
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
