import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { trackVisitorQueue } from "@api/modules/visitor-form";
import type { VisitorFormTrackResponse } from "@shared/types/visitor-form";

export async function GET(req: NextRequest) {
	try {
		const limiter = await rateLimit(req, "visitor-form-track", {
			limit: 15,
			windowMs: 60_000,
		});
		if (!limiter.allowed) {
			return NextResponse.json(
				{ error: "Terlalu banyak permintaan, coba lagi nanti." },
				{ status: 429 }
			);
		}

		const visitorUuid = req.headers.get("x-visitor-uuid");
		const clientHash = req.headers.get("x-queue-hash") || "";

		if (!visitorUuid) {
			return NextResponse.json(
				{ error: "Missing visitor UUID" },
				{ status: 400 }
			);
		}

		const result = await trackVisitorQueue(visitorUuid, clientHash);

		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status });
		}

		return NextResponse.json<VisitorFormTrackResponse>(result.data);
	} catch (error) {
		console.error("Error tracking visitor queue:", error);
		return NextResponse.json(
			{ error: "Failed to track queue status" },
			{ status: 500 }
		);
	}
}
