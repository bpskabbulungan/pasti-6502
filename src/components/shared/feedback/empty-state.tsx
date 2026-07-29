import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, icon: Icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/80 bg-muted/35 px-4 py-9 text-center sm:px-6",
        className
      )}
    >
      {Icon ? (
        <div className="relative mb-2 mt-1">
          <div className="absolute inset-0 animate-pulse rounded-full bg-primary/10" />
          <div className="relative rounded-full border border-border/80 bg-background/80 p-3 shadow-sm transition-transform hover:scale-110">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      ) : null}
      <div className="space-y-1.5">
        <p className="text-base font-semibold text-primary-color sm:text-lg">{title}</p>
        <p className="max-w-xl text-sm leading-relaxed text-secondary-color">{description}</p>
      </div>
      {action ? <div className="flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}
