import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PageBackground from "@/components/page-background";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRight, Home, QrCode, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-full flex-col">
      <PageBackground className="bg-gradient-to-br from-[#FFF4EC] via-white to-[#FFE5D3] dark:from-background dark:via-[#1f1f1f] dark:to-background" />
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(247,144,57,0.16),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(154,5,1,0.12),transparent_30%)]" />
        <div className="absolute -left-16 top-24 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-10 bottom-12 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="fixed inset-x-0 top-0 z-30 border-b border-border/60 bg-white/90 backdrop-blur dark:bg-background/85 md:hidden">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <img src="/icon_pst.png" alt="PST" className="h-6 w-6" />
            </div>
            <div className="leading-tight">
              <p className="text-base font-bold text-primary-color">PASTI 6502</p>
              <p className="text-xs text-secondary-color">Pelayanan Statistik Terpadu</p>
            </div>
          </Link>
          <ThemeToggle />
        </div>
      </div>

      <header className="relative z-20 hidden md:block">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <img src="/icon_pst.png" alt="PST" className="h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-bold text-primary-color">PASTI 6502</p>
              <p className="text-sm text-secondary-color">Pelayanan Statistik Terpadu</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
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
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-5 pb-20 pt-28 text-center sm:px-6 md:pt-12 lg:px-8">
          <Badge
            variant="secondary"
            className="border-border/60 bg-white/70 text-primary-color shadow-sm backdrop-blur"
          >
            <ShieldAlert className="h-4 w-4" />
            Error 404
          </Badge>

          <div className="relative flex items-center justify-center">
            <div className="text-[clamp(4.5rem,16vw,11rem)] font-black leading-none text-primary/15">
              404
            </div>
            <div className="absolute flex h-20 w-20 items-center justify-center rounded-3xl border border-border/70 bg-white/90 text-primary shadow-lg backdrop-blur dark:bg-card sm:h-24 sm:w-24">
              <Home className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-primary-color sm:text-4xl">
              Halaman tidak ditemukan
            </h1>
            <p className="mx-auto max-w-2xl text-base text-secondary-color sm:text-lg">
              Maaf, alamat yang kamu cari tidak tersedia atau sudah dipindahkan. Kamu bisa kembali
              ke beranda atau menuju layanan publik PST yang tersedia.
            </p>
          </div>

          <div className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/" className="w-full sm:w-auto">
              <Button className="w-full gap-2 bg-primary text-primary-foreground shadow-md hover:bg-primary/90">
                Kembali ke Beranda
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/visitor-form" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full border-border bg-white/70 backdrop-blur dark:bg-background"
              >
                Buku Tamu Digital
              </Button>
            </Link>
            <Link href="/queue-display" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full border-border bg-white/70 backdrop-blur dark:bg-background"
              >
                Lihat Antrean
              </Button>
            </Link>
          </div>

          <div className="grid w-full max-w-4xl gap-4 text-left sm:grid-cols-2">
            <div className="flex h-full items-start gap-4 rounded-2xl border border-custom/80 bg-white/80 p-5 shadow-sm backdrop-blur dark:bg-card">
              <div className="shrink-0 rounded-full bg-primary/10 p-2 text-primary">
                <QrCode className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-primary-color">Isi buku tamu PST</p>
                <p className="text-sm text-secondary-color">
                  Scan QR atau isi formulir digital untuk pencatatan kunjungan.
                </p>
              </div>
            </div>
            <div className="flex h-full items-start gap-4 rounded-2xl border border-custom/80 bg-white/80 p-5 shadow-sm backdrop-blur dark:bg-card">
              <div className="shrink-0 rounded-full bg-secondary/10 p-2 text-secondary-foreground">
                <ArrowRight className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-primary-color">Pantau antrean layanan</p>
                <p className="text-sm text-secondary-color">
                  Lihat nomor antrean yang sedang dan akan dilayani secara real-time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
