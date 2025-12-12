import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { serveQueue } from "@api/modules/queues";
import type { QueueDetail } from "@shared/types/queue";

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || !session.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		const result = await serveQueue(id, session.user.id);

		if (!result.ok) {
			return NextResponse.json(
				{ error: result.error },
				{ status: result.status }
			);
		}

		return NextResponse.json<{
			message: string;
			queue: QueueDetail;
		}>({
			message: "Queue is now being served",
			queue: result.queue,
		});
	} catch (error) {
		console.error("Error serving queue:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";

		if (
			errorMessage.includes(
				"Foreign key constraint violated on the constraint: `Queue_adminId_fkey`"
			)
		) {
			return NextResponse.json(
				{
					error: "Failed to serve queue",
					details:
						"The admin user associated with this session does not exist in the database.",
				},
				{ status: 500 }
			);
		}

		return NextResponse.json(
			{ error: "Failed to serve queue", details: errorMessage },
			{ status: 500 }
		);
	}
}
