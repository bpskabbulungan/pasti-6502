"use client";

import type { Session } from "next-auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Role } from "@/shared/constants/enums";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LiveStatusBadge } from "@/components/shared/feedback/live-status-badge";
import { DashboardPageHeader } from "@/features/dashboard/components/layout/dashboard-page-header";
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
  initialFetchedAt: string;
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

export default function DashboardPage({
  currentUser,
  initialStats,
  initialFetchedAt,
}: DashboardPageProps) {
  const {
    data: stats,
    isLoading,
    isRefreshing,
    lastFetchedAt,
    refresh,
  } = useLiveQuery<DashboardStats>(dashboardApi.statsUrl(), {
    fallbackData: initialStats,
    fallbackEtag: initialStats.hash ? `"${initialStats.hash}"` : null,
    fallbackFetchedAt: initialFetchedAt,
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
        <div className="rounded-xl border border-border/80 bg-card p-6 text-center">
          <p className="text-secondary-color">Tidak ada data statistik untuk ditampilkan.</p>
          <Button
            onClick={() => void refresh()}
            variant="outline"
            className="mt-4 border-border/80"
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
      iconClassName: "text-amber-600 dark:text-amber-300",
      iconBadgeClassName: "border-amber-400/35 bg-amber-500/10",
      link: "/dashboard/queue?status=WAITING",
      linkLabel: "Lihat Detail",
    },
    {
      title: "Sedang Dilayani",
      value: stats.counts.serving,
      description: "Pengunjung yang sedang dalam proses layanan",
      icon: Users,
      iconClassName: "text-sky-600 dark:text-sky-300",
      iconBadgeClassName: "border-sky-400/35 bg-sky-500/10",
      link: "/dashboard/queue?status=SERVING",
      linkLabel: "Lihat Detail",
    },
    {
      title: "Selesai Dilayani",
      value: stats.counts.completed,
      description: "Layanan yang telah selesai hari ini",
      icon: CheckCircle,
      iconClassName: "text-emerald-600 dark:text-emerald-300",
      iconBadgeClassName: "border-emerald-400/35 bg-emerald-500/10",
      link: "/dashboard/queue?status=COMPLETED",
      linkLabel: "Lihat Detail",
    },
    {
      title: "Dibatalkan",
      value: stats.counts.canceled,
      description: "Antrean yang dibatalkan hari ini",
      icon: XCircle,
      iconClassName: "text-rose-600 dark:text-rose-300",
      iconBadgeClassName: "border-rose-400/35 bg-rose-500/10",
      link: "/dashboard/queue?status=CANCELED",
      linkLabel: "Lihat Detail",
    },
  ];

  const averageCards = [
    {
      title: "Rata-rata Waktu Tunggu",
      value: stats.averages.waitTimeMinutes,
      description: "Waktu rata-rata pengunjung menunggu sebelum dilayani",
      icon: Clock3,
      iconClassName: "text-violet-600 dark:text-violet-300",
      iconBadgeClassName: "border-violet-400/35 bg-violet-500/10",
    },
    {
      title: "Rata-rata Waktu Layanan",
      value: stats.averages.serviceTimeMinutes,
      description: "Durasi rata-rata layanan per pengunjung",
      icon: Clock3,
      iconClassName: "text-cyan-600 dark:text-cyan-300",
      iconBadgeClassName: "border-cyan-400/35 bg-cyan-500/10",
    },
  ];

  return (
    <div className="dashboard-page">
      <DashboardPageHeader
        title="Dashboard"
        description="Statistik antrean harian dan ringkasan performa layanan."
        meta={
          <>
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              <span>Data per: {updatedLabel}</span>
            </div>
            <LiveStatusBadge
              isRefreshing={isRefreshing}
              hasFetched={Boolean(lastFetchedAt)}
              idleLabel="Auto refresh setiap 30 detik"
            />
          </>
        }
        actions={
          <div className="dashboard-header-actions">
            {currentUser.role === Role.PETUGAS && (
              <Button
                asChild
                variant="outline"
                className="dashboard-header-action border-border/80 bg-background text-primary-color"
              >
                <Link href="/dashboard/ui-showcase">UI Showcase</Link>
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => void refresh()}
              disabled={isRefreshing}
              className="dashboard-header-action border-border/80 bg-background"
              aria-label="Perbarui data statistik"
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Memperbarui..." : "Perbarui Data"}</span>
            </Button>
          </div>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="h-full border-border/80 bg-card shadow-none">
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
                  className={`flex h-10 w-10 items-center justify-center rounded-lg border ${card.iconBadgeClassName}`}
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
                  className="w-full justify-start rounded-lg px-2 text-xs text-secondary-color hover:text-primary-color"
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
            <Card key={card.title} className="border-border/80 bg-card shadow-none">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm font-semibold text-primary-color">
                    {card.title}
                  </CardTitle>
                </div>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border ${card.iconBadgeClassName}`}
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
          <Card className="border-border/80 bg-card shadow-none">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-primary-color">
                Total Pengunjung Hari Ini
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-indigo-400/35 bg-indigo-500/10">
                <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
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
          <Card className="border-border/80 bg-card shadow-none">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-primary-color">
                Pengaturan Sistem
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-fuchsia-400/35 bg-fuchsia-500/10">
                <Settings className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-300" />
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
