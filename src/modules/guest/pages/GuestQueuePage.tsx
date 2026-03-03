"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import PageBackground from "@/components/page-background";
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
  [Purpose.PERPUSTAKAAN]:
    "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100",
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
  if (errorDetails?.error) {
    return errorDetails.error;
  }

  const message = (error as { message?: string }).message;
  return message || fallback;
};

export default function GuestQueuePage() {
  const router = useRouter();
  const params = useParams<{ id?: string | string[] }>();
  const queueId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [queue, setQueue] = useState<GuestQueueDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadQueue = useCallback(
    async (withToast = false) => {
      if (!queueId) {
        setErrorMessage("ID antrean tidak ditemukan.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await guestApi.detail(queueId);
        setQueue(data);
        if (withToast) {
          toast.success("Detail antrean diperbarui");
        }
      } catch (error) {
        const message = getErrorMessage(error, "Gagal memuat detail antrean.");
        setErrorMessage(message);
        if (withToast) {
          toast.error(message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [queueId]
  );

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  return (
    <main className="relative isolate min-h-full overflow-hidden">
      <PageBackground className="bg-gradient-to-b from-primary/10 via-background to-background" />
      <div className="pointer-events-none fixed left-1/2 top-[-6rem] -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none fixed right-6 top-20 -z-10 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" />
      <div className="relative mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 md:px-6 md:py-12">
        <Card className="border border-border/40 bg-card/90 shadow-2xl backdrop-blur">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Nomor Antrean Anda</CardTitle>
            <CardDescription>
              Simpan detail ini dan tunjukkan ke petugas PST saat dipanggil.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
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
                <div className="rounded-2xl border border-border/60 bg-muted/30 px-6 py-5">
                  <p className="text-sm text-muted-foreground">Kode antrean</p>
                  <p className="text-4xl font-bold text-foreground md:text-5xl">
                    {queue.queueCode}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Atas nama {queue.guestName}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{queue.serviceName}</Badge>
                    <Badge
                      variant="outline"
                      className={statusBadgeClass[queue.status]}
                    >
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
              onClick={() => router.push("/guest")}
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Buku Tamu
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => loadQueue(true)}
              disabled={isLoading}
            >
              <RefreshCcw className="h-4 w-4" />
              Muat Ulang
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
