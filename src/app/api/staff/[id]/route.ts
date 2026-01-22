import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
	deactivateStaff,
	getStaffById,
	updateStaff,
} from "@api/modules/staff";

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const result = await getStaffById(id);

		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status });
		}

		return NextResponse.json({ staff: result.staff });
	} catch (error) {
		console.error("Error fetching staff detail:", error);
		return NextResponse.json(
			{ error: "Failed to fetch staff detail" },
			{ status: 500 }
		);
	}
}

export async function PUT(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const body = await req.json();
		const result = await updateStaff(id, body);

		if (!result.ok) {
			return NextResponse.json(
				{ error: result.error, details: result.details },
				{ status: result.status }
			);
		}

		return NextResponse.json({ staff: result.staff });
	} catch (error) {
		console.error("Error updating staff:", error);
		return NextResponse.json(
			{ error: "Failed to update staff" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const result = await deactivateStaff(id);

		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status });
		}

		return NextResponse.json({ staff: result.staff });
	} catch (error) {
		console.error("Error deactivating staff:", error);
		return NextResponse.json(
			{ error: "Failed to deactivate staff" },
			{ status: 500 }
		);
	}
}
