"use client";

import dynamic from "next/dynamic";
import UIShowcaseSkeleton from "@/modules/dashboard/components/skeletons/UIShowcaseSkeleton";

const UIShowcasePage = dynamic(
	() => import("@/modules/dashboard/pages/UIShowcasePage"),
	{ ssr: false, loading: () => <UIShowcaseSkeleton /> }
);

export default function Page() {
	return <UIShowcasePage />;
}
