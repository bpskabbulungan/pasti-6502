type AppLoadingScreenProps = {
  fullScreen?: boolean;
  centerInViewport?: boolean;
};

export default function AppLoadingScreen({
  fullScreen = true,
  centerInViewport = true,
}: AppLoadingScreenProps) {
  const containerClassName = centerInViewport
    ? "pointer-events-none fixed inset-0 z-[70] grid place-items-center px-4"
    : fullScreen
      ? "flex min-h-screen w-full items-center justify-center px-4"
      : "flex w-full min-h-[50vh] items-center justify-center px-4";

  return (
    <div className={containerClassName} role="status" aria-live="polite">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute h-16 w-16 animate-ping rounded-full bg-primary/20" />
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/25 border-t-primary" />
        <div className="absolute h-2.5 w-2.5 animate-pulse rounded-full bg-accent" />
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
}
