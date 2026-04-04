"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { NAVIGATION_PENDING_EVENT } from "@/lib/navigation-pending";

export default function LoadingTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamKey = searchParams.toString();
  const [showIndicator, setShowIndicator] = useState(false);
  const resetTimerRef = useRef<number | undefined>(undefined);

  const clearPendingState = useCallback(() => {
    setShowIndicator(false);
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = undefined;
    }
  }, []);

  const startPendingState = useCallback(() => {
    setShowIndicator(true);
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }
    // Failsafe in case route change fails or is canceled.
    resetTimerRef.current = window.setTimeout(() => {
      setShowIndicator(false);
      resetTimerRef.current = undefined;
    }, 15000);
  }, []);

  useEffect(() => {
    const handleNavigationIntent = () => startPendingState();
    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.href);
      if (nextUrl.origin !== window.location.origin) {
        return;
      }

      const currentUrl = new URL(window.location.href);
      if (nextUrl.pathname === currentUrl.pathname && nextUrl.search === currentUrl.search) {
        return;
      }

      startPendingState();
    };

    window.addEventListener(NAVIGATION_PENDING_EVENT, handleNavigationIntent);
    document.addEventListener("click", handleClick, true);

    return () => {
      window.removeEventListener(NAVIGATION_PENDING_EVENT, handleNavigationIntent);
      document.removeEventListener("click", handleClick, true);
    };
  }, [startPendingState]);

  useEffect(() => {
    clearPendingState();
  }, [pathname, searchParamKey, clearPendingState]);

  useEffect(() => {
    return () => clearPendingState();
  }, [clearPendingState]);

  return (
    <>
      {children}
      {showIndicator ? (
        <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-background/45 px-4 backdrop-blur-sm">
          <div className="rounded-xl border border-border/70 bg-background/95 px-4 py-3 shadow-lg">
            <div className="flex items-center gap-2.5 text-sm font-medium text-secondary-color">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
              <span>Memuat halaman...</span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
