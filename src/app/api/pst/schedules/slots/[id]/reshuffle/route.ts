import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireApiGuard } from "@/lib/api-guard";
import { reshuffleSingleSlot, reshuffleSingleSlotSchema } from "@api/modules/pst";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireApiGuard({ request: req, roles: [Role.ADMIN] });
    if (!guard.ok) {
      return guard.response;
    }

    const body = await req.json().catch(() => ({}));
    const parsed = reshuffleSingleSlotSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Payload reshuffle tidak valid",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { id } = await params;
    const result = await reshuffleSingleSlot(id, {
      reason: parsed.data.reason,
      performedById: guard.session.user?.id,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ detail: result.detail });
  } catch (error) {
    console.error("Error reshuffling schedule slot:", error);
    return NextResponse.json({ error: "Gagal reshuffle slot jadwal" }, { status: 500 });
  }
}
