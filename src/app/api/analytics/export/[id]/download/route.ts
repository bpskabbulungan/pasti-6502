import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireApiGuard } from "@/lib/api-guard";
import { getAnalyticsExportDownload } from "@api/modules/analytics";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guard = await requireApiGuard({ request: _req, roles: [Role.ADMIN] });
    if (!guard.ok) {
      return guard.response;
    }

    const { id } = await params;
    const result = await getAnalyticsExportDownload(id, guard.session.user.id);

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
    console.error("Error downloading analytics export file:", error);
    return NextResponse.json(
      { error: "Failed to download analytics export file" },
      { status: 500 }
    );
  }
}
