import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { format } from "date-fns";
import { createAnalyticsExportJob, parseDateRange } from "@api/modules/analytics";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as {
      startDate?: string;
      endDate?: string;
      format?: "xlsx" | "pdf";
    } | null;

    const todayString = format(new Date(), "yyyy-MM-dd");
    const startDateParam = body?.startDate || todayString;
    const endDateParam = body?.endDate || startDateParam;
    const formatParam = body?.format ?? "xlsx";

    if (formatParam !== "xlsx" && formatParam !== "pdf") {
      return NextResponse.json({ error: "Format export tidak didukung" }, { status: 400 });
    }

    const parsedRange = parseDateRange(startDateParam, endDateParam, 90);
    if (!parsedRange.ok) {
      return NextResponse.json({ error: parsedRange.error }, { status: parsedRange.status });
    }

    const result = await createAnalyticsExportJob(session.user.id, parsedRange.range, formatParam);

    return NextResponse.json(result, { status: 202 });
  } catch (error) {
    console.error("Error creating analytics export job:", error);
    return NextResponse.json({ error: "Failed to create analytics export job" }, { status: 500 });
  }
}
