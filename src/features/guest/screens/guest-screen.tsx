import type { Metadata } from "next";
import { Building2, ClipboardCheck, ShieldCheck, type LucideIcon } from "lucide-react";
import PageBackground from "@/components/shared/page-background";
import GuestForm from "@/features/guest/components/guest-form";
import GuestThemeSwitch from "@/features/guest/components/guest-theme-switch";

export const metadata: Metadata = {
  title: "Buku Tamu",
};

type GuestInfoPanel = {
  title: string;
  description: string;
  Icon: LucideIcon;
};

const guestInfoPanels: GuestInfoPanel[] = [
  {
    title: "Identitas Valid",
    description: "Isi data sesuai identitas resmi agar proses verifikasi pengunjung lebih cepat.",
    Icon: ClipboardCheck,
  },
  {
    title: "Asal Instansi",
    description: "Cantumkan asal instansi atau domisili untuk kebutuhan rekap layanan PST.",
    Icon: Building2,
  },
  {
    title: "Perlindungan Data",
    description: "Data digunakan untuk operasional layanan BPS Kabupaten Bulungan secara internal.",
    Icon: ShieldCheck,
  },
];

export default function GuestPage() {
  return (
    <main className="relative isolate min-h-full bg-background">
      <PageBackground className="bg-background" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 sm:gap-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <section className="overflow-hidden rounded-2xl border border-border/90 bg-card/92 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col gap-4 border-b border-border/70 px-4 py-4 sm:px-5 md:flex-row md:items-start md:justify-between md:px-6 md:py-5">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-primary-color sm:text-3xl">Buku Tamu PST 6502</h1>
              <p className="max-w-3xl text-sm leading-relaxed text-secondary-color sm:text-base">
                Lengkapi data kunjungan untuk mendapatkan nomor antrean pelayanan secara otomatis.
              </p>
            </div>
            <div className="self-start md:ml-4">
              <GuestThemeSwitch />
            </div>
          </div>
        </section>
        <GuestForm />
      </div>
    </main>
  );
}
