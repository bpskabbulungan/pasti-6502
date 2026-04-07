import type { Metadata } from "next";
import AnalyticsPage from "@/features/dashboard/screens/analytics-screen";
import { requireAdminDashboardUser } from "@/lib/dashboard-session";
import { getAnalyticsSummary } from "@api/modules/analytics/analytics-summary.service";
import { addDaysInTimeZone, parseDateOnlyInTimeZone, toIsoDateInTimeZone } from "@shared/utils/date-boundary";

export const metadata: Metadata = {
  title: "Analisis",
};

export default async function Page() {
  await requireAdminDashboardUser();

  const today = new Date();
  const todayIso = toIsoDateInTimeZone(today);
  const [yearString, monthString] = todayIso.split("-");
  const monthStartIso = `${yearString}-${monthString}-01`;
  const monthStart = parseDateOnlyInTimeZone(monthStartIso);
  const nextMonthStart = parseDateOnlyInTimeZone(
    monthString === "12"
      ? `${Number(yearString) + 1}-01-01`
      : `${yearString}-${String(Number(monthString) + 1).padStart(2, "0")}-01`
  );

  const startDate = monthStart ?? parseDateOnlyInTimeZone(todayIso) ?? today;
  const endDate =
    nextMonthStart ??
    addDaysInTimeZone(parseDateOnlyInTimeZone(todayIso) ?? today, 1);

  const initialAnalytics = await getAnalyticsSummary(startDate, endDate);
  const initialFetchedAt = new Date().toISOString();

  return <AnalyticsPage initialAnalytics={initialAnalytics} initialFetchedAt={initialFetchedAt} />;
}


