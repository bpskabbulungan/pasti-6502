import type { Metadata } from "next";
import ServicesPage from "@/features/dashboard/screens/services-screen";
import { requireAdminDashboardUser } from "@/lib/dashboard-session";

export const metadata: Metadata = {
	title: "Kelola Layanan",
};

export default async function Page() {
	await requireAdminDashboardUser();
	return <ServicesPage />;
}


