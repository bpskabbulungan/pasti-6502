import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireApiGuard } from "@/lib/api-guard";
import { getAnalyticsExportJob } from "@api/modules/analytics";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guard = await requireApiGuard({ request: _req, roles: [Role.ADMIN] });
    if (!guard.ok) {
      return guard.response;
    }

    const { id } = await params;
    const result = await getAnalyticsExportJob(id, guard.session.user.id);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ job: result.job });
  } catch (error) {
    console.error("Error fetching analytics export job:", error);
    return NextResponse.json({ error: "Failed to fetch analytics export job" }, { status: 500 });
  }
}
