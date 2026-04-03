import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireApiGuard } from "@/lib/api-guard";
import { createDutyDayOff, listDutyDayOffs } from "@api/modules/schedule";

export async function GET(req: NextRequest) {
	try {
		const guard = await requireApiGuard({ request: req, roles: [Role.ADMIN] });
		if (!guard.ok) {
			return guard.response;
		}

		const { searchParams } = new URL(req.url);
		const from = searchParams.get("from");
		const to = searchParams.get("to");
		const result = await listDutyDayOffs(from, to);

		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status });
		}

		return NextResponse.json({ dayOffs: result.dayOffs });
	} catch (error) {
		console.error("Error fetching duty day offs:", error);
		return NextResponse.json(
			{ error: "Failed to fetch duty day offs" },
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const guard = await requireApiGuard({ request: req, roles: [Role.ADMIN] });
		if (!guard.ok) {
			return guard.response;
		}

		const body = await req.json();
		const result = await createDutyDayOff(body);

		if (!result.ok) {
			return NextResponse.json(
				{ error: result.error, details: result.details },
				{ status: result.status }
			);
		}

		return NextResponse.json({ dayOff: result.dayOff }, { status: 201 });
	} catch (error) {
		console.error("Error creating duty day off:", error);
		return NextResponse.json(
			{ error: "Failed to create duty day off" },
			{ status: 500 }
		);
	}
}
