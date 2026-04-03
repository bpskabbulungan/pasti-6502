import { NextRequest, NextResponse } from "next/server";
import { requireApiGuard } from "@/lib/api-guard";
import { completeQueue } from "@api/modules/queues";
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

		const result = await completeQueue(id, guard.session.user.id, guard.session.user.role);

		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status });
		}

		return NextResponse.json<{
			message: string;
			queue: QueueDetail;
			nextQueue: QueueDetail | null;
		}>({
			message: "Queue has been completed",
			queue: result.queue,
			nextQueue: result.nextQueue ?? null,
		});
	} catch (error) {
		console.error("Error completing queue:", error);
		return NextResponse.json(
			{ error: "Failed to complete queue" },
			{ status: 500 }
		);
	}
}
