"use client";

import CurrentYear from "@/components/shared/current-year";
import { FOOTER_COPYRIGHT_HOLDER, FOOTER_START_YEAR } from "@/constants/app";
import { usePathname } from "next/navigation";

export default function SiteFooter() {
  const pathname = usePathname();

  // Hide global footer on login page since it has its own integrated footer
  if (pathname === "/login") {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-border/80 bg-background/90 text-secondary-color backdrop-blur">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 md:py-5">
        <p className="text-center text-xs leading-relaxed sm:text-sm">
          &copy; <CurrentYear startYear={FOOTER_START_YEAR} /> {FOOTER_COPYRIGHT_HOLDER}
        </p>
      </div>
    </footer>
  );
}
