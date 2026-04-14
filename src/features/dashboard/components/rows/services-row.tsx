import { memo } from "react";
import { Pencil, Trash2, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { getServiceCodeByName } from "@/shared/constants/service-catalog";
import { formatDisplayDate } from "@/lib/date-format";
import { ServiceStatus } from "@/shared/constants/enums";
import type { ServiceSummary } from "@shared/types/service";

type ServicesTableRowProps = {
  service: ServiceSummary;
  onEdit: (service: ServiceSummary) => void;
  onDelete: (service: ServiceSummary) => void;
};

const formatRelativeTime = (value: string | Date) => {
  const diff = Date.now() - new Date(value).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days <= 0) return "Hari ini";
  if (days === 1) return "Kemarin";
  if (days < 7) return `${days} hari lalu`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} minggu lalu`;
  const months = Math.floor(days / 30);
  return `${months} bulan lalu`;
};

const getStatusLabel = (status: ServiceStatus) =>
  status === ServiceStatus.ACTIVE ? "Aktif" : "Nonaktif";

const getStatusBadgeClass = (status: ServiceStatus) =>
  status === ServiceStatus.ACTIVE
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
    : "border-red-500/30 bg-red-500/10 text-red-700";

function ServicesTableRowComponent({
  service,
  onEdit,
  onDelete,
}: ServicesTableRowProps) {
  const updatedAt = service.updatedAt ?? service.createdAt;
  const updatedDate = formatDisplayDate(updatedAt);
  const updatedRelative = formatRelativeTime(updatedAt);
  const isActive = service.status === ServiceStatus.ACTIVE;
  const serviceCode = service.code ?? getServiceCodeByName(service.name);

  return (
    <>
      <TableRow className="hidden md:table-row">
        <TableCell className="py-4">
          <div className="flex items-center justify-center gap-3 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary-color">
              <Wrench className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="break-words font-semibold text-primary-color">{service.name}</p>
              <p className="text-xs text-secondary-color">
                Kode {serviceCode} ·
                {" "}
                {isActive ? "Aktif untuk antrean" : "Nonaktif sementara"}
              </p>
            </div>
          </div>
        </TableCell>
        <TableCell className="py-4 text-center">
          <Badge variant="outline" className="font-semibold text-primary-color">
            {serviceCode}
          </Badge>
        </TableCell>
        <TableCell className="py-4 text-center">
          <div className="flex justify-center">
            <Badge variant="outline" className={getStatusBadgeClass(service.status)}>
              {getStatusLabel(service.status)}
            </Badge>
          </div>
        </TableCell>
        <TableCell className="py-4 text-center">
          <div className="space-y-1 text-sm">
            <p className="font-medium text-primary-color">{updatedDate}</p>
            <p className="text-xs text-secondary-color">{updatedRelative}</p>
          </div>
        </TableCell>
        <TableCell className="py-4 text-center">
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-9"
              onClick={() => onEdit(service)}
              title="Edit layanan"
              aria-label="Edit layanan"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="size-9"
              onClick={() => onDelete(service)}
              title="Hapus layanan"
              aria-label="Hapus layanan"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <TableRow className="border-0 md:hidden hover:bg-transparent">
        <TableCell colSpan={5} className="p-0 whitespace-normal">
          <div className="rounded-xl border border-border/70 bg-background/80 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary-color">
                  <Wrench className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="break-words font-semibold text-primary-color">{service.name}</p>
                  <div className="mt-1 text-xs text-secondary-color">
                    Kode {serviceCode} · {updatedDate}
                  </div>
                </div>
              </div>
              <Badge variant="outline" className={getStatusBadgeClass(service.status)}>
                {getStatusLabel(service.status)}
              </Badge>
            </div>
            <div className="mt-3 text-xs text-secondary-color">Diperbarui {updatedRelative}</div>
            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="size-9"
                onClick={() => onEdit(service)}
                title="Edit layanan"
                aria-label="Edit layanan"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="size-9"
                onClick={() => onDelete(service)}
                title="Hapus layanan"
                aria-label="Hapus layanan"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}

const ServicesTableRow = memo(ServicesTableRowComponent);

ServicesTableRow.displayName = "ServicesTableRow";

export default ServicesTableRow;
