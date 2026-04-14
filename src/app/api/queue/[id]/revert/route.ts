import { NextRequest, NextResponse } from "next/server";
import { requireApiGuard } from "@/lib/api-guard";
import { revertQueueToWaiting } from "@api/modules/queues/queue.actions";
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
		const result = await revertQueueToWaiting(id, guard.session.user.id, guard.session.user.role);

		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status });
		}

		return NextResponse.json<{
			message: string;
			queue: QueueDetail;
		}>({
			message: "Queue has been reverted to waiting",
			queue: result.queue,
		});
	} catch (error) {
		console.error("Error reverting queue:", error);
		return NextResponse.json(
			{ error: "Failed to revert queue" },
			{ status: 500 }
		);
	}
}
