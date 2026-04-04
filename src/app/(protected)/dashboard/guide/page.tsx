import GuidePage from "@/features/dashboard/screens/guide-screen";
import { requireDashboardUser } from "@/lib/dashboard-session";

export default async function Page() {
	const user = await requireDashboardUser();
	return <GuidePage currentUser={user} />;
}


