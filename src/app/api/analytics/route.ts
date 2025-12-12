import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { format } from "date-fns";
import { getAnalyticsSummary, parseDateRange } from "@api/modules/analytics";
import type { AnalyticsSummary } from "@shared/types/analytics";

export async function GET(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(req.url);
		const todayString = format(new Date(), "yyyy-MM-dd");
		const startDateParam = searchParams.get("startDate") || todayString;
		const endDateParam = searchParams.get("endDate") || startDateParam;
		const maxRangeDays = 31;

		const parsedRange = parseDateRange(startDateParam, endDateParam, maxRangeDays);
		if (!parsedRange.ok) {
			return NextResponse.json(
				{ error: parsedRange.error },
				{ status: parsedRange.status }
			);
		}

		const result = await getAnalyticsSummary(
			parsedRange.range.startDate,
			parsedRange.range.endDate
		);

		return NextResponse.json<AnalyticsSummary>(result);
	} catch (error) {
		console.error("Error fetching analytics data", error);
		return NextResponse.json(
			{ error: "Failed to fetch analytics data" },
			{ status: 500 }
		);
	}
}
