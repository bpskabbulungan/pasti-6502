"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Role } from "@/shared/constants/enums";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Clock3,
  Hourglass,
  RefreshCcw,
  Settings,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";
import AuthLoadingSkeleton from "@/modules/dashboard/components/skeletons/AuthLoadingSkeleton";
import DashboardSkeleton from "@/modules/dashboard/components/skeletons/DashboardSkeleton";
import { dashboardApi } from "@/services/api/dashboard";
import type { DashboardStatsResponse } from "@shared/types/dashboard";
import type { ErrorResponse } from "@shared/types/api";

type DashboardStats = DashboardStatsResponse;

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

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null); // State untuk menyimpan waktu update terakhir
  const [dataHash, setDataHash] = useState<string>(""); // Track data hash for change detection

  const fetchStats = useCallback(
    async (forceRefresh: boolean = false) => {
      if (!session) {
        setLoading(false);
        return;
      }

      // Only show loading indicator on forced refresh or initial load
      if (forceRefresh || !stats) {
        setLoading(true);
      }

      try {
        const data = await dashboardApi.stats(!forceRefresh ? dataHash : undefined);

        // Only update if there are changes or initial load or force refresh
        if (forceRefresh || !data.hasOwnProperty("hasChanges") || data.hasChanges) {
          setStats(data);
          setLastUpdatedAt(new Date()); // Set waktu saat ini sebagai waktu update terakhir

          // Store the hash for future comparisons
          if (data.hash) setDataHash(data.hash);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error(getErrorMessage(error, "Terjadi kesalahan saat memuat statistik"));
      } finally {
        if (forceRefresh || !stats) {
          setLoading(false);
        }
      }
    },
    [session, dataHash, stats]
  );

  // Setup polling for data changes with change detection
  useEffect(() => {
    if (!session) return;

    // Initial fetch
    fetchStats();

    // Set up polling for changes
    const pollInterval = 30000; // Poll every 30 seconds
    let pollTimer: NodeJS.Timeout | null = null;

    // Function to poll for changes
    const pollForChanges = () => {
      if (document.visibilityState === "visible") {
        fetchStats(false); // Don't force refresh on polling
      }

      // Schedule next poll
      pollTimer = setTimeout(pollForChanges, pollInterval);
    };

    // Start polling
    pollTimer = setTimeout(pollForChanges, pollInterval);

    // Track document visibility to pause polling when tab is not visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && pollTimer === null) {
        // Resume polling when tab becomes visible again
        fetchStats();
        pollTimer = setTimeout(pollForChanges, pollInterval);
      }
    };

    // Add visibility change listener
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [fetchStats, session]);

  if (!session) {
    // Use Auth Loading Skeleton component for better UX
    return <AuthLoadingSkeleton />;
  }

  const updatedLabel = lastUpdatedAt
    ? new Intl.DateTimeFormat("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(lastUpdatedAt)
    : loading && !stats
      ? "Memuat data awal..."
      : "Belum ada data";
  const isRefreshing = loading && Boolean(stats);

  if (loading && !stats) {
    return <DashboardSkeleton />;
  }

  if (!stats) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
        <div className="rounded-2xl border border-border/80 bg-card/80 p-6 text-center shadow-md">
          <p className="text-secondary-color">Tidak ada data statistik untuk ditampilkan.</p>
          <Button
            onClick={() => fetchStats(true)}
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
      link: "/dashboard/queue",
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
      link: "/dashboard/queue#serving",
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
      link: "/dashboard/all-queues?status=COMPLETED",
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
      link: "/dashboard/all-queues?status=CANCELED",
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

  const manualItems = [
    {
      title: "Cara Melihat Antrean",
      description:
        'Klik tombol "Lihat Detail" pada kartu Antrean Menunggu untuk melihat daftar antrean saat ini.',
    },
    {
      title: "Cara Melayani Pengunjung",
      description:
        'Pilih pengunjung dari daftar antrean dan klik tombol "Mulai Layanan" untuk memulai proses layanan.',
    },
    {
      title: "Cara Menyelesaikan Layanan",
      description:
        'Setelah selesai melayani pengunjung, klik tombol "Selesaikan" untuk menandai layanan sebagai selesai.',
    },
    {
      title: "Memperbarui Data",
      description:
        'Klik tombol "Perbarui Data" di pojok kanan atas untuk memuat ulang data terbaru.',
    },
    {
      title: "Melihat Riwayat",
      description:
        'Gunakan halaman "Riwayat Antrean" untuk melihat seluruh riwayat layanan.',
    },
    {
      title: "Bantuan",
      description: "Jika Anda memerlukan bantuan lebih lanjut, hubungi administrator sistem.",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
      <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6 shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(247,144,57,0.22),transparent_55%)]" />
        <div className="absolute inset-y-0 right-0 w-52 bg-[radial-gradient(circle_at_70%_30%,rgba(154,5,1,0.12),transparent_55%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-primary-color md:text-4xl">Dashboard</h1>
              <p className="max-w-xl text-secondary-color">
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
            {session.user.role === Role.PETUGAS && (
              <Button
                asChild
                variant="outline"
                className="border-border/80 bg-background/70 text-primary-color hover:bg-background"
              >
                <Link href="/dashboard/ui-showcase">UI Showcase</Link>
              </Button>
            )}
            <Button
              onClick={() => fetchStats(true)}
              disabled={loading}
              className="flex items-center gap-2 bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
              aria-label="Perbarui data statistik"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Memperbarui..." : "Perbarui Data"}</span>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="group h-full border-border/80 bg-card/80 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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
                  className={`w-full justify-start px-2 text-xs ${card.linkClassName}`}
                >
                  <Link href={card.link}>{card.linkLabel}</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {averageCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="border-border/80 bg-card/80 shadow-sm">
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

      {session.user.role === Role.ADMIN && (
        <section className="grid gap-6 md:grid-cols-2">
          <Card className="border-border/80 bg-card/80 shadow-sm">
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
          <Card className="border-border/80 bg-card/80 shadow-sm">
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
              <div className="flex flex-wrap gap-2">
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
