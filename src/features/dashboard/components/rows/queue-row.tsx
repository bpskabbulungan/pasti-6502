import { memo } from "react";
import { formatDistance } from "date-fns";
import { id } from "date-fns/locale";
import { Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Role } from "@/shared/constants/enums";
import type { QueueDetail } from "@shared/types/queue";

type QueueTableRowProps = {
  queue: QueueDetail;
  currentUserRole?: Role;
  currentUserName?: string | null;
  onServe: (queueId: string) => void;
  onComplete: (queueId: string) => void;
  onOpenCancel: (queue: QueueDetail) => void;
  onRemindSkd: (queue: QueueDetail) => void;
  onMarkSkdFilled: (queue: QueueDetail, filled: boolean) => void;
  onCopyTrackingLink: (tempUuid: string) => void;
};

const formatQueueTime = (isoDateString: string | Date): string => {
  const date = new Date(isoDateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${day}${month}`;
};

const getWaitingTime = (createdAt: string | Date) => {
  try {
    return formatDistance(new Date(createdAt), new Date(), {
      addSuffix: false,
      locale: id,
    });
  } catch {
    return "-";
  }
};

const queueTypeBadgeClass: Record<"ONLINE" | "OFFLINE", string> = {
  ONLINE: "border-blue-500/30 bg-blue-500/10 text-blue-700",
  OFFLINE: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
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

function QueueTableRowComponent({
  queue,
  currentUserRole,
  currentUserName,
  onServe,
  onComplete,
  onOpenCancel,
  onRemindSkd,
  onMarkSkdFilled,
  onCopyTrackingLink,
}: QueueTableRowProps) {
  const canComplete =
    currentUserRole === Role.ADMIN ||
    (queue.admin && queue.admin.name === currentUserName);
  const queueCode = `${queue.queueNumber}-${formatQueueTime(queue.createdAt)}`;
  const queueTypeLabel = queue.queueType === "ONLINE" ? "Online" : "Offline";

  return (
    <>
      <TableRow className="hidden md:table-row">
        <TableCell className="font-semibold text-primary-color">{queueCode}</TableCell>
        <TableCell>
          <div className="space-y-1">
            <p className="break-words font-medium text-primary-color">{queue.visitor.name}</p>
            <p className="break-words text-xs text-muted-foreground">{queue.visitor.institution || "-"}</p>
            <p className="text-xs text-muted-foreground">{queue.visitor.phone}</p>
          </div>
        </TableCell>
        <TableCell className="max-w-[220px] break-words font-medium">{queue.service.name}</TableCell>
        <TableCell>
          <Badge variant="outline" className={queueTypeBadgeClass[queue.queueType]}>
            {queueTypeLabel}
          </Badge>
        </TableCell>
        <TableCell>
          <p className="text-xs text-muted-foreground">{getWaitingTime(queue.createdAt)}</p>
        </TableCell>
        <TableCell>
          <span className="text-xs font-semibold text-primary-color">
            {queue.dutyStaff?.name || queue.admin?.name || "-"}
          </span>
        </TableCell>
        <TableCell>
          {queue.filledSKD ? (
            <div className="flex flex-col items-start gap-2 lg:flex-row lg:items-center">
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
              >
                Sudah Diisi
              </Badge>
              <Button
                variant="warning"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => onMarkSkdFilled(queue, false)}
              >
                Tandai Belum
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-2 lg:flex-row lg:items-center">
              <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-700">
                Belum Diisi
              </Badge>
              <Button
                variant="success"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => onMarkSkdFilled(queue, true)}
              >
                Tandai Sudah
              </Button>
            </div>
          )}
        </TableCell>
        <TableCell>
          {queue.trackingLink && queue.tempUuid ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => onCopyTrackingLink(queue.tempUuid!)}
            >
              Salin Link
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex flex-wrap justify-end gap-1.5">
            {!queue.filledSKD && queue.tempUuid && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 max-w-full gap-1.5 px-3 text-xs"
                onClick={() => onRemindSkd(queue)}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Pengingat SKD</span>
              </Button>
            )}
            {queue.status === "WAITING" && (
              <>
                <Button size="sm" className="h-8 px-3 text-xs" onClick={() => onServe(queue.id)}>
                  Layani
                </Button>
                <Button
                  size="sm"
                  variant="warning"
                  className="h-8 px-3 text-xs"
                  onClick={() => onOpenCancel(queue)}
                >
                  Batalkan
                </Button>
              </>
            )}
            {queue.status === "SERVING" &&
              (canComplete ? (
                <Button
                  size="sm"
                  variant="success"
                  className="h-8 px-3 text-xs"
                  onClick={() => onComplete(queue.id)}
                >
                  Selesai
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Dilayani oleh {queue.admin?.name}
                </span>
              ))}
          </div>
        </TableCell>
      </TableRow>

      <TableRow className="border-0 md:hidden hover:bg-transparent">
        <TableCell colSpan={9} className="p-0 whitespace-normal">
          <div className="rounded-xl border border-border/70 bg-background/80 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-lg font-bold text-primary-color">{queueCode}</p>
                <p className="break-words text-sm font-medium text-primary-color">{queue.visitor.name}</p>
                <p className="break-words text-xs text-muted-foreground">{queue.service.name}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Badge variant="outline" className={queueStatusClass[queue.status]}>
                  {queueStatusLabel[queue.status]}
                </Badge>
                <Badge variant="outline" className={queueTypeBadgeClass[queue.queueType]}>
                  {queueTypeLabel}
                </Badge>
              </div>
            </div>

            <div className="mt-3 grid gap-2 rounded-lg bg-muted/40 p-3 text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Kontak</span>
                <span className="text-right">{queue.visitor.phone}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Instansi</span>
                <span className="max-w-[70%] break-words text-right">{queue.visitor.institution || "-"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Menunggu</span>
                <span>{getWaitingTime(queue.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Petugas</span>
                <span className="max-w-[70%] break-words text-right font-medium">
                  {queue.dutyStaff?.name || queue.admin?.name || "-"}
                </span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {queue.filledSKD ? (
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                >
                  SKD Sudah Diisi
                </Badge>
              ) : (
                <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-700">
                  SKD Belum Diisi
                </Badge>
              )}
              <Button
                variant={queue.filledSKD ? "warning" : "success"}
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => onMarkSkdFilled(queue, !queue.filledSKD)}
              >
                {queue.filledSKD ? "Tandai Belum" : "Tandai Sudah"}
              </Button>
              {queue.tempUuid ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={() => onCopyTrackingLink(queue.tempUuid!)}
                >
                  Salin Link Tracking
                </Button>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {!queue.filledSKD && queue.tempUuid ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 flex-1 gap-1.5 text-xs"
                  onClick={() => onRemindSkd(queue)}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  Kirim Pengingat
                </Button>
              ) : null}
              {queue.status === "WAITING" ? (
                <>
                  <Button
                    size="sm"
                    className="h-8 min-w-[120px] flex-1 text-xs"
                    onClick={() => onServe(queue.id)}
                  >
                    Layani Sekarang
                  </Button>
                  <Button
                    size="sm"
                    variant="warning"
                    className="h-8 min-w-[120px] flex-1 text-xs"
                    onClick={() => onOpenCancel(queue)}
                  >
                    Batalkan
                  </Button>
                </>
              ) : null}
              {queue.status === "SERVING" ? (
                canComplete ? (
                  <Button
                    size="sm"
                    variant="success"
                    className="h-8 min-w-[120px] flex-1 text-xs"
                    onClick={() => onComplete(queue.id)}
                  >
                    Selesai
                  </Button>
                ) : (
                  <div className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                    Dilayani oleh {queue.admin?.name}
                  </div>
                )
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
