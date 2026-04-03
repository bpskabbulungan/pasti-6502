import DashboardPage from "@/modules/dashboard/pages/DashboardPage";
import { requireDashboardUser } from "@/lib/dashboard-session";
import { getDashboardStats } from "@api/modules/dashboard";

export default async function Page() {
  const user = await requireDashboardUser();
  const initialStats = await getDashboardStats();
  return <DashboardPage currentUser={user} initialStats={initialStats} />;
}
