import { memo } from "react";
import { formatDistance } from "date-fns";
import { id } from "date-fns/locale";
import { Smartphone } from "lucide-react";
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

  return (
    <TableRow>
      <TableCell className="font-medium">
        {queue.queueNumber}-{formatQueueTime(queue.createdAt)}
      </TableCell>
      <TableCell>
        <div>
          <p>{queue.visitor.name}</p>
          <p className="text-muted-foreground text-xs">{queue.visitor.institution || "-"}</p>
          <p className="text-muted-foreground text-xs">{queue.visitor.phone}</p>
        </div>
      </TableCell>
      <TableCell>{queue.service.name}</TableCell>
      <TableCell>
        {queue.queueType === "ONLINE" ? (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-600/20 ring-inset">
            Online
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
            Offline
          </span>
        )}
      </TableCell>
      <TableCell>
        <p className="text-muted-foreground text-xs">{getWaitingTime(queue.createdAt)}</p>
      </TableCell>
      <TableCell>
        <span className="text-xs font-medium text-primary-color">
          {queue.dutyStaff?.name || queue.admin?.name || "-"}
        </span>
      </TableCell>
      <TableCell>
        {queue.filledSKD ? (
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
              Sudah Diisi
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => onMarkSkdFilled(queue, false)}
            >
              Tandai Belum
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-600/20 ring-inset">
              Belum Diisi
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
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
          <span className="text-muted-foreground text-xs">-</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex flex-wrap justify-end gap-2">
          {!queue.filledSKD && queue.tempUuid && (
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
              onClick={() => onRemindSkd(queue)}
            >
              <Smartphone className="h-3 w-3" />
              <span>Kirim Pengingat</span>
            </Button>
          )}
          {queue.status === "WAITING" && (
            <>
              <Button size="sm" onClick={() => onServe(queue.id)}>
                Layani
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onOpenCancel(queue)}>
                Batalkan
              </Button>
            </>
          )}
          {queue.status === "SERVING" &&
            (canComplete ? (
              <Button size="sm" onClick={() => onComplete(queue.id)}>
                Selesai
              </Button>
            ) : (
              <span>Sedang dilayani oleh {queue.admin?.name}</span>
            ))}
        </div>
      </TableCell>
    </TableRow>
  );
}

const QueueTableRow = memo(QueueTableRowComponent);

QueueTableRow.displayName = "QueueTableRow";

export default QueueTableRow;
