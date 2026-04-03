import QRCodePage from "@/modules/dashboard/pages/QRCodePage";
import { requireAdminDashboardUser } from "@/lib/dashboard-session";

export default async function Page() {
	await requireAdminDashboardUser();
	return <QRCodePage />;
}
