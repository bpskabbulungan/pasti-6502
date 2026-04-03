import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { listDutyStaff } from "@api/modules/schedule";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await listDutyStaff();
    return NextResponse.json({ staff: result.staff });
  } catch (error) {
    console.error("Error fetching duty staff:", error);
    return NextResponse.json({ error: "Failed to fetch duty staff" }, { status: 500 });
  }
}
