import { redirect } from "next/navigation";

type PageProps = {
  searchParams?: Promise<{
    status?: string;
    dateFilter?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const params = new URLSearchParams();
  if (resolvedSearchParams?.status) {
    params.set("status", resolvedSearchParams.status);
  }
  if (resolvedSearchParams?.dateFilter) {
    params.set("dateFilter", resolvedSearchParams.dateFilter);
  }
  const queryString = params.toString();
  redirect(`/dashboard/queue${queryString ? `?${queryString}` : ""}`);
}
