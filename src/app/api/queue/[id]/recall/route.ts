import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { recallQueue } from "@/api/modules/queues/queue.actions";
import type { QueueActionResponse } from "@/shared/types/queue";

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const id = (await params).id;
		if (!id) {
			return NextResponse.json({ error: "Queue ID is required" }, { status: 400 });
		}

		const result = await recallQueue(id, session.user.id, session.user.role as any);

		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status });
		}

		const responseData: QueueActionResponse = {
			message: "Antrean berhasil dipanggil ulang",
			queue: result.queue,
		};

		return NextResponse.json(responseData);
	} catch (error) {
		console.error("Error recalling queue:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
