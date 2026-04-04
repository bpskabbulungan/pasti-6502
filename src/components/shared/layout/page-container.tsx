import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  maxWidth?: "5xl" | "6xl" | "7xl";
};

const maxWidthClassName: Record<NonNullable<PageContainerProps["maxWidth"]>, string> = {
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
};

export function PageContainer({ children, className, maxWidth = "7xl" }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full space-y-5 px-0 pb-1 sm:space-y-6",
        maxWidthClassName[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}
