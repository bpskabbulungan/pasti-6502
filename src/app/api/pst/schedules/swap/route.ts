import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireApiGuard } from "@/lib/api-guard";
import { swapSchedule, swapScheduleSchema } from "@api/modules/pst";

export async function POST(req: NextRequest) {
  try {
    const guard = await requireApiGuard({ request: req, roles: [Role.ADMIN] });
    if (!guard.ok) {
      return guard.response;
    }

    const body = await req.json().catch(() => ({}));
    const parsed = swapScheduleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Payload swap jadwal tidak valid",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const result = await swapSchedule(parsed.data.firstScheduleId, parsed.data.secondScheduleId, {
      reason: parsed.data.reason,
      performedById: guard.session.user?.id,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ swapped: result.swapped });
  } catch (error) {
    console.error("Error swapping schedule:", error);
    return NextResponse.json({ error: "Gagal swap jadwal" }, { status: 500 });
  }
}
