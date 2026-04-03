"use client";

import Link from "next/link";
import type { Session } from "next-auth";
import {
  BookOpenCheck,
  CalendarClock,
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  QrCode,
  RefreshCcw,
  ShieldCheck,
  UserCog,
  Wrench,
  BarChart4,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

type GuidePageProps = {
  currentUser: Session["user"];
};

export default function GuidePage({ currentUser }: GuidePageProps) {
  const isAdmin = currentUser.role === Role.ADMIN;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6">
      <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6 shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(247,144,57,0.18),transparent_55%)]" />
        <div className="relative space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="bg-background/80">
              Panduan Praktis
            </Badge>
            <Badge variant="outline">Bahasa santai</Badge>
          </div>
          <h1 className="text-3xl font-bold text-primary-color md:text-4xl">
            Panduan Dashboard PST
          </h1>
          <p className="max-w-3xl text-sm text-secondary-color md:text-base">
            Biar gampang, ingat alurnya begini: pengunjung isi buku tamu atau scan QR, sistem bikin
            nomor antrean, petugas proses di menu Antrean, lalu rekapnya dilihat di Buku Tamu dan
            Analisis.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/80 bg-card/80">
          <CardHeader>
            <CardTitle className="text-primary-color">Mulai Cepat (2 Menit)</CardTitle>
            <CardDescription>Kalau baru pakai sistem, ikuti urutan ini dulu.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-secondary-color">
            <p>
              1. Buka <strong>Antrean</strong> untuk lihat siapa yang menunggu.
            </p>
            <p>
              2. Klik <strong>Layani</strong> saat pengunjung dipanggil.
            </p>
            <p>
              3. Setelah selesai, klik <strong>Selesai</strong> supaya status pindah ke riwayat.
            </p>
            <p>
              4. Kalau perlu, kirim <strong>Pengingat SKD</strong> dari baris antrean.
            </p>
            <p>
              5. Cek rekap di <strong>Buku Tamu</strong> dan export jika dibutuhkan.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary-color">
              <RefreshCcw className="h-4 w-4" />
              Catatan Penting
            </CardTitle>
            <CardDescription>Supaya kerja harian tetap aman dan rapi.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-secondary-color">
            <p>
              - Hampir semua halaman punya tombol <strong>Perbarui Data</strong> dan auto-refresh.
            </p>
            <p>
              - Di menu Antrean, gunakan filter <strong>Status</strong> dan <strong>Tanggal</strong>{" "}
              agar daftar tidak campur.
            </p>
            <p>
              - Menu admin (<strong>Pengguna, Layanan, QR, Jadwal</strong>) hanya muncul untuk role
              Admin.
            </p>
            <p>
              - Sebelum logout, pastikan antrean yang sedang dilayani sudah diproses sesuai kondisi
              terakhir.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-primary-color">Menu Utama</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {mainMenus.map((menu) => {
            const Icon = menu.icon;
            return (
              <Card key={menu.href} className="border-border/80 bg-card/80">
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
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <UserCog className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-primary-color">Menu Admin</h2>
          <Badge variant={isAdmin ? "secondary" : "outline"}>
            {isAdmin ? "Akses Anda: Admin" : "Akses Anda: Petugas"}
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {adminMenus.map((menu) => {
            const Icon = menu.icon;
            return (
              <Card key={menu.href} className="border-border/80 bg-card/80">
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
      </section>

      <section>
        <Card className="border-border/80 bg-card/80">
          <CardHeader>
            <CardTitle className="text-primary-color">Alur Kerja Harian (Ringkas)</CardTitle>
            <CardDescription>Flow ini sesuai menu yang ada di sistem saat ini.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-secondary-color">
            <p>
              1. Admin pastikan <strong>Layanan aktif</strong>, <strong>petugas tersedia</strong>,
              dan QR buku tamu sudah siap ditempatkan di area layanan.
            </p>
            <p>
              2. Pengunjung datang lalu isi form di <strong>/guest</strong> (bisa dari scan QR).
            </p>
            <p>
              3. Sistem membuat nomor antrean otomatis, lalu antrean tampil di dashboard petugas.
            </p>
            <p>
              4. Petugas proses di menu <strong>Antrean</strong>: Layani -&gt; (opsional) Batalkan
              -&gt; Selesai.
            </p>
            <p>
              5. Jika SKD belum diisi, kirim pengingat dari tabel antrean atau tandai status SKD.
            </p>
            <p>
              6. Lihat rekap di <strong>Buku Tamu</strong>, lalu gunakan <strong>Analisis</strong>{" "}
              untuk evaluasi performa (admin).
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
