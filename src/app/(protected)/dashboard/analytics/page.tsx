import AnalyticsPage from "@/modules/dashboard/pages/AnalyticsPage";
import { requireAdminDashboardUser } from "@/lib/dashboard-session";
import { getAnalyticsSummary } from "@api/modules/analytics";
import { getDayRangeInTimeZone } from "@shared/utils/date-boundary";

export default async function Page() {
  await requireAdminDashboardUser();

  const { start: startDate, end: endDate } = getDayRangeInTimeZone(new Date());

  const initialAnalytics = await getAnalyticsSummary(startDate, endDate);

  return <AnalyticsPage initialAnalytics={initialAnalytics} />;
}
