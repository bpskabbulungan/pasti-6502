import { memo } from "react";
import { Eye, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDisplayDate, formatDisplayDateTime } from "@/lib/date-format";
import { QueueStatus } from "@/shared/constants/enums";
import type { GuestbookEntry } from "@shared/types/guestbook";

type GuestbookTableRowProps = {
  entry: GuestbookEntry;
  statusLabels: Record<QueueStatus, string>;
  statusBadgeClass: Record<QueueStatus, string>;
  onViewDetail: (entry: GuestbookEntry) => void;
};

function GuestbookTableRowComponent({
  entry,
  statusLabels,
  statusBadgeClass,
  onViewDetail,
}: GuestbookTableRowProps) {
  const createdDate = formatDisplayDate(entry.createdAt);
  const createdDateTime = formatDisplayDateTime(entry.createdAt);

  return (
    <>
      <TableRow className="hidden md:table-row">
        <TableCell className="align-middle text-center">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary-color">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-primary-color">{entry.fullName}</p>
              <p className="text-xs text-secondary-color">{entry.institution || "-"}</p>
              <p className="text-xs text-secondary-color">{entry.phone}</p>
            </div>
          </div>
        </TableCell>
        <TableCell className="align-middle text-center">
          <div className="space-y-1">
            <p className="font-medium text-primary-color">{entry.serviceName}</p>
            <p className="text-xs text-secondary-color">
              {entry.queueType === "ONLINE" ? "Online" : "Offline"}
            </p>
          </div>
        </TableCell>
        <TableCell className="align-middle text-center">
          <div className="space-y-1">
            <p className="font-semibold text-primary-color">{entry.queueCode}</p>
            <Badge variant="outline" className={statusBadgeClass[entry.status]}>
              {statusLabels[entry.status]}
            </Badge>
          </div>
        </TableCell>
        <TableCell className="align-middle text-center">
          <div className="space-y-1 text-sm">
            <p className="font-medium text-primary-color">{createdDate}</p>
            <p className="text-xs text-secondary-color">{createdDateTime}</p>
          </div>
        </TableCell>
        <TableCell className="align-middle text-center">
          <Badge
            variant="outline"
            className={
              entry.filledSKD
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                : "border-red-500/30 bg-red-500/10 text-red-700"
            }
          >
            {entry.filledSKD ? "Sudah" : "Belum"}
          </Badge>
        </TableCell>
        <TableCell className="align-middle text-center">
          <p className="font-medium text-primary-color">{entry.officerName || "-"}</p>
        </TableCell>
        <TableCell className="align-middle text-center">
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onViewDetail(entry)}
              aria-label={`Lihat detail ${entry.fullName}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <TableRow className="border-0 md:hidden hover:bg-transparent">
        <TableCell colSpan={7} className="p-0 whitespace-normal">
          <div className="rounded-xl border border-border/70 bg-background/80 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-primary-color">{entry.fullName}</p>
                <p className="text-xs text-secondary-color">{entry.phone}</p>
                <p className="text-xs text-secondary-color">{entry.institution || "-"}</p>
              </div>
              <Badge variant="outline" className={statusBadgeClass[entry.status]}>
                {statusLabels[entry.status]}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline">{entry.serviceName}</Badge>
              <Badge variant="secondary" className="bg-background/80 text-secondary-color">
                Petugas: {entry.officerName || "-"}
              </Badge>
              <Badge
                variant="outline"
                className={
                  entry.filledSKD
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                    : "border-red-500/30 bg-red-500/10 text-red-700"
                }
              >
                SKD {entry.filledSKD ? "Sudah" : "Belum"}
              </Badge>
            </div>
            <div className="mt-2 text-xs text-secondary-color">{createdDateTime}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onViewDetail(entry)}
                aria-label={`Lihat detail ${entry.fullName}`}
              >
                <Eye className="h-4 w-4" />
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
