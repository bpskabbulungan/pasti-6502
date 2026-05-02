import { NextRequest, NextResponse } from "next/server";
import { PstGenerateAttemptStatus, Role } from "@prisma/client";
import { requireApiGuard } from "@/lib/api-guard";
import {
  createPstGenerateAttemptLog,
  finalizePstGenerateAttemptLog,
  generateAndStorePstSchedulePdf,
  generateMonthlySchedule,
  generateMonthlyScheduleSchema,
  listPstGenerateAttemptLogs,
} from "@api/modules/pst";

const toSafeErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message.slice(0, 191);
  }

  if (typeof error === "string") {
    return error.slice(0, 191);
  }

  return "Terjadi kesalahan saat memproses generate".slice(0, 191);
};

export async function GET(req: NextRequest) {
  try {
    const guard = await requireApiGuard({ request: req, roles: [Role.ADMIN] });
    if (!guard.ok) {
      return guard.response;
    }

    const { searchParams } = new URL(req.url);
    const monthRaw = searchParams.get("month");
    const yearRaw = searchParams.get("year");
    const limitRaw = searchParams.get("limit");

    if ((monthRaw && !yearRaw) || (!monthRaw && yearRaw)) {
      return NextResponse.json(
        { error: "month dan year harus dikirim bersamaan jika ingin memfilter periode" },
        { status: 400 }
      );
    }

    const month = monthRaw === null ? undefined : Number(monthRaw);
    const year = yearRaw === null ? undefined : Number(yearRaw);
    const limit = limitRaw === null ? undefined : Number(limitRaw);

    if (month !== undefined && (!Number.isInteger(month) || month < 1 || month > 12)) {
      return NextResponse.json({ error: "month harus berupa angka 1-12" }, { status: 400 });
    }

    if (year !== undefined && !Number.isInteger(year)) {
      return NextResponse.json({ error: "year harus berupa angka" }, { status: 400 });
    }

    if (limit !== undefined && (!Number.isInteger(limit) || limit < 1)) {
      return NextResponse.json({ error: "limit harus berupa angka positif" }, { status: 400 });
    }

    const logs = await listPstGenerateAttemptLogs({
      month,
      year,
      limit,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error loading PST generate attempt logs:", error);
    return NextResponse.json(
      { error: "Gagal memuat log percobaan generate PST" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  let attemptLogId: string | null = null;

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
    try {
      attemptLogId = await createPstGenerateAttemptLog({
        month: generatePayload.month,
        year: generatePayload.year,
        downloadPdf: Boolean(downloadPdf),
        forceRegenerate: Boolean(generatePayload.forceRegenerate),
        allowSameFridayAssignee: Boolean(generatePayload.allowSameFridayAssignee),
        requestedById: guard.session.user?.id ?? null,
      });
    } catch (loggingError) {
      console.error("Error creating PST generate attempt log:", loggingError);
    }

    const result = await generateMonthlySchedule({
      ...generatePayload,
      generatedById: guard.session.user?.id,
      generatedByName: guard.session.user?.name ?? null,
    });

    if (!result.ok) {
      if (attemptLogId) {
        await finalizePstGenerateAttemptLog({
          id: attemptLogId,
          status: PstGenerateAttemptStatus.FAILED,
          errorMessage: toSafeErrorMessage(result.error),
        });
      }
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const generatedPdf = await generateAndStorePstSchedulePdf({
      schedule: result.schedule,
      generatedById: guard.session.user?.id ?? null,
      generatedByName: guard.session.user?.name ?? null,
      includeBody: Boolean(downloadPdf),
    });

    if (!generatedPdf.ok) {
      if (attemptLogId) {
        await finalizePstGenerateAttemptLog({
          id: attemptLogId,
          status: PstGenerateAttemptStatus.FAILED,
          alreadyExists: result.alreadyExists,
          monthlyScheduleId: result.schedule.id,
          errorMessage: toSafeErrorMessage(generatedPdf.error),
        });
      }
      return NextResponse.json(
        {
          error: `Jadwal berhasil dibuat, tetapi PDF gagal dibuat: ${generatedPdf.error}`,
          schedule: result.schedule,
          alreadyExists: result.alreadyExists,
        },
        { status: generatedPdf.status }
      );
    }

    if (attemptLogId) {
      await finalizePstGenerateAttemptLog({
        id: attemptLogId,
        status: PstGenerateAttemptStatus.SUCCESS,
        alreadyExists: result.alreadyExists,
        monthlyScheduleId: result.schedule.id,
      });
    }

    if (downloadPdf) {
      if (!generatedPdf.body) {
        return NextResponse.json(
          {
            error: "PDF berhasil disimpan, tetapi body unduhan tidak tersedia",
            schedule: result.schedule,
            alreadyExists: result.alreadyExists,
          },
          { status: 500 }
        );
      }
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
    if (attemptLogId) {
      await finalizePstGenerateAttemptLog({
        id: attemptLogId,
        status: PstGenerateAttemptStatus.FAILED,
        errorMessage: toSafeErrorMessage(error),
      });
    }
    console.error("Error generating monthly schedule:", error);
    return NextResponse.json({ error: "Gagal generate jadwal bulanan" }, { status: 500 });
  }
}
