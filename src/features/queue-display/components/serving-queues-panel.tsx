import { UserCog } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { QueueDisplayResponse } from "@shared/types/queue";
import { formatQueueCode, getQueueOfficerName } from "./queue-display-utils";

type ServingQueuesPanelProps = {
  queues: QueueDisplayResponse["servingQueues"];
};

export function ServingQueuesPanel({ queues }: ServingQueuesPanelProps) {
  return (
    <Card className="flex h-full border border-border/80 bg-card/90 shadow-[var(--shadow-soft)]">
      <CardHeader className="pb-2 md:pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-2xl font-bold text-primary-color">Sedang Dilayani</CardTitle>
            <CardDescription className="text-sm text-secondary-color sm:text-base">
              Nomor yang sedang diproses di loket.
            </CardDescription>
          </div>
          {queues.length > 0 ? (
            <div className="rounded-full border border-border/70 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-color">
              {queues.length} aktif
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden pb-4 sm:pb-5 md:pb-6">
        {queues.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 bg-muted/35 p-8 text-center">
            <UserCog className="h-10 w-10 text-primary" />
            <p className="text-base font-semibold text-primary-color">Belum ada antrean aktif</p>
            <p className="max-w-sm text-sm text-secondary-color">
              Daftar antrean aktif akan muncul saat proses pelayanan dimulai.
            </p>
          </div>
        ) : (
          <ul className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
            {queues.map((queue) => (
              <li
                key={queue.id}
                className="rounded-2xl border border-border/75 bg-background/85 px-4 py-4 shadow-sm dark:bg-background/35"
              >
                <p className="text-[2rem] font-black leading-none tracking-tight text-primary-color">
                  {formatQueueCode(queue.service.name, queue.queueNumber)}
                </p>
                <p className="mt-2 text-base font-semibold leading-snug text-primary-color break-words">
                  {queue.service.name}
                </p>
                <p className="mt-1 text-sm text-secondary-color">
                  Petugas: {getQueueOfficerName(queue)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
