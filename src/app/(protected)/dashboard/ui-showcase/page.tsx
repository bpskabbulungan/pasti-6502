import UIShowcasePage from "@/modules/dashboard/pages/UIShowcasePage";
import { requireDashboardUser } from "@/lib/dashboard-session";

export default async function Page() {
	await requireDashboardUser();
	return <UIShowcasePage />;
}
