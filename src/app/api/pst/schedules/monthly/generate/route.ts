import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireApiGuard } from "@/lib/api-guard";
import {
  generateAndStorePstSchedulePdf,
  generateMonthlySchedule,
  generateMonthlyScheduleSchema,
} from "@api/modules/pst";

export async function POST(req: NextRequest) {
  try {
    const guard = await requireApiGuard({ request: req, roles: [Role.ADMIN] });
    if (!guard.ok) {
      return guard.response;
    }

    const body = await req.json().catch(() => ({}));
    const parsed = generateMonthlyScheduleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Payload generate jadwal bulanan tidak valid",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { downloadPdf, ...generatePayload } = parsed.data;
    const result = await generateMonthlySchedule({
      ...generatePayload,
      generatedById: guard.session.user?.id,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const generatedPdf = await generateAndStorePstSchedulePdf({
      schedule: result.schedule,
      generatedById: guard.session.user?.id ?? null,
      generatedByName: guard.session.user?.name ?? null,
    });

    if (!generatedPdf.ok) {
      return NextResponse.json(
        {
          error: `Jadwal berhasil dibuat, tetapi PDF gagal dibuat: ${generatedPdf.error}`,
          schedule: result.schedule,
          alreadyExists: result.alreadyExists,
        },
        { status: generatedPdf.status }
      );
    }

    if (downloadPdf) {
      return new NextResponse(generatedPdf.body, {
        headers: {
          "Content-Type": generatedPdf.contentType,
          "Content-Disposition": `attachment; filename="${generatedPdf.fileName}"`,
        },
      });
    }

    return NextResponse.json({
      schedule: result.schedule,
      alreadyExists: result.alreadyExists,
      pdf: generatedPdf.metadata,
    });
  } catch (error) {
    console.error("Error generating monthly schedule:", error);
    return NextResponse.json({ error: "Gagal generate jadwal bulanan" }, { status: 500 });
  }
}
