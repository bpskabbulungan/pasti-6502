"use client";

import dynamic from "next/dynamic";
import DashboardSkeleton from "@/modules/dashboard/components/skeletons/DashboardSkeleton";

const DashboardPage = dynamic(
	() => import("@/modules/dashboard/pages/DashboardPage"),
	{ ssr: false, loading: () => <DashboardSkeleton /> }
);

export default function Page() {
	return <DashboardPage />;
}
