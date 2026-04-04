import { NextRequest, NextResponse } from "next/server";
import { extractEtagMarker, toEtag } from "@/lib/http-cache";
import { Role } from "@prisma/client";
import { requireApiGuard } from "@/lib/api-guard";
import {
  getAnalyticsSummary,
  parseDateRange,
} from "@api/modules/analytics/analytics-summary.service";
import { toIsoDateInTimeZone } from "@shared/utils/date-boundary";
import type { AnalyticsSummary } from "@shared/types/analytics";

export async function GET(req: NextRequest) {
  try {
    const guard = await requireApiGuard({ request: req, roles: [Role.ADMIN] });
    if (!guard.ok) {
      return guard.response;
    }

    const { searchParams } = new URL(req.url);
    const todayString = toIsoDateInTimeZone(new Date());
    const startDateParam = searchParams.get("startDate") || todayString;
    const endDateParam = searchParams.get("endDate") || startDateParam;
    const clientHash =
      searchParams.get("hash") ?? extractEtagMarker(req.headers.get("if-none-match"));
    const maxRangeDays = 31;

    const parsedRange = parseDateRange(startDateParam, endDateParam, maxRangeDays);
    if (!parsedRange.ok) {
      return NextResponse.json({ error: parsedRange.error }, { status: parsedRange.status });
    }

    const result = await getAnalyticsSummary(
      parsedRange.range.startDate,
      parsedRange.range.endDate,
      clientHash
    );
    const etag = result.hash ? toEtag(result.hash) : null;

    if (!result.hasChanges && etag) {
      return new NextResponse(null, {
        status: 304,
        headers: { etag },
      });
    }

    return NextResponse.json<AnalyticsSummary>(result, {
      headers: etag ? { etag } : undefined,
    });
  } catch (error) {
    console.error("Error fetching analytics data", error);
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 });
  }
}
