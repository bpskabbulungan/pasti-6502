import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireApiGuard } from "@/lib/api-guard";
import { listDutyStaff } from "@api/modules/schedule";

export async function GET(req: Request) {
  try {
    const guard = await requireApiGuard({ request: req, roles: [Role.ADMIN] });
    if (!guard.ok) {
      return guard.response;
    }

    const result = await listDutyStaff();
    return NextResponse.json({ staff: result.staff });
  } catch (error) {
    console.error("Error fetching duty staff:", error);
    return NextResponse.json({ error: "Failed to fetch duty staff" }, { status: 500 });
  }
}
