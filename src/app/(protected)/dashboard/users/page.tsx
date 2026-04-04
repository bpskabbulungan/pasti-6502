import UsersPage from "@/features/dashboard/screens/users-screen";
import { requireAdminDashboardUser } from "@/lib/dashboard-session";

export default async function Page() {
	await requireAdminDashboardUser();
	return <UsersPage />;
}


