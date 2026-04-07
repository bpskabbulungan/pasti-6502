import type { Metadata } from "next";
import DutySchedulePage from "@/features/dashboard/screens/duty-schedule-screen";
import { requireAdminDashboardUser } from "@/lib/dashboard-session";

export const metadata: Metadata = {
	title: "Jadwal Petugas",
};

export default async function Page() {
	await requireAdminDashboardUser();
	return <DutySchedulePage />;
}


