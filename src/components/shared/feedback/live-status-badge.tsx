import { Badge } from "@/components/ui/badge";

type LiveStatusBadgeProps = {
  isRefreshing: boolean;
  hasFetched: boolean;
  idleLabel?: string;
};

export function LiveStatusBadge({
  isRefreshing,
  hasFetched,
  idleLabel = "Data terbaru",
}: LiveStatusBadgeProps) {
  const label = isRefreshing ? "Memperbarui data..." : hasFetched ? idleLabel : "Belum ada data";

  return (
    <Badge variant="secondary" className="gap-1.5 bg-background/80 text-secondary-color">
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isRefreshing ? "bg-primary animate-pulse" : hasFetched ? "bg-emerald-500" : "bg-muted-foreground"
        }`}
      />
      {label}
    </Badge>
  );
}
