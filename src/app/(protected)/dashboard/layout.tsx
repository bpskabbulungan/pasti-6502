import DashboardLayoutShell from "@/features/dashboard/components/layout/dashboard-layout-shell";
import { requireDashboardUser } from "@/lib/dashboard-session";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireDashboardUser();
  return <DashboardLayoutShell user={user}>{children}</DashboardLayoutShell>;
}


