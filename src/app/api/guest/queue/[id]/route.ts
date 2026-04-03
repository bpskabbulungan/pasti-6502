import { NextResponse } from "next/server";
import { extractEtagMarker, toEtag } from "@/lib/http-cache";
import { getGuestQueueDetail } from "@api/modules/guest";
import type { GuestQueueDetail } from "@shared/types/guest";

export async function GET(req: Request) {
  const pathname = new URL(req.url).pathname;
  const segments = pathname.split("/").filter(Boolean);
  const queueId = segments[segments.length - 1];

  if (!queueId) {
    return NextResponse.json({ error: "Queue ID is required" }, { status: 400 });
  }

  try {
    const clientHash =
      new URL(req.url).searchParams.get("hash") ??
      extractEtagMarker(req.headers.get("if-none-match"));
    const result = await getGuestQueueDetail(queueId, clientHash);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    const etag = result.hash ? toEtag(result.hash) : null;

    if (!result.hasChanges && etag) {
      return new NextResponse(null, {
        status: 304,
        headers: { etag },
      });
    }

    return NextResponse.json<GuestQueueDetail>(result.data, {
      headers: etag ? { etag } : undefined,
    });
  } catch (error) {
    console.error("Error fetching guest queue detail:", error);
    return NextResponse.json({ error: "Failed to fetch guest queue detail" }, { status: 500 });
  }
}
