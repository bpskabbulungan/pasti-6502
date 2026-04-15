import { memo } from "react";
import { Ban, CheckCircle2, ExternalLink, MoreVertical, PlayCircle, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDisplayDate } from "@/lib/date-format";
import { formatGuestQueueCode } from "@/shared/utils/guest-queue-code";
import type { QueueDetail } from "@shared/types/queue";

type QueueTableRowProps = {
  rowNumber: number;
  queue: QueueDetail;
  onServe: (queueId: string) => void;
  onComplete: (queue: QueueDetail) => void;
  onOpenCancel: (queue: QueueDetail) => void;
  onRevert: (queue: QueueDetail) => void;
};

const queueStatusLabel = {
  WAITING: "Menunggu",
  SERVING: "Sedang Dilayani",
  COMPLETED: "Selesai",
  CANCELED: "Dibatalkan",
} as const;

const queueStatusClass = {
  WAITING: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  SERVING: "border-sky-500/30 bg-sky-500/10 text-sky-700",
  COMPLETED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  CANCELED: "border-red-500/30 bg-red-500/10 text-red-700",
} as const;

type QueueActionMenuProps = {
  queue: QueueDetail;
  onServe: (queueId: string) => void;
  onComplete: (queue: QueueDetail) => void;
  onOpenCancel: (queue: QueueDetail) => void;
  onRevert: (queue: QueueDetail) => void;
};

function QueueActionMenu({ queue, onServe, onComplete, onOpenCancel, onRevert }: QueueActionMenuProps) {
  if (
    queue.status !== "WAITING" &&
    queue.status !== "SERVING" &&
    queue.status !== "COMPLETED" &&
    queue.status !== "CANCELED"
  ) {
    return <span className="text-xs text-muted-foreground">-</span>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 border-border/70 bg-background/70"
          aria-label={`Buka aksi antrean ${queue.queueNumber}`}
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        {queue.status === "WAITING" ? (
          <>
            <DropdownMenuItem className="gap-2" onSelect={() => onServe(queue.id)}>
              <PlayCircle className="h-4 w-4 text-emerald-600" />
              <span>Layani</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-rose-700 focus:text-rose-700"
              onSelect={() => onOpenCancel(queue)}
            >
              <Ban className="h-4 w-4" />
              <span>Batalkan</span>
            </DropdownMenuItem>
          </>
        ) : null}
        {queue.status === "SERVING" ? (
          <>
            <DropdownMenuItem className="gap-2" onSelect={() => onComplete(queue)}>
              <CheckCircle2 className="h-4 w-4 text-sky-600" />
              <span>Selesaikan</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 text-rose-700 focus:text-rose-700"
              onSelect={() => onOpenCancel(queue)}
            >
              <Ban className="h-4 w-4" />
              <span>Batalkan</span>
            </DropdownMenuItem>
          </>
        ) : null}
        {(queue.status === "COMPLETED" || queue.status === "CANCELED") ? (
          <DropdownMenuItem className="gap-2" onSelect={() => onRevert(queue)}>
            <RotateCcw className="h-4 w-4 text-amber-600" />
            <span>Kembalikan ke Menunggu</span>
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function QueueTableRowComponent({
  rowNumber,
  queue,
  onServe,
  onComplete,
  onOpenCancel,
  onRevert,
}: QueueTableRowProps) {
  const queueCode = formatGuestQueueCode(
    {
      name: queue.service.name,
      code: queue.service.code ?? undefined,
    },
    queue.queueNumber
  );
  const queueDate = formatDisplayDate(queue.createdAt);
  const trackingPath = queue.tempUuid
    ? `/visitor-form/${queue.tempUuid}`
    : queue.guestId || queue.trackingLink
      ? `/guest/queue/${queue.id}`
      : null;

  return (
    <>
      <TableRow className="hidden md:table-row">
        <TableCell className="text-center font-semibold text-primary-color">{rowNumber}</TableCell>
        <TableCell className="text-center font-medium text-primary-color">{queue.visitor.name}</TableCell>
        <TableCell className="text-center">{queue.visitor.institution || "-"}</TableCell>
        <TableCell className="max-w-[220px] break-words text-center font-medium">
          {queue.service.name}
        </TableCell>
        <TableCell className="text-center font-semibold text-primary-color">{queueCode}</TableCell>
        <TableCell className="text-center text-xs">{queueDate}</TableCell>
        <TableCell className="text-center">
          <span className="text-xs font-semibold text-primary-color">
            {queue.dutyStaff?.name || queue.admin?.name || "-"}
          </span>
        </TableCell>
        <TableCell className="text-center">
          {trackingPath ? (
            <a
              href={trackingPath}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Buka link antrean"
              title="Buka link antrean"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/70 bg-muted/20 text-primary-color transition-colors hover:bg-muted/40"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </TableCell>
        <TableCell className="text-center">
          <div className="flex justify-center">
            <QueueActionMenu
              queue={queue}
              onServe={onServe}
              onComplete={onComplete}
              onOpenCancel={onOpenCancel}
              onRevert={onRevert}
            />
          </div>
        </TableCell>
      </TableRow>

      <TableRow className="border-0 md:hidden hover:bg-transparent">
        <TableCell colSpan={9} className="whitespace-normal p-0">
          <div className="rounded-lg border border-border/70 bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-lg font-bold text-primary-color">No. {rowNumber}</p>
                <p className="text-xs text-muted-foreground">{queueCode}</p>
                <p className="break-words text-sm font-medium text-primary-color">{queue.visitor.name}</p>
                <p className="break-words text-xs text-muted-foreground">{queue.service.name}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 text-right">
                <Badge variant="outline" className={queueStatusClass[queue.status]}>
                  {queueStatusLabel[queue.status]}
                </Badge>
              </div>
            </div>

            <div className="mt-3 grid gap-2 rounded-lg bg-muted/25 p-3 text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Nomor Antrean</span>
                <span className="font-semibold text-primary-color">{queueCode}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Tanggal</span>
                <span>{queueDate}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Instansi</span>
                <span className="max-w-[70%] break-words text-right">{queue.visitor.institution || "-"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Petugas</span>
                <span className="max-w-[70%] break-words text-right font-medium">
                  {queue.dutyStaff?.name || queue.admin?.name || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Tracking</span>
                {trackingPath ? (
                  <a
                    href={trackingPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Buka link antrean"
                    title="Buka link antrean"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/70 bg-muted/20 text-primary-color transition-colors hover:bg-muted/40"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <span>-</span>
                )}
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <QueueActionMenu
                queue={queue}
                onServe={onServe}
                onComplete={onComplete}
                onOpenCancel={onOpenCancel}
                onRevert={onRevert}
              />
            </div>
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}

const QueueTableRow = memo(QueueTableRowComponent);

QueueTableRow.displayName = "QueueTableRow";

export default QueueTableRow;
