import { NextRequest, NextResponse } from "next/server";
import { requireApiGuard } from "@/lib/api-guard";
import { extractEtagMarker, toEtag } from "@/lib/http-cache";
import { getGuestbookEntries } from "@api/modules/guestbook";
import type { GuestbookListResponse } from "@shared/types/guestbook";

export async function GET(req: NextRequest) {
  try {
    const guard = await requireApiGuard({ request: req });
    if (!guard.ok) {
      return guard.response;
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const purpose = url.searchParams.get("purpose");
    const dateFilterParam = url.searchParams.get("dateFilter");
    const dateFilter =
      dateFilterParam === "all" || dateFilterParam === "today" ? dateFilterParam : "today";
    const limitParam = url.searchParams.get("limit");
    const offsetParam = url.searchParams.get("offset");
    const search = url.searchParams.get("search");
    const clientHash =
      url.searchParams.get("hash") ?? extractEtagMarker(req.headers.get("if-none-match"));

    const result = await getGuestbookEntries({
      status,
      purpose,
      dateFilter,
      search,
      limit: limitParam,
      offset: offsetParam,
      clientHash,
    });
    const etag = result.hash ? toEtag(result.hash) : null;

    if (!result.hasChanges && etag) {
      return new NextResponse(null, {
        status: 304,
        headers: { etag },
      });
    }

    return NextResponse.json<GuestbookListResponse>(result, {
      headers: etag ? { etag } : undefined,
    });
  } catch (error) {
    console.error("Error fetching guestbook entries:", error);
    return NextResponse.json({ error: "Failed to fetch guestbook entries" }, { status: 500 });
  }
}
