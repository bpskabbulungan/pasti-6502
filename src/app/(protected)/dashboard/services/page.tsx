import ServicesPage from "@/modules/dashboard/pages/ServicesPage";
import { requireAdminDashboardUser } from "@/lib/dashboard-session";

export default async function Page() {
	await requireAdminDashboardUser();
	return <ServicesPage />;
}
