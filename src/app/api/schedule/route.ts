import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";
import { listSchedules } from "@api/modules/schedule";

export async function GET(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		if (![Role.ADMIN, Role.PETUGAS].includes(session.user.role)) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
