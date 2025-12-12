import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { generateDynamicUuid } from "@api/modules/visitor-form";
import type {
	VisitorFormDynamicUuidResponse,
	VisitorFormDynamicUuidErrorResponse,
} from "@shared/types/visitor-form";
import type { ErrorResponse } from "@shared/types/api";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ uuid: string }> }
) {
	try {
		const limiter = await rateLimit(req, "visitor-form-uuid", {
			limit: 15,
			windowMs: 60_000,
		});
		if (!limiter.allowed) {
			return NextResponse.json(
				{ error: "Terlalu banyak permintaan, coba lagi nanti." },
				{ status: 429 }
			);
		}

		const { uuid } = await params;

		const result = await generateDynamicUuid(uuid);

		if (!result.ok) {
			return NextResponse.json<VisitorFormDynamicUuidErrorResponse>(
				{
					error: result.error as VisitorFormDynamicUuidErrorResponse["error"],
				},
				{ status: result.status }
			);
		}

		return NextResponse.json<VisitorFormDynamicUuidResponse>({
			dynamicUuid: result.dynamicUuid,
		});
	} catch (error) {
		console.error("Error validating QR code:", error);
		return NextResponse.json<ErrorResponse>(
			{ error: "Failed to process QR code" },
			{ status: 500 }
		);
	}
}
