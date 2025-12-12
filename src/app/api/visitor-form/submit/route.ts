import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { submitVisitorForm } from "@api/modules/visitor-form";
import type { VisitorFormSubmitResponse } from "@shared/types/visitor-form";

export async function POST(req: NextRequest) {
	try {
		const limiter = await rateLimit(req, "visitor-form-submit", {
			limit: 5,
			windowMs: 60_000,
		});
		if (!limiter.allowed) {
			return NextResponse.json(
				{ error: "Terlalu banyak permintaan, coba lagi nanti." },
				{ status: 429 }
			);
		}

		const payload = await req.json();
		const result = await submitVisitorForm(payload);

		if (!result.ok) {
			return NextResponse.json(
				{ error: result.error, details: result.details },
				{ status: result.status }
			);
		}

		return NextResponse.json<VisitorFormSubmitResponse>({
			success: true,
			message: "Queue created successfully",
			data: result.data,
		});
	} catch (error) {
		if ((error as { code?: string }).code === "P2002") {
			return NextResponse.json(
				{ error: "Nomor antrean duplikat, silakan coba lagi." },
				{ status: 409 }
			);
		}
		console.error("Error submitting visitor form:", error);
		return NextResponse.json(
			{ error: "Failed to process visitor form" },
			{ status: 500 }
		);
	}
}
