import DutySchedulePage from "@/modules/dashboard/pages/DutySchedulePage";
import { requireAdminDashboardUser } from "@/lib/dashboard-session";

export default async function Page() {
	await requireAdminDashboardUser();
	return <DutySchedulePage />;
}
