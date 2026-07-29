"use client";

import { Clock3, Maximize2, Minimize2, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QueueDisplayControlsProps = {
  className?: string;
  compact?: boolean;
  isFullscreen: boolean;
  isLoading: boolean;
  isValidating: boolean;
  isAudioEnabled?: boolean;
  lastUpdatedText: string;
  onRefresh: () => void;
  onToggleFullscreen: () => void;
  onToggleAudio?: () => void;
};

export function QueueDisplayControls({
  className,
  compact = false,
  isFullscreen,
  isLoading,
  isValidating,
  isAudioEnabled = false,
  lastUpdatedText,
  onRefresh,
  onToggleFullscreen,
  onToggleAudio,
}: QueueDisplayControlsProps) {
  const buttonSizeClass = compact ? "h-8 px-2.5 text-xs" : "h-9 px-3.5";

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-2 text-xs shadow-sm",
          compact && "px-2.5 py-1.5"
        )}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span
            className={cn(
              "absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full",
              isValidating ? "bg-primary/50" : "bg-emerald-500/50"
            )}
          />
          <span
            className={cn(
              "relative inline-flex h-2.5 w-2.5 rounded-full",
              isValidating ? "bg-primary" : "bg-emerald-500"
            )}
          />
        </span>
        <span className="font-semibold text-primary-color">Realtime</span>
      </div>

      <div
        className={cn(
          "flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-2 text-xs shadow-sm",
          compact && "px-2.5 py-1.5"
        )}
        aria-live="polite"
      >
        <Clock3 className="h-3.5 w-3.5 text-primary" />
        <span className="hidden text-secondary-color sm:inline">Pembaruan:</span>
        <span className="font-semibold text-primary-color">{lastUpdatedText}</span>
      </div>

      {onToggleAudio && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn("gap-2", buttonSizeClass, isAudioEnabled && "text-emerald-600 border-emerald-500/50 bg-emerald-500/10")}
          onClick={onToggleAudio}
          title={isAudioEnabled ? "Matikan Suara" : "Nyalakan Suara"}
        >
          {isAudioEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          <span className={cn(compact && "sr-only")}>{isAudioEnabled ? "Suara Nyala" : "Suara Mati"}</span>
        </Button>
      )}

      <Button
        type="button"
        size="sm"
        className={cn("gap-2 text-white dark:text-primary-foreground", buttonSizeClass)}
        onClick={onRefresh}
        disabled={isLoading || isValidating}
      >
        <RefreshCw className={cn("h-3.5 w-3.5", isValidating && "animate-spin")} />
        <span>Refresh</span>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn("gap-2", buttonSizeClass)}
        onClick={onToggleFullscreen}
      >
        {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        <span className={cn(compact && "sr-only")}>{isFullscreen ? "Minimize" : "Maximize"}</span>
      </Button>

      <ThemeToggle />
    </div>
  );
}
