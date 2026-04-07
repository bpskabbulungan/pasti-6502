import { memo } from "react";
import { ExternalLink, ListChecks, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDisplayDate } from "@/lib/date-format";
import type { QueueDetail } from "@shared/types/queue";

type QueueTableRowProps = {
  rowNumber: number;
  queue: QueueDetail;
  onServe: (queueId: string) => void;
  onOpenCancel: (queue: QueueDetail) => void;
};

const formatServiceQueueCode = (serviceName: string, queueNumber: number) => {
  const trimmed = serviceName.toLowerCase();
  const prefix = trimmed.includes("dtsen")
    ? "D"
    : trimmed.includes("perpust")
    ? "P"
    : trimmed.includes("konsul")
      ? "K"
      : trimmed.includes("rekomen")
        ? "R"
        : "L";
  const padded = queueNumber.toString().padStart(3, "0");
  return `${prefix}-${padded}`;
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

const actionButtonTone = {
  serve:
    "border-emerald-300/90 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 focus-visible:ring-emerald-300/60 dark:border-emerald-500/40 dark:bg-emerald-500/14 dark:text-emerald-200 dark:hover:bg-emerald-500/22",
  cancel:
    "border-rose-300/90 bg-rose-50 text-rose-700 hover:bg-rose-100 focus-visible:ring-rose-300/60 dark:border-rose-500/40 dark:bg-rose-500/14 dark:text-rose-200 dark:hover:bg-rose-500/22",
} as const;

function QueueTableRowComponent({
  rowNumber,
  queue,
  onServe,
  onOpenCancel,
}: QueueTableRowProps) {
  const queueCode = formatServiceQueueCode(queue.service.name, queue.queueNumber);
  const queueDate = formatDisplayDate(queue.createdAt);
  const trackingPath = queue.tempUuid ? `/visitor-form/${queue.tempUuid}` : null;

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
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Buka
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </TableCell>
        <TableCell className="text-center">
          <div className="flex flex-wrap justify-center gap-1.5">
            {queue.status === "WAITING" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className={`h-8 w-8 p-0 shadow-none ${actionButtonTone.serve}`}
                  onClick={() => onServe(queue.id)}
                  aria-label="Layani antrean"
                  title="Layani antrean"
                >
                  <ListChecks className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className={`h-8 w-8 p-0 shadow-none ${actionButtonTone.cancel}`}
                  onClick={() => onOpenCancel(queue)}
                  aria-label="Batalkan antrean"
                  title="Batalkan antrean"
                >
                  <XCircle className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
            {queue.status === "SERVING" ? (
              <Button
                size="sm"
                variant="outline"
                className={`h-8 w-8 p-0 shadow-none ${actionButtonTone.cancel}`}
                onClick={() => onOpenCancel(queue)}
                aria-label="Batalkan antrean"
                title="Batalkan antrean"
              >
                <XCircle className="h-3.5 w-3.5" />
              </Button>
            ) : null}
            {queue.status !== "WAITING" && queue.status !== "SERVING" ? (
              <span className="text-xs text-muted-foreground">-</span>
            ) : null}
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
                    className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                  >
                    Buka
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <span>-</span>
                )}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {queue.status === "WAITING" ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`h-8 w-8 p-0 shadow-none ${actionButtonTone.serve}`}
                    onClick={() => onServe(queue.id)}
                    aria-label="Layani antrean"
                    title="Layani antrean"
                  >
                    <ListChecks className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`h-8 w-8 p-0 shadow-none ${actionButtonTone.cancel}`}
                    onClick={() => onOpenCancel(queue)}
                    aria-label="Batalkan antrean"
                    title="Batalkan antrean"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : null}
              {queue.status === "SERVING" ? (
                <Button
                  size="sm"
                  variant="outline"
                  className={`h-8 w-8 p-0 shadow-none ${actionButtonTone.cancel}`}
                  onClick={() => onOpenCancel(queue)}
                  aria-label="Batalkan antrean"
                  title="Batalkan antrean"
                >
                  <XCircle className="h-3.5 w-3.5" />
                </Button>
              ) : null}
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
