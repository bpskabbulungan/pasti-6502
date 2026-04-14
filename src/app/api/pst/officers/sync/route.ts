import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { checkSigapEnv } from "@api/config/env-checker";
import { requireApiGuard } from "@/lib/api-guard";
import { syncEligibleOfficers } from "@api/modules/pst";

export async function POST(req: NextRequest) {
  try {
    const guard = await requireApiGuard({ request: req, roles: [Role.ADMIN] });
    if (!guard.ok) {
      return guard.response;
    }

    const envStatus = checkSigapEnv();
    if (!envStatus.isValid) {
      return NextResponse.json({ error: envStatus.message }, { status: 400 });
    }

    const result = await syncEligibleOfficers(guard.session.user?.id);
    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error,
          syncSummary: result.syncSummary,
        },
        { status: result.status }
      );
    }

    return NextResponse.json({
      syncSummary: result.syncSummary,
      officers: result.officers,
    });
  } catch (error) {
    console.error("Error syncing SIGAP officers:", error);
    return NextResponse.json({ error: "Sinkronisasi SIGAP gagal diproses" }, { status: 500 });
  }
}
