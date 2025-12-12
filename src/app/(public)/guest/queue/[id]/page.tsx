import type { Metadata } from "next";
import QueueStatusView from "./queue-status-view";

export const metadata: Metadata = {
	title: "Status Antrean PST 6502",
	description:
		"Lihat status antrean buku tamu PST BPS Bulungan melalui halaman publik.",
};

export default async function GuestQueueStatusPage(props: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await props.params;
	return <QueueStatusView queueId={id} />;
}
