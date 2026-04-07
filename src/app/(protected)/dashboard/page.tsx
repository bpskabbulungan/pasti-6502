import type { Metadata } from "next";
import DashboardPage from "@/features/dashboard/screens/dashboard-screen";
import { requireDashboardUser } from "@/lib/dashboard-session";
import { getDashboardStats } from "@api/modules/dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function Page() {
  const user = await requireDashboardUser();
  const initialStats = await getDashboardStats();
  const initialFetchedAt = new Date().toISOString();

  return (
    <DashboardPage
      currentUser={user}
      initialStats={initialStats}
      initialFetchedAt={initialFetchedAt}
    />
  );
}


