export type OfficerPerformanceTone = "good" | "moderate" | "needs-attention" | "unknown";

export type OfficerPerformanceStatus = {
  tone: OfficerPerformanceTone;
  label: string;
  description: string;
  badgeClassName: string;
  dotClassName: string;
};

type OfficerPerformanceAssessmentInput = {
  averageWaitTime: number | null | undefined;
  averageServiceTime: number | null | undefined;
  teamAverageWaitTime: number | null | undefined;
  teamAverageServiceTime: number | null | undefined;
};

const STATUS_BY_TONE: Record<OfficerPerformanceTone, OfficerPerformanceStatus> = {
  good: {
    tone: "good",
    label: "Baik",
    description: "Lebih cepat dari rata-rata tim.",
    badgeClassName: "border-emerald-300/70 bg-emerald-50 text-emerald-700",
    dotClassName: "bg-emerald-500",
  },
  moderate: {
    tone: "moderate",
    label: "Cukup",
    description: "Mendekati rata-rata tim.",
    badgeClassName: "border-amber-300/70 bg-amber-50 text-amber-700",
    dotClassName: "bg-amber-500",
  },
  "needs-attention": {
    tone: "needs-attention",
    label: "Perlu Perhatian",
    description: "Lebih lambat dari rata-rata tim.",
    badgeClassName: "border-rose-300/70 bg-rose-50 text-rose-700",
    dotClassName: "bg-rose-500",
  },
  unknown: {
    tone: "unknown",
    label: "Belum Tersedia",
    description: "Data belum cukup untuk menilai performa.",
    badgeClassName: "border-slate-300/70 bg-slate-100/80 text-slate-700",
    dotClassName: "bg-slate-400",
  },
};

const isValidMetric = (value: number | null | undefined) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

export const getOfficerPerformanceStatus = (
  input: OfficerPerformanceAssessmentInput
): OfficerPerformanceStatus => {
  const {
    averageWaitTime,
    averageServiceTime,
    teamAverageWaitTime,
    teamAverageServiceTime,
  } = input;

  if (
    !isValidMetric(averageWaitTime) ||
    !isValidMetric(averageServiceTime) ||
    !isValidMetric(teamAverageWaitTime) ||
    !isValidMetric(teamAverageServiceTime) ||
    teamAverageWaitTime <= 0 ||
    teamAverageServiceTime <= 0
  ) {
    return STATUS_BY_TONE.unknown;
  }

  const waitRatio = averageWaitTime / teamAverageWaitTime;
  const serviceRatio = averageServiceTime / teamAverageServiceTime;
  const combinedRatio = (waitRatio + serviceRatio) / 2;

  if (combinedRatio <= 0.9 && waitRatio <= 1 && serviceRatio <= 1) {
    return STATUS_BY_TONE.good;
  }

  if (combinedRatio <= 1.08 && waitRatio <= 1.15 && serviceRatio <= 1.15) {
    return STATUS_BY_TONE.moderate;
  }

  return STATUS_BY_TONE["needs-attention"];
};

export const getPotentialRatingRange = (tone: OfficerPerformanceTone) => {
  if (tone === "good") {
    return "4.5 - 5.0";
  }

  if (tone === "moderate") {
    return "3.5 - 4.4";
  }

  if (tone === "needs-attention") {
    return "<= 3.4";
  }

  return "-";
};
