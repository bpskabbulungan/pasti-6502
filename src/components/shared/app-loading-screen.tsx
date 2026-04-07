import AppLoader from "@/components/shared/app-loader";

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
      <AppLoader size="xl" />
    </div>
  );
}
