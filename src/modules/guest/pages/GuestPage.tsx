import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import PageBackground from "@/components/page-background";
import GuestForm from "@/modules/guest/components/GuestForm";

export const metadata: Metadata = {
  title: "Buku Tamu PST 6502",
  description:
    "Halaman buku tamu untuk pengunjung PST BPS Bulungan. Pindai QR permanen, isi data, dapat nomor antrean, dan isi SKD setelah layanan selesai.",
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
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">Buku Tamu PST Bulungan</h1>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground md:text-base">
            Pengunjung dapat mengisi data dari gawai masing-masing dengan memindai QR permanen yang
            mengarah ke <span className="font-semibold text-foreground">{guestUrl}</span>. Setelah
            dikirim, sistem mencatat buku tamu dan membuat nomor antrean otomatis. Status antrean
            diproses hingga selesai, lalu pengunjung diminta mengisi SKD.
          </p>
        </div>
        <div className="grid gap-3 text-sm md:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-card/80 p-4 shadow-sm">
            <p className="font-semibold text-foreground">Scan QR Permanen</p>
            <p className="text-muted-foreground">
              QR yang sama dapat digunakan setiap hari untuk pengunjung datang.
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-card/80 p-4 shadow-sm">
            <p className="font-semibold text-foreground">Isi Buku Tamu</p>
            <p className="text-muted-foreground">
              Data tersimpan sebagai buku tamu dan memicu nomor antrean otomatis.
            </p>
          </div>
          <div className="rounded-lg border border-border/70 bg-card/80 p-4 shadow-sm">
            <p className="font-semibold text-foreground">Pantau &amp; Isi SKD</p>
            <p className="text-muted-foreground">
              Status antrean diproses sampai selesai, lalu isi SKD.
            </p>
          </div>
        </div>
        <GuestForm />
      </div>
    </main>
  );
}
