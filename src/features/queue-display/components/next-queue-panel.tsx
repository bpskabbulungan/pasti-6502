import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { QueueDisplayResponse } from "@shared/types/queue";
import {
  formatQueueCode,
  getQueueOfficerName,
  getQueueVisitorName,
} from "./queue-display-utils";

type NextQueuePanelProps = {
  isFullscreen: boolean;
  queue: QueueDisplayResponse["nextQueue"];
};

type QueueInfoItemProps = {
  label: string;
  value: string;
};

function QueueInfoItem({ label, value }: QueueInfoItemProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-left shadow-sm dark:bg-background/40">
      <p className="text-xs font-semibold uppercase tracking-wide text-secondary-color">{label}</p>
      <p className="mt-1 text-base font-semibold leading-snug text-primary-color break-words">{value}</p>
    </div>
  );
}

export function NextQueuePanel({ isFullscreen, queue }: NextQueuePanelProps) {
  return (
    <Card className="h-full border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 shadow-[var(--shadow-soft)]">
      <CardHeader className="pb-2 md:pb-3">
        <CardTitle className="text-2xl font-bold text-primary-color sm:text-[1.75rem]">
          Nomor Berikutnya
        </CardTitle>
        <CardDescription className="text-sm text-secondary-color sm:text-base">
          Nomor antrean berikutnya yang siap dipanggil.
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4 sm:pb-5 md:pb-6">
        {queue ? (
          <div className="rounded-3xl border border-border/75 bg-background/82 p-6 text-center shadow-md dark:bg-background/35 sm:p-7 md:p-9">
            <p className="text-sm font-medium text-secondary-color">Antrean Selanjutnya</p>
            <p
              className={cn(
                "mt-2 font-black tracking-tight text-primary-color",
                isFullscreen
                  ? "text-[clamp(4.5rem,14vw,12rem)]"
                  : "text-[clamp(4rem,11vw,9.5rem)]"
              )}
            >
              {formatQueueCode(queue.service.name, queue.queueNumber)}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <QueueInfoItem label="Layanan" value={queue.service.name} />
              <QueueInfoItem label="Pengunjung" value={getQueueVisitorName(queue)} />
              <QueueInfoItem label="Petugas" value={getQueueOfficerName(queue)} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border/80 bg-background/70 p-10 text-center shadow-sm dark:bg-background/35">
            <ArrowRight className="h-10 w-10 text-primary" />
            <p className="text-lg font-semibold text-primary-color">Belum ada antrean berikutnya</p>
            <p className="max-w-lg text-sm text-secondary-color">
              Nomor baru akan otomatis muncul saat antrean siap dipanggil.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
