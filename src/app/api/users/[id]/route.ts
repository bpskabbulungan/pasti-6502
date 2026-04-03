import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireApiGuard } from "@/lib/api-guard";
import { deleteUser, updateUser } from "@api/modules/users";

// PATCH - Update a user
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guard = await requireApiGuard({ request: req, roles: [Role.ADMIN] });
    if (!guard.ok) {
      return NextResponse.json(
        {
          error:
            guard.response.status === 403 ? "Only admins can update users" : "Unauthorized",
        },
        { status: guard.response.status }
      );
    }

    const { id } = await params;
    const data = await req.json();
    const { name, username, password, phone } = data;
    const result = await updateUser(id, { name, username, password, phone });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      message: "User updated successfully",
      user: result.user,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE - Delete a user
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const guard = await requireApiGuard({ request: req, roles: [Role.ADMIN] });
    if (!guard.ok) {
      return NextResponse.json(
        {
          error:
            guard.response.status === 403 ? "Only admins can delete users" : "Unauthorized",
        },
        { status: guard.response.status }
      );
    }

    const { id } = await params;
    const result = await deleteUser(id);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
