import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tampilan Antrean",
};

export default function QueueDisplayLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
