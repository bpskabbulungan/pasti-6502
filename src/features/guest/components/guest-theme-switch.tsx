"use client";

import { useEffect, useMemo, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export default function GuestThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = useMemo(
    () => (resolvedTheme === "dark" ? "dark" : "light"),
    [resolvedTheme]
  );

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-border/80 bg-background/90 p-1 shadow-sm backdrop-blur">
      <span className="hidden px-2 text-[11px] font-semibold tracking-wide text-muted-foreground sm:inline">
        Tampilan
      </span>
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-pressed={mounted ? activeTheme === "light" : false}
        className={cn(
          "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors",
          mounted && activeTheme === "light"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-secondary-color hover:bg-muted"
        )}
      >
        <Sun className="h-3.5 w-3.5" />
        Terang
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-pressed={mounted ? activeTheme === "dark" : false}
        className={cn(
          "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors",
          mounted && activeTheme === "dark"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-secondary-color hover:bg-muted"
        )}
      >
        <Moon className="h-3.5 w-3.5" />
        Gelap
      </button>
    </div>
  );
}
