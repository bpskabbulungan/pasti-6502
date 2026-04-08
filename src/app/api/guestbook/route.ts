import { NextRequest, NextResponse } from "next/server";
import { requireApiGuard } from "@/lib/api-guard";
import { extractEtagMarker, toEtag } from "@/lib/http-cache";
import { getGuestbookEntries } from "@api/modules/guestbook/guestbook-list.service";
import type { GuestbookListResponse } from "@shared/types/guestbook";

export async function GET(req: NextRequest) {
  try {
    const guard = await requireApiGuard({ request: req });
    if (!guard.ok) {
      return guard.response;
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
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
    const limitParam = url.searchParams.get("limit");
    const offsetParam = url.searchParams.get("offset");
    const search = url.searchParams.get("search");
    const clientHash =
      url.searchParams.get("hash") ?? extractEtagMarker(req.headers.get("if-none-match"));

    const result = await getGuestbookEntries({
      status,
      dateFilter,
      year,
      month,
      quarter,
      semester,
      sortBy,
      sortOrder,
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
