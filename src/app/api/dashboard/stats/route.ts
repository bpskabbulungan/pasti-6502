import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { extractEtagMarker, toEtag } from "@/lib/http-cache";
import { getDashboardStats } from "@api/modules/dashboard";
import type { DashboardStatsResponse } from "@shared/types/dashboard";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
