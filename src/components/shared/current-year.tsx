"use client";

type CurrentYearProps = {
  startYear?: number;
};

export default function CurrentYear({ startYear }: CurrentYearProps) {
  const currentYear = new Date().getFullYear();
  const yearLabel =
    typeof startYear === "number" && startYear < currentYear
      ? `${startYear}-${currentYear}`
      : String(startYear ?? currentYear);

  return <span suppressHydrationWarning>{yearLabel}</span>;
}