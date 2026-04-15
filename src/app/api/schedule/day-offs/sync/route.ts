import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireApiGuard } from "@/lib/api-guard";
import { syncDutyDayOffsFromSigapNow } from "@api/modules/schedule";

export async function POST(req: NextRequest) {
  try {
    const guard = await requireApiGuard({ request: req, roles: [Role.ADMIN] });
    if (!guard.ok) {
      return guard.response;
    }

    const result = await syncDutyDayOffsFromSigapNow();
    if (!result.ok) {
      return NextResponse.json({ error: "Sinkronisasi hari libur/cuti gagal" }, { status: 500 });
    }

    return NextResponse.json({
      summary: result.summary,
      dayOffs: result.dayOffs,
    });
  } catch (error) {
    console.error("Error syncing duty day offs from SIGAP:", error);
    const errorMessage =
      error instanceof Error && error.message.trim()
        ? error.message
        : "Failed to sync duty day offs from SIGAP";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
