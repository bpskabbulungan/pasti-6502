import type { Metadata } from "next";
import GuestQueuePage from "@/modules/guest/pages/GuestQueuePage";

export const metadata: Metadata = {
	title: "Nomor Antrean Tamu",
};

export default function Page() {
	return <GuestQueuePage />;
}
