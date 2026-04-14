import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireApiGuard } from "@/lib/api-guard";
import { getSyncSummary, listOfficerCandidates } from "@api/modules/pst";

export async function GET(req: NextRequest) {
  try {
    const guard = await requireApiGuard({ request: req, roles: [Role.ADMIN] });
    if (!guard.ok) {
      return guard.response;
    }

    const [officersResult, summaryResult] = await Promise.all([
      listOfficerCandidates(),
      getSyncSummary(),
    ]);

    return NextResponse.json({
      officers: officersResult.officers,
      syncSummary: summaryResult.syncSummary,
    });
  } catch (error) {
    console.error("Error loading PST officers:", error);
    return NextResponse.json({ error: "Gagal memuat data petugas PST" }, { status: 500 });
  }
}
