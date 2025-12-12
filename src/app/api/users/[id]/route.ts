import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Updated import path
import bcryptjs from "bcryptjs";
import prisma from "@/lib/prisma"; // Import shared prisma instance
import { Role } from "@/generated/prisma"; // Add this import

// PATCH - Update a user
export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		// Get the current session to verify authentication
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Check if user is a superadmin
		if (session.user.role !== Role.SUPERADMIN) {
			return NextResponse.json(
				{ error: "Only superadmins can update users" },
				{ status: 403 }
			);
		}

		const { id } = await params;
		const data = await req.json();
		const { name, username, password } = data;

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { id },
		});

		if (!existingUser) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Prevent updating superadmin
		if (existingUser.role === Role.SUPERADMIN) {
			return NextResponse.json(
				{ error: "Cannot update superadmin account" },
				{ status: 403 }
			);
		}

		// Check if username already exists (for someone else)
		if (username && username !== existingUser.username) {
			const usernameExists = await prisma.user.findUnique({
				where: { username },
			});

			if (usernameExists) {
				return NextResponse.json(
					{ error: "Username already exists" },
					{ status: 409 }
				);
			}
		}

		// Update user
		const updateData: Partial<{
			name: string;
			username: string;
			password: string;
		}> = {};
		if (name) updateData.name = name;
		if (username) updateData.username = username;
		if (password) updateData.password = await bcryptjs.hash(password, 10);

		const updatedUser = await prisma.user.update({
			where: { id },
			data: updateData,
			select: {
				id: true,
				name: true,
				username: true,
				role: true,
				createdAt: true,
			},
		});

		return NextResponse.json({
			message: "User updated successfully",
			user: updatedUser,
		});
	} catch (error) {
		console.error("Error updating user:", error);
		return NextResponse.json(
			{ error: "Failed to update user" },
			{ status: 500 }
		);
	}
}

// DELETE - Delete a user
export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		// Get the current session to verify authentication
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Check if user is a superadmin
		if (session.user.role !== Role.SUPERADMIN) {
			return NextResponse.json(
				{ error: "Only superadmins can delete users" },
				{ status: 403 }
			);
		}

		const { id } = await params;

		// Check if user exists
		const existingUser = await prisma.user.findUnique({
			where: { id },
		});

		if (!existingUser) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Prevent deleting superadmin
		if (existingUser.role === Role.SUPERADMIN) {
			return NextResponse.json(
				{ error: "Cannot delete superadmin account" },
				{ status: 403 }
			);
		}

		// Delete user
		await prisma.user.delete({
			where: { id },
		});

		return NextResponse.json({
			message: "User deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting user:", error);
		return NextResponse.json(
			{ error: "Failed to delete user" },
			{ status: 500 }
		);
	}
}
