import DashboardLayoutClient from "@/modules/dashboard/components/DashboardLayoutClient";
import { requireDashboardUser } from "@/lib/dashboard-session";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireDashboardUser();
  return <DashboardLayoutClient user={user}>{children}</DashboardLayoutClient>;
}
