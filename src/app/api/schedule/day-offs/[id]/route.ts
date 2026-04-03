import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireApiGuard } from "@/lib/api-guard";
import { removeDutyDayOff } from "@api/modules/schedule";

export async function DELETE(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const guard = await requireApiGuard({ request: _req, roles: [Role.ADMIN] });
		if (!guard.ok) {
			return guard.response;
		}

		const { id } = await params;
		const result = await removeDutyDayOff(id);
		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting duty day off:", error);
		return NextResponse.json(
			{ error: "Failed to delete duty day off" },
			{ status: 500 }
		);
	}
}
