import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginForm } from "@/components/LoginForm";
import { CalendarClock, QrCode, ShieldCheck, Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#FFF4EC] via-white to-[#FFE5D3] dark:from-background dark:via-[#1f1f1f] dark:to-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(247,144,57,0.16),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(154,5,1,0.12),transparent_30%)]" />
      <div className="absolute -left-16 top-24 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-10 bottom-12 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />

      <div className="absolute right-6 top-6 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 lg:flex-row lg:items-center">
        <div className="space-y-6 lg:flex-1">
          <Badge
            variant="secondary"
            className="border-border/60 bg-white/70 text-primary-color shadow-sm backdrop-blur"
          >
            <Sparkles className="h-4 w-4" />
            PASTI 6502
          </Badge>
          <div className="space-y-3">
            <h1 className="text-3xl font-black leading-tight text-primary-color sm:text-4xl">
              Pelayanan Statistik Terpadu dan Terintegrasi
            </h1>
            <div className="max-w-2xl space-y-3 text-base text-secondary-color sm:text-lg">
              <p>
                PASTI merupakan komitmen BPS Kabupaten Bulungan dalam memberikan pelayanan statistik kepada masyarakat yang berkunjung ke Pelayanan Statistik Terpadu (PST).
              </p>
              <p>
                Melalui penerapan alur pelayanan yang terstruktur dan terukur, PASTI menjamin proses pelayananan statistik berjalan secara efektif, transparan, dan akuntabel, sekaligus mengedepankan kenyamanan serta kualitas pelayanan bagi masyarakat.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl border border-custom bg-white/70 p-4 shadow-sm backdrop-blur dark:bg-card">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <CalendarClock className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-primary-color">Jadwal Petugas</p>
                <p className="text-sm text-secondary-color">
                  Penugasan petugas layanan diatur secara otomatis setiap hari guna menjamin pemerataan beban kerja, ketertiban pelaksanaan tugas, serta keberlangsungan pelayanan yang konsisten.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-custom bg-white/70 p-4 shadow-sm backdrop-blur dark:bg-card">
              <div className="rounded-full bg-accent/10 p-2 text-accent">
                <QrCode className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-primary-color">Buku Tamu Digital</p>
                <p className="text-sm text-secondary-color">
                  Pengunjung melakukan pengisian buku tamu secara mandiri melalui pemindaian QR Code tanpa perlu proses login, sehingga pelayanan menjadi lebih cepat dan efisien.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-custom bg-white/70 p-4 shadow-sm backdrop-blur dark:bg-card">
              <div className="rounded-full bg-secondary/10 p-2 text-secondary-foreground">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-primary-color">Antrean Pelayanan</p>
                <p className="text-sm text-secondary-color">
                  Sistem antrean dikelola secara otomatis untuk memastikan ketertiban, kejelasan urutan layanan, serta kepastian waktu pelayanan bagi setiap pengunjung.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-custom bg-white/70 p-4 shadow-sm backdrop-blur dark:bg-card">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-primary-color">Monitoring SKD</p>
                <p className="text-sm text-secondary-color">
                  Pemantauan status pengisian Survei Kebutuhan Data (SKD) dilakukan secara terintegrasi dan didukung dengan pengiriman pesan pengingat melalui WhatsApp untuk memastikan responden melakukan pengisian survei.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:flex-1">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
