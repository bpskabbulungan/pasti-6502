import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { callQueue } from "@api/modules/queues";

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const result = await callQueue(id, session.user.id);

		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status });
		}

		return NextResponse.json({ queue: result.queue });
	} catch (error) {
		console.error("Error calling queue:", error);
		return NextResponse.json(
			{ error: "Failed to call queue" },
			{ status: 500 }
		);
	}
}
