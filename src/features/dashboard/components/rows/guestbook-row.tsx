import { memo } from "react";
import { BellRing, Eye, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDisplayDateTime } from "@/lib/date-format";
import { QueueStatus } from "@/shared/constants/enums";
import type { GuestbookEntry } from "@shared/types/guestbook";

type GuestbookTableRowProps = {
  rowNumber: number;
  entry: GuestbookEntry;
  statusLabels: Record<QueueStatus, string>;
  statusBadgeClass: Record<QueueStatus, string>;
  onViewDetail: (entry: GuestbookEntry) => void;
  onSendReminder: (entry: GuestbookEntry) => void;
  isReminding: boolean;
};

const getArrivedAtLabel = (entry: GuestbookEntry) => formatDisplayDateTime(entry.createdAt);

function GuestbookTableRowComponent({
  rowNumber,
  entry,
  statusLabels,
  statusBadgeClass,
  onViewDetail,
  onSendReminder,
  isReminding,
}: GuestbookTableRowProps) {
  const arrivedAtLabel = getArrivedAtLabel(entry);
  const skdBadgeClass = entry.filledSKD
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
    : "border-red-500/30 bg-red-500/10 text-red-700";

  return (
    <>
      <TableRow className="hidden md:table-row">
        <TableCell className="text-center font-semibold text-primary-color">{rowNumber}</TableCell>
        <TableCell className="align-middle text-center">
          <div className="space-y-1">
            <p className="break-words font-medium text-primary-color">{entry.fullName}</p>
            <p className="break-words text-xs text-secondary-color">{entry.institution || "-"}</p>
            <p className="text-xs text-secondary-color">{entry.phone}</p>
          </div>
        </TableCell>
        <TableCell className="align-middle text-center">
          <p className="break-words font-medium text-primary-color">{entry.serviceName}</p>
        </TableCell>
        <TableCell className="align-middle text-center text-xs">{arrivedAtLabel}</TableCell>
        <TableCell className="align-middle text-center">
          <p className="break-words text-xs font-semibold text-primary-color">{entry.officerName || "-"}</p>
        </TableCell>
        <TableCell className="align-middle text-center">
          <Badge variant="outline" className={skdBadgeClass}>
            {entry.filledSKD ? "Sudah" : "Belum"}
          </Badge>
        </TableCell>
        <TableCell className="align-middle text-center">
          <Badge variant="outline" className={statusBadgeClass[entry.status]}>
            {statusLabels[entry.status]}
          </Badge>
        </TableCell>
        <TableCell className="align-middle text-center">
          <div className="flex justify-center gap-1.5">
            {!entry.filledSKD ? (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onSendReminder(entry)}
                disabled={isReminding}
                className="h-8 w-8 border-border/80"
                aria-label={`Kirim pengingat SKD ${entry.fullName}`}
                title="Kirim pengingat SKD"
              >
                {isReminding ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />}
              </Button>
            ) : null}
            <Button
              variant="outline"
              size="icon"
              onClick={() => onViewDetail(entry)}
              className="h-8 w-8 border-border/80"
              aria-label={`Lihat detail ${entry.fullName}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <TableRow className="border-0 md:hidden hover:bg-transparent">
        <TableCell colSpan={8} className="p-0 whitespace-normal">
          <div className="rounded-lg border border-border/70 bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-primary-color">No. {rowNumber}</p>
                <p className="break-words font-semibold text-primary-color">{entry.fullName}</p>
                <p className="text-xs text-secondary-color">{entry.phone}</p>
                <p className="break-words text-xs text-secondary-color">{entry.institution || "-"}</p>
              </div>
              <Badge variant="outline" className={statusBadgeClass[entry.status]}>
                {statusLabels[entry.status]}
              </Badge>
            </div>

            <div className="mt-3 grid gap-2 rounded-lg bg-muted/25 p-3 text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Layanan</span>
                <span className="max-w-[70%] break-words text-right font-medium text-primary-color">
                  {entry.serviceName}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Tanggal datang</span>
                <span className="text-right">{arrivedAtLabel}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Status layanan</span>
                <Badge variant="outline" className={statusBadgeClass[entry.status]}>
                  {statusLabels[entry.status]}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Petugas</span>
                <span className="max-w-[70%] break-words text-right">{entry.officerName || "-"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Monitoring SKD</span>
                <Badge variant="outline" className={skdBadgeClass}>
                  {entry.filledSKD ? "Sudah" : "Belum"}
                </Badge>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {!entry.filledSKD ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendReminder(entry)}
                  disabled={isReminding}
                  className="gap-1.5 border-border/80"
                  aria-label={`Kirim pengingat SKD ${entry.fullName}`}
                >
                  {isReminding ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <BellRing className="h-3.5 w-3.5" />
                  )}
                  Pengingat SKD
                </Button>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetail(entry)}
                className="gap-1.5 border-border/80"
                aria-label={`Lihat detail ${entry.fullName}`}
              >
                <Eye className="h-3.5 w-3.5" />
                Detail
              </Button>
            </div>
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}

const GuestbookTableRow = memo(GuestbookTableRowComponent);

GuestbookTableRow.displayName = "GuestbookTableRow";

export default GuestbookTableRow;
