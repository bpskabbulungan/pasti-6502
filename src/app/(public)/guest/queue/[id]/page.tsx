import type { Metadata } from "next";
import GuestQueuePage from "@/features/guest/screens/guest-queue-screen";
import { getGuestQueueDetail } from "@api/modules/guest";

export const metadata: Metadata = {
  title: "Nomor Antrean Tamu",
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const result = await getGuestQueueDetail(id);

  return (
    <GuestQueuePage
      queueId={id}
      initialQueue={result.ok ? result.data : null}
      initialError={result.ok ? null : result.error}
    />
  );
}


