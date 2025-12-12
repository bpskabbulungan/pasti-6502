import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { completeQueue } from "@api/modules/queues";
import type { QueueDetail } from "@shared/types/queue";

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		const result = await completeQueue(id, session.user.id, session.user.role);

		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status });
		}

		return NextResponse.json<{
			message: string;
			queue: QueueDetail;
		}>({
			message: "Queue has been completed",
			queue: result.queue,
		});
	} catch (error) {
		console.error("Error completing queue:", error);
		return NextResponse.json(
			{ error: "Failed to complete queue" },
			{ status: 500 }
		);
	}
}
