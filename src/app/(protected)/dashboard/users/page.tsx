import type { Metadata } from "next";
import UsersPage from "@/features/dashboard/screens/users-screen";
import { requireAdminDashboardUser } from "@/lib/dashboard-session";

export const metadata: Metadata = {
	title: "Kelola Pengguna",
};

export default async function Page() {
	await requireAdminDashboardUser();
	return <UsersPage />;
}


