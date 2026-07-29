"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, RefreshCcw, Star } from "lucide-react";
import { ConfirmActionDialog } from "@/components/shared/dialogs/confirm-action-dialog";
import PageBackground from "@/components/shared/page-background";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useLiveQuery } from "@/hooks/use-live-query";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/error-message";
import { markNavigationPending } from "@/lib/navigation-pending";
import { guestApi } from "@/services/api/guest";
import { saveLastGuestQueue } from "@/features/guest/utils/last-queue";
import { QueueStatus } from "@/shared/constants/enums";
import type { GuestQueueDetail } from "@shared/types/guest";

const statusLabels: Record<QueueStatus, string> = {
  WAITING: "Menunggu",
  SERVING: "Sedang Dilayani",
  COMPLETED: "Selesai",
  CANCELED: "Dibatalkan",
};



const statusPanelClass: Record<QueueStatus, string> = {
  WAITING:
    "border-amber-400/35 bg-amber-50/90 text-amber-900 dark:border-amber-500/30 dark:bg-amber-900/20 dark:text-amber-100",
  SERVING:
    "border-sky-400/35 bg-sky-50/90 text-sky-900 dark:border-sky-500/30 dark:bg-sky-900/20 dark:text-sky-100",
  COMPLETED:
    "border-emerald-400/35 bg-emerald-50/90 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-900/20 dark:text-emerald-100",
  CANCELED:
    "border-red-400/35 bg-red-50/90 text-red-900 dark:border-red-500/30 dark:bg-red-900/20 dark:text-red-100",
};

const statusStripClass: Record<QueueStatus, string> = {
  WAITING:
    "border-amber-300/60 bg-amber-100/85 text-amber-900 dark:border-amber-500/40 dark:bg-amber-900/35 dark:text-amber-100",
  SERVING:
    "border-sky-300/60 bg-sky-100/85 text-sky-900 dark:border-sky-500/40 dark:bg-sky-900/35 dark:text-sky-100",
  COMPLETED:
    "border-emerald-300/60 bg-emerald-100/85 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-900/35 dark:text-emerald-100",
  CANCELED:
    "border-red-300/60 bg-red-100/85 text-red-900 dark:border-red-500/40 dark:bg-red-900/35 dark:text-red-100",
};

const statusHelperMessage: Record<QueueStatus, string> = {
  WAITING: "Mohon menunggu sesuai urutan antrean hari ini.",
  SERVING: "Silakan siapkan dokumen yang diperlukan untuk proses pelayanan.",
  COMPLETED: "Antrean Anda sudah selesai diproses.",
  CANCELED: "Antrean dibatalkan. Silakan hubungi petugas jika perlu bantuan.",
};

const skdProxyLink = "/api/visitor-form/skd/open";

const ratingCopy: Record<number, string> = {
  1: "Sangat tidak puas",
  2: "Tidak puas",
  3: "Cukup",
  4: "Puas",
  5: "Sangat puas",
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
  const [isBackConfirmOpen, setIsBackConfirmOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
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

  useEffect(() => {
    if (!queueId) {
      return;
    }

    saveLastGuestQueue({
      queueId,
      queueCode: queue?.queueCode,
      status: queue?.status,
    });
  }, [queue?.queueCode, queue?.status, queueId]);

  useEffect(() => {
    if (!queue) {
      return;
    }

    if (typeof queue.serviceRating === "number") {
      setFeedbackRating(queue.serviceRating);
      setFeedbackComment(queue.serviceFeedback ?? "");
      return;
    }

    if (queue.status !== QueueStatus.COMPLETED) {
      setFeedbackRating(0);
      setFeedbackComment("");
    }
  }, [queue]);

  const goToQueueHome = () => {
    markNavigationPending();
    router.push("/guest");
  };

  const shouldConfirmBeforeLeave =
    queue?.status === QueueStatus.WAITING || queue?.status === QueueStatus.SERVING;
  const submittedRating =
    queue && typeof queue.serviceRating === "number" ? queue.serviceRating : null;

  const handleBackToQueue = () => {
    if (shouldConfirmBeforeLeave) {
      setIsBackConfirmOpen(true);
      return;
    }

    goToQueueHome();
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      toast.success("Detail antrean diperbarui");
    } catch (refreshError) {
      toast.error(getErrorMessage(refreshError, "Gagal memuat detail antrean."));
    }
  };

  const handleSubmitFeedback = async () => {
    if (!queueId) {
      toast.error("ID antrean tidak ditemukan.");
      return;
    }

    if (!queue || queue.status !== QueueStatus.COMPLETED) {
      toast.error("Feedback hanya bisa diisi setelah layanan selesai.");
      return;
    }

    if (feedbackRating < 1 || feedbackRating > 5) {
      toast.error("Pilih rating 1 sampai 5 bintang.");
      return;
    }

    try {
      setIsSubmittingFeedback(true);
      await guestApi.submitFeedback(queueId, {
        rating: feedbackRating,
        comment: feedbackComment.trim() || undefined,
      });
      toast.success("Terima kasih, feedback Anda berhasil disimpan.");
      await refresh();
    } catch (submitError) {
      toast.error(getErrorMessage(submitError, "Gagal menyimpan feedback."));
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <main className="relative isolate flex min-h-[calc(100dvh_-_4.5rem)] items-center justify-center overflow-x-hidden">
      <PageBackground className="bg-gradient-to-b from-primary/10 via-background to-background" />
      <div className="pointer-events-none fixed left-1/2 top-[-6rem] -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none fixed right-6 top-20 -z-10 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" />
      <div className="relative w-full max-w-4xl px-4 py-4 md:px-6 md:py-6">
        <Card className="border border-border/70 bg-card/90 shadow-[var(--shadow-strong)] backdrop-blur">
          <CardContent className="space-y-4">
            {isLoading && !queue ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-16 w-full sm:w-[calc(33%_-_0.5rem)]" />
                  <Skeleton className="h-16 w-full sm:w-[calc(33%_-_0.5rem)]" />
                  <Skeleton className="h-16 w-full sm:w-[calc(33%_-_0.5rem)]" />
                </div>
              </div>
            ) : errorMessage ? (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {errorMessage}
              </div>
            ) : queue ? (
              <div className="space-y-5">
                <div className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-primary/15 via-background to-secondary/10 shadow-sm">
                  <div
                    className={cn(
                      "flex items-center justify-between border-b px-4 py-2.5",
                      statusStripClass[queue.status]
                    )}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                      Status Antrean
                    </p>
                    <StatusBadge status={queue.status} className="text-xs" />
                  </div>
                  <div className="space-y-5 p-5 sm:p-6">
                    <div className="rounded-2xl border border-border/70 bg-background/75 px-4 py-5 text-center sm:px-6">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Nomor Antrean Anda
                      </p>
                      <p className="mt-1 text-6xl font-black tracking-tight text-primary-color sm:text-7xl">
                        {queue.queueCode}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Atas nama <span className="font-semibold text-foreground">{queue.guestName}</span>
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Tunjukkan kode ini kepada petugas PST saat nomor dipanggil.
                      </p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Keperluan
                        </p>
                        <p className="mt-1 text-sm font-semibold">{queue.serviceName}</p>
                      </div>
                      <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Nomor Urut
                        </p>
                        <p className="mt-1 text-sm font-semibold">{queue.queueNumber}</p>
                      </div>
                      <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Petugas PST
                        </p>
                        <p className="mt-1 text-sm font-semibold">
                          {queue.officerName && queue.officerName.trim().length > 0
                            ? queue.officerName
                            : "Belum dijadwalkan"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={cn("rounded-xl border px-4 py-3", statusPanelClass[queue.status])}>
                  <p className="text-sm font-semibold">Status antrean: {statusLabels[queue.status]}</p>
                  <p className="mt-1 text-sm opacity-90">{statusHelperMessage[queue.status]}</p>
                </div>

                {queue.status === QueueStatus.COMPLETED ? (
                  <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4 sm:p-5">
                    <p className="text-sm font-semibold text-foreground text-center">
                      Terima Kasih Telah Mengunjungi PST BPS Kabupaten Bulungan!
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground text-center">
                      Mohon isi feedback layanan dan SKD agar mutu pelayanan PST terus meningkat.
                    </p>

                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                      <div className="order-2 rounded-xl border border-border/70 bg-background/80 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          2. Pengisian Survei Kebutuhan Data (SKD)
                        </p>
                        <p className="mt-1 text-sm text-foreground">
                          Survei Kebutuhan Data (SKD) membantu evaluasi kebutuhan layanan data.
                        </p>
                        {queue.filledSKD ? (
                          <p className="mt-3 rounded-md border border-emerald-300/70 bg-emerald-100/80 px-3 py-2 text-xs font-medium text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-900/30 dark:text-emerald-100">
                            Status SKD sudah tercatat. Terima kasih atas partisipasinya.
                          </p>
                        ) : (
                          <div className="mt-3 space-y-2">
                            <Button asChild size="sm">
                              <a href={skdProxyLink} target="_blank" rel="noreferrer">
                                Isi SKD Sekarang
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                            <p className="text-xs text-muted-foreground">
                              Form SKD akan dibuka di tab baru.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="order-1 rounded-xl border border-border/70 bg-background/80 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          1. Penilaian Pelayanan Petugas PST
                        </p>
                        <p className="mt-1 text-sm text-foreground">
                          Beri rating bintang dan uraian singkat pengalaman Anda.
                        </p>

                        {submittedRating !== null ? (
                          <div className="mt-3 space-y-2 rounded-md border border-emerald-300/70 bg-emerald-100/80 px-3 py-2 dark:border-emerald-500/40 dark:bg-emerald-900/30">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={cn(
                                    "h-4 w-4",
                                    submittedRating >= star
                                      ? "fill-amber-400 text-amber-500"
                                      : "text-muted-foreground/40"
                                  )}
                                />
                              ))}
                              <span className="ml-1 text-xs font-semibold text-emerald-900 dark:text-emerald-100">
                                {ratingCopy[submittedRating] ?? `${submittedRating} bintang`}
                              </span>
                            </div>
                            <p className="text-xs text-emerald-900/90 dark:text-emerald-100/90">
                              {queue.serviceFeedback?.trim().length
                                ? queue.serviceFeedback
                                : "Tidak ada uraian tambahan."}
                            </p>
                          </div>
                        ) : (
                          <div className="mt-3 space-y-3">
                            <div className="flex flex-wrap items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  className="rounded-md p-1 transition hover:bg-amber-100/70 dark:hover:bg-amber-500/20"
                                  onClick={() => setFeedbackRating(star)}
                                  aria-label={`Beri nilai ${star} bintang`}
                                  aria-pressed={feedbackRating === star}
                                >
                                  <Star
                                    className={cn(
                                      "h-6 w-6",
                                      feedbackRating >= star
                                        ? "fill-amber-400 text-amber-500"
                                        : "text-muted-foreground/40"
                                    )}
                                  />
                                </button>
                              ))}
                              <span className="ml-1 text-xs font-medium text-muted-foreground">
                                {feedbackRating > 0
                                  ? ratingCopy[feedbackRating] ?? `${feedbackRating} bintang`
                                  : "Pilih 1-5 bintang"}
                              </span>
                            </div>
                            <Textarea
                              value={feedbackComment}
                              onChange={(event) => setFeedbackComment(event.target.value)}
                              placeholder="Uraian pengalaman pelayanan (opsional)"
                              maxLength={1000}
                              className="min-h-24"
                            />
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs text-muted-foreground">
                                {feedbackComment.length}/1000 karakter
                              </p>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => void handleSubmitFeedback()}
                                disabled={isSubmittingFeedback || feedbackRating < 1}
                              >
                                {isSubmittingFeedback ? "Menyimpan..." : "Kirim Feedback"}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </CardContent>
          <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button
              type="button"
              className="w-full text-white sm:w-auto sm:min-w-52"
              onClick={handleBackToQueue}
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Antrean
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:ml-auto sm:w-auto"
              onClick={() => void handleRefresh()}
              disabled={!queueId || isRefreshing}
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Memuat..." : "Muat Ulang"}
            </Button>
          </CardFooter>
        </Card>
      </div>
      <ConfirmActionDialog
        open={isBackConfirmOpen}
        onOpenChange={setIsBackConfirmOpen}
        title="Kembali ke Antrean?"
        description="Nomor antrean tetap tersimpan. Anda bisa membuka antrean terakhir kapan saja."
        confirmLabel="Ya, kembali"
        confirmVariant="default"
        onConfirm={goToQueueHome}
      />
    </main>
  );
}
