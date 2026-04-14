"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import PageBackground from "@/components/shared/page-background";
import { NextQueuePanel } from "@/features/queue-display/components/next-queue-panel";
import { QueueDisplayControls } from "@/features/queue-display/components/queue-display-controls";
import { ServingQueuesPanel } from "@/features/queue-display/components/serving-queues-panel";
import { useQueueDisplay } from "@/features/queue-display/hooks/use-queue-display";
import { formatDisplayDateTimeWithSeconds } from "@/lib/date-format";
import { serializeErrorForLog } from "@/lib/error-log";
import { cn } from "@/lib/utils";
import type { QueueDisplayResponse } from "@shared/types/queue";

const formatTimestamp = (value: Date | null) =>
  value ? formatDisplayDateTimeWithSeconds(value) : "Belum ada data";

const dummyNextQueue: NonNullable<QueueDisplayResponse["nextQueue"]> = {
  id: "dummy-next",
  queueNumber: 12,
  status: "WAITING",
  queueType: "OFFLINE",
  service: { name: "Konsultasi Statistik" },
  visitor: { name: "Andi Saputra" },
  admin: { name: "Sinta" },
  dutyStaff: null,
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
    visitor: { name: "Budi Santoso" },
    admin: { name: "Budi" },
    dutyStaff: null,
    createdAt: new Date(),
    startTime: new Date(),
    endTime: null,
  },
  {
    id: "dummy-serving-2",
    queueNumber: 10,
    status: "SERVING",
    queueType: "OFFLINE",
    service: { name: "Rekomendasi Statistik" },
    visitor: { name: "Nadia Putri" },
    admin: { name: "Nadia" },
    dutyStaff: null,
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
  const hideTimerRef = useRef<number | null>(null);

  const enableDummy =
    process.env.NEXT_PUBLIC_QUEUE_DISPLAY_DUMMY === "true" ||
    process.env.NODE_ENV !== "production";
  const showDummy = enableDummy && !nextQueue && servingQueues.length === 0;
  const displayNextQueue = showDummy ? dummyNextQueue : nextQueue;
  const displayServingQueues = showDummy ? dummyServingQueues : servingQueues;

  const handleRefresh = useCallback(() => {
    toast.info("Menyegarkan data antrean...");
    void refetch();
  }, [refetch]);

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

  const handleFullscreenToggle = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (fullscreenError) {
      console.error("Fullscreen toggle failed", serializeErrorForLog(fullscreenError));
      toast.error("Browser tidak mendukung mode fullscreen.");
    }
  }, []);

  useEffect(() => {
    if (error) {
      toast.error("Gagal memuat data antrean");
    }
  }, [error]);

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

  const lastUpdatedText = formatTimestamp(lastUpdatedAt);

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden px-4 pb-3 pt-4 md:px-8 md:pb-4 md:pt-5",
        isFullscreen && "px-4 py-4 md:px-6 md:py-5"
      )}
      aria-busy={isValidating}
    >
      <PageBackground className="bg-gradient-to-br from-[#f8fbff] via-[#fefefe] to-[#e8f2ff] dark:from-[#0b1220] dark:via-[#0f1728] dark:to-[#0b1220]" />
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(37,99,235,0.14),transparent_36%),radial-gradient(circle_at_80%_12%,rgba(15,118,110,0.12),transparent_33%)]" />
        <div className="absolute -left-20 top-24 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-16 bottom-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1700px] flex-col gap-4 md:gap-5">
        {isFullscreen ? (
          <div
            className={cn(
              "fixed left-1/2 top-3 z-30 w-max max-w-[calc(100vw-1.5rem)] -translate-x-1/2 rounded-2xl border border-border/80 bg-card/88 p-2 shadow-lg backdrop-blur transition-opacity duration-300",
              showControls ? "opacity-100" : "pointer-events-none opacity-0"
            )}
          >
            <QueueDisplayControls
              compact
              className="gap-1.5 sm:gap-2"
              isFullscreen={isFullscreen}
              isLoading={isLoading}
              isValidating={isValidating}
              lastUpdatedText={lastUpdatedText}
              onRefresh={handleRefresh}
              onToggleFullscreen={() => {
                void handleFullscreenToggle();
              }}
            />
          </div>
        ) : (
          <header className="rounded-2xl border border-border/80 bg-card/88 px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur md:px-5 md:py-3.5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-primary/12 text-primary">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-bold leading-tight text-primary-color md:text-xl lg:text-[1.6rem]">
                    Informasi Antrean PST BPS Kabupaten Bulungan
                  </h1>
                </div>
              </div>

              <QueueDisplayControls
                className="w-full xl:w-auto xl:justify-end"
                isFullscreen={isFullscreen}
                isLoading={isLoading}
                isValidating={isValidating}
                lastUpdatedText={lastUpdatedText}
                onRefresh={handleRefresh}
                onToggleFullscreen={() => {
                  void handleFullscreenToggle();
                }}
              />
            </div>
          </header>
        )}

        <section
          className={cn(
            "grid items-stretch gap-4 lg:gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]",
            isFullscreen && "pt-14 md:pt-16"
          )}
        >
          <NextQueuePanel isFullscreen={isFullscreen} queue={displayNextQueue} />
          <ServingQueuesPanel queues={displayServingQueues} />
        </section>
      </div>
    </div>
  );
}
