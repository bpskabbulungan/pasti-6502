import UIShowcasePage from "@/features/dashboard/screens/ui-showcase-screen";
import { requireDashboardUser } from "@/lib/dashboard-session";

export default async function Page() {
	await requireDashboardUser();
	return <UIShowcasePage />;
}


