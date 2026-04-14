import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireApiGuard } from "@/lib/api-guard";
import { getStoredOrCreatePstSchedulePdf } from "@api/modules/pst";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guard = await requireApiGuard({ request: req, roles: [Role.ADMIN] });
    if (!guard.ok) {
      return guard.response;
    }

    const { id } = await params;
    const result = await getStoredOrCreatePstSchedulePdf(id);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return new NextResponse(result.body, {
      headers: {
        "Content-Type": result.contentType,
        "Content-Disposition": `attachment; filename="${result.fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading monthly schedule PDF:", error);
    return NextResponse.json({ error: "Gagal mengunduh PDF jadwal bulanan" }, { status: 500 });
  }
}
