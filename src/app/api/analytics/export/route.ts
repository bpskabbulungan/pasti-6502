import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { format } from "date-fns";
import { exportAnalytics, parseDateRange } from "@api/modules/analytics";

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
		const formatParam = searchParams.get("format");
		if (formatParam && formatParam !== "xlsx" && formatParam !== "pdf") {
			return NextResponse.json(
				{ error: "Format export tidak didukung" },
				{ status: 400 }
			);
		}
		const exportFormat = (formatParam as "xlsx" | "pdf" | null) || "xlsx";
		const maxRangeDays = 90;

		const parsedRange = parseDateRange(startDateParam, endDateParam, maxRangeDays);
		if (!parsedRange.ok) {
			return NextResponse.json(
				{ error: parsedRange.error },
				{ status: parsedRange.status }
			);
		}

		const result = await exportAnalytics(parsedRange.range, exportFormat);

		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status });
		}

		const filename = `pst-queue-report-${format(new Date(), "yyyy-MM-dd")}.${result.format}`;

		return new NextResponse(result.body, {
			headers: {
				...result.headers,
				"Content-Disposition": `attachment; filename="${filename}"`,
			},
		});
	} catch (error) {
		console.error("Error exporting analytics data:", error);
		return NextResponse.json(
			{ error: "Failed to export analytics data" },
			{ status: 500 }
		);
	}
}
