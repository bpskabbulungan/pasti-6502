import QueuePage from "@/features/dashboard/screens/queue-management-screen";
import { requireDashboardUser } from "@/lib/dashboard-session";
import { QueueStatus } from "@prisma/client";
import { getQueues } from "@api/modules/queues/queue.service";

type PageProps = {
  searchParams?: Promise<{
    status?: string;
    dateFilter?: string;
  }>;
};

const queueStatusParamValues = new Set([
  QueueStatus.WAITING,
  QueueStatus.SERVING,
  QueueStatus.COMPLETED,
  QueueStatus.CANCELED,
]);

const parseStatusParam = (value?: string) => {
  if (!value) {
    return QueueStatus.WAITING;
  }

  const normalized = value.toUpperCase();
  return queueStatusParamValues.has(normalized as QueueStatus)
    ? (normalized as QueueStatus)
    : QueueStatus.WAITING;
};

const parseDateFilterParam = (value?: string) => (value?.toLowerCase() === "all" ? "all" : "today");

export default async function Page({ searchParams }: PageProps) {
  const user = await requireDashboardUser();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialStatus = parseStatusParam(resolvedSearchParams?.status);
  const initialDateFilter = parseDateFilterParam(resolvedSearchParams?.dateFilter);
  const initialPageData = await getQueues({
    status: initialStatus,
    dateFilter: initialDateFilter,
    limit: "10",
    offset: "0",
  });
  const initialFetchedAt = new Date().toISOString();

  return (
    <QueuePage
      currentUser={user}
      initialStatus={initialStatus}
      initialDateFilter={initialDateFilter}
      initialPageData={initialPageData}
      initialFetchedAt={initialFetchedAt}
    />
  );
}


