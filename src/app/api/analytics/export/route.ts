import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireApiGuard } from "@/lib/api-guard";
import { createAnalyticsExportJob } from "@api/modules/analytics";
import { parseDateRange } from "@api/modules/analytics/analytics-summary.service";
import { toIsoDateInTimeZone } from "@shared/utils/date-boundary";

export async function POST(req: NextRequest) {
  try {
    const guard = await requireApiGuard({ request: req, roles: [Role.ADMIN] });
    if (!guard.ok) {
      return guard.response;
    }

    const body = (await req.json().catch(() => null)) as {
      startDate?: string;
      endDate?: string;
      format?: "xlsx" | "pdf";
    } | null;

    const todayString = toIsoDateInTimeZone(new Date());
    const startDateParam = body?.startDate || todayString;
    const endDateParam = body?.endDate || startDateParam;
    const formatParam = body?.format ?? "xlsx";

    if (formatParam !== "xlsx") {
      return NextResponse.json({ error: "Format export tidak didukung" }, { status: 400 });
    }

    const parsedRange = parseDateRange(startDateParam, endDateParam, 366);
    if (!parsedRange.ok) {
      return NextResponse.json({ error: parsedRange.error }, { status: parsedRange.status });
    }

    const result = await createAnalyticsExportJob(
      guard.session.user.id,
      parsedRange.range,
      formatParam
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result, { status: 202 });
  } catch (error) {
    console.error("Error creating analytics export job:", error);
    return NextResponse.json({ error: "Failed to create analytics export job" }, { status: 500 });
  }
}
