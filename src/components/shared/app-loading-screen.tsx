type AppLoadingScreenProps = {
  fullScreen?: boolean;
};

export default function AppLoadingScreen({
  fullScreen = true,
}: AppLoadingScreenProps) {
  return (
    <div
      className={`flex w-full items-center justify-center px-4 ${
        fullScreen ? "min-h-screen" : "min-h-[50vh]"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute h-16 w-16 animate-ping rounded-full bg-primary/20" />
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/25 border-t-primary" />
        <div className="absolute h-2.5 w-2.5 animate-pulse rounded-full bg-accent" />
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
}
