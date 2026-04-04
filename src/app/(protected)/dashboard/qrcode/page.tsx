import QRCodePage from "@/features/dashboard/screens/qr-code-screen";
import { requireAdminDashboardUser } from "@/lib/dashboard-session";

export default async function Page() {
	await requireAdminDashboardUser();
	return <QRCodePage />;
}


