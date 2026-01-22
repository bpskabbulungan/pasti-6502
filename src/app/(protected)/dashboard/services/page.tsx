"use client";

import dynamic from "next/dynamic";
import ServicesManagementSkeleton from "@/modules/dashboard/components/skeletons/ServicesManagementSkeleton";

const ServicesPage = dynamic(
	() => import("@/modules/dashboard/pages/ServicesPage"),
	{ ssr: false, loading: () => <ServicesManagementSkeleton /> }
);

export default function Page() {
	return <ServicesPage />;
}
