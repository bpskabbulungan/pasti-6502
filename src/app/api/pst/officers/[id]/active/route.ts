import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireApiGuard } from "@/lib/api-guard";
import { setOfficerCandidateActive, toggleOfficerCandidateSchema } from "@api/modules/pst";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireApiGuard({ request: req, roles: [Role.ADMIN] });
    if (guard.ok === false) {
      return guard.response;
    }

    const body = await req.json().catch(() => ({}));
    const parsed = toggleOfficerCandidateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Payload tidak valid", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { id } = await params;
    const result = await setOfficerCandidateActive(id, parsed.data.isActiveCandidate);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ officer: result.officer });
  } catch (error) {
    console.error("Error updating candidate status:", error);
    return NextResponse.json({ error: "Gagal memperbarui status kandidat" }, { status: 500 });
  }
}
