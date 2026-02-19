"use client";

import dynamic from "next/dynamic";
import GuestbookSkeleton from "@/modules/dashboard/components/skeletons/GuestbookSkeleton";

const GuestbookPage = dynamic(
	() => import("@/modules/dashboard/pages/GuestbookPage"),
	{ ssr: false, loading: () => <GuestbookSkeleton /> }
);

export default function Page() {
	return <GuestbookPage />;
}
