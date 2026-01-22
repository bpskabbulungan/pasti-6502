"use client";

import dynamic from "next/dynamic";
import AllQueuesSkeleton from "@/modules/dashboard/components/skeletons/AllQueuesSkeleton";

const AllQueuesPage = dynamic(
	() => import("@/modules/dashboard/pages/AllQueuesPage"),
	{ ssr: false, loading: () => <AllQueuesSkeleton /> }
);

export default function Page() {
	return <AllQueuesPage />;
}
