"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  RefreshCw,
  ArrowRight,
  UserCog,
  LayoutGrid,
  Clock3,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQueueDisplay } from "@/features/queue-display/hooks/use-queue-display";
import PageBackground from "@/components/shared/page-background";
import { formatDisplayDateTimeWithSeconds } from "@/lib/date-format";
import type { QueueDisplayResponse } from "@shared/types/queue";

const formatTimestamp = (value: Date | null) =>
  value ? formatDisplayDateTimeWithSeconds(value) : "Belum ada data";

const formatQueueCode = (serviceName: string, queueNumber: number) => {
  const trimmed = serviceName.toLowerCase();
  const prefix = trimmed.startsWith("perpust")
    ? "P"
    : trimmed.startsWith("konsul")
      ? "K"
      : trimmed.startsWith("rekomen")
        ? "R"
        : "L";
  const padded = queueNumber.toString().padStart(3, "0");
  return `${prefix}-${padded}`;
};

const getQueueTypeBadge = (queueType: "ONLINE" | "OFFLINE") =>
  queueType === "ONLINE"
    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-100"
    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100";

type QueueDisplayItem =
  | QueueDisplayResponse["servingQueues"][number]
  | NonNullable<QueueDisplayResponse["nextQueue"]>;

type HighlightedQueue = {
  queue: QueueDisplayItem;
  title: string;
  description: string;
  statusLabel: string;
  statusTone: string;
};

const dummyNextQueue: QueueDisplayItem = {
  id: "dummy-next",
  queueNumber: 12,
  status: "WAITING",
  queueType: "ONLINE",
  service: { name: "Konsultasi Statistik" },
  admin: { name: "Sinta" },
  createdAt: new Date(),
  startTime: null,
  endTime: null,
};

const dummyServingQueues: QueueDisplayResponse["servingQueues"] = [
  {
    id: "dummy-serving-1",
    queueNumber: 11,
    status: "SERVING",
    queueType: "OFFLINE",
    service: { name: "Perpustakaan" },
    admin: { name: "Budi" },
    createdAt: new Date(),
    startTime: new Date(),
    endTime: null,
  },
  {
    id: "dummy-serving-2",
    queueNumber: 10,
    status: "SERVING",
    queueType: "ONLINE",
    service: { name: "Rekomendasi Statistik" },
    admin: { name: "Nadia" },
    createdAt: new Date(),
    startTime: new Date(),
    endTime: null,
  },
];

export default function QueueDisplayPage() {
  const { servingQueues, nextQueue, lastUpdatedAt, isLoading, isValidating, error, refetch } =
    useQueueDisplay({ adminId: "all", dateFilter: "today" });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [highlightMode, setHighlightMode] = useState<"next" | "serving">("next");
  const hideTimerRef = useRef<number | null>(null);
  const enableDummy =
    process.env.NEXT_PUBLIC_QUEUE_DISPLAY_DUMMY === "true" ||
    process.env.NODE_ENV !== "production";
  const showDummy = enableDummy && !nextQueue && servingQueues.length === 0;
  const displayNextQueue = showDummy ? dummyNextQueue : nextQueue;
  const displayServingQueues = showDummy ? dummyServingQueues : servingQueues;

  const highlightedQueue: HighlightedQueue | null = useMemo(() => {
    if (highlightMode === "serving" && displayServingQueues.length > 0) {
      return {
        queue: displayServingQueues[0],
        title: "Sedang Dilayani",
        description: "Nomor yang sedang diproses petugas.",
        statusLabel: "Sedang dilayani",
        statusTone: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100",
      };
    }

    if (displayNextQueue) {
      return {
        queue: displayNextQueue,
        title: "Antrean Berikutnya",
        description: "Antrean berikutnya untuk dilayani di loket.",
        statusLabel: "Urutan berikutnya",
        statusTone: "bg-white/70 text-primary-color shadow-sm",
      };
    }

    if (displayServingQueues.length > 0) {
      return {
        queue: displayServingQueues[0],
        title: "Sedang Dilayani",
        description: "Nomor yang sedang diproses petugas.",
        statusLabel: "Sedang dilayani",
        statusTone: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100",
      };
    }

    return null;
  }, [displayNextQueue, displayServingQueues, highlightMode]);

  const handleRefresh = () => {
    toast.info("Memperbarui data antrean...");
    refetch();
  };

  const resetHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (isFullscreen) {
      hideTimerRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 12_000);
    }
  }, [isFullscreen]);

  const handleFullscreenToggle = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (fullscreenError) {
      console.error("Fullscreen toggle failed", fullscreenError);
      toast.error("Browser tidak mendukung mode fullscreen.");
    }
  };

  useEffect(() => {
    if (error) {
      toast.error("Gagal memuat data antrean");
    }
  }, [error]);

  useEffect(() => {
    if (isFullscreen) {
      if (displayNextQueue) {
        setHighlightMode("next");
        return;
      }
      if (displayServingQueues.length > 0) {
        setHighlightMode("serving");
      }
      return;
    }

    if (displayNextQueue) {
      setHighlightMode("next");
      return;
    }
    if (displayServingQueues.length > 0) {
      setHighlightMode("serving");
    }
  }, [displayNextQueue, displayServingQueues.length, isFullscreen]);

  useEffect(() => {
    if (!isFullscreen || !displayNextQueue || displayServingQueues.length === 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setHighlightMode((current) => (current === "next" ? "serving" : "next"));
    }, 8_000);

    return () => window.clearInterval(intervalId);
  }, [displayNextQueue, displayServingQueues.length, isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      setShowControls(true);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (isFullscreen) {
      root.classList.add("queue-fullscreen");
      body.classList.add("queue-fullscreen");
      return () => {
        root.classList.remove("queue-fullscreen");
        body.classList.remove("queue-fullscreen");
      };
    }

    root.classList.remove("queue-fullscreen");
    body.classList.remove("queue-fullscreen");
    return;
  }, [isFullscreen]);

  useEffect(() => {
    if (!isFullscreen) {
      setShowControls(true);
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      return;
    }

    resetHideTimer();

    const handleActivity = () => {
      setShowControls(true);
      resetHideTimer();
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("pointermove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("touchstart", handleActivity);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("pointermove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [isFullscreen, resetHideTimer]);

  return (
    <div
      className={`relative isolate h-full min-h-0 box-border overflow-hidden px-4 py-6 md:px-8 md:py-8 ${
        isFullscreen ? "py-4 md:py-6" : ""
      }`}
      aria-busy={isValidating}
    >
      <PageBackground className="bg-gradient-to-br from-[#FFF4EC] via-white to-[#FFE5D3] dark:from-background dark:via-[#1f1f1f] dark:to-background" />
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(247,144,57,0.15),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(154,5,1,0.12),transparent_30%)]" />
        <div className="absolute -left-16 top-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-12 bottom-20 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-screen-2xl flex-col gap-6 md:gap-8">
        {isFullscreen ? (
          <div
            className={`fixed right-4 top-4 z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-white/80 px-3 py-2 text-xs text-secondary-color shadow-sm backdrop-blur transition-opacity duration-300 dark:bg-card ${
              showControls ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-2 w-2 animate-ping rounded-full ${
                    isValidating ? "bg-primary/50" : "bg-emerald-500/50"
                  }`}
                />
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    isValidating ? "bg-primary" : "bg-emerald-500"
                  }`}
                />
              </span>
              <span className="font-semibold">{isValidating ? "Memperbarui" : "Live"}</span>
            </div>
            <div className="hidden items-center gap-2 md:flex" aria-live="polite">
              <Clock3 className="h-4 w-4 text-primary" />
              {formatTimestamp(lastUpdatedAt)}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={handleRefresh}
              disabled={isLoading || isValidating}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isValidating ? "animate-spin" : ""}`} />
              Perbarui
            </Button>
            <Button variant="outline" size="sm" className="gap-1" onClick={handleFullscreenToggle}>
              <Minimize2 className="h-3.5 w-3.5" />
              Minimize
            </Button>
            <ThemeToggle />
          </div>
        ) : (
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border/70 bg-white/85 px-5 py-4 shadow-md backdrop-blur dark:bg-card">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl border border-border/70 bg-primary/10 p-3 text-primary">
                <LayoutGrid className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black leading-tight text-primary-color md:text-3xl lg:text-4xl">
                  Informasi Antrean PST BPS Kabupaten Bulungan
                </h1>
                <p className="text-sm text-secondary-color md:text-base">
                  Nomor yang sedang dan akan dilayani secara real-time.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div
                className="rounded-full border border-border/70 bg-white/80 px-3 py-2 text-xs text-secondary-color shadow-sm dark:bg-card"
                aria-live="polite"
              >
                <Clock3 className="mr-2 inline h-4 w-4 text-primary" />
                {formatTimestamp(lastUpdatedAt)}
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border/70 bg-white/80 px-3 py-2 text-xs text-secondary-color shadow-sm dark:bg-card">
                <span className="relative flex h-2 w-2">
                  <span
                    className={`absolute inline-flex h-2 w-2 animate-ping rounded-full ${
                      isValidating ? "bg-primary/50" : "bg-emerald-500/50"
                    }`}
                  />
                  <span
                    className={`relative inline-flex h-2 w-2 rounded-full ${
                      isValidating ? "bg-primary" : "bg-emerald-500"
                    }`}
                  />
                </span>
                <span className="font-semibold">{isValidating ? "Memperbarui" : "Live"}</span>
              </div>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleRefresh}
                disabled={isLoading || isValidating}
              >
                <RefreshCw className={`h-4 w-4 ${isValidating ? "animate-spin" : ""}`} />
                Perbarui
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleFullscreenToggle}>
                <Maximize2 className="h-4 w-4" />
                Maximize
              </Button>
              <ThemeToggle />
            </div>
          </header>
        )}

        <div
          className={
            isFullscreen
              ? "flex min-h-[calc(100vh-5rem)] items-center justify-center"
              : "grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
          }
        >
          <div className={isFullscreen ? "w-full max-w-6xl" : ""}>
            <Card
              className={`relative overflow-hidden border border-border/70 bg-gradient-to-br from-primary/15 via-white to-[#FFF7F1] shadow-xl dark:from-primary/10 dark:via-card dark:to-card ${
                isFullscreen ? "px-4 py-4 sm:px-6 sm:py-6" : ""
              }`}
            >
              <div className="absolute right-4 top-4 h-24 w-24 rounded-full bg-primary/10 blur-3xl" />
              <CardHeader
                className={`relative ${
                  isFullscreen ? "pb-4 text-center" : "pb-2"
                }`}
              >
                <CardTitle
                  className={`font-bold text-primary-color ${
                    isFullscreen ? "text-3xl sm:text-4xl" : "text-2xl"
                  }`}
                >
                  {highlightedQueue?.title ?? "Antrean Berikutnya"}
                </CardTitle>
                <CardDescription
                  className={`text-secondary-color ${isFullscreen ? "text-base sm:text-lg" : ""}`}
                >
                  {highlightedQueue?.description ?? "Antrean berikutnya untuk dilayani di loket."}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div
                  key={highlightedQueue ? `${highlightedQueue.queue.id}-${highlightedQueue.title}` : "empty"}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-500"
                >
                  {highlightedQueue ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge
                          variant="secondary"
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${highlightedQueue.statusTone}`}
                        >
                          {highlightedQueue.statusLabel}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getQueueTypeBadge(
                            highlightedQueue.queue.queueType
                          )}`}
                        >
                          {highlightedQueue.queue.queueType === "ONLINE" ? "Online" : "Offline"}
                        </Badge>
                      </div>
                      <div
                        className={`rounded-3xl border border-border/80 bg-white/92 text-center shadow-xl backdrop-blur dark:bg-card ${
                          isFullscreen ? "p-10 sm:p-14" : "p-8"
                        }`}
                      >
                        <p
                          className={`text-secondary-color ${
                            isFullscreen ? "text-base sm:text-lg" : "text-sm"
                          }`}
                        >
                          Nomor Antrean
                        </p>
                        <p
                          className={`font-black leading-tight text-primary-color ${
                            isFullscreen
                              ? "text-[clamp(4rem,13vw,10.5rem)]"
                              : "text-[clamp(2.75rem,8vw,7.2rem)]"
                          }`}
                        >
                          {formatQueueCode(
                            highlightedQueue.queue.service.name,
                            highlightedQueue.queue.queueNumber
                          )}
                        </p>
                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                          <div
                            className={`rounded-lg bg-muted/50 px-4 py-3 text-secondary-color ${
                              isFullscreen ? "text-base sm:text-lg" : ""
                            }`}
                          >
                            <p className="font-semibold text-primary-color">Layanan</p>
                            <p className="text-lg">{highlightedQueue.queue.service.name}</p>
                          </div>
                          <div
                            className={`rounded-lg bg-muted/50 px-4 py-3 text-secondary-color ${
                              isFullscreen ? "text-base sm:text-lg" : ""
                            }`}
                          >
                            <p className="font-semibold text-primary-color">Petugas</p>
                            <p className="text-lg">{highlightedQueue.queue.admin?.name || "-"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 bg-white/70 p-10 text-center text-secondary-color backdrop-blur dark:bg-card">
                      <ArrowRight className="h-12 w-12 text-primary" />
                      <p className="text-lg font-semibold text-primary-color">
                        Belum ada antrean berikutnya
                      </p>
                      <p className="text-sm">Data akan muncul otomatis saat antrean baru dibuat.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {!isFullscreen ? (
            <Card className="border border-custom/80 bg-white/80 shadow-lg backdrop-blur dark:bg-card">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-xl font-bold text-primary-color">
                      Sedang Dilayani
                    </CardTitle>
                    <CardDescription className="text-secondary-color">
                      Nomor yang saat ini diproses petugas.
                    </CardDescription>
                  </div>
                  {displayServingQueues.length > 0 ? (
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-primary/10 text-primary-color"
                    >
                      {displayServingQueues.length} aktif
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent>
                {displayServingQueues.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 bg-muted/40 p-10 text-center">
                    <UserCog className="h-12 w-12 text-primary" />
                    <p className="text-lg font-semibold text-primary-color">
                      Belum ada antrean aktif
                    </p>
                    <p className="text-sm text-secondary-color">
                      Nomor akan tampil segera setelah dilayani.
                    </p>
                  </div>
                ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                  {displayServingQueues.map((queue) => (
                    <div
                      key={queue.id}
                      className="flex h-full flex-col gap-4 rounded-3xl border border-border/70 bg-white/90 p-6 shadow-md backdrop-blur dark:bg-card"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-secondary-color">
                            Nomor
                          </p>
                          <p className="text-3xl font-black leading-none text-primary-color sm:text-4xl md:text-5xl">
                            {formatQueueCode(queue.service.name, queue.queueNumber)}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getQueueTypeBadge(
                            queue.queueType
                          )}`}
                        >
                          {queue.queueType === "ONLINE" ? "Online" : "Offline"}
                        </Badge>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-secondary-color">
                          <p className="text-xs font-semibold uppercase tracking-wide text-secondary-color">
                            Layanan
                          </p>
                          <p className="break-words text-base font-semibold leading-snug text-primary-color">
                            {queue.service.name}
                          </p>
                        </div>
                        <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-secondary-color">
                          <p className="text-xs font-semibold uppercase tracking-wide text-secondary-color">
                            Petugas
                          </p>
                          <p className="break-words text-base font-semibold leading-snug text-primary-color">
                            {queue.admin?.name || "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}



