import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DashboardMetricCardProps = {
  title: string;
  value?: ReactNode;
  description?: ReactNode;
  content?: ReactNode;
  icon: LucideIcon;
  iconClassName: string;
  iconBadgeClassName: string;
  footer?: ReactNode;
  cardClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  titleClassName?: string;
  valueClassName?: string;
  descriptionClassName?: string;
  badgeClassName?: string;
  iconSizeClassName?: string;
};

export function DashboardMetricCard({
  title,
  value,
  description,
  content,
  icon: Icon,
  iconClassName,
  iconBadgeClassName,
  footer,
  cardClassName,
  headerClassName,
  contentClassName,
  footerClassName,
  titleClassName,
  valueClassName,
  descriptionClassName,
  badgeClassName,
  iconSizeClassName,
}: DashboardMetricCardProps) {
  return (
    <Card className={cn("h-full border-border/80 bg-card shadow-none", cardClassName)}>
      <CardHeader
        className={cn("flex flex-row items-start justify-between space-y-0 pb-2", headerClassName)}
      >
        <div className={cn(value ? "space-y-1" : "space-y-0.5")}>
          <CardTitle
            className={cn(
              "text-xs font-semibold uppercase tracking-wide text-secondary-color",
              titleClassName
            )}
          >
            {title}
          </CardTitle>
          {typeof value !== "undefined" ? (
            <div className={cn("text-2xl font-bold text-primary-color md:text-3xl", valueClassName)}>
              {value}
            </div>
          ) : null}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg border",
            iconBadgeClassName,
            badgeClassName
          )}
        >
          <Icon className={cn("h-5 w-5", iconClassName, iconSizeClassName)} />
        </div>
      </CardHeader>
      {(description || content || contentClassName) && (
        <CardContent className={contentClassName}>
          <div className={cn(description && content ? "space-y-3" : undefined)}>
            {description ? (
              <p className={cn("text-xs text-secondary-color", descriptionClassName)}>{description}</p>
            ) : null}
            {content}
          </div>
        </CardContent>
      )}
      {footer ? (
        <CardFooter className={cn("border-t border-border/70 pt-3", footerClassName)}>
          {footer}
        </CardFooter>
      ) : null}
    </Card>
  );
}