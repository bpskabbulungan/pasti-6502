import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { extractEtagMarker, toEtag } from "@/lib/http-cache";
import { QueueStatus } from "@prisma/client";
import { getQueues } from "@api/modules/queues";
import type { QueueListResponse } from "@shared/types/queue";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const statusParam = url.searchParams.get("status") as QueueStatus | null;
    const clientHash =
      url.searchParams.get("hash") ?? extractEtagMarker(req.headers.get("if-none-match")) ?? "";
    const dateFilterParam = url.searchParams.get("dateFilter");
    const dateFilter: "today" | "all" = dateFilterParam === "all" ? "all" : "today";
    const limitParam = url.searchParams.get("limit");
    const offsetParam = url.searchParams.get("offset");

    const status = statusParam || QueueStatus.WAITING;

    const result = await getQueues({
      status,
      dateFilter,
      clientHash,
      limit: limitParam,
      offset: offsetParam,
    });
    const etag = toEtag(result.hash);

    if (!result.hasChanges) {
      return new NextResponse(null, {
        status: 304,
        headers: { etag },
      });
    }

    return NextResponse.json<QueueListResponse>(result, {
      headers: { etag },
    });
  } catch (error) {
    console.error("Error fetching queues:", error);
    return NextResponse.json({ error: "Failed to fetch queues" }, { status: 500 });
  }
}
