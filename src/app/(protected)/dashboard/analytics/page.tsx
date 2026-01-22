"use client";

import dynamic from "next/dynamic";
import AnalyticsSkeleton from "@/modules/dashboard/components/skeletons/AnalyticsSkeleton";

const AnalyticsPage = dynamic(
	() => import("@/modules/dashboard/pages/AnalyticsPage"),
	{ ssr: false, loading: () => <AnalyticsSkeleton /> }
);

export default function Page() {
	return <AnalyticsPage />;
}
