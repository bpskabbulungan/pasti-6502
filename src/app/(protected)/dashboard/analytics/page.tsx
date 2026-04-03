import AnalyticsPage from "@/modules/dashboard/pages/AnalyticsPage";
import { requireAdminDashboardUser } from "@/lib/dashboard-session";
import { getAnalyticsSummary } from "@api/modules/analytics";

export default async function Page() {
  await requireAdminDashboardUser();

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);

  const initialAnalytics = await getAnalyticsSummary(startDate, endDate);

  return <AnalyticsPage initialAnalytics={initialAnalytics} />;
}
