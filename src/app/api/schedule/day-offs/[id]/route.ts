import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { removeDutyDayOff } from "@api/modules/schedule";

export async function DELETE(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		if (session.user.role !== Role.ADMIN) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

