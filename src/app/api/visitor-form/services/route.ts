import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { getVisitorServices } from "@api/modules/visitor-form";
import type { VisitorFormServicesResponse } from "@shared/types/visitor-form";

export async function GET(req: NextRequest) {
	try {
		const limiter = await rateLimit(req, "visitor-form-services", {
			limit: 20,
			windowMs: 60_000,
		});
		if (!limiter.allowed) {
			return NextResponse.json(
				{ error: "Terlalu banyak permintaan, coba lagi nanti." },
				{ status: 429 }
			);
		}

		const visitorUuid = req.headers.get("x-visitor-uuid");

		if (!visitorUuid) {
			return NextResponse.json(
				{ error: "Missing visitor UUID" },
				{ status: 400 }
			);
		}

		const result = await getVisitorServices(visitorUuid);
		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status });
		}

		return NextResponse.json<VisitorFormServicesResponse>({
			services: result.services,
		});
	} catch (error) {
		console.error("Error fetching services:", error);
		return NextResponse.json(
			{ error: "Failed to fetch services" },
			{ status: 500 }
		);
	}
}
