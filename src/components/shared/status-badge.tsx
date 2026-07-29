import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { QueueStatus } from "@/shared/constants/enums";

export type StatusBadgeProps = {
  status: QueueStatus | string;
  className?: string;
  showText?: boolean;
};

const statusLabels: Record<string, string> = {
  WAITING: "Menunggu",
  SERVING: "Sedang Dilayani",
  COMPLETED: "Selesai",
  CANCELED: "Dibatalkan",
};

export function StatusBadge({ status, className, showText = true }: StatusBadgeProps) {
  const normalizedStatus = typeof status === "string" ? status.toUpperCase() : status;

  let badgeVariant = "outline" as const;
  let colorClasses = "";

  switch (normalizedStatus) {
    case "WAITING":
      colorClasses = "border-amber-400/40 bg-amber-100 text-amber-900 dark:border-amber-500/40 dark:bg-amber-900/30 dark:text-amber-100";
      break;
    case "SERVING":
      colorClasses = "border-sky-400/40 bg-sky-100 text-sky-900 dark:border-sky-500/40 dark:bg-sky-900/30 dark:text-sky-100";
      break;
    case "COMPLETED":
      colorClasses = "border-emerald-400/40 bg-emerald-100 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-900/30 dark:text-emerald-100";
      break;
    case "CANCELED":
      colorClasses = "border-red-400/40 bg-red-100 text-red-900 dark:border-red-500/40 dark:bg-red-900/30 dark:text-red-100";
      break;
    default:
      colorClasses = "border-slate-400/40 bg-slate-100 text-slate-900 dark:border-slate-500/40 dark:bg-slate-900/30 dark:text-slate-100";
      break;
  }

  const label = statusLabels[normalizedStatus] || normalizedStatus;

  return (
    <Badge variant={badgeVariant} className={cn(colorClasses, className)}>
      {showText ? label : null}
    </Badge>
  );
}
