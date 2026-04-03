import { Role } from "@prisma/client";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export type DashboardUser = Session["user"];

export async function requireDashboardUser(): Promise<DashboardUser> {
	const session = await getServerSession(authOptions);
	if (!session) {
		redirect("/");
	}

	return session.user;
}

export async function requireAdminDashboardUser(): Promise<DashboardUser> {
	const user = await requireDashboardUser();
	if (user.role !== Role.ADMIN) {
		redirect("/dashboard");
	}

	return user;
}
