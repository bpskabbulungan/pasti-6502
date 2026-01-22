"use client";

import dynamic from "next/dynamic";
import QueueManagementSkeleton from "@/modules/dashboard/components/skeletons/QueueManagementSkeleton";

const QueuePage = dynamic(
	() => import("@/modules/dashboard/pages/QueuePage"),
	{ ssr: false, loading: () => <QueueManagementSkeleton /> }
);

export default function Page() {
	return <QueuePage />;
}
