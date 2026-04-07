import { cn } from "@/lib/utils";

type AppLoaderSize = "xs" | "sm" | "md" | "lg" | "xl";

type AppLoaderProps = {
  size?: AppLoaderSize;
  className?: string;
};

const loaderSizes: Record<
  AppLoaderSize,
  { container: string; spinner: string; dot: string }
> = {
  xs: {
    container: "h-3.5 w-3.5",
    spinner: "h-2.5 w-2.5 border",
    dot: "h-1 w-1",
  },
  sm: {
    container: "h-4 w-4",
    spinner: "h-3 w-3 border-[1.5px]",
    dot: "h-1 w-1",
  },
  md: {
    container: "h-5 w-5",
    spinner: "h-4 w-4 border-2",
    dot: "h-1.5 w-1.5",
  },
  lg: {
    container: "h-12 w-12",
    spinner: "h-9 w-9 border-[3px]",
    dot: "h-2 w-2",
  },
  xl: {
    container: "h-16 w-16",
    spinner: "h-12 w-12 border-4",
    dot: "h-2.5 w-2.5",
  },
};

export default function AppLoader({ size = "md", className }: AppLoaderProps) {
  const sizeClass = loaderSizes[size];

  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center text-primary",
        sizeClass.container,
        className,
      )}
    >
      <span className={cn("absolute animate-pulse rounded-full bg-current/20", sizeClass.container)} />
      <span
        className={cn(
          "animate-spin rounded-full border-current/30 border-t-current",
          sizeClass.spinner,
        )}
      />
      <span className={cn("absolute animate-pulse rounded-full bg-current", sizeClass.dot)} />
      <span className="sr-only">Loading</span>
    </span>
  );
}
