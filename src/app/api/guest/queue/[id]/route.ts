import { NextResponse } from "next/server";
import { getGuestQueueDetail } from "@api/modules/guest";
import type { GuestQueueDetail } from "@shared/types/guest";

export async function GET(req: Request) {
	const pathname = new URL(req.url).pathname;
	const segments = pathname.split("/").filter(Boolean);
	const queueId = segments[segments.length - 1];

	if (!queueId) {
		return NextResponse.json({ error: "Queue ID is required" }, { status: 400 });
	}

	try {
		const result = await getGuestQueueDetail(queueId);
		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status });
		}

		return NextResponse.json<GuestQueueDetail>(result.data);
	} catch (error) {
		console.error("Error fetching guest queue detail:", error);
		return NextResponse.json(
			{ error: "Failed to fetch guest queue detail" },
			{ status: 500 }
		);
	}
}
