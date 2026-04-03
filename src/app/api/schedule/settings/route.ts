import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { getDutySettings, updateDutySettings } from "@api/modules/schedule";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		if (session.user.role !== Role.ADMIN) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		if (session.user.role !== Role.ADMIN) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

