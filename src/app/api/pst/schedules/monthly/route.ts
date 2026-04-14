import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireApiGuard } from "@/lib/api-guard";
import { getMonthlySchedule, listMonthlySchedules } from "@api/modules/pst";

export async function GET(req: NextRequest) {
  try {
    const guard = await requireApiGuard({ request: req, roles: [Role.ADMIN] });
    if (!guard.ok) {
      return guard.response;
    }

    const { searchParams } = new URL(req.url);
    const monthRaw = searchParams.get("month");
    const yearRaw = searchParams.get("year");

    if (monthRaw && yearRaw) {
      const month = Number(monthRaw);
      const year = Number(yearRaw);

      if (!Number.isInteger(month) || !Number.isInteger(year)) {
        return NextResponse.json({ error: "month dan year harus berupa angka" }, { status: 400 });
      }

      const schedule = await getMonthlySchedule(month, year);
      if (!schedule) {
        return NextResponse.json({ error: "Jadwal bulanan tidak ditemukan" }, { status: 404 });
      }

      return NextResponse.json({ schedule });
    }

    const limitRaw = searchParams.get("limit");
    const limit = limitRaw ? Number(limitRaw) : 6;
    const schedules = await listMonthlySchedules(Number.isInteger(limit) ? limit : 6);

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("Error loading monthly schedules:", error);
    return NextResponse.json({ error: "Gagal memuat jadwal bulanan" }, { status: 500 });
  }
}
