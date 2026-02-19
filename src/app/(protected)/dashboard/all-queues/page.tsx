import { redirect } from "next/navigation";

type PageProps = {
  searchParams?: {
    status?: string;
    dateFilter?: string;
  };
};

export default function Page({ searchParams }: PageProps) {
  const params = new URLSearchParams();
  if (searchParams?.status) {
    params.set("status", searchParams.status);
  }
  if (searchParams?.dateFilter) {
    params.set("dateFilter", searchParams.dateFilter);
  }
  const queryString = params.toString();
  redirect(`/dashboard/queue${queryString ? `?${queryString}` : ""}`);
}
