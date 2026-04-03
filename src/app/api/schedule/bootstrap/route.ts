import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { getDutyScheduleBootstrap } from "@api/modules/schedule";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
