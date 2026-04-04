import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import PageBackground from "@/components/shared/page-background";
import { ArrowRight, CalendarClock, ClipboardList, ListOrdered, QrCode } from "lucide-react";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Beranda",
};

export default function Home() {
  return (
    <div className="relative isolate flex min-h-full flex-col">
      <PageBackground className="bg-gradient-to-br from-background via-background to-muted/40 dark:from-background dark:via-background dark:to-muted/35" />
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,color-mix(in_srgb,var(--primary)_14%,transparent),transparent_35%),radial-gradient(circle_at_80%_0%,color-mix(in_srgb,var(--accent)_10%,transparent),transparent_30%)]" />
        <div className="absolute -left-16 top-24 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-10 bottom-12 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="fixed inset-x-0 top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur md:hidden">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Image src="/icon_pst.png" alt="PST" width={24} height={24} className="h-6 w-6" />
            </div>
            <div className="leading-tight">
              <p className="text-base font-bold text-primary-color">PASTI 6502</p>
              <p className="text-xs text-secondary-color">Pelayanan Statistik Terpadu</p>
            </div>
          </Link>
          <div className="ml-auto flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>

      <header className="relative z-20 hidden md:block">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Image src="/icon_pst.png" alt="PST" width={32} height={32} className="h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-bold text-primary-color">PASTI 6502</p>
              <p className="text-sm text-secondary-color">Pelayanan Statistik Terpadu</p>
            </div>
          </Link>
          <div className="flex items-center justify-center gap-3 sm:justify-end">
            <div className="hidden items-center gap-3 sm:flex">
              <Link href="/queue-display">
                <Button
                  variant="outline"
                  className="border-border bg-white/70 backdrop-blur dark:bg-background"
                >
                  Tampilan Antrean
                </Button>
              </Link>
              <Link href="/login">
                <Button className="gap-2 bg-primary text-primary-foreground shadow-md hover:bg-primary/90">
                  Login
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 pb-16 pt-24 sm:px-6 md:pt-8 lg:px-8">
          <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 text-center">
            <div className="w-full space-y-3">
              <h1
                className={`${plusJakarta.className} w-full text-center text-3xl font-extrabold leading-tight text-primary-color sm:text-4xl lg:text-5xl`}
              >
                PASTI 6502
              </h1>
              <div className="mx-auto mt-4 w-full max-w-3xl space-y-3 text-base leading-relaxed text-secondary-color sm:mt-3 sm:text-lg">
                <p>
                  Pelayanan Statistik Terpadu dan Terintegrasi (PASTI) adalah komitmen BPS Kabupaten
                  Bulungan untuk menyediakan layanan statistik bagi masyarakat melalui Pelayanan
                  Statistik Terpadu (PST). Alur layanan yang terstruktur memastikan proses berjalan
                  efektif, transparan, dan akuntabel, sekaligus meningkatkan kenyamanan pengunjung.
                </p>
              </div>
            </div>
          </section>

          <section className="grid w-full auto-rows-fr gap-4 grid-cols-1 sm:grid-cols-2">
            <div className="flex h-full w-full items-start gap-4 rounded-2xl border border-border/80 bg-card/88 p-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5">
              <div className="shrink-0 rounded-full bg-primary/10 p-2 text-primary">
                <CalendarClock className="h-4 w-4" />
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-primary-color">Jadwal Petugas</p>
                <p className="text-sm leading-relaxed text-secondary-color">
                  Penugasan otomatis disertai notifikasi pengingat lewat WhatsApp untuk memastikan
                  layanan selalu siap.
                </p>
              </div>
            </div>
            <div className="flex h-full w-full items-start gap-4 rounded-2xl border border-border/80 bg-card/88 p-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5">
              <div className="shrink-0 rounded-full bg-accent/10 p-2 text-accent">
                <QrCode className="h-4 w-4" />
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-primary-color">Buku Tamu PST</p>
                <p className="text-sm leading-relaxed text-secondary-color">
                  Pendaftaran digital dengan QR code untuk memudahkan pencatatan data pengunjung.
                </p>
              </div>
            </div>
            <div className="flex h-full w-full items-start gap-4 rounded-2xl border border-border/80 bg-card/88 p-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5">
              <div className="shrink-0 rounded-full bg-secondary/10 p-2 text-secondary-foreground">
                <ListOrdered className="h-4 w-4" />
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-primary-color">Antrean Pelayanan PST</p>
                <p className="text-sm leading-relaxed text-secondary-color">
                  Manajemen antrean digital untuk memastikan layanan berjalan tertib dan efisien.
                </p>
              </div>
            </div>
            <div className="flex h-full w-full items-start gap-4 rounded-2xl border border-border/80 bg-card/88 p-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5">
              <div className="shrink-0 rounded-full bg-primary/10 p-2 text-primary">
                <ClipboardList className="h-4 w-4" />
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-primary-color">Survei Kebutuhan Data (SKD)</p>
                <p className="text-sm leading-relaxed text-secondary-color">
                  Pemantauan pengisian SKD sekaligus pengiriman pengingat lewat WhatsApp.
                </p>
              </div>
            </div>
          </section>
          <div className="flex w-full flex-col gap-3 sm:hidden">
            <Link href="/queue-display" className="w-full">
              <Button
                variant="outline"
                className="w-full border-border bg-background/80"
              >
                Tampilan Antrean
              </Button>
            </Link>
            <Link href="/login" className="w-full">
              <Button className="w-full gap-2 bg-primary text-primary-foreground shadow-md hover:bg-primary/90">
                Login
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

