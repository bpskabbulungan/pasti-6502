import type { Metadata } from "next";
import PageBackground from "@/components/shared/page-background";
import GuestForm from "@/features/guest/components/guest-form";

export const metadata: Metadata = {
  title: "Buku Tamu",
};

export default function GuestPage() {
  return (
    <main className="relative isolate min-h-full overflow-hidden">
      <PageBackground className="bg-gradient-to-b from-primary/10 via-background to-background" />
      <div className="pointer-events-none fixed left-1/2 top-[-6rem] -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none fixed right-6 top-20 -z-10 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:px-6 md:py-12">
        <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-primary/15 via-secondary/20 to-background p-6 shadow-md">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(247,144,57,0.16),transparent_40%)]" />
          <div className="relative space-y-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-color">
              Buku Tamu Digital
            </p>
            <h1 className="text-3xl font-black text-primary-color md:text-4xl">Buku Tamu PST 6502</h1>
            <p className="mx-auto max-w-2xl text-sm text-secondary-color md:text-base">
              Lengkapi data pengunjung untuk mendapatkan nomor antrean secara otomatis.
            </p>
          </div>
        </section>
        <GuestForm />
      </div>
    </main>
  );
}



