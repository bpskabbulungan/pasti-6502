import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireApiGuard } from "@/lib/api-guard";
import { getDutyScheduleBootstrap } from "@api/modules/schedule";

export async function GET(req: NextRequest) {
  try {
    const guard = await requireApiGuard({ request: req, roles: [Role.ADMIN] });
    if (!guard.ok) {
      return guard.response;
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const result = await getDutyScheduleBootstrap(date);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.bootstrap);
  } catch (error) {
    console.error("Error fetching duty schedule bootstrap:", error);
    return NextResponse.json({ error: "Failed to fetch duty schedule bootstrap" }, { status: 500 });
  }
}
