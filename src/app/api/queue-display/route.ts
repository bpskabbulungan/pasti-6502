import { NextRequest, NextResponse } from "next/server";
import { getQueueDisplay } from "@api/modules/queue-display";
import type { QueueDisplayResponse } from "@shared/types/queue";

export async function GET(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const adminId = url.searchParams.get("adminId");
		const dateFilterParam = url.searchParams.get("dateFilter");
		const dateFilter = dateFilterParam === "all" ? "all" : "today";
		const clientHash = req.headers.get("x-queue-hash") || "";

		const result = await getQueueDisplay({
			adminId,
			dateFilter,
			clientHash,
		});

		return NextResponse.json<QueueDisplayResponse>(result);
	} catch (error) {
		console.error("Error fetching queue display data:", error);
		return NextResponse.json(
			{ error: "Failed to fetch queue display data" },
			{ status: 500 }
		);
	}
}
