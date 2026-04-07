import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Antrean",
};

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
