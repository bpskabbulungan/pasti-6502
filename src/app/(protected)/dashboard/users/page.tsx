"use client";

import dynamic from "next/dynamic";
import UsersManagementSkeleton from "@/modules/dashboard/components/skeletons/UsersManagementSkeleton";

const UsersPage = dynamic(
	() => import("@/modules/dashboard/pages/UsersPage"),
	{ ssr: false, loading: () => <UsersManagementSkeleton /> }
);

export default function Page() {
	return <UsersPage />;
}
