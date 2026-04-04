import ServicesPage from "@/features/dashboard/screens/services-screen";
import { requireAdminDashboardUser } from "@/lib/dashboard-session";

export default async function Page() {
	await requireAdminDashboardUser();
	return <ServicesPage />;
}


