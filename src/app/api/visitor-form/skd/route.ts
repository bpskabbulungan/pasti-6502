import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { markSkdFilled } from "@api/modules/visitor-form";

export async function POST(req: NextRequest) {
	try {
		const limiter = await rateLimit(req, "visitor-form-skd", {
			limit: 8,
			windowMs: 60_000,
		});
		if (!limiter.allowed) {
			return NextResponse.json(
				{ error: "Terlalu banyak permintaan, coba lagi nanti." },
				{ status: 429 }
			);
		}

		const schema = z.object({
			tempUuid: z.string().uuid("Link sementara tidak valid"),
			filled: z.boolean(),
		});

		const parsed = schema.safeParse(await req.json());
		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Data tidak valid", details: parsed.error.flatten().fieldErrors },
				{ status: 400 }
			);
		}

		const { tempUuid, filled } = parsed.data;

		const result = await markSkdFilled(tempUuid, filled);

		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status });
		}

		return NextResponse.json({
			success: true,
			message: result.message,
		});
	} catch (error) {
		console.error("Error updating SKD status:", error);
		return NextResponse.json(
			{ error: "Failed to update SKD status" },
			{ status: 500 }
		);
	}
}
