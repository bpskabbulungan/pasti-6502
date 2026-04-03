import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireApiGuard } from "@/lib/api-guard";
import { listSchedules } from "@api/modules/schedule";

export async function GET(req: NextRequest) {
	try {
		const guard = await requireApiGuard({
			request: req,
			roles: [Role.ADMIN, Role.PETUGAS],
		});
		if (!guard.ok) {
			return guard.response;
		}

		const { searchParams } = new URL(req.url);
		const from = searchParams.get("from");
		const to = searchParams.get("to");

		const result = await listSchedules(from, to);

		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status });
		}

		return NextResponse.json({ schedules: result.schedules });
	} catch (error) {
		console.error("Error fetching schedules:", error);
		return NextResponse.json(
			{ error: "Failed to fetch schedules" },
			{ status: 500 }
		);
	}
}
