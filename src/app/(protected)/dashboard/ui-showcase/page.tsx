import type { Metadata } from "next";
import UIShowcasePage from "@/features/dashboard/screens/ui-showcase-screen";
import { requireDashboardUser } from "@/lib/dashboard-session";

export const metadata: Metadata = {
	title: "UI Showcase",
};

export default async function Page() {
	await requireDashboardUser();
	return <UIShowcasePage />;
}


