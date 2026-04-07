import { format } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { requireApiGuard } from "@/lib/api-guard";
import { exportGuestbookEntries } from "@api/modules/guestbook";

export async function GET(req: NextRequest) {
	try {
		const guard = await requireApiGuard({ request: req });
		if (!guard.ok) {
			return guard.response;
		}

		const url = new URL(req.url);
		const status = url.searchParams.get("status");
		const purpose = url.searchParams.get("purpose");
		const search = url.searchParams.get("search");
		const dateFilterParam = url.searchParams.get("dateFilter");
		const dateFilter =
			dateFilterParam === "all" ||
			dateFilterParam === "today" ||
			dateFilterParam === "year" ||
			dateFilterParam === "month" ||
			dateFilterParam === "quarter" ||
			dateFilterParam === "semester"
				? dateFilterParam
				: "today";
		const year = url.searchParams.get("year");
		const month = url.searchParams.get("month");
		const quarter = url.searchParams.get("quarter");
		const semester = url.searchParams.get("semester");
		const sortBy = url.searchParams.get("sortBy");
		const sortOrder = url.searchParams.get("sortOrder");
		const formatParam = url.searchParams.get("format");

		if (formatParam && formatParam !== "xlsx" && formatParam !== "pdf") {
			return NextResponse.json(
				{ error: "Format export tidak didukung" },
				{ status: 400 }
			);
		}

		const exportFormat = (formatParam as "xlsx" | "pdf" | null) ?? "xlsx";
		const result = await exportGuestbookEntries({
			status,
			purpose,
			dateFilter,
			year,
			month,
			quarter,
			semester,
			sortBy,
			sortOrder,
			search,
			format: exportFormat,
		});

		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status });
		}

		const timestamp = format(new Date(), "yyyyMMdd-HHmmss");
		const filename = `buku-tamu-pst-${timestamp}.${result.format}`;

		return new NextResponse(result.body, {
			headers: {
				...result.headers,
				"Content-Disposition": `attachment; filename="${filename}"`,
			},
		});
	} catch (error) {
		console.error("Error exporting guestbook data:", error);
		return NextResponse.json(
			{ error: "Failed to export guestbook data" },
			{ status: 500 }
		);
	}
}
