import DutySchedulePage from "@/features/dashboard/screens/duty-schedule-screen";
import { requireAdminDashboardUser } from "@/lib/dashboard-session";

export default async function Page() {
	await requireAdminDashboardUser();
	return <DutySchedulePage />;
}


