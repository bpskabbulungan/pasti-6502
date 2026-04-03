import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireApiGuard } from "@/lib/api-guard";
import { createUser, listUsers } from "@api/modules/users";

export async function GET() {
	try {
		const guard = await requireApiGuard({ roles: [Role.ADMIN] });
		if (!guard.ok) {
			return NextResponse.json(
				{
					error:
						guard.response.status === 403
							? "Only admins can view users"
							: "Unauthorized",
				},
				{ status: guard.response.status }
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
		const guard = await requireApiGuard({ request: req, roles: [Role.ADMIN] });
		if (!guard.ok) {
			return NextResponse.json(
				{
					error:
						guard.response.status === 403
							? "Only admins can create users"
							: "Unauthorized",
				},
				{ status: guard.response.status }
			);
		}

		const data = await req.json();
		const { name, username, password, phone, role } = data;

		const result = await createUser({ name, username, password, phone, role });

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
