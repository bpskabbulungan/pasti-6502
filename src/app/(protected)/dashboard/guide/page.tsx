import type { Metadata } from "next";
import GuidePage from "@/features/dashboard/screens/guide-screen";
import { requireDashboardUser } from "@/lib/dashboard-session";

export const metadata: Metadata = {
	title: "Panduan",
};

export default async function Page() {
	const user = await requireDashboardUser();
	return <GuidePage currentUser={user} />;
}


