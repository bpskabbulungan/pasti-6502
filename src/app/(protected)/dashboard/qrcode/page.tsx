"use client";

import dynamic from "next/dynamic";
import QRCodeSkeleton from "@/modules/dashboard/components/skeletons/QRCodeSkeleton";

const QRCodePage = dynamic(
	() => import("@/modules/dashboard/pages/QRCodePage"),
	{ ssr: false, loading: () => <QRCodeSkeleton /> }
);

export default function Page() {
	return <QRCodePage />;
}
