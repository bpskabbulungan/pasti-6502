import { memo } from "react";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDisplayDate } from "@/lib/date-format";
import type { GuestbookEntry } from "@shared/types/guestbook";

type GuestbookTableRowProps = {
  rowNumber: number;
  entry: GuestbookEntry;
  onViewDetail: (entry: GuestbookEntry) => void;
};

const getArrivedAtLabel = (entry: GuestbookEntry) => formatDisplayDate(entry.createdAt);

const getSkdBadgeClass = (filledSKD: boolean) =>
  filledSKD
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-300/35 dark:bg-emerald-400/10 dark:text-emerald-200"
    : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:border-amber-300/35 dark:bg-amber-400/10 dark:text-amber-200";

const serviceStatusLabel = {
  WAITING: "Menunggu",
  SERVING: "Sedang Dilayani",
  COMPLETED: "Selesai",
  CANCELED: "Dibatalkan",
} as const;

const serviceStatusClass = {
  WAITING:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:border-amber-300/35 dark:bg-amber-400/10 dark:text-amber-200",
  SERVING:
    "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:border-sky-300/35 dark:bg-sky-400/10 dark:text-sky-200",
  COMPLETED:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-300/35 dark:bg-emerald-400/10 dark:text-emerald-200",
  CANCELED:
    "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:border-rose-300/35 dark:bg-rose-400/10 dark:text-rose-200",
} as const;

function GuestbookTableRowComponent({
  rowNumber,
  entry,
  onViewDetail,
}: GuestbookTableRowProps) {
  const arrivedAtLabel = getArrivedAtLabel(entry);
  const skdBadgeClass = getSkdBadgeClass(entry.filledSKD);
  const statusLabel = serviceStatusLabel[entry.status];
  const statusClass = serviceStatusClass[entry.status];

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
          <p className="font-semibold text-primary-color">{entry.queueCode}</p>
        </TableCell>
        <TableCell className="align-middle text-center">
          <div className="space-y-1.5">
            <p className="break-words font-medium text-primary-color">{entry.serviceName}</p>
            <Badge variant="outline" className={statusClass}>
              {statusLabel}
            </Badge>
          </div>
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
          <Button
            variant="outline"
            size="icon"
            onClick={() => onViewDetail(entry)}
            className="h-8 w-8 border-border/80"
            aria-label={`Lihat detail ${entry.fullName}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>

      <TableRow className="border-0 md:hidden hover:bg-transparent">
        <TableCell colSpan={8} className="whitespace-normal p-0">
          <div className="rounded-lg border border-border/70 bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-primary-color">No. {rowNumber}</p>
                <p className="text-xs text-secondary-color">Nomor antrean: {entry.queueCode}</p>
                <p className="break-words font-semibold text-primary-color">{entry.fullName}</p>
                <p className="text-xs text-secondary-color">{entry.phone}</p>
                <p className="break-words text-xs text-secondary-color">{entry.institution || "-"}</p>
              </div>
            </div>

            <div className="mt-3 grid gap-2 rounded-lg bg-muted/25 p-3 text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Layanan</span>
                <span className="max-w-[70%] break-words text-right font-medium text-primary-color">
                  {entry.serviceName}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Status layanan</span>
                <Badge variant="outline" className={statusClass}>
                  {statusLabel}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Tanggal datang</span>
                <span className="text-right">{arrivedAtLabel}</span>
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
