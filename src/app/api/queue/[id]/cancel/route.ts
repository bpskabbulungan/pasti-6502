import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireApiGuard } from "@/lib/api-guard";
import { cancelQueue } from "@api/modules/queues";
import type { QueueDetail } from "@shared/types/queue";

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const guard = await requireApiGuard({ request: req });
		if (!guard.ok) {
			return guard.response;
		}

		const { id } = await params;

		const result = await cancelQueue(id, guard.session.user.id, guard.session.user.role as Role);

		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status });
		}

		return NextResponse.json<{
			message: string;
			queue: QueueDetail;
		}>({
			message: "Queue has been canceled",
			queue: result.queue,
		});
	} catch (error) {
		console.error("Error canceling queue:", error);
		return NextResponse.json(
			{ error: "Failed to cancel queue" },
			{ status: 500 }
		);
	}
}
