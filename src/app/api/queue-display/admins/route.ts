import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET() {
	try {
		// Get all superadmins and admins
		const admins = await prisma.user.findMany({
			where: {
				OR: [{ role: Role.ADMIN }, { role: Role.SUPERADMIN }],
			},
			select: {
				id: true,
				name: true,
				role: true,
			},
			orderBy: {
				role: "asc", // SUPERADMIN first, then ADMIN
			},
		});

		return NextResponse.json({ admins });
	} catch (error) {
		console.error("Error fetching admins:", error);
		return NextResponse.json(
			{ error: "Failed to fetch admins" },
			{ status: 500 }
		);
	}
}
