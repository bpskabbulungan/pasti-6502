import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAnalyticsExportJob } from "@api/modules/analytics";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const result = await getAnalyticsExportJob(id, session.user.id);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ job: result.job });
  } catch (error) {
    console.error("Error fetching analytics export job:", error);
    return NextResponse.json({ error: "Failed to fetch analytics export job" }, { status: 500 });
  }
}
