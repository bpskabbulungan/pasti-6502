import GuestbookPage from "@/modules/dashboard/pages/GuestbookPage";
import { requireDashboardUser } from "@/lib/dashboard-session";
import { getGuestbookEntries } from "@api/modules/guestbook";

export default async function Page() {
  await requireDashboardUser();
  const initialData = await getGuestbookEntries({
    dateFilter: "today",
    limit: "10",
    offset: "0",
  });

  return <GuestbookPage initialData={initialData} />;
}
