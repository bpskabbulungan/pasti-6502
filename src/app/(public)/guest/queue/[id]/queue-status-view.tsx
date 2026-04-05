"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PageBackground from "@/components/shared/page-background";
import { RefreshCcw, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { markNavigationPending } from "@/lib/navigation-pending";
import { queuesApi } from "@/services/api/queues";
import type { ErrorResponse } from "@shared/types/api";
import type { QueueDetail } from "@shared/types/queue";

const STATUS_POLL_INTERVAL_MS = 15000;

type QueueStatus = "WAITING" | "SERVING" | "COMPLETED" | "CANCELED";

type QueueData = {
  queueId: string;
  queueNumber: number;
  status: QueueStatus;
  queueType: "ONLINE" | "OFFLINE";
  serviceName: string;
  visitorName: string;
  createdAt: string;
  startTime: string | null;
  endTime: string | null;
  updatedAt: string;
  filledSKD: boolean;
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

const mapQueueDetail = (detail: QueueDetail): QueueData => ({
  queueId: detail.id,
  queueNumber: detail.queueNumber,
  status: (["WAITING", "SERVING", "COMPLETED", "CANCELED"] as const).includes(
    detail.status as QueueStatus
  )
    ? (detail.status as QueueStatus)
    : "WAITING",
  queueType: detail.queueType,
  serviceName: detail.serviceName ?? detail.service.name,
  visitorName: detail.visitorName ?? detail.visitor.name,
  createdAt: detail.createdAt as string,
  startTime: detail.startTime as string | null,
  endTime: detail.endTime as string | null,
  updatedAt: detail.updatedAt as string,
  filledSKD: Boolean(detail.filledSKD),
});

const statusCopy: Record<QueueStatus, { title: string; desc: string; badge: string }> = {
  WAITING: {
    title: "Menunggu giliran",
    desc: "Silakan bersabar, petugas akan melayani sesuai urutan.",
    badge: "bg-yellow-100 text-yellow-800",
  },
  SERVING: {
    title: "Sedang dilayani",
    desc: "Anda sedang diproses oleh petugas.",
    badge: "bg-blue-100 text-blue-800",
  },
  COMPLETED: {
    title: "Selesai",
    desc: "Pelayanan Anda telah selesai, terima kasih.",
    badge: "bg-emerald-100 text-emerald-800",
  },
  CANCELED: {
    title: "Dibatalkan",
    desc: "Antrean telah dibatalkan oleh petugas.",
    badge: "bg-red-100 text-red-800",
  },
};

function formatQueueDate(iso: string) {
  const date = new Date(iso);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${day}${month}`;
}

function formatTime(iso?: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function QueueStatusView({ queueId }: { queueId: string }) {
  const router = useRouter();
  const [data, setData] = useState<QueueData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const skdProxyLink = "/api/visitor-form/skd/open";

  const queueCode = useMemo(() => {
    if (!data) return "--";
    return `${data.queueNumber}-${formatQueueDate(data.createdAt)}`;
  }, [data]);

  const fetchStatus = useCallback(
    async (showLoading = true) => {
      if (!queueId) return;
      if (showLoading) {
        setIsLoading(true);
      }
      try {
        const result = await queuesApi.detail(queueId);
        setData(mapQueueDetail(result));
        setError(null);
        setLastUpdated(new Date());
      } catch (err) {
        console.error("Error fetching queue status", err);
        setError(getErrorMessage(err, "Terjadi kesalahan saat memuat status"));
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [queueId]
  );

  useEffect(() => {
    let isActive = true;
    let pollTimer: NodeJS.Timeout | null = null;

    const clearPoll = () => {
      if (pollTimer) {
        clearTimeout(pollTimer);
        pollTimer = null;
      }
    };

    const scheduleNextPoll = () => {
      if (!isActive || document.visibilityState !== "visible") {
        return;
      }

      pollTimer = setTimeout(runPoll, STATUS_POLL_INTERVAL_MS);
    };

    const runPoll = async () => {
      if (!isActive || document.visibilityState !== "visible") {
        clearPoll();
        return;
      }

      await fetchStatus(false);
      scheduleNextPoll();
    };

    const handleVisibilityChange = () => {
      if (!isActive) {
        return;
      }

      if (document.visibilityState === "visible") {
        clearPoll();
        void fetchStatus(false);
        scheduleNextPoll();
      } else {
        clearPoll();
      }
    };

    void fetchStatus(true);
    if (document.visibilityState === "visible") {
      scheduleNextPoll();
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isActive = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearPoll();
    };
  }, [fetchStatus]);

  return (
    <main className="relative isolate min-h-full px-4 py-8">
      <PageBackground className="bg-gradient-to-b from-background via-background to-primary/5" />
      <div className="pointer-events-none fixed left-6 top-8 -z-10 h-28 w-28 rounded-full bg-primary/20 blur-3xl md:left-16" />
      <div className="pointer-events-none fixed right-10 top-24 -z-10 h-32 w-32 rounded-full bg-secondary/30 blur-3xl" />
      <div className="relative mx-auto flex max-w-3xl flex-col gap-5">
        <Card className="border-none bg-card/90 shadow-xl backdrop-blur">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl md:text-3xl">
              Terima kasih, data Anda sudah tersimpan.
            </CardTitle>
            <CardDescription>
              Nomor antrean dibuat otomatis berdasarkan urutan hari ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Nomor Antrean Anda</p>
                <p className="text-4xl font-bold tracking-tight md:text-5xl">{queueCode}</p>
              </div>
              {data?.status ? (
                <Badge
                  variant="outline"
                  className={`${statusCopy[data.status].badge} px-3 py-1 text-sm font-semibold`}
                >
                  Status: {statusCopy[data.status].title}
                </Badge>
              ) : null}
              {data?.queueType ? (
                <Badge variant="outline" className="bg-muted">
                  {data.queueType === "ONLINE" ? "Online" : "Offline"}
                </Badge>
              ) : null}
            </div>

            {data ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-border/80 bg-background p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Status: {statusCopy[data.status].title}
                  </p>
                  <p className="text-sm text-muted-foreground">{statusCopy[data.status].desc}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Layanan</span>
                    <span className="font-semibold text-foreground">{data.serviceName}</span>
                    <span className="text-muted-foreground">Nama</span>
                    <span className="font-semibold text-foreground">{data.visitorName}</span>
                    <span className="text-muted-foreground">Dibuat</span>
                    <span className="text-foreground">{formatTime(data.createdAt)}</span>
                    <span className="text-muted-foreground">Mulai</span>
                    <span className="text-foreground">{formatTime(data.startTime)}</span>
                    <span className="text-muted-foreground">Selesai</span>
                    <span className="text-foreground">{formatTime(data.endTime)}</span>
                  </div>
                </div>
                <div className="flex flex-col justify-between gap-3 rounded-lg border border-dashed border-border/70 bg-muted/60 p-4">
                  <div className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-foreground">Pembaruan otomatis</p>
                      <p className="text-sm text-muted-foreground">
                        Status diperbarui tiap 15 detik saat halaman aktif. Klik tombol di bawah
                        untuk memuat ulang manual.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => fetchStatus()}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      <RefreshCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                      Muat ulang
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      Terakhir diperbarui:{" "}
                      {lastUpdated
                        ? lastUpdated.toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Baru saja"}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border/80 bg-muted/60 p-4">
                <p className="text-muted-foreground">
                  {isLoading ? "Memuat status antrean..." : "Status antrean belum tersedia."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {data?.status === "COMPLETED" ? (
          <Card className="border-none bg-emerald-50/80 shadow-lg backdrop-blur dark:bg-emerald-900/20">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl md:text-2xl">Pelayanan selesai</CardTitle>
              <CardDescription>
                Terima kasih sudah berkunjung. Mohon kesediaannya mengisi Survei Kebutuhan Data
                (SKD) untuk meningkatkan layanan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.filledSKD ? (
                <div className="rounded-lg border border-emerald-200 bg-white/80 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-900/10 dark:text-emerald-100">
                  Status SKD sudah tercatat. Terima kasih atas partisipasinya.
                </div>
              ) : (
                <>
                  <Button asChild>
                    <a href={skdProxyLink} target="_blank" rel="noreferrer">
                      Isi SKD Sekarang
                    </a>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Form SKD akan terbuka di tab baru. Jika sudah diisi, abaikan pesan ini.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : null}

        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Gagal memuat</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Alert className="border-none bg-gradient-to-r from-primary/20 via-card to-secondary/30 text-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <AlertTitle>Butuh bantuan?</AlertTitle>
          <AlertDescription className="text-sm">
            Tunjukkan kode antrean kepada petugas PASTI 6502 untuk verifikasi. Jika halaman ini tidak
            diperbarui, tekan <strong>Muat ulang</strong>
            atau kembali ke buku tamu.
          </AlertDescription>
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                markNavigationPending();
                router.push("/guest");
              }}
            >
              Kembali ke Buku Tamu
            </Button>
          </div>
        </Alert>
      </div>
    </main>
  );
}

