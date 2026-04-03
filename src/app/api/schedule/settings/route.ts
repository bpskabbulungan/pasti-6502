import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireApiGuard } from "@/lib/api-guard";
import { getDutySettings, updateDutySettings } from "@api/modules/schedule";

export async function GET() {
	try {
		const guard = await requireApiGuard({ roles: [Role.ADMIN] });
		if (!guard.ok) {
			return guard.response;
		}

		const result = await getDutySettings();
		return NextResponse.json({ settings: result.settings });
	} catch (error) {
		console.error("Error fetching duty settings:", error);
		return NextResponse.json(
			{ error: "Failed to fetch duty settings" },
			{ status: 500 }
		);
	}
}

export async function PUT(req: NextRequest) {
	try {
		const guard = await requireApiGuard({ request: req, roles: [Role.ADMIN] });
		if (!guard.ok) {
			return guard.response;
		}

		const body = await req.json();
		const result = await updateDutySettings(body);

		if (!result.ok) {
			return NextResponse.json(
				{ error: result.error, details: result.details },
				{ status: result.status }
			);
		}

		return NextResponse.json({ settings: result.settings });
	} catch (error) {
		console.error("Error updating duty settings:", error);
		return NextResponse.json(
			{ error: "Failed to update duty settings" },
			{ status: 500 }
		);
	}
}
