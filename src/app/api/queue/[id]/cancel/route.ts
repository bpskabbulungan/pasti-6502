import { Role } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cancelQueue } from "@api/modules/queues";
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

		const result = await cancelQueue(id, session.user.id, session.user.role as Role);

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
