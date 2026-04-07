import type { Metadata } from "next";
import Image from "next/image";
import { Plus_Jakarta_Sans } from "next/font/google";
import {
  CalendarClock,
  ClipboardList,
  ListOrdered,
  QrCode,
  type LucideIcon,
} from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "@/constants/app";
import PublicHomeHeader from "./public-home-header";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["700", "800"],
});

export const metadata: Metadata = {
  title: "Beranda",
};

type MenuItem = {
  title: string;
  description: string;
  Icon: LucideIcon;
  accentBarClass: string;
  iconWrapClass: string;
  iconClass: string;
};

const menuItems: MenuItem[] = [
  {
    title: "Manajemen Petugas",
    description:
      "Kelola petugas terdaftar, atur penjadwalan layanan otomatis setiap minggu, dan kirim notifikasi pengingat pada petugas terkait.",
    Icon: CalendarClock,
    accentBarClass: "bg-primary/80",
    iconWrapClass: "bg-primary/12",
    iconClass: "text-primary",
  },
  {
    title: "Buku Tamu",
    description:
      "Kelola pencatatan pengunjung secara digital untuk mendukung proses layanan yang lebih praktis dan terdokumentasi.",
    Icon: QrCode,
    accentBarClass: "bg-accent/80",
    iconWrapClass: "bg-accent/12",
    iconClass: "text-accent",
  },
  {
    title: "Sistem Antrean",
    description:
      "Kelola antrean layanan secara real-time untuk mendukung proses yang lebih teratur dan mudah dipantau.",
    Icon: ListOrdered,
    accentBarClass: "bg-warning/85",
    iconWrapClass: "bg-warning/14",
    iconClass: "text-warning",
  },
  {
    title: "Survei Kebutuhan Data (SKD)",
    description:
      "Monitoring pengisian Survei Kebutuhan Data (SKD) serta pengingat tindak lanjut kepada pengguna layanan.",
    Icon: ClipboardList,
    accentBarClass: "bg-primary/80",
    iconWrapClass: "bg-primary/12",
    iconClass: "text-primary",
  },
];

function MenuCard({ item }: { item: MenuItem }) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-border/95 bg-card px-5 py-5 transition-colors hover:border-primary/45 sm:p-6">
      <span className={`absolute inset-y-0 left-0 w-1 ${item.accentBarClass}`} aria-hidden />
      <div className="relative flex h-full items-start gap-4">
        <div className={`rounded-xl p-2.5 ${item.iconWrapClass}`}>
          <item.Icon className={`h-5 w-5 ${item.iconClass}`} />
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-primary-color">{item.title}</h3>
          <p className="text-sm leading-relaxed text-secondary-color">{item.description}</p>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-col">
      <PublicHomeHeader />

      <main className="flex-1">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:gap-7 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <section className="relative overflow-hidden rounded-3xl border border-border/95 bg-card px-6 py-12 sm:px-10 sm:py-14">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,color-mix(in_srgb,var(--primary)_7%,transparent),transparent_58%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className="mx-auto w-full max-w-3xl text-center lg:mx-0 lg:text-left">
                <h1
                  className={`${plusJakarta.className} text-3xl font-extrabold leading-tight text-primary-color sm:text-4xl lg:text-5xl`}
                >
                  {APP_NAME}
                </h1>
                <p className="mt-3 text-base font-semibold text-secondary-color sm:text-lg">{APP_TAGLINE}</p>
                <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-secondary-color sm:text-base lg:mx-0">
                PASTI merupakan inovasi layanan yang dikembangkan untuk mendukung Pelayanan
                Statistik Terpadu BPS Kabupaten Bulungan. Layanan ini mencakup manajemen petugas, buku tamu, sistem antrean, hingga monitoring
                pengisian Survei Kebutuhan Data (SKD).
                </p>
              </div>
              <div className="mx-auto hidden h-44 w-44 items-center justify-center rounded-full border border-border/80 bg-background/70 lg:flex">
                <Image src="/icon_pst.png" alt={APP_NAME} width={104} height={104} className="h-24 w-24" />
              </div>
            </div>
          </section>

          <section className="space-y-5 sm:space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-primary-color sm:text-xl text-center">Menu Utama</h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm text-secondary-color sm:text-base text-center">
                Berikut layanan utama yang tersedia di dalam aplikasi.
              </p>
            </div>

            <div className="grid auto-rows-fr gap-4 md:grid-cols-2 md:gap-5">
              {menuItems.map((item) => (
                <MenuCard key={item.title} item={item} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
