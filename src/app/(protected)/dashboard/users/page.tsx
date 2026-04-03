import UsersPage from "@/modules/dashboard/pages/UsersPage";
import { requireAdminDashboardUser } from "@/lib/dashboard-session";

export default async function Page() {
	await requireAdminDashboardUser();
	return <UsersPage />;
}
