import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createStaff, listStaff } from "@api/modules/staff";

export async function GET(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(req.url);
		const includeInactive = searchParams.get("includeInactive") === "true";

		const result = await listStaff(includeInactive);

		return NextResponse.json(result);
	} catch (error) {
		console.error("Error fetching staff:", error);
		return NextResponse.json(
			{ error: "Failed to fetch staff" },
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

		const body = await req.json();
		const result = await createStaff(body);

		if (!result.ok) {
			return NextResponse.json(
				{ error: result.error, details: result.details },
				{ status: result.status }
			);
		}

		return NextResponse.json({ staff: result.staff }, { status: 201 });
	} catch (error) {
		console.error("Error creating staff:", error);
		return NextResponse.json(
			{ error: "Failed to create staff" },
			{ status: 500 }
		);
	}
}
