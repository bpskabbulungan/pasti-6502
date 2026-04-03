import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireApiGuard } from "@/lib/api-guard";
import { listDutyReminderLogs } from "@api/modules/schedule";

export async function GET(req: NextRequest) {
	try {
		const guard = await requireApiGuard({ request: req, roles: [Role.ADMIN] });
		if (!guard.ok) {
			return guard.response;
		}

		const { searchParams } = new URL(req.url);
		const from = searchParams.get("from");
		const to = searchParams.get("to");
		const result = await listDutyReminderLogs(from, to);
		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status });
		}

		return NextResponse.json({ logs: result.logs });
	} catch (error) {
		console.error("Error fetching reminder logs:", error);
		return NextResponse.json(
			{ error: "Failed to fetch reminder logs" },
			{ status: 500 }
		);
	}
}
