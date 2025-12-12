import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllQueuesToday } from "@api/modules/queues";
import type { QueueListResponse } from "@shared/types/queue";

export async function GET(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const url = new URL(req.url);
		const clientHash = url.searchParams.get("hash") || "";

		const result = await getAllQueuesToday({ clientHash });

		return NextResponse.json<QueueListResponse>(result);
	} catch (error) {
		console.error("Error fetching all queues:", error);
		return NextResponse.json(
			{ error: "Failed to fetch queues" },
			{ status: 500 }
		);
	}
}
