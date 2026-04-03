import { NextResponse } from "next/server";
import { requireApiGuard } from "@/lib/api-guard";
import { extractEtagMarker, toEtag } from "@/lib/http-cache";
import { getDashboardStats } from "@api/modules/dashboard";
import type { DashboardStatsResponse } from "@shared/types/dashboard";

export async function GET(request: Request) {
  try {
    const guard = await requireApiGuard({ request });
    if (!guard.ok) {
      return guard.response;
    }

    const url = new URL(request.url);
    const clientHash =
      url.searchParams.get("hash") ?? extractEtagMarker(request.headers.get("if-none-match"));

    const result = await getDashboardStats(clientHash);
    const etag = result.hash ? toEtag(result.hash) : null;

    if (!result.hasChanges && etag) {
      return new NextResponse(null, {
        status: 304,
        headers: { etag },
      });
    }

    return NextResponse.json<DashboardStatsResponse>(result, {
      headers: etag ? { etag } : undefined,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 });
  }
}
