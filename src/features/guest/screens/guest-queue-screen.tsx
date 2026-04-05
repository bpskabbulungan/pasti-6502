"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import PageBackground from "@/components/shared/page-background";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLiveQuery } from "@/hooks/use-live-query";
import { markNavigationPending } from "@/lib/navigation-pending";
import { guestApi } from "@/services/api/guest";
import { Purpose, QueueStatus } from "@/shared/constants/enums";
import type { ErrorResponse } from "@shared/types/api";
import type { GuestQueueDetail } from "@shared/types/guest";

const purposeLabels: Record<Purpose, string> = {
  [Purpose.KONSULTASI_STATISTIK]: "Konsultasi Statistik",
  [Purpose.PERPUSTAKAAN]: "Perpustakaan",
  [Purpose.REKOMENDASI_STATISTIK]: "Rekomendasi Statistik",
  [Purpose.LAINNYA]: "Lainnya",
};

const purposeBadgeClass: Record<Purpose, string> = {
  [Purpose.KONSULTASI_STATISTIK]:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-100",
  [Purpose.PERPUSTAKAAN]: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100",
  [Purpose.REKOMENDASI_STATISTIK]:
    "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100",
  [Purpose.LAINNYA]: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
};

const statusLabels: Record<QueueStatus, string> = {
  WAITING: "Menunggu",
  SERVING: "Sedang Dilayani",
  COMPLETED: "Selesai",
  CANCELED: "Dibatalkan",
};

const statusBadgeClass: Record<QueueStatus, string> = {
  WAITING: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  SERVING: "border-sky-500/30 bg-sky-500/10 text-sky-700",
  COMPLETED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  CANCELED: "border-red-500/30 bg-red-500/10 text-red-700",
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== "object" || !error) {
    return fallback;
  }

  const errorDetails = (error as { details?: ErrorResponse }).details;
  if (errorDetails && typeof errorDetails === "object" && "error" in errorDetails) {
    const message = (errorDetails as { error?: string }).error;
    if (message) {
      return message;
    }
  }

  const message = (error as { message?: string }).message;
  return message || fallback;
};

type GuestQueuePageProps = {
  queueId?: string;
  initialQueue?: GuestQueueDetail | null;
  initialError?: string | null;
};

export default function GuestQueuePage({
  queueId,
  initialQueue,
  initialError,
}: GuestQueuePageProps) {
  const router = useRouter();
  const detailUrl = queueId ? guestApi.detailUrl(queueId) : null;

  const {
    data: queue,
    isLoading,
    isRefreshing,
    refresh,
    error,
  } = useLiveQuery<GuestQueueDetail>(detailUrl, {
    enabled: Boolean(queueId),
    fallbackData: initialQueue ?? undefined,
    fallbackEtag: initialQueue?.hash ? `"${initialQueue.hash}"` : null,
    refreshInterval: 30_000,
  });

  const errorMessage = queue
    ? null
    : !queueId
      ? "ID antrean tidak ditemukan."
      : (initialError ?? (error ? getErrorMessage(error, "Gagal memuat detail antrean.") : null));

  const handleRefresh = async () => {
    try {
      await refresh();
      toast.success("Detail antrean diperbarui");
    } catch (refreshError) {
      toast.error(getErrorMessage(refreshError, "Gagal memuat detail antrean."));
    }
  };

  return (
    <main className="relative isolate min-h-full overflow-hidden">
      <PageBackground className="bg-gradient-to-b from-primary/10 via-background to-background" />
      <div className="pointer-events-none fixed left-1/2 top-[-6rem] -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none fixed right-6 top-20 -z-10 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" />
      <div className="relative mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 md:px-6 md:py-12">
        <Card className="border border-border/70 bg-card/90 shadow-[var(--shadow-strong)] backdrop-blur">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Nomor Antrean Anda</CardTitle>
            <CardDescription>
              Simpan detail ini dan tunjukkan ke petugas PASTI 6502 saat dipanggil.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && !queue ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-52" />
                <Skeleton className="h-4 w-60" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-7 w-28" />
                  <Skeleton className="h-7 w-24" />
                </div>
              </div>
            ) : errorMessage ? (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {errorMessage}
              </div>
            ) : queue ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-primary/10 via-background to-secondary/10 px-6 py-5">
                  <p className="text-sm text-muted-foreground">Kode antrean</p>
                  <p className="text-4xl font-black tracking-tight text-primary-color md:text-5xl">
                    {queue.queueCode}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">Atas nama {queue.guestName}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{queue.serviceName}</Badge>
                    <Badge variant="outline" className={statusBadgeClass[queue.status]}>
                      {statusLabels[queue.status]}
                    </Badge>
                    {queue.purpose ? (
                      <Badge variant="outline" className={purposeBadgeClass[queue.purpose]}>
                        {purposeLabels[queue.purpose]}
                      </Badge>
                    ) : null}
                    <Badge variant="outline">Nomor: {queue.queueNumber}</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Status antrean saat ini{" "}
                  <span className="font-semibold text-foreground">
                    {statusLabels[queue.status]}
                  </span>
                  . Mohon menunggu sesuai urutan hari ini.
                </p>
              </div>
            ) : null}
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => {
                markNavigationPending();
                router.push("/guest");
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Buku Tamu
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => void handleRefresh()}
              disabled={!queueId || isRefreshing}
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Memuat..." : "Muat Ulang"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}

