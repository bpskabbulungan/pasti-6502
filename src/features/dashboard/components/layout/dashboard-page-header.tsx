import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashboardPageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  chips?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  actionsClassName?: string;
};

export function DashboardPageHeader({
  title,
  description,
  meta,
  chips,
  actions,
  children,
  className,
  actionsClassName,
}: DashboardPageHeaderProps) {
  return (
    <section className={cn("dashboard-hero p-5 sm:p-6", className)}>
      <div className="space-y-4">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-primary-color sm:text-3xl">{title}</h1>
              {description ? (
                <p className="max-w-3xl text-sm text-secondary-color">{description}</p>
              ) : null}
            </div>
            {meta ? (
              <div className="flex flex-wrap items-center gap-2 text-xs text-secondary-color">{meta}</div>
            ) : null}
            {chips ? <div className="flex flex-wrap gap-2">{chips}</div> : null}
          </div>
          {actions ? <div className={cn("w-full lg:w-auto lg:flex-none", actionsClassName)}>{actions}</div> : null}
        </div>
        {children}
      </div>
    </section>
  );
}
