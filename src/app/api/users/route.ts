import { Role } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createUser, listUsers } from "@api/modules/users";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (session.user.role !== Role.SUPERADMIN) {
			return NextResponse.json(
				{ error: "Only superadmins can view users" },
				{ status: 403 }
			);
		}

		const result = await listUsers();

		return NextResponse.json(result);
	} catch (error) {
		console.error("Error fetching users:", error);
		return NextResponse.json(
			{ error: "Failed to fetch users" },
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

		if (session.user.role !== Role.SUPERADMIN) {
			return NextResponse.json(
				{ error: "Only superadmins can create users" },
				{ status: 403 }
			);
		}

		const data = await req.json();
		const { name, username, password, role } = data;

		const result = await createUser({ name, username, password, role });

		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status });
		}

		return NextResponse.json({
			message: "User created successfully",
			user: result.user,
		});
	} catch (error) {
		console.error("Error creating user:", error);
		return NextResponse.json(
			{ error: "Failed to create user" },
			{ status: 500 }
		);
	}
}
