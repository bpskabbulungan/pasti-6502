"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Session } from "next-auth";
import {
  BarChart4,
  BookOpenCheck,
  CheckCircle2,
  CalendarClock,
  ClipboardList,
  HelpCircle,
  FileText,
  LayoutDashboard,
  ListChecks,
  QrCode,
  ShieldCheck,
  UserCog,
  Workflow,
  Wrench,
} from "lucide-react";
import { PageContainer } from "@/components/shared/layout/page-container";
import { DashboardPageHeader } from "@/features/dashboard/components/layout/dashboard-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Role } from "@/shared/constants/enums";

const mainMenus = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description:
      "Lihat ringkasan antrean hari ini: menunggu, sedang dilayani, selesai, dibatalkan, dan rata-rata waktu layanan.",
  },
  {
    title: "Antrean",
    href: "/dashboard/queue",
    icon: ListChecks,
    description:
      "Tempat kerja utama petugas. Di sini Anda bisa layani, selesaikan, batalkan antrean, kirim pengingat SKD, dan cek tracking link.",
  },
  {
    title: "Analisis",
    href: "/dashboard/analytics",
    icon: BarChart4,
    description:
      "Khusus admin. Menampilkan statistik per periode (hari ini, minggu ini, bulan ini, 3 bulan) lengkap dengan grafik layanan dan performa petugas.",
  },
  {
    title: "Buku Tamu",
    href: "/dashboard/guestbook",
    icon: ClipboardList,
    description:
      "Rekap pengunjung yang sudah masuk sistem. Bisa filter, cari data, lihat detail kunjungan, dan export Excel/PDF.",
  },
  {
    title: "Panduan",
    href: "/dashboard/guide",
    icon: BookOpenCheck,
    description:
      "Halaman ini. Gunakan sebagai pegangan cepat saat onboarding atau saat lupa alur kerja.",
  },
];

const adminMenus = [
  {
    title: "Kelola Pengguna",
    href: "/dashboard/users",
    icon: UserCog,
    description:
      "Tambah/edit/hapus akun petugas. Nomor WhatsApp petugas di sini penting untuk fitur pengingat jadwal.",
  },
  {
    title: "Kelola Layanan",
    href: "/dashboard/services",
    icon: Wrench,
    description:
      "Atur daftar layanan yang tersedia untuk antrean. Layanan bisa diaktifkan/nonaktifkan sesuai kebutuhan operasional.",
  },
  {
    title: "QR Buku Tamu",
    href: "/dashboard/qrcode",
    icon: QrCode,
    description:
      "Download QR statis untuk pengunjung. QR ini mengarah ke halaman buku tamu (`/guest`).",
  },
  {
    title: "Jadwal Petugas",
    href: "/dashboard/duty-schedule",
    icon: CalendarClock,
    description:
      "Atur hari kerja, generate jadwal, kelola libur/cuti, dan kirim reminder WhatsApp untuk petugas.",
  },
];

const quickStartSteps = [
  {
    title: "Buka menu Antrean saat mulai shift",
    description:
      "Periksa antrean menunggu, tentukan prioritas panggilan, dan pastikan status layanan aktif.",
  },
  {
    title: "Klik Layani ketika pengunjung dipanggil",
    description: "Status antrean berubah menjadi sedang diproses oleh petugas yang login.",
  },
  {
    title: "Tutup proses dengan status final",
    description: "Pilih Selesai jika tuntas atau Batalkan bila layanan tidak jadi diproses.",
  },
  {
    title: "Kirim Pengingat SKD jika data belum lengkap",
    description: "Gunakan aksi pada baris antrean untuk membantu pengunjung menyelesaikan SKD.",
  },
  {
    title: "Validasi hasil kerja di akhir shift",
    description:
      "Cek Buku Tamu dan Analisis agar data harian lengkap sebelum laporan atau serah-terima.",
  },
];

const dailyWorkflow = [
  {
    title: "Persiapan oleh Admin",
    description:
      "Pastikan layanan aktif, petugas tersedia, dan QR buku tamu siap digunakan di area layanan.",
  },
  {
    title: "Pengunjung isi buku tamu",
    description: "Pengunjung mengisi form melalui /guest, baik dari link langsung atau hasil scan QR.",
  },
  {
    title: "Nomor antrean dibuat otomatis",
    description: "Setelah submit, sistem membuat nomor antrean dan antrean muncul di dashboard petugas.",
  },
  {
    title: "Petugas proses di menu Antrean",
    description: "Alur standar: Layani -> (opsional) Batalkan -> Selesai.",
  },
  {
    title: "Lanjutkan penanganan SKD",
    description: "Jika SKD belum lengkap, kirim pengingat atau tandai status SKD dari tabel antrean.",
  },
  {
    title: "Evaluasi operasional",
    description: "Lihat rekap di Buku Tamu dan gunakan Analisis untuk review performa harian.",
  },
];

const roleBasedActions = [
  {
    title: "Petugas PST",
    icon: ShieldCheck,
    audience: "PETUGAS",
    items: [
      "Awali shift dari menu Antrean dan cek pengunjung menunggu.",
      "Gunakan aksi Layani/Selesai/Batalkan secara disiplin agar status tidak tertinggal.",
      "Kirim pengingat SKD jika pengunjung belum melengkapi data wajib.",
    ],
  },
  {
    title: "Admin PASTI",
    icon: UserCog,
    audience: "ADMIN",
    items: [
      "Pastikan layanan aktif dan akun petugas sudah siap sebelum jam operasional.",
      "Pantau performa lewat menu Analisis dan validasi data melalui Buku Tamu.",
      "Kelola QR dan jadwal petugas untuk menjaga kelancaran antrean harian.",
    ],
  },
];

const troubleshootingTips = [
  {
    title: "Data terlihat belum terbaru",
    description: "Klik Perbarui Data, lalu cek kembali filter tanggal dan status aktif.",
  },
  {
    title: "Menu admin tidak muncul",
    description: "Pastikan akun Anda memiliki role Admin dan login ulang bila role baru diubah.",
  },
  {
    title: "Pengunjung belum isi SKD",
    description:
      "Gunakan aksi pengingat SKD dari tabel antrean agar pengunjung mendapat instruksi lanjutan.",
  },
];

type GuidePageProps = {
  currentUser: Session["user"];
};

type GuideTabValue = "quick-start" | "main-menu" | "admin-menu" | "workflow" | "troubleshooting";

const guideTabs: Array<{ value: GuideTabValue; label: string }> = [
  { value: "quick-start", label: "Mulai Shift" },
  { value: "main-menu", label: "Navigasi Menu" },
  { value: "admin-menu", label: "Menu Admin" },
  { value: "workflow", label: "Alur Layanan" },
  { value: "troubleshooting", label: "Masalah Umum" },
];

type GuideProgressStorage = {
  activeTab: GuideTabValue;
  visitedTabs: Record<GuideTabValue, boolean>;
};

const GUIDE_PROGRESS_VERSION = 1;

const getDefaultVisitedTabs = (): Record<GuideTabValue, boolean> => ({
  "quick-start": true,
  "main-menu": false,
  "admin-menu": false,
  "workflow": false,
  "troubleshooting": false,
});

const isGuideTabValue = (value: unknown): value is GuideTabValue =>
  typeof value === "string" && guideTabs.some((tab) => tab.value === value);

const normalizeVisitedTabs = (value: unknown): Record<GuideTabValue, boolean> => {
  const defaults = getDefaultVisitedTabs();
  if (!value || typeof value !== "object") {
    return defaults;
  }

  const maybeVisited = value as Partial<Record<GuideTabValue, unknown>>;
  return {
    "quick-start": maybeVisited["quick-start"] === true,
    "main-menu": maybeVisited["main-menu"] === true,
    "admin-menu": maybeVisited["admin-menu"] === true,
    "workflow": maybeVisited["workflow"] === true,
    "troubleshooting": maybeVisited["troubleshooting"] === true,
  };
};

export default function GuidePage({ currentUser }: GuidePageProps) {
  const isAdmin = currentUser.role === Role.ADMIN;
  const visibleRoleCards = roleBasedActions.filter(
    (section) => section.audience === "PETUGAS" || isAdmin
  );
  const [activeTab, setActiveTab] = useState<GuideTabValue>("quick-start");
  const [visitedTabs, setVisitedTabs] = useState<Record<GuideTabValue, boolean>>(
    getDefaultVisitedTabs()
  );

  useEffect(() => {
    const storageKey = `guide-reading-progress:v${GUIDE_PROGRESS_VERSION}:${currentUser.id}`;
    const raw = window.localStorage.getItem(storageKey);

    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<GuideProgressStorage>;
      const nextActiveTab = isGuideTabValue(parsed.activeTab) ? parsed.activeTab : "quick-start";
      const nextVisitedTabs = normalizeVisitedTabs(parsed.visitedTabs);

      setActiveTab(nextActiveTab);
      setVisitedTabs({
        ...nextVisitedTabs,
        [nextActiveTab]: true,
      });
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [currentUser.id]);

  useEffect(() => {
    const storageKey = `guide-reading-progress:v${GUIDE_PROGRESS_VERSION}:${currentUser.id}`;
    const payload: GuideProgressStorage = {
      activeTab,
      visitedTabs,
    };

    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [activeTab, currentUser.id, visitedTabs]);

  const completedTabs = guideTabs.filter((tab) => visitedTabs[tab.value]).length;
  const progressPercent = Math.round((completedTabs / guideTabs.length) * 100);
  const isReadingComplete = completedTabs === guideTabs.length;

  const handleTabChange = (value: string) => {
    const tabValue = value as GuideTabValue;
    setActiveTab(tabValue);
    setVisitedTabs((previous) => ({
      ...previous,
      [tabValue]: true,
    }));
  };

  return (
    <PageContainer maxWidth="6xl" className="guide-page dashboard-page">
      <DashboardPageHeader
        className="guide-no-print"
        title="Panduan Penggunaan PASTI"
        description="Panduan operasional agar alur kerja antrean tetap lancar dan konsisten."
      />

      <section className="guide-no-print">
        <Card className="border-border/80 bg-card/92">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base text-primary-color">
              <ShieldCheck className="h-4 w-4" />
              Tanggung Jawab Berdasarkan Role
            </CardTitle>
            <CardDescription>
              Pastikan memahami peran masing-masing untuk menjaga kelancaran operasional harian.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {visibleRoleCards.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.title} className="h-full border-border/70 bg-card/88">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm text-primary-color">
                      <Icon className="h-4 w-4" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5 text-sm leading-relaxed text-secondary-color">
                      {section.items.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/80 bg-card/92 shadow-sm">
        <CardHeader className="border-b border-border/70 pb-4">
          <CardTitle className="flex items-center gap-2 text-primary-color">
            <FileText className="h-5 w-5" />
            Panduan Operasional PASTI 6502
          </CardTitle>
          <CardDescription>
            Gunakan tab berikut sesuai kebutuhan: mulai shift, navigasi menu, alur harian, hingga
            troubleshooting.
          </CardDescription>
        </CardHeader>
        <CardContent className="guide-interactive space-y-4 p-4 sm:p-6">
          <div className="guide-no-print rounded-lg border border-border/80 bg-background/70 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-primary-color">Progres baca tab panduan</p>
              <Badge variant={isReadingComplete ? "secondary" : "outline"} aria-live="polite">
                {isReadingComplete
                  ? "Semua tab sudah dibaca"
                  : `${completedTabs}/${guideTabs.length} tab selesai`}
              </Badge>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
            <div className="guide-no-print -mx-1 overflow-x-auto px-1 pb-1">
              <TabsList className="h-auto w-max min-w-full justify-start gap-1 bg-background/80 p-1 sm:w-full sm:flex-wrap">
                {guideTabs.map((tab) => {
                  const isVisited = visitedTabs[tab.value];

                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="flex-none gap-1.5 rounded-md px-3 py-2"
                    >
                      {tab.label}
                      <span
                        className={
                          isVisited
                            ? "inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600"
                            : "text-[10px] font-medium text-secondary-color"
                        }
                      >
                        {isVisited ? <CheckCircle2 className="h-3 w-3" /> : null}
                        {isVisited ? "Selesai" : "Belum"}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            <TabsContent value="quick-start" className="space-y-4">
              <Card className="border-border/80 bg-card/88">
                <CardHeader>
                  <CardTitle className="text-base text-primary-color">Mulai Shift dalam 5 Langkah</CardTitle>
                  <CardDescription>
                    Alur ini disarankan untuk pembukaan layanan setiap hari kerja.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {quickStartSteps.map((step, index) => (
                      <li key={step.title} className="flex gap-3">
                        <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {index + 1}
                        </span>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-primary-color">{step.title}</p>
                          <p className="text-sm text-secondary-color">{step.description}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="main-menu" className="space-y-3">
              <div className="grid gap-4 md:grid-cols-2">
                {mainMenus.map((menu) => {
                  const Icon = menu.icon;
                  return (
                    <Card key={menu.href} className="h-full border-border/80 bg-card/88">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base text-primary-color">
                          <Icon className="h-4 w-4" />
                          {menu.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex h-full flex-col gap-3 text-sm text-secondary-color">
                        <p className="leading-relaxed">{menu.description}</p>
                        <Button asChild variant="outline" size="sm" className="mt-auto w-fit">
                          <Link href={menu.href}>Buka {menu.title}</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="admin-menu" className="space-y-3">
              <div className="grid gap-4 md:grid-cols-2">
                {adminMenus.map((menu) => {
                  const Icon = menu.icon;
                  return (
                    <Card key={menu.href} className="h-full border-border/80 bg-card/88">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base text-primary-color">
                          <Icon className="h-4 w-4" />
                          {menu.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex h-full flex-col gap-3 text-sm text-secondary-color">
                        <p className="leading-relaxed">{menu.description}</p>
                        {isAdmin ? (
                          <Button asChild variant="outline" size="sm" className="mt-auto w-fit">
                            <Link href={menu.href}>Buka {menu.title}</Link>
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="mt-auto w-fit" disabled>
                            Hanya untuk admin
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="workflow">
              <Card className="border-border/80 bg-card/88">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary-color">
                    <Workflow className="h-4 w-4" />
                    Alur Kerja Harian (Ringkas)
                  </CardTitle>
                  <CardDescription>
                    Ikuti urutan ini untuk menjaga konsistensi status antrean dan laporan.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-4">
                    {dailyWorkflow.map((step, index) => (
                      <li key={step.title} className="flex gap-3">
                        <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {index + 1}
                        </span>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-primary-color">{step.title}</p>
                          <p className="text-sm text-secondary-color">{step.description}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="troubleshooting">
              <Card className="border-border/80 bg-card/88">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary-color">
                    <HelpCircle className="h-4 w-4" />
                    Masalah Umum
                  </CardTitle>
                  <CardDescription>
                    Solusi singkat untuk kendala paling sering di lapangan.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {troubleshootingTips.map((tip) => (
                    <div
                      key={tip.title}
                      className="rounded-lg border border-border/70 bg-background/70 p-3"
                    >
                      <p className="text-sm font-semibold text-primary-color">{tip.title}</p>
                      <p className="mt-1 text-sm text-secondary-color">{tip.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
