"use client";

import Link from "next/link";
import type { Session } from "next-auth";
import {
  BarChart4,
  BookOpenCheck,
  CalendarClock,
  ClipboardList,
  FileText,
  LayoutDashboard,
  ListChecks,
  Printer,
  QrCode,
  RefreshCcw,
  UserCog,
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
    title: "Buka menu Antrean",
    description: "Lihat daftar pengunjung yang menunggu dan siapa yang harus dipanggil lebih dulu.",
  },
  {
    title: "Klik Layani saat pengunjung dipanggil",
    description: "Status antrean berubah menjadi sedang diproses oleh petugas.",
  },
  {
    title: "Tutup layanan dengan status yang sesuai",
    description: "Pilih Selesai jika tuntas, atau Batalkan bila layanan tidak jadi diproses.",
  },
  {
    title: "Kirim Pengingat SKD bila diperlukan",
    description: "Gunakan aksi di baris antrean untuk kasus pengunjung yang belum mengisi SKD.",
  },
  {
    title: "Cek rekap di Buku Tamu dan Analisis",
    description: "Pastikan data harian tercatat, lalu export Excel/PDF jika dibutuhkan pelaporan.",
  },
];

const importantNotes = [
  "Sebagian halaman punya tombol Perbarui Data dan auto-refresh untuk meminimalkan data stale.",
  "Di menu Antrean, gunakan filter Status dan Tanggal agar daftar kerja lebih fokus.",
  "Menu admin (Pengguna, Layanan, QR, Jadwal) hanya muncul untuk role Admin.",
  "Sebelum logout, pastikan antrean yang sedang dilayani sudah ditutup dengan status final.",
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

type GuidePageProps = {
  currentUser: Session["user"];
};

export default function GuidePage({ currentUser }: GuidePageProps) {
  const isAdmin = currentUser.role === Role.ADMIN;

  const handlePrint = () => {
    window.print();
  };

  return (
    <PageContainer maxWidth="6xl">
      <DashboardPageHeader
        title="Panduan Dashboard PASTI 6502"
        description="Alur singkatnya: pengunjung isi buku tamu atau scan QR, sistem membuat nomor antrean, petugas proses di menu Antrean, lalu rekap dievaluasi dari Buku Tamu dan Analisis."
        chips={
          <>
            <div className="dashboard-chip">Panduan Praktis</div>
            <div className="dashboard-chip">Format Dokumen + Tab</div>
          </>
        }
        actions={
          <div className="dashboard-header-actions">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="dashboard-header-action border-border/80 bg-background/80"
            >
              <Printer className="h-4 w-4" />
              Cetak / Simpan PDF
            </Button>
          </div>
        }
      />

      <section className="mx-auto w-full max-w-5xl">
        <Card className="border-border/80 bg-card/92 shadow-sm">
          <CardHeader className="border-b border-border/70">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <CardTitle className="flex items-center gap-2 text-primary-color">
                  <FileText className="h-5 w-5" />
                  Panduan Operasional
                </CardTitle>
                <CardDescription>
                  Dibuat seperti dokumen ringkas dengan tab supaya cepat dicari saat dipakai kerja.
                </CardDescription>
              </div>
              <Badge variant={isAdmin ? "secondary" : "outline"}>
                {isAdmin ? "Akses Anda: Admin" : "Akses Anda: Petugas"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <Tabs defaultValue="quick-start" className="space-y-4">
              <TabsList className="w-full justify-start overflow-x-auto bg-background/80">
                <TabsTrigger value="quick-start" className="flex-none">
                  Mulai Cepat
                </TabsTrigger>
                <TabsTrigger value="main-menu" className="flex-none">
                  Menu Utama
                </TabsTrigger>
                <TabsTrigger value="admin-menu" className="flex-none">
                  Menu Admin
                </TabsTrigger>
                <TabsTrigger value="workflow" className="flex-none">
                  Alur Harian
                </TabsTrigger>
              </TabsList>

              <TabsContent value="quick-start" className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card className="border-border/80 bg-card/88">
                    <CardHeader>
                      <CardTitle className="text-base text-primary-color">Mulai Cepat (2 Menit)</CardTitle>
                      <CardDescription>Urutan dasar untuk operasional harian petugas.</CardDescription>
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

                  <Card className="border-border/80 bg-card/88">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base text-primary-color">
                        <RefreshCcw className="h-4 w-4" />
                        Catatan Penting
                      </CardTitle>
                      <CardDescription>Checklist kecil agar data tetap rapi dan aman.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-secondary-color">
                        {importantNotes.map((note) => (
                          <li key={note} className="flex gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="main-menu" className="space-y-3">
                <div className="grid gap-4 md:grid-cols-2">
                  {mainMenus.map((menu) => {
                    const Icon = menu.icon;
                    return (
                      <Card key={menu.href} className="border-border/80 bg-card/88">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-base text-primary-color">
                            <Icon className="h-4 w-4" />
                            {menu.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-secondary-color">
                          <p>{menu.description}</p>
                          <Button asChild variant="outline" size="sm" className="w-fit">
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
                      <Card key={menu.href} className="border-border/80 bg-card/88">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-base text-primary-color">
                            <Icon className="h-4 w-4" />
                            {menu.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-secondary-color">
                          <p>{menu.description}</p>
                          {isAdmin ? (
                            <Button asChild variant="outline" size="sm" className="w-fit">
                              <Link href={menu.href}>Buka {menu.title}</Link>
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" className="w-fit" disabled>
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
                    <CardTitle className="text-primary-color">Alur Kerja Harian (Ringkas)</CardTitle>
                    <CardDescription>Flow ini mengikuti menu yang tersedia di sistem saat ini.</CardDescription>
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
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </PageContainer>
  );
}
