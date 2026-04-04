"use client";

import type { Session } from "next-auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Role } from "@/shared/constants/enums";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock3, Hourglass, RefreshCcw, Settings, Users, XCircle } from "lucide-react";
import DashboardSkeleton from "@/features/dashboard/components/skeletons/dashboard-skeleton";
import { useLiveQuery } from "@/hooks/use-live-query";
import { dashboardApi } from "@/services/api/dashboard";
import { formatDisplayDateTimeWithSeconds } from "@/lib/date-format";
import type { DashboardStatsResponse } from "@shared/types/dashboard";
import type { ErrorResponse } from "@shared/types/api";

type DashboardStats = DashboardStatsResponse;
type DashboardPageProps = {
  currentUser: Session["user"];
  initialStats: DashboardStats;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== "object" || !error) {
    return fallback;
  }

  const errorDetails = (error as { details?: ErrorResponse }).details;
  if (errorDetails?.error) {
    return errorDetails.error;
  }

  const message = (error as { message?: string }).message;
  return message || fallback;
};

export default function DashboardPage({ currentUser, initialStats }: DashboardPageProps) {
  const {
    data: stats,
    isLoading,
    isRefreshing,
    lastFetchedAt,
    refresh,
  } = useLiveQuery<DashboardStats>(dashboardApi.statsUrl(), {
    fallbackData: initialStats,
    fallbackEtag: initialStats.hash ? `"${initialStats.hash}"` : null,
    refreshInterval: 30_000,
    onError: (error) => {
      console.error("Error fetching stats:", error);
      toast.error(getErrorMessage(error, "Terjadi kesalahan saat memuat statistik"));
    },
  });

  const updatedLabel = lastFetchedAt
    ? formatDisplayDateTimeWithSeconds(lastFetchedAt)
    : isLoading && !stats
      ? "Memuat data awal..."
      : "Belum ada data";

  if (isLoading && !stats) {
    return <DashboardSkeleton />;
  }

  if (!stats) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="rounded-2xl border border-border/80 bg-card/80 p-6 text-center shadow-md">
          <p className="text-secondary-color">Tidak ada data statistik untuk ditampilkan.</p>
          <Button
            onClick={() => void refresh()}
            className="mt-4 bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
          >
            Muat Ulang
          </Button>
        </div>
      </div>
    );
  }

  const metricCards = [
    {
      title: "Antrean Menunggu",
      value: stats.counts.waiting,
      description: "Pengunjung yang sedang menunggu layanan",
      icon: Hourglass,
      iconClassName: "text-primary",
      iconBg: "bg-primary/10",
      link: "/dashboard/queue?status=WAITING",
      linkLabel: "Lihat Detail",
      linkClassName: "text-primary",
    },
    {
      title: "Sedang Dilayani",
      value: stats.counts.serving,
      description: "Pengunjung yang sedang dalam proses layanan",
      icon: Users,
      iconClassName: "text-accent",
      iconBg: "bg-accent/10",
      link: "/dashboard/queue?status=SERVING",
      linkLabel: "Lihat Detail",
      linkClassName: "text-accent",
    },
    {
      title: "Selesai Dilayani",
      value: stats.counts.completed,
      description: "Layanan yang telah selesai hari ini",
      icon: CheckCircle,
      iconClassName: "text-emerald-600",
      iconBg: "bg-emerald-500/10",
      link: "/dashboard/queue?status=COMPLETED",
      linkLabel: "Lihat Detail",
      linkClassName: "text-emerald-600",
    },
    {
      title: "Dibatalkan",
      value: stats.counts.canceled,
      description: "Antrean yang dibatalkan hari ini",
      icon: XCircle,
      iconClassName: "text-destructive",
      iconBg: "bg-destructive/10",
      link: "/dashboard/queue?status=CANCELED",
      linkLabel: "Lihat Detail",
      linkClassName: "text-destructive",
    },
  ];

  const averageCards = [
    {
      title: "Rata-rata Waktu Tunggu",
      value: stats.averages.waitTimeMinutes,
      description: "Waktu rata-rata pengunjung menunggu sebelum dilayani",
      icon: Clock3,
      iconClassName: "text-accent",
      iconBg: "bg-accent/10",
    },
    {
      title: "Rata-rata Waktu Layanan",
      value: stats.averages.serviceTimeMinutes,
      description: "Durasi rata-rata layanan per pengunjung",
      icon: Clock3,
      iconClassName: "text-primary",
      iconBg: "bg-primary/10",
    },
  ];

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-primary-color sm:text-3xl">Dashboard</h1>
              <p className="max-w-xl text-sm text-secondary-color">
                Statistik antrean harian dan ringkasan performa layanan.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-secondary-color">
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                <span>Data per: {updatedLabel}</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-2 py-1 text-[11px] font-medium">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${isRefreshing ? "bg-primary animate-pulse" : "bg-emerald-500"}`}
                />
                {isRefreshing ? "Memperbarui data..." : "Auto refresh setiap 30 detik"}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentUser.role === Role.PETUGAS && (
              <Button
                asChild
                variant="outline"
                className="border-border/80 bg-background/75 text-primary-color"
              >
                <Link href="/dashboard/ui-showcase">UI Showcase</Link>
              </Button>
            )}
            <Button
              onClick={() => void refresh()}
              disabled={isRefreshing}
              className="flex items-center gap-2"
              aria-label="Perbarui data statistik"
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Memperbarui..." : "Perbarui Data"}</span>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="group h-full border-border/80 bg-card/88 transition hover:-translate-y-0.5"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wide text-secondary-color">
                    {card.title}
                  </CardTitle>
                  <div className="text-2xl font-bold text-primary-color md:text-3xl">
                    {card.value}
                  </div>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${card.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${card.iconClassName}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-secondary-color">{card.description}</p>
              </CardContent>
              <CardFooter className="border-t border-border/70 pt-3">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className={`w-full justify-start rounded-lg px-2 text-xs ${card.linkClassName}`}
                >
                  <Link href={card.link}>{card.linkLabel}</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {averageCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="border-border/80 bg-card/88">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm font-semibold text-primary-color">
                    {card.title}
                  </CardTitle>
                </div>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${card.iconBg}`}
                >
                  <Icon className={`h-4 w-4 ${card.iconClassName}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary-color md:text-3xl">
                  {card.value}{" "}
                  <span className="text-sm font-normal text-secondary-color">menit</span>
                </div>
                <p className="mt-2 text-xs text-secondary-color">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {currentUser.role === Role.ADMIN && (
        <section className="grid gap-4 md:grid-cols-2">
          <Card className="border-border/80 bg-card/88">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-primary-color">
                Total Pengunjung Hari Ini
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-color md:text-3xl">
                {stats.counts.total}{" "}
                <span className="text-sm font-normal text-secondary-color">pengunjung</span>
              </div>
              <p className="mt-2 text-xs text-secondary-color">
                Jumlah total pengunjung yang terdaftar hari ini
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/80 bg-card/88">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-primary-color">
                Pengaturan Sistem
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10">
                <Settings className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-secondary-color">
                Akses cepat ke halaman konfigurasi sistem
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button asChild variant="outline" size="sm" className="border-border/80 text-xs">
                  <Link href="/dashboard/services">Kelola Layanan</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="border-border/80 text-xs">
                  <Link href="/dashboard/users">Kelola Pengguna</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="border-border/80 text-xs">
                  <Link href="/dashboard/qrcode">QR Code</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="border-border/80 text-xs">
                  <Link href="/dashboard/duty-schedule">Jadwal Petugas</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="border-border/80 text-xs">
                  <Link href="/dashboard/analytics">Analisis</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}


