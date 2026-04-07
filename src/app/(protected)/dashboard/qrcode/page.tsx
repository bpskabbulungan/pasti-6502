import type { Metadata } from "next";
import QRCodePage from "@/features/dashboard/screens/qr-code-screen";
import { requireAdminDashboardUser } from "@/lib/dashboard-session";

export const metadata: Metadata = {
	title: "QR Buku Tamu",
};

export default async function Page() {
	await requireAdminDashboardUser();
	return <QRCodePage />;
}


