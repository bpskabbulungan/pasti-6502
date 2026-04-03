import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import PageBackground from "@/components/page-background";
import GuestForm from "@/modules/guest/components/GuestForm";

export const metadata: Metadata = {
  title: "PASTI 6502 - Buku Tamu",
};

export default function GuestPage() {
  const baseUrl = process.env.NEXT_PUBLIC_QR_BASE_URL?.replace(/\/$/, "") ?? "";
  const guestUrl = baseUrl ? `${baseUrl}/guest` : "/guest";

  return (
    <main className="relative isolate min-h-full overflow-hidden">
      <PageBackground className="bg-gradient-to-b from-primary/10 via-background to-background" />
      <div className="pointer-events-none fixed left-1/2 top-[-6rem] -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none fixed right-6 top-20 -z-10 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" />
      <div className="relative mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 md:px-6 md:py-12">
        <div className="space-y-3 text-center md:space-y-4">
          <div className="flex items-center justify-center gap-2"></div>
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            BUKU TAMU PST 6502
          </h1>
        </div>
        <GuestForm />
      </div>
    </main>
  );
}
