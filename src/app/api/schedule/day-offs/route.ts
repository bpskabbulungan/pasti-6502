import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { createDutyDayOff, listDutyDayOffs } from "@api/modules/schedule";

export async function GET(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		if (session.user.role !== Role.ADMIN) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}
		if (session.user.role !== Role.ADMIN) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

