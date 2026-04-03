import GuidePage from "@/modules/dashboard/pages/GuidePage";
import { requireDashboardUser } from "@/lib/dashboard-session";

export default async function Page() {
	const user = await requireDashboardUser();
	return <GuidePage currentUser={user} />;
}
