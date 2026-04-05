import GuestbookPage from "@/features/dashboard/screens/guestbook-screen";
import { requireDashboardUser } from "@/lib/dashboard-session";
import { getGuestbookEntries } from "@api/modules/guestbook/guestbook-list.service";

export default async function Page() {
  await requireDashboardUser();
  const initialData = await getGuestbookEntries({
    dateFilter: "today",
    limit: "10",
    offset: "0",
  });
  const initialFetchedAt = new Date().toISOString();

  return <GuestbookPage initialData={initialData} initialFetchedAt={initialFetchedAt} />;
}


