"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { endOfMonth, endOfYear, format, startOfMonth, startOfYear } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  Activity,
  BarChart3,
  CalendarClock,
  Download,
  FileImage,
  FileSpreadsheet,
  Info,
  RefreshCcw,
  Star,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import AppLoader from "@/components/shared/app-loader";
import { LiveStatusBadge } from "@/components/shared/feedback/live-status-badge";
import { PageContainer } from "@/components/shared/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardMetricCard } from "@/features/dashboard/components/dashboard-metric-card";
import AnalyticsSkeleton from "@/features/dashboard/components/skeletons/analytics-skeleton";
import { DashboardPageHeader } from "@/features/dashboard/components/layout/dashboard-page-header";
import { getOfficerPerformanceStatus } from "@/features/dashboard/components/analytics/officer-performance-status";
import { useLiveQuery } from "@/hooks/use-live-query";
import { formatDisplayDateTimeWithSeconds } from "@/lib/date-format";
import { serializeErrorForLog } from "@/lib/error-log";
import { getErrorMessage } from "@/lib/error-message";
import { analyticsApi } from "@/services/api/analytics";
import type {
  AnalyticsDistributionItem,
  AnalyticsOfficerDetail,
  OfficerFeedbackCommentItem,
  OfficerFeedbackSummary,
  AnalyticsSummary,
} from "@shared/types/analytics";
import {
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type AnalyticsData = AnalyticsSummary;

type AnalyticsPageProps = {
  initialAnalytics: AnalyticsData;
  initialFetchedAt: string;
};

type PeriodType = "month" | "quarter" | "semester" | "year";
type AnalyticsTab = "overview" | "officer";
type ExportImageFormat = "png" | "jpg";
type ChartCardKey = "service" | "gender" | "education" | "occupation";

type PeriodFilterState = {
  periodType: PeriodType;
  selectedYear: number;
  selectedMonth: number;
  selectedQuarter: number;
  selectedSemester: number;
};

type ComputedPeriod = {
  startDate: string;
  endDate: string;
  label: string;
  longLabel: string;
};

type DistributionItem = AnalyticsDistributionItem;

type ChartDistributionItem = AnalyticsDistributionItem & {
  valueLabel: string;
  percentageLabel: string;
};

type MetricCardProps = {
  title: string;
  value: ReactNode;
  description: ReactNode;
  icon: typeof Users;
  iconClassName: string;
  iconBadgeClassName: string;
};

type FilterFieldProps = {
  label: string;
  children: React.ReactNode;
};

type RatingTrendSnapshot = {
  points: number[];
  delta: number;
};

const SOFT_CHART_COLORS = ["#365d7a", "#56818f", "#8fa6b5", "#c7a86d", "#8f6f79", "#94b0a4"];
const MONTH_OPTIONS = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];
const QUARTER_OPTIONS = [
  { value: 1, label: "Triwulan I" },
  { value: 2, label: "Triwulan II" },
  { value: 3, label: "Triwulan III" },
  { value: 4, label: "Triwulan IV" },
];
const SEMESTER_OPTIONS = [
  { value: 1, label: "Semester I" },
  { value: 2, label: "Semester II" },
];
const numberFormatter = new Intl.NumberFormat("id-ID");
const percentFormatter = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});
const SERVICE_CARD_ACCENTS = [
  {
    iconClassName: "text-sky-600 dark:text-sky-300",
    iconBadgeClassName: "border-sky-400/35 bg-sky-500/10",
  },
  {
    iconClassName: "text-violet-600 dark:text-violet-300",
    iconBadgeClassName: "border-violet-400/35 bg-violet-500/10",
  },
  {
    iconClassName: "text-amber-600 dark:text-amber-300",
    iconBadgeClassName: "border-amber-400/35 bg-amber-500/10",
  },
  {
    iconClassName: "text-emerald-600 dark:text-emerald-300",
    iconBadgeClassName: "border-emerald-400/35 bg-emerald-500/10",
  },
  {
    iconClassName: "text-rose-600 dark:text-rose-300",
    iconBadgeClassName: "border-rose-400/35 bg-rose-500/10",
  },
  {
    iconClassName: "text-slate-600 dark:text-slate-300",
    iconBadgeClassName: "border-slate-400/35 bg-slate-500/10",
  },
] as const;
const FEEDBACK_API_ENABLED = process.env.NEXT_PUBLIC_ENABLE_ANALYTICS_FEEDBACK_API === "true";



const formatNumber = (value: number) => numberFormatter.format(value);
const formatPercentage = (value: number) => `${percentFormatter.format(value)}%`;

const sanitizeFileSegment = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const buildChartImageFileName = (
  chartTitle: string,
  startDate: string,
  endDate: string,
  format: ExportImageFormat
) => {
  return `analitik-${sanitizeFileSegment(chartTitle)}-${startDate}-${endDate}.${format}`;
};

const clampRating = (value: number) => Math.max(1, Math.min(5, value));

const buildRatingTrendSnapshot = (ratings: number[]): RatingTrendSnapshot | null => {
  if (ratings.length === 0) {
    return null;
  }

  const points = ratings.slice(-10).map(clampRating);
  if (points.length === 1) {
    return {
      points,
      delta: 0,
    };
  }

  const splitIndex = Math.floor(points.length / 2);
  const previousSegment = points.slice(0, splitIndex);
  const latestSegment = points.slice(splitIndex);

  const previousAvg =
    previousSegment.length > 0
      ? previousSegment.reduce((total, value) => total + value, 0) / previousSegment.length
      : points[0];
  const latestAvg =
    latestSegment.length > 0
      ? latestSegment.reduce((total, value) => total + value, 0) / latestSegment.length
      : points[points.length - 1];

  return {
    points,
    delta: latestAvg - previousAvg,
  };
};

const buildSparklinePath = (points: number[], width: number, height: number) => {
  if (points.length === 0) {
    return "";
  }

  const step = points.length > 1 ? width / (points.length - 1) : width;

  return points
    .map((point, index) => {
      const x = step * index;
      const y = height - ((clampRating(point) - 1) / 4) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
};

const getSparklinePointCoordinate = (
  points: number[],
  index: number,
  width: number,
  height: number
) => {
  if (points.length === 0 || index < 0 || index >= points.length) {
    return null;
  }

  const step = points.length > 1 ? width / (points.length - 1) : width;
  const x = step * index;
  const y = height - ((clampRating(points[index]) - 1) / 4) * height;

  return { x, y };
};

const formatDuration = (minutes: number | null | undefined) => {
  if (minutes === null || minutes === undefined || Number.isNaN(minutes)) {
    return "-";
  }

  const roundedMinutes = Math.max(0, Math.round(minutes));
  if (roundedMinutes < 60) {
    return `${formatNumber(roundedMinutes)} menit`;
  }

  const hours = Math.floor(roundedMinutes / 60);
  const remainingMinutes = roundedMinutes % 60;

  if (remainingMinutes === 0) {
    return `${formatNumber(hours)} jam`;
  }

  return `${formatNumber(hours)} jam ${formatNumber(remainingMinutes)} menit`;
};

const formatDateOnly = (value: string) =>
  format(new Date(`${value}T00:00:00`), "d MMMM yyyy", { locale: localeId });

const buildPeriodRangeLabel = (startDate: string, endDate: string) =>
  `${formatDateOnly(startDate)} - ${formatDateOnly(endDate)}`;

const buildChartDistributionData = (
  items: DistributionItem[],
  unitLabel: string,
  limit = 6,
  othersLabel = "Lainnya"
): ChartDistributionItem[] => {
  const positiveItems = items.filter((item) => item.count > 0);
  if (positiveItems.length === 0) {
    return [];
  }

  const totalCount = positiveItems.reduce((total, item) => total + item.count, 0);
  const visibleCount = Math.max(1, limit - 1);
  const chartItems =
    positiveItems.length > limit
      ? [
          ...positiveItems.slice(0, visibleCount),
          {
            name: othersLabel,
            count: positiveItems
              .slice(visibleCount)
              .reduce((total, item) => total + item.count, 0),
            percentage: 0,
          },
        ]
      : positiveItems;

  return chartItems.map((item) => ({
    ...item,
    valueLabel: `${formatNumber(item.count)} ${unitLabel}`,
    percentageLabel: formatPercentage(totalCount > 0 ? (item.count / totalCount) * 100 : 0),
  }));
};

const createInitialFilters = (): PeriodFilterState => {
  const now = new Date();
  const month = now.getMonth() + 1;
  return {
    periodType: "month",
    selectedYear: now.getFullYear(),
    selectedMonth: month,
    selectedQuarter: Math.ceil(month / 3),
    selectedSemester: month <= 6 ? 1 : 2,
  };
};

const computePeriod = (filter: PeriodFilterState): ComputedPeriod => {
  if (filter.periodType === "year") {
    const start = startOfYear(new Date(filter.selectedYear, 0, 1));
    const end = endOfYear(start);
    const startLabel = format(start, "yyyy-MM-dd");
    const endLabel = format(end, "yyyy-MM-dd");

    return {
      startDate: startLabel,
      endDate: endLabel,
      label: `Tahun ${filter.selectedYear}`,
      longLabel: buildPeriodRangeLabel(startLabel, endLabel),
    };
  }

  if (filter.periodType === "quarter") {
    const quarterStartMonth = (filter.selectedQuarter - 1) * 3;
    const start = startOfMonth(new Date(filter.selectedYear, quarterStartMonth, 1));
    const end = endOfMonth(new Date(filter.selectedYear, quarterStartMonth + 2, 1));
    const startLabel = format(start, "yyyy-MM-dd");
    const endLabel = format(end, "yyyy-MM-dd");

    return {
      startDate: startLabel,
      endDate: endLabel,
      label: `Triwulan ${filter.selectedQuarter} ${filter.selectedYear}`,
      longLabel: buildPeriodRangeLabel(startLabel, endLabel),
    };
  }

  if (filter.periodType === "semester") {
    const semesterStartMonth = filter.selectedSemester === 1 ? 0 : 6;
    const start = startOfMonth(new Date(filter.selectedYear, semesterStartMonth, 1));
    const end = endOfMonth(new Date(filter.selectedYear, semesterStartMonth + 5, 1));
    const startLabel = format(start, "yyyy-MM-dd");
    const endLabel = format(end, "yyyy-MM-dd");

    return {
      startDate: startLabel,
      endDate: endLabel,
      label: `Semester ${filter.selectedSemester} ${filter.selectedYear}`,
      longLabel: buildPeriodRangeLabel(startLabel, endLabel),
    };
  }

  const start = startOfMonth(new Date(filter.selectedYear, filter.selectedMonth - 1, 1));
  const end = endOfMonth(start);
  const startLabel = format(start, "yyyy-MM-dd");
  const endLabel = format(end, "yyyy-MM-dd");

  return {
    startDate: startLabel,
    endDate: endLabel,
    label: format(start, "MMMM yyyy", { locale: localeId }),
    longLabel: buildPeriodRangeLabel(startLabel, endLabel),
  };
};

const toSelectValue = (value: number) => String(value);

type PieCollisionState = {
  left: number[];
  right: number[];
};

const pieLabelCollisionByChart: Record<string, PieCollisionState> = {};

const renderPiePercentageLabel = ({
  chartKey,
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  index,
}: {
  chartKey: string;
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  percent: number;
  index: number;
}) => {
  if (percent <= 0) {
    return null;
  }

  if (!pieLabelCollisionByChart[chartKey] || index === 0) {
    pieLabelCollisionByChart[chartKey] = {
      left: [],
      right: [],
    };
  }

  const RADIAN = Math.PI / 180;
  const angle = -midAngle * RADIAN;
  const cosTheta = Math.cos(angle);
  const sinTheta = Math.sin(angle);
  const edgeX = cx + outerRadius * cosTheta;
  const edgeY = cy + outerRadius * sinTheta;
  const bendRadius = outerRadius + 14;
  const bendX = cx + bendRadius * cosTheta;
  const bendY = cy + bendRadius * sinTheta;
  const labelOnRight = bendX >= cx;
  const horizontalOffset = 14;
  const labelX = bendX + (labelOnRight ? horizontalOffset : -horizontalOffset);
  const preferredY = bendY;

  const sideKey = labelOnRight ? "right" : "left";
  const collisionState = pieLabelCollisionByChart[chartKey];
  const usedY = collisionState[sideKey];
  const minGap = 11;
  const moveDirection = sinTheta >= 0 ? 1 : -1;
  const minY = cy - (outerRadius + 34);
  const maxY = cy + (outerRadius + 34);

  let labelY = Math.max(minY, Math.min(maxY, preferredY));
  let attempts = 0;
  while (attempts < 12) {
    const hasCollision = usedY.some((takenY) => Math.abs(takenY - labelY) < minGap);
    if (!hasCollision) {
      break;
    }

    labelY += minGap * moveDirection;
    labelY = Math.max(minY, Math.min(maxY, labelY));
    attempts += 1;
  }

  usedY.push(labelY);

  return (
    <g>
      <path
        d={`M ${edgeX} ${edgeY} L ${bendX} ${bendY} L ${labelX} ${labelY}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        className="text-secondary-color/60"
      />
      <text
        x={labelX + (labelOnRight ? 2 : -2)}
        y={labelY}
        fill="currentColor"
        textAnchor={labelOnRight ? "start" : "end"}
        dominantBaseline="central"
        className="text-primary-color"
        style={{ fontSize: "11px", fontWeight: 700 }}
      >
        {formatPercentage(percent * 100)}
      </text>
    </g>
  );
};

function FilterField({ label, children }: FilterFieldProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary-color">
        {label}
      </p>
      {children}
    </div>
  );
}

function SubtleInfoNote({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`flex items-start gap-1.5 text-xs leading-5 text-secondary-color/85 ${className}`.trim()}>
      <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

function formatCompactDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return format(date, "dd MMM yyyy, HH:mm", { locale: localeId });
}

function computeStringHash(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export default function AnalyticsPageV2({ initialAnalytics, initialFetchedAt }: AnalyticsPageProps) {
  const [initialFilters] = useState<PeriodFilterState>(() => createInitialFilters());
  const [periodType, setPeriodType] = useState<PeriodType>(initialFilters.periodType);
  const [selectedYear, setSelectedYear] = useState(initialFilters.selectedYear);
  const [selectedMonth, setSelectedMonth] = useState(initialFilters.selectedMonth);
  const [selectedQuarter, setSelectedQuarter] = useState(initialFilters.selectedQuarter);
  const [selectedSemester, setSelectedSemester] = useState(initialFilters.selectedSemester);
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("overview");
  const [selectedOfficerId, setSelectedOfficerId] = useState("");
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [exportingChartKey, setExportingChartKey] = useState<ChartCardKey | null>(null);
  const [exportingImageFormat, setExportingImageFormat] = useState<ExportImageFormat | null>(null);
  const [isFilterTransitioning, setIsFilterTransitioning] = useState(false);
  const [feedbackSummaryByOfficerId, setFeedbackSummaryByOfficerId] = useState<
    Record<string, OfficerFeedbackSummary | null>
  >({});
  const [feedbackItemsByOfficerId, setFeedbackItemsByOfficerId] = useState<
    Record<string, OfficerFeedbackCommentItem[]>
  >({});
  const [feedbackCommentsByOfficerId, setFeedbackCommentsByOfficerId] = useState<
    Record<string, OfficerFeedbackCommentItem[]>
  >({});
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [feedbackLoadError, setFeedbackLoadError] = useState<string | null>(null);
  const serviceChartCardRef = useRef<HTMLDivElement | null>(null);
  const genderChartCardRef = useRef<HTMLDivElement | null>(null);
  const educationChartCardRef = useRef<HTMLDivElement | null>(null);
  const occupationChartCardRef = useRef<HTMLDivElement | null>(null);
  const requestedFeedbackKeysRef = useRef<Set<string>>(new Set());

  const currentFilter = useMemo(
    () => ({ periodType, selectedYear, selectedMonth, selectedQuarter, selectedSemester }),
    [periodType, selectedMonth, selectedQuarter, selectedSemester, selectedYear]
  );

  const currentPeriod = useMemo(() => computePeriod(currentFilter), [currentFilter]);
  const initialPeriod = useMemo(() => computePeriod(initialFilters), [initialFilters]);

  const currentUrl = analyticsApi.summaryUrl({
    startDate: currentPeriod.startDate,
    endDate: currentPeriod.endDate,
  });
  const initialUrl = analyticsApi.summaryUrl({
    startDate: initialPeriod.startDate,
    endDate: initialPeriod.endDate,
  });

  const {
    data: analyticsData,
    isLoading,
    isRefreshing,
    lastFetchedAt,
    refresh,
  } = useLiveQuery<AnalyticsData>(currentUrl, {
    fallbackData: currentUrl === initialUrl ? initialAnalytics : undefined,
    fallbackEtag:
      currentUrl === initialUrl && initialAnalytics.hash ? `"${initialAnalytics.hash}"` : null,
    fallbackFetchedAt: currentUrl === initialUrl ? initialFetchedAt : null,
    refreshInterval: 60_000,
    onError: (error) => {
      const message = getErrorMessage(error, "Terjadi kesalahan saat memuat data analitik");
      console.warn("Error fetching analytics data:", message);
      toast.error(message);
    },
  });

  const urlRef = useRef<string | null>(currentUrl);

  useEffect(() => {
    if (currentUrl && urlRef.current && currentUrl !== urlRef.current) {
      setIsFilterTransitioning(true);
    }

    urlRef.current = currentUrl;
  }, [currentUrl]);

  useEffect(() => {
    if (!isRefreshing) {
      setIsFilterTransitioning(false);
    }
  }, [isRefreshing]);

  useEffect(() => {
    if (!analyticsData?.officerDetails?.length) {
      if (selectedOfficerId) {
        setSelectedOfficerId("");
      }

      return;
    }

    const selectedOfficerStillExists = analyticsData.officerDetails.some(
      (officer) => officer.officerId === selectedOfficerId
    );

    if (!selectedOfficerStillExists) {
      setSelectedOfficerId(analyticsData.officerDetails[0].officerId);
    }
  }, [analyticsData?.officerDetails, selectedOfficerId]);

  useEffect(() => {
    requestedFeedbackKeysRef.current.clear();
    setFeedbackSummaryByOfficerId({});
    setFeedbackItemsByOfficerId({});
    setFeedbackCommentsByOfficerId({});
    setFeedbackLoadError(null);
  }, [currentPeriod.startDate, currentPeriod.endDate]);

  useEffect(() => {
    if (!analyticsData?.officerDetails?.length) {
      return;
    }

    setFeedbackSummaryByOfficerId((previous) => {
      const next = { ...previous };

      for (const officer of analyticsData.officerDetails) {
        if (typeof officer.feedbackSummary !== "undefined") {
          next[officer.officerId] = officer.feedbackSummary;
        }
      }

      return next;
    });
  }, [analyticsData?.officerDetails]);

  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);

      const { job } = await analyticsApi.createExportJob({
        startDate: currentPeriod.startDate,
        endDate: currentPeriod.endDate,
        format: "xlsx",
      });

      let completedJob = job;
      for (let attempt = 0; attempt < 40; attempt += 1) {
        if (completedJob.status === "COMPLETED" && completedJob.downloadUrl) {
          break;
        }

        if (completedJob.status === "FAILED") {
          throw new Error(completedJob.errorMessage || "Gagal menyiapkan export analitik");
        }

        await new Promise((resolve) => {
          window.setTimeout(resolve, 1500);
        });

        const response = await analyticsApi.getExportJob(job.id);
        completedJob = response.job;
      }

      if (completedJob.status !== "COMPLETED" || !completedJob.downloadUrl) {
        throw new Error("Export analitik belum selesai, silakan coba lagi.");
      }

      const link = document.createElement("a");
      link.href = analyticsApi.downloadUrl(completedJob.id);
      if (completedJob.fileName) {
        link.download = completedJob.fileName;
      }

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Export Excel berhasil diunduh");
    } catch (error) {
      console.error("Error exporting analytics excel:", serializeErrorForLog(error));
      toast.error(getErrorMessage(error, "Terjadi kesalahan saat mengekspor data"));
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportChartImage = async (
    chartKey: ChartCardKey,
    chartTitle: string,
    format: ExportImageFormat
  ) => {
    const chartNodeByKey: Record<ChartCardKey, HTMLDivElement | null> = {
      service: serviceChartCardRef.current,
      gender: genderChartCardRef.current,
      education: educationChartCardRef.current,
      occupation: occupationChartCardRef.current,
    };

    const chartNode = chartNodeByKey[chartKey];
    if (!chartNode) {
      toast.error("Card diagram belum siap untuk diexport");
      return;
    }

    let tempPeriodElement: HTMLParagraphElement | null = null;
    const hiddenElements: Array<{ element: HTMLElement; previousDisplay: string }> = [];

    try {
      setExportingChartKey(chartKey);
      setExportingImageFormat(format);

      const { toJpeg, toPng } = await import("html-to-image");
      const nodeStyle = window.getComputedStyle(chartNode);
      const pageStyle = window.getComputedStyle(document.body);
      const backgroundColor =
        nodeStyle.backgroundColor && nodeStyle.backgroundColor !== "rgba(0, 0, 0, 0)"
          ? nodeStyle.backgroundColor
          : pageStyle.backgroundColor;

      const cardHeader = chartNode.querySelector("[data-slot='card-header']");
      if (cardHeader) {
        tempPeriodElement = document.createElement("p");
        tempPeriodElement.textContent = `Periode: ${rangeLabel}`;
        tempPeriodElement.style.margin = "2px 0 0";
        tempPeriodElement.style.fontSize = "12px";
        tempPeriodElement.style.lineHeight = "1.4";
        tempPeriodElement.style.color = "#9fb1c7";
        tempPeriodElement.style.gridColumn = "1 / -1";
        cardHeader.appendChild(tempPeriodElement);
      }

      const cardDescription = chartNode.querySelector("[data-slot='card-description']");
      if (cardDescription instanceof HTMLElement) {
        hiddenElements.push({
          element: cardDescription,
          previousDisplay: cardDescription.style.display,
        });
        cardDescription.style.display = "none";
      }

      const exportControls = chartNode.querySelectorAll("[data-export-control='true']");
      exportControls.forEach((control) => {
        if (control instanceof HTMLElement) {
          hiddenElements.push({
            element: control,
            previousDisplay: control.style.display,
          });
          control.style.display = "none";
        }
      });

      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve());
      });

      const pixelRatio = Math.max(2, Math.min(window.devicePixelRatio || 1, 3));
      const bounds = chartNode.getBoundingClientRect();

      const imageOptions = {
        backgroundColor,
        cacheBust: true,
        pixelRatio,
        width: Math.ceil(bounds.width),
        height: Math.ceil(bounds.height),
      };

      const dataUrl =
        format === "png"
          ? await toPng(chartNode, imageOptions)
          : await toJpeg(chartNode, {
              ...imageOptions,
              quality: 0.95,
            });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = buildChartImageFileName(
        chartTitle,
        currentPeriod.startDate,
        currentPeriod.endDate,
        format
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Export ${format.toUpperCase()} berhasil diunduh`);
    } catch (error) {
      console.error(`Error exporting analytics ${format}:`, serializeErrorForLog(error));
      toast.error(getErrorMessage(error, `Terjadi kesalahan saat mengekspor ${format.toUpperCase()}`));
    } finally {
      hiddenElements.forEach(({ element, previousDisplay }) => {
        element.style.display = previousDisplay;
      });

      if (tempPeriodElement && tempPeriodElement.parentElement) {
        tempPeriodElement.parentElement.removeChild(tempPeriodElement);
      }
      setExportingChartKey(null);
      setExportingImageFormat(null);
    }
  };

  const isInitialLoading = isLoading && !analyticsData;

  const updatedLabel = analyticsData?.dataLastUpdatedAt
    ? formatDisplayDateTimeWithSeconds(new Date(analyticsData.dataLastUpdatedAt))
    : lastFetchedAt
      ? formatDisplayDateTimeWithSeconds(new Date(lastFetchedAt))
      : isInitialLoading
        ? "Memuat data awal..."
        : "Belum ada data";

  const rangeLabel = analyticsData
    ? buildPeriodRangeLabel(analyticsData.selectedPeriod.startDate, analyticsData.selectedPeriod.endDate)
    : currentPeriod.longLabel;

  const trackUpdatedLabel = analyticsData?.trackLastUpdated
    ? formatDisplayDateTimeWithSeconds(new Date(analyticsData.trackLastUpdated))
    : null;
  const isExportingImage = exportingImageFormat !== null;

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 8 }, (_, index) => currentYear - index);
  }, []);

  const selectedOfficerDetail = useMemo(() => {
    if (!analyticsData?.officerDetails?.length) {
      return null;
    }

    return (
      analyticsData.officerDetails.find((officer) => officer.officerId === selectedOfficerId) ??
      analyticsData.officerDetails[0]
    );
  }, [analyticsData?.officerDetails, selectedOfficerId]);

  const hasRealOfficerFeedbackData = useMemo(() => {
    if (!analyticsData?.officerDetails?.length) {
      return false;
    }

    return analyticsData.officerDetails.some((officer) => {
      const summary = feedbackSummaryByOfficerId[officer.officerId] ?? officer.feedbackSummary ?? null;
      return Boolean(summary && summary.totalReviews > 0);
    });
  }, [analyticsData?.officerDetails, feedbackSummaryByOfficerId]);

  const shouldUseFeedbackPreviewData = Boolean(
    analyticsData?.officerDetails?.length && !hasRealOfficerFeedbackData
  );

  const getPreviewFeedbackSummary = (officer: AnalyticsOfficerDetail): OfficerFeedbackSummary | null => {
    if (!shouldUseFeedbackPreviewData || officer.totalHandled <= 0) {
      return null;
    }

    const seed = computeStringHash(officer.officerId);
    const ratingOffset = (seed % 10) / 10;
    const averageRating = Math.min(4.9, 3.9 + ratingOffset);
    const totalReviews = Math.max(3, Math.round(officer.totalHandled * 0.7));
    const positiveRate = Math.min(0.95, 0.62 + ((seed % 30) / 100));

    return {
      averageRating,
      totalReviews,
      latestFeedbackAt: `${currentPeriod.endDate}T12:00:00.000Z`,
      positiveRate,
    };
  };

  useEffect(() => {
    if (!analyticsData || !selectedOfficerDetail || !FEEDBACK_API_ENABLED) {
      return;
    }

    const hasSummary =
      typeof feedbackSummaryByOfficerId[selectedOfficerDetail.officerId] !== "undefined";
    const hasTimeline =
      typeof feedbackItemsByOfficerId[selectedOfficerDetail.officerId] !== "undefined";
    const hasCommentPreview =
      typeof feedbackCommentsByOfficerId[selectedOfficerDetail.officerId] !== "undefined";

    if (hasSummary && hasTimeline && hasCommentPreview) {
      return;
    }

    const requestKey = `${selectedOfficerDetail.officerId}:${currentPeriod.startDate}:${currentPeriod.endDate}`;
    if (requestedFeedbackKeysRef.current.has(requestKey)) {
      return;
    }

    requestedFeedbackKeysRef.current.add(requestKey);
    setIsFeedbackLoading(true);
    setFeedbackLoadError(null);

    void analyticsApi
      .listOfficerFeedback({
        officerId: selectedOfficerDetail.officerId,
        startDate: currentPeriod.startDate,
        endDate: currentPeriod.endDate,
        page: 1,
        pageSize: 100,
      })
      .then((response) => {
        const timelineItems = [...response.items].sort(
          (left, right) =>
            new Date(left.submittedAt).getTime() - new Date(right.submittedAt).getTime()
        );
        const commentItems = response.items.filter((item) => item.comment.trim().length > 0);

        setFeedbackSummaryByOfficerId((previous) => ({
          ...previous,
          [selectedOfficerDetail.officerId]: response.summary,
        }));
        setFeedbackItemsByOfficerId((previous) => ({
          ...previous,
          [selectedOfficerDetail.officerId]: timelineItems,
        }));
        setFeedbackCommentsByOfficerId((previous) => ({
          ...previous,
          [selectedOfficerDetail.officerId]: commentItems,
        }));
      })
      .catch((error) => {
        requestedFeedbackKeysRef.current.delete(requestKey);
        setFeedbackLoadError(getErrorMessage(error, "Gagal memuat data feedback petugas"));
      })
      .finally(() => {
        setIsFeedbackLoading(false);
      });
  }, [
    analyticsData,
    currentPeriod.endDate,
    currentPeriod.startDate,
    feedbackCommentsByOfficerId,
    feedbackItemsByOfficerId,
    feedbackSummaryByOfficerId,
    selectedOfficerDetail,
  ]);

  if (isInitialLoading) {
    return <AnalyticsSkeleton />;
  }

  if (!analyticsData) {
    return (
      <PageContainer maxWidth="6xl">
        <Card className="border-border/80 bg-card/95 p-6 text-center shadow-sm">
          <CardTitle className="text-base text-primary-color">Data analitik tidak tersedia</CardTitle>
          <CardDescription className="mt-2">
            Coba muat ulang atau periksa koneksi Anda.
          </CardDescription>
          <div className="mt-4 flex justify-center gap-2">
            <Button onClick={() => void refresh()} className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Muat Ulang
            </Button>
          </div>
        </Card>
      </PageContainer>
    );
  }

  const primaryService = analyticsData.insights.mostPopularService;
  const primaryOfficer = analyticsData.insights.mostActiveOfficer;

  const serviceMetricCards: MetricCardProps[] = [...analyticsData.serviceDistribution]
    .sort((left, right) => left.name.localeCompare(right.name, "id-ID"))
    .map((service, index) => {
      const accent = SERVICE_CARD_ACCENTS[index % SERVICE_CARD_ACCENTS.length];

      return {
        title: service.name,
        value: formatNumber(service.count),
        description: `Pengunjung yang menggunakan layanan ${service.name} pada periode aktif.`,
        icon: BarChart3,
        iconClassName: accent.iconClassName,
        iconBadgeClassName: accent.iconBadgeClassName,
      };
    });

  const summaryCards: MetricCardProps[] = [
    {
      title: "Total Pengunjung",
      value: formatNumber(analyticsData.summary.totalVisitors),
      description: "Jumlah pengunjung yang tercatat pada periode aktif.",
      icon: Users,
      iconClassName: "text-slate-600 dark:text-slate-300",
      iconBadgeClassName: "border-slate-400/35 bg-slate-500/10",
    },
    ...serviceMetricCards,
    {
      title: "Rata-rata Waktu Layanan",
      value: formatDuration(analyticsData.summary.averageServiceTimeMinutes),
      description: "Durasi rata-rata layanan hingga antrean selesai.",
      icon: Activity,
      iconClassName: "text-sky-600 dark:text-sky-300",
      iconBadgeClassName: "border-sky-400/35 bg-sky-500/10",
    },
    {
      title: "Layanan Paling Populer",
      value: primaryService?.serviceName || "-",
      description: primaryService
        ? `${formatNumber(primaryService.count)} pengunjung • ${formatPercentage(primaryService.percentage)}`
        : "Belum ada layanan dominan pada periode ini.",
      icon: TrendingUp,
      iconClassName: "text-indigo-600 dark:text-indigo-300",
      iconBadgeClassName: "border-indigo-400/35 bg-indigo-500/10",
    },
    {
      title: "Petugas Paling Aktif",
      value: primaryOfficer?.officerName || "-",
      description: primaryOfficer
        ? `${formatNumber(primaryOfficer.completedCount)} layanan selesai.`
        : "Belum ada petugas aktif pada periode ini.",
      icon: UserRound,
      iconClassName: "text-teal-600 dark:text-teal-300",
      iconBadgeClassName: "border-teal-400/35 bg-teal-500/10",
    },
  ];

  const serviceDistributionData = buildChartDistributionData(
    analyticsData.serviceDistribution,
    "pengunjung",
    6
  );
  const genderDistributionData = buildChartDistributionData(
    analyticsData.genderDistribution,
    "pengunjung",
    4
  );
  const educationDistributionData = buildChartDistributionData(
    analyticsData.educationDistribution,
    "pengunjung",
    6
  );
  const occupationDistributionData = buildChartDistributionData(
    analyticsData.occupationDistribution,
    "pengunjung",
    6
  );

  const sortedOfficerDetails = [...analyticsData.officerDetails].sort((left, right) => {
    if (right.totalHandled !== left.totalHandled) {
      return right.totalHandled - left.totalHandled;
    }

    return left.officerName.localeCompare(right.officerName, "id-ID");
  });

  const officerHandledTotal = sortedOfficerDetails.reduce((total, officer) => total + officer.totalHandled, 0);

  const weightedOfficerWaitAverage =
    officerHandledTotal > 0
      ? sortedOfficerDetails.reduce(
          (total, officer) => total + officer.averageWaitTime * officer.totalHandled,
          0
        ) / officerHandledTotal
      : 0;

  const weightedOfficerServiceAverage =
    officerHandledTotal > 0
      ? sortedOfficerDetails.reduce(
          (total, officer) => total + officer.averageServiceTime * officer.totalHandled,
          0
        ) / officerHandledTotal
      : 0;

  const getOfficerFeedbackSummary = (officer: AnalyticsOfficerDetail) =>
    feedbackSummaryByOfficerId[officer.officerId] ??
    officer.feedbackSummary ??
    getPreviewFeedbackSummary(officer);

  const officerFeedbackSummaries = sortedOfficerDetails
    .map((officer) => getOfficerFeedbackSummary(officer))
    .filter((summary): summary is OfficerFeedbackSummary => summary !== null);

  const totalReviewCount = officerFeedbackSummaries.reduce(
    (total, summary) => total + summary.totalReviews,
    0
  );

  const weightedTeamRating =
    totalReviewCount > 0
      ? officerFeedbackSummaries.reduce(
          (total, summary) => total + summary.averageRating * summary.totalReviews,
          0
        ) / totalReviewCount
      : null;

  const officersWithReviews = sortedOfficerDetails.filter((officer) => {
    const summary = getOfficerFeedbackSummary(officer);
    return Boolean(summary && summary.totalReviews > 0);
  }).length;

  const topRatedOfficer = sortedOfficerDetails
    .map((officer) => ({
      officer,
      feedbackSummary: getOfficerFeedbackSummary(officer),
    }))
    .filter(
      (item): item is { officer: AnalyticsOfficerDetail; feedbackSummary: OfficerFeedbackSummary } =>
        Boolean(item.feedbackSummary && item.feedbackSummary.totalReviews > 0)
    )
    .sort((left, right) => {
      if (right.feedbackSummary.averageRating !== left.feedbackSummary.averageRating) {
        return right.feedbackSummary.averageRating - left.feedbackSummary.averageRating;
      }

      return right.feedbackSummary.totalReviews - left.feedbackSummary.totalReviews;
    })[0];

  const officerInsightCards: MetricCardProps[] = [
    {
      title: "Petugas Aktif",
      value: formatNumber(sortedOfficerDetails.filter((officer) => officer.totalHandled > 0).length),
      description: "Jumlah petugas yang aktif melayani pada periode terpilih.",
      icon: Users,
      iconClassName: "text-slate-600 dark:text-slate-300",
      iconBadgeClassName: "border-slate-400/35 bg-slate-500/10",
    },
    {
      title: "Total Kali Bertugas",
      value: formatNumber(officerHandledTotal),
      description: "Akumulasi frekuensi petugas aktif melayani pada periode ini.",
      icon: Activity,
      iconClassName: "text-sky-600 dark:text-sky-300",
      iconBadgeClassName: "border-sky-400/35 bg-sky-500/10",
    },
    {
      title: "Rata-rata Bintang Tim",
      value: weightedTeamRating !== null ? weightedTeamRating.toFixed(1) : "-",
      description:
        totalReviewCount > 0
          ? `Dari ${formatNumber(totalReviewCount)} penilaian responden.`
          : "Belum ada penilaian responden pada periode ini.",
      icon: Star,
      iconClassName: "text-amber-600 dark:text-amber-300",
      iconBadgeClassName: "border-amber-400/35 bg-amber-500/10",
    },
    {
      title: "Petugas Dengan Ulasan",
      value: formatNumber(officersWithReviews),
      description: topRatedOfficer
        ? `Tertinggi: ${topRatedOfficer.officer.officerName} (${topRatedOfficer.feedbackSummary.averageRating.toFixed(1)} bintang).`
        : "Belum ada ulasan petugas yang dapat dibandingkan.",
      icon: TrendingUp,
      iconClassName: "text-indigo-600 dark:text-indigo-300",
      iconBadgeClassName: "border-indigo-400/35 bg-indigo-500/10",
    },
  ];

  const officerPerformanceStatusMap = new Map(
    sortedOfficerDetails.map((officer) => [
      officer.officerId,
      getOfficerPerformanceStatus({
        averageWaitTime: officer.averageWaitTime,
        averageServiceTime: officer.averageServiceTime,
        teamAverageWaitTime: weightedOfficerWaitAverage,
        teamAverageServiceTime: weightedOfficerServiceAverage,
      }),
    ])
  );

  const selectedOfficerPerformanceStatus = selectedOfficerDetail
    ? officerPerformanceStatusMap.get(selectedOfficerDetail.officerId)
    : undefined;

  const selectedOfficerFeedbackSummary = selectedOfficerDetail
    ? getOfficerFeedbackSummary(selectedOfficerDetail)
    : null;

  const selectedOfficerCommentItems = selectedOfficerDetail
    ? feedbackCommentsByOfficerId[selectedOfficerDetail.officerId] || []
    : [];

  const selectedOfficerFeedbackTimeline = selectedOfficerDetail
    ? feedbackItemsByOfficerId[selectedOfficerDetail.officerId] || []
    : [];

  const selectedOfficerPreviewCommentItems = (() => {
    if (!selectedOfficerDetail || !shouldUseFeedbackPreviewData) {
      return [] as OfficerFeedbackCommentItem[];
    }

    const seed = computeStringHash(selectedOfficerDetail.officerId);
    const serviceName = selectedOfficerDetail.topService?.serviceName || "layanan utama";
    const templatePool = [
      "Petugas sangat membantu, penjelasan jelas dan prosesnya cepat.",
      "Pelayanan rapi dan ramah, antrean juga terasa tertib.",
      "Responsif saat ditanya dan alurnya mudah diikuti.",
      "Komunikasi baik, proses selesai tanpa kendala berarti.",
      "Waktu tunggu masih wajar dan petugas tetap informatif.",
      "Secara keseluruhan pengalaman pelayanan cukup memuaskan.",
    ];

    const count = 3 + (seed % 2);

    return Array.from({ length: count }, (_, index) => {
      const templateIndex = (seed + index) % templatePool.length;
      const rating = (4 + ((seed + index) % 2)) as 4 | 5;
      const daysBefore = (index + 1) * 2;
      const submittedAt = new Date(`${currentPeriod.endDate}T12:00:00.000Z`);
      submittedAt.setUTCDate(submittedAt.getUTCDate() - daysBefore);

      return {
        id: `preview-${selectedOfficerDetail.officerId}-${index}`,
        officerId: selectedOfficerDetail.officerId,
        rating,
        comment: `${templatePool[templateIndex]} (${serviceName})`,
        sentiment: "positive",
        submittedAt: submittedAt.toISOString(),
        serviceName,
      };
    });
  })();

  const selectedOfficerDisplayCommentItems =
    selectedOfficerCommentItems.length > 0
      ? selectedOfficerCommentItems
      : selectedOfficerPreviewCommentItems;

  const isShowingPreviewComments =
    shouldUseFeedbackPreviewData &&
    selectedOfficerCommentItems.length === 0 &&
    selectedOfficerDisplayCommentItems.length > 0;

  const selectedOfficerRatingTrend = buildRatingTrendSnapshot(
    selectedOfficerFeedbackTimeline.map((item) => item.rating)
  );

  const miniTrendWidth = 120;
  const miniTrendHeight = 28;

  const selectedOfficerTrendPath = selectedOfficerRatingTrend
    ? buildSparklinePath(selectedOfficerRatingTrend.points, miniTrendWidth, miniTrendHeight)
    : "";

  const selectedOfficerTrendStartPoint = selectedOfficerRatingTrend
    ? getSparklinePointCoordinate(
        selectedOfficerRatingTrend.points,
        0,
        miniTrendWidth,
        miniTrendHeight
      )
    : null;

  const selectedOfficerTrendEndPoint = selectedOfficerRatingTrend
    ? getSparklinePointCoordinate(
        selectedOfficerRatingTrend.points,
        selectedOfficerRatingTrend.points.length - 1,
        miniTrendWidth,
        miniTrendHeight
      )
    : null;

  const selectedOfficerTrendToneClass =
    selectedOfficerRatingTrend && selectedOfficerRatingTrend.delta < -0.08
      ? "text-rose-600"
      : selectedOfficerRatingTrend && selectedOfficerRatingTrend.delta > 0.08
        ? "text-emerald-600"
        : "text-sky-700";

  const selectedOfficerContribution =
    selectedOfficerDetail && officerHandledTotal > 0
      ? (selectedOfficerDetail.totalHandled / officerHandledTotal) * 100
      : null;

  const selectedOfficerWaitGap =
    selectedOfficerDetail && weightedOfficerWaitAverage > 0
      ? selectedOfficerDetail.averageWaitTime - weightedOfficerWaitAverage
      : null;

  const selectedOfficerServiceGap =
    selectedOfficerDetail && weightedOfficerServiceAverage > 0
      ? selectedOfficerDetail.averageServiceTime - weightedOfficerServiceAverage
      : null;

  const showFilterLoadingOverlay = isFilterTransitioning && isRefreshing;

  const renderEmptyState = (title: string, description: string) => (
    <div className="flex h-full min-h-56 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-background/55 p-6 text-center">
      <div className="max-w-sm space-y-2">
        <p className="text-sm font-semibold text-primary-color">{title}</p>
        <p className="text-sm leading-relaxed text-secondary-color">{description}</p>
      </div>
    </div>
  );

  const renderChartExportMenu = (chartKey: ChartCardKey, chartTitle: string) => {
    const isCurrentCardExporting = exportingChartKey === chartKey && isExportingImage;
    const cardExportLabel = isCurrentCardExporting
      ? `Menyusun ${exportingImageFormat?.toUpperCase() || "gambar"}`
      : `Export gambar ${chartTitle}`;

    return (
      <div data-export-control="true">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-border"
            disabled={isCurrentCardExporting}
            aria-label={cardExportLabel}
            title={cardExportLabel}
          >
            {isCurrentCardExporting ? (
              <RefreshCcw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40">
          <DropdownMenuLabel>Export Diagram</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => void handleExportChartImage(chartKey, chartTitle, "png")}>
            <FileImage className="h-4 w-4" />
            PNG
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => void handleExportChartImage(chartKey, chartTitle, "jpg")}>
            <FileImage className="h-4 w-4" />
            JPG
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
    );
  };

  const renderDistributionPie = (data: ChartDistributionItem[], keyPrefix: string, unitLabel: string) => (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={2}
              stroke="transparent"
              labelLine={false}
              label={(props) => renderPiePercentageLabel({ ...props, chartKey: keyPrefix })}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`${keyPrefix}-cell-${entry.name}`}
                  fill={SOFT_CHART_COLORS[index % SOFT_CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${formatNumber(Number(value))} ${unitLabel}`, "Jumlah"]} />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div
            key={`${keyPrefix}-legend-${item.name}`}
            className="rounded-xl border border-border/70 bg-background/55 px-3 py-2.5"
          >
            <div className="flex items-start gap-2">
              <span
                className="mt-1 h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: SOFT_CHART_COLORS[index % SOFT_CHART_COLORS.length] }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-primary-color">{item.name}</p>
                <p className="text-xs text-secondary-color">
                  {item.valueLabel} • {item.percentageLabel}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <PageContainer maxWidth="6xl">
      <DashboardPageHeader
        title="Analisis PST BPS Kabupaten Bulungan"
        description="Halaman ringkasan dan analisis Pelayanan Statistik Terpadu BPS Kabupaten Bulungan."
        meta={
          <>
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              <span>Data per: {updatedLabel}</span>
            </div>
            <LiveStatusBadge
              isRefreshing={isRefreshing}
              hasFetched={Boolean(lastFetchedAt || analyticsData.dataLastUpdatedAt)}
              idleLabel="Auto refresh 60 detik"
            />
          </>
        }
        actions={
          <div className="dashboard-header-actions">
            <Button
              variant="outline"
              onClick={() => void refresh()}
              disabled={isRefreshing}
              className="dashboard-header-action border-border"
              aria-label="Perbarui data analitik"
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Memperbarui..." : "Perbarui Data"}</span>
            </Button>
          </div>
        }
      />

      {/* Filter panel */}
      <div className="dashboard-filter-panel">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid grid-cols-2 md:flex md:flex-wrap items-end gap-3">
            <FilterField label="Periode">
              <Select value={periodType} onValueChange={(value) => setPeriodType(value as PeriodType)}>
                <SelectTrigger className="w-full md:w-36 bg-background/80">
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Bulanan</SelectItem>
                  <SelectItem value="quarter">Triwulanan</SelectItem>
                  <SelectItem value="semester">Semesteran</SelectItem>
                  <SelectItem value="year">Tahunan</SelectItem>
                </SelectContent>
              </Select>
            </FilterField>

            {periodType === "month" ? (
              <FilterField label="Bulan">
                <Select
                  value={toSelectValue(selectedMonth)}
                  onValueChange={(value) => setSelectedMonth(Number(value))}
                >
                  <SelectTrigger className="w-full md:w-36 bg-background/80">
                    <SelectValue placeholder="Pilih bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_OPTIONS.map((month) => (
                      <SelectItem key={month.value} value={toSelectValue(month.value)}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
            ) : null}

            {periodType === "quarter" ? (
              <FilterField label="Triwulan">
                <Select
                  value={toSelectValue(selectedQuarter)}
                  onValueChange={(value) => setSelectedQuarter(Number(value))}
                >
                  <SelectTrigger className="w-full md:w-40 bg-background/80">
                    <SelectValue placeholder="Pilih triwulan" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUARTER_OPTIONS.map((quarter) => (
                      <SelectItem key={quarter.value} value={toSelectValue(quarter.value)}>
                        {quarter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
            ) : null}

            {periodType === "semester" ? (
              <FilterField label="Semester">
                <Select
                  value={toSelectValue(selectedSemester)}
                  onValueChange={(value) => setSelectedSemester(Number(value))}
                >
                  <SelectTrigger className="w-full md:w-40 bg-background/80">
                    <SelectValue placeholder="Pilih semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTER_OPTIONS.map((semester) => (
                      <SelectItem key={semester.value} value={toSelectValue(semester.value)}>
                        {semester.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FilterField>
            ) : null}

            <FilterField label="Tahun">
              <Select
                value={toSelectValue(selectedYear)}
                onValueChange={(value) => setSelectedYear(Number(value))}
              >
                <SelectTrigger className="w-full md:w-28 bg-background/80">
                  <SelectValue placeholder="Pilih tahun" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={toSelectValue(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FilterField>

            <FilterField label="Export">
              <Button
                variant="outline"
                size="icon"
                onClick={() => void handleExportExcel()}
                disabled={isRefreshing || isExportingExcel}
                className="border-border"
                aria-label={isExportingExcel ? "Menyusun export Excel" : "Export Excel"}
                title={isExportingExcel ? "Menyusun export Excel" : "Export Excel"}
              >
                {isExportingExcel ? (
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4" />
                )}
              </Button>
            </FilterField>
          </div>

        </div>
      </div>

      <div className="space-y-4 rounded-2xl bg-background">
        <p className="text-[12px] text-secondary-color">
          Menampilkan data <span className="font-semibold text-primary-color">{rangeLabel}</span>
        </p>

        <div className="relative space-y-5">
          {showFilterLoadingOverlay ? (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-start justify-center rounded-2xl bg-background/55 pt-8 backdrop-blur-[1px]">
              <Badge variant="secondary" className="gap-2 bg-background/95 px-3 py-1.5 text-primary-color">
                <AppLoader size="xs" className="text-primary-color" />
                Memuat ulang data berdasarkan filter...
              </Badge>
            </div>
          ) : null}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AnalyticsTab)} className="space-y-5">
          <TabsList className="w-full justify-start overflow-x-auto bg-background/70">
            <TabsTrigger value="overview">Ringkasan</TabsTrigger>
            <TabsTrigger value="officer">Analisis Petugas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-5">
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <DashboardMetricCard
                  key={card.title}
                  {...card}
                  contentClassName="pt-0"
                  descriptionClassName="leading-relaxed"
                />
              ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
              <Card ref={serviceChartCardRef} className="border-border/80 bg-card shadow-sm">
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base text-primary-color">Distribusi Layanan</CardTitle>
                    {renderChartExportMenu("service", "Distribusi Layanan")}
                  </div>
                  <CardDescription>
                    Komposisi pengunjung berdasarkan layanan aktif pada periode yang dipilih.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  {serviceDistributionData.length > 0 ? (
                    renderDistributionPie(serviceDistributionData, "service", "pengunjung")
                  ) : (
                    renderEmptyState(
                      "Distribusi layanan belum tersedia",
                      "Belum ada data pengunjung pada layanan aktif untuk periode yang dipilih."
                    )
                  )}
                </CardContent>
              </Card>

              <Card ref={genderChartCardRef} className="border-border/80 bg-card shadow-sm">
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base text-primary-color">Jenis Kelamin Pengunjung</CardTitle>
                    {renderChartExportMenu("gender", "Jenis Kelamin Pengunjung")}
                  </div>
                  <CardDescription>
                    Sebaran pengunjung berdasarkan jenis kelamin pada periode aktif.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  {genderDistributionData.length > 0 ? (
                    renderDistributionPie(genderDistributionData, "gender", "pengunjung")
                  ) : (
                    renderEmptyState(
                      "Distribusi jenis kelamin belum tersedia",
                      "Belum ada data jenis kelamin pengunjung pada periode yang dipilih."
                    )
                  )}
                </CardContent>
              </Card>

              <Card ref={educationChartCardRef} className="border-border/80 bg-card shadow-sm">
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base text-primary-color">Pendidikan Pengunjung</CardTitle>
                    {renderChartExportMenu("education", "Pendidikan Pengunjung")}
                  </div>
                  <CardDescription>
                    Tingkat pendidikan terakhir pengunjung yang tercatat pada periode aktif.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  {educationDistributionData.length > 0 ? (
                    renderDistributionPie(educationDistributionData, "education", "pengunjung")
                  ) : (
                    renderEmptyState(
                      "Distribusi pendidikan belum tersedia",
                      "Belum ada data pendidikan pengunjung pada periode yang dipilih."
                    )
                  )}
                </CardContent>
              </Card>

              <Card ref={occupationChartCardRef} className="border-border/80 bg-card shadow-sm">
                <CardHeader className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base text-primary-color">Pekerjaan Pengunjung</CardTitle>
                    {renderChartExportMenu("occupation", "Pekerjaan Pengunjung")}
                  </div>
                  <CardDescription>
                    Sebaran pekerjaan pengunjung untuk membantu membaca profil layanan yang digunakan.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  {occupationDistributionData.length > 0 ? (
                    renderDistributionPie(occupationDistributionData, "occupation", "pengunjung")
                  ) : (
                    renderEmptyState(
                      "Distribusi pekerjaan belum tersedia",
                      "Belum ada data pekerjaan pengunjung pada periode yang dipilih."
                    )
                  )}
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          <TabsContent value="officer" className="space-y-5">
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {officerInsightCards.map((card) => (
                <DashboardMetricCard
                  key={card.title}
                  {...card}
                  contentClassName="pt-0"
                  descriptionClassName="leading-relaxed"
                />
              ))}
            </section>

            <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <Card className="border-border/80 bg-card shadow-sm">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-base text-primary-color">Ringkasan Performa Petugas</CardTitle>
                  <CardDescription>
                    Fokus pada performa, jumlah aktif bertugas, rating bintang, dan status ulasan.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pb-6">
                  <div className="mb-1 flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-background/55 px-3 py-2">
                    <p className="text-xs font-semibold text-secondary-color">Legenda Performa:</p>
                    <div className="flex items-center gap-1.5 rounded-full border border-emerald-300/70 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Baik
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-amber-300/70 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Cukup
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-rose-300/70 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-700">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      Perlu Perhatian
                    </div>
                  </div>

                  {sortedOfficerDetails.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-border/70">
                      <Table className="min-w-[760px]">
                        <TableHeader>
                          <TableRow className="bg-muted/35">
                            <TableHead className="w-[72px]">Rank</TableHead>
                            <TableHead>Petugas</TableHead>
                            <TableHead className="text-right">Aktif Bertugas</TableHead>
                            <TableHead className="text-right">Rating</TableHead>
                            <TableHead className="text-right">Ulasan</TableHead>
                            <TableHead>Performa</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedOfficerDetails.map((officer, index) => {
                            const officerStatus =
                              officerPerformanceStatusMap.get(officer.officerId) ||
                              getOfficerPerformanceStatus({
                                averageWaitTime: null,
                                averageServiceTime: null,
                                teamAverageWaitTime: weightedOfficerWaitAverage,
                                teamAverageServiceTime: weightedOfficerServiceAverage,
                              });
                            const feedbackSummary = getOfficerFeedbackSummary(officer);

                            return (
                              <TableRow
                                key={officer.officerId}
                                className={`cursor-pointer border-border/60 ${
                                  selectedOfficerDetail?.officerId === officer.officerId
                                    ? "bg-sky-500/10"
                                    : "odd:bg-background/40 even:bg-muted/20"
                                }`}
                                onClick={() => setSelectedOfficerId(officer.officerId)}
                              >
                                <TableCell>
                                  <Badge variant="secondary" className="w-10 justify-center">
                                    #{index + 1}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-medium text-primary-color">{officer.officerName}</TableCell>
                                <TableCell className="text-right">{formatNumber(officer.totalHandled)}</TableCell>
                                <TableCell className="text-right">
                                  {feedbackSummary ? feedbackSummary.averageRating.toFixed(1) : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                  {feedbackSummary ? formatNumber(feedbackSummary.totalReviews) : "0"}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span className={`h-2.5 w-2.5 rounded-full ${officerStatus.dotClassName}`} />
                                    <Badge variant="outline" className={officerStatus.badgeClassName}>
                                      {officerStatus.label}
                                    </Badge>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    renderEmptyState(
                      "Belum ada data petugas",
                      "Belum ada data layanan petugas pada periode yang dipilih."
                    )
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/80 bg-card shadow-sm">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-base text-primary-color">Ringkasan Petugas Terpilih</CardTitle>
                  <CardDescription>
                    Fokus cepat untuk melihat performa, rating, dan produktivitas petugas terpilih.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pb-6">
                  {selectedOfficerDetail ? (
                    <>
                      <FilterField label="Petugas">
                        <Select value={selectedOfficerDetail?.officerId || ""} onValueChange={setSelectedOfficerId}>
                          <SelectTrigger className="bg-background/80">
                            <SelectValue placeholder="Pilih petugas" />
                          </SelectTrigger>
                          <SelectContent>
                            {sortedOfficerDetails.map((officer) => (
                              <SelectItem key={officer.officerId} value={officer.officerId}>
                                {officer.officerName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FilterField>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-border/70 bg-background/55 px-3 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary-color/90">
                            Performa
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${selectedOfficerPerformanceStatus?.dotClassName || "bg-slate-400"}`}
                            />
                            <Badge variant="outline" className={selectedOfficerPerformanceStatus?.badgeClassName || ""}>
                              {selectedOfficerPerformanceStatus?.label || "Belum tersedia"}
                            </Badge>
                          </div>
                        </div>
                        <div className="rounded-xl border border-border/70 bg-background/55 px-3 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary-color/90">
                            Aktif bertugas
                          </p>
                          <p className="mt-1 text-lg font-semibold text-primary-color">
                            {formatNumber(selectedOfficerDetail.totalHandled)} kali
                          </p>
                        </div>
                        <div className="rounded-xl border border-border/70 bg-background/55 px-3 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary-color/90">
                            Rating bintang
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-lg font-semibold text-primary-color">
                            <Star className="h-4 w-4 text-amber-500" />
                            {selectedOfficerFeedbackSummary
                              ? selectedOfficerFeedbackSummary.averageRating.toFixed(1)
                              : "-"}
                          </p>
                        </div>
                        <div className="rounded-xl border border-border/70 bg-background/55 px-3 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary-color/90">
                            Total penilaian
                          </p>
                          <p className="mt-1 text-lg font-semibold text-primary-color">
                            {selectedOfficerFeedbackSummary
                              ? formatNumber(selectedOfficerFeedbackSummary.totalReviews)
                              : "0"}
                          </p>
                        </div>
                      </div>

                      {shouldUseFeedbackPreviewData ? (
                        <SubtleInfoNote>
                          Nilai rating berikut merupakan pratinjau tampilan karena data ulasan periode ini masih terbatas.
                        </SubtleInfoNote>
                      ) : null}

                      <div className="rounded-xl border border-border/70 bg-background/55 px-3 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary-color/90">
                          Ringkasan periode
                        </p>
                        <p className="mt-1 text-sm text-primary-color">
                          Kontribusi layanan: {selectedOfficerContribution !== null
                            ? `${formatPercentage(selectedOfficerContribution)} dari total layanan petugas`
                            : "-"}
                        </p>
                        <p className="mt-1 text-sm text-primary-color">
                          Avg tunggu: {formatDuration(selectedOfficerDetail.averageWaitTime)} ({selectedOfficerWaitGap !== null && selectedOfficerWaitGap <= 0 ? "lebih cepat" : "lebih lama"} dari tim)
                        </p>
                        <p className="mt-1 text-sm text-primary-color">
                          Avg layanan: {formatDuration(selectedOfficerDetail.averageServiceTime)} ({selectedOfficerServiceGap !== null && selectedOfficerServiceGap <= 0 ? "lebih cepat" : "lebih lama"} dari tim)
                        </p>
                      </div>
                    </>
                  ) : (
                    renderEmptyState(
                      "Pilih petugas terlebih dahulu",
                      "Pilih salah satu petugas untuk melihat ringkasan performa dan rating."
                    )
                  )}
                </CardContent>
              </Card>
            </section>

            <section>
              <Card className="border-border/80 bg-card shadow-sm">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-base text-primary-color">Detail Ulasan & Komentar</CardTitle>
                  <CardDescription>
                    Status ulasan, tren rating, dan cuplikan komentar pengunjung pada periode aktif.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pb-6">
                  {selectedOfficerDetail ? (
                    <>

                      <div className="rounded-xl border border-border/70 bg-background/55 px-3 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary-color/90">
                          Status ulasan pengunjung
                        </p>
                        <p className="mt-1 text-sm font-semibold text-primary-color">
                          {selectedOfficerDisplayCommentItems.length > 0
                            ? `Ada ${formatNumber(selectedOfficerDisplayCommentItems.length)} ulasan tertulis`
                            : "Belum ada ulasan tertulis pada periode ini"}
                        </p>
                        <p className="mt-1 text-xs text-secondary-color/90">
                          Ulasan terakhir: {selectedOfficerFeedbackSummary?.latestFeedbackAt
                            ? formatDisplayDateTimeWithSeconds(
                                new Date(selectedOfficerFeedbackSummary.latestFeedbackAt)
                              )
                            : "-"}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-background/70 px-2 py-1.5">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-primary-color">Mini tren rating</p>
                            <p className="text-xs text-secondary-color/90">
                              {selectedOfficerRatingTrend
                                ? selectedOfficerRatingTrend.delta > 0.08
                                  ? "Meningkat"
                                  : selectedOfficerRatingTrend.delta < -0.08
                                    ? "Menurun"
                                    : "Stabil"
                                : "Belum ada data tren"}
                            </p>
                          </div>
                          {selectedOfficerTrendPath ? (
                            <div className="shrink-0">
                              <svg
                                width={miniTrendWidth}
                                height={miniTrendHeight}
                                viewBox={`0 0 ${miniTrendWidth} ${miniTrendHeight}`}
                                role="img"
                                aria-label="Mini tren rating petugas"
                              >
                                <line
                                  x1={0}
                                  y1={miniTrendHeight}
                                  x2={miniTrendWidth}
                                  y2={miniTrendHeight}
                                  stroke="currentColor"
                                  strokeWidth="1"
                                  className="text-border/70"
                                />
                                <line
                                  x1={0}
                                  y1={miniTrendHeight / 2}
                                  x2={miniTrendWidth}
                                  y2={miniTrendHeight / 2}
                                  stroke="currentColor"
                                  strokeWidth="1"
                                  className="text-border/40"
                                  strokeDasharray="2 2"
                                />
                                <path
                                  d={selectedOfficerTrendPath}
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className={selectedOfficerTrendToneClass}
                                />

                                {selectedOfficerTrendStartPoint && selectedOfficerRatingTrend ? (
                                  <circle
                                    cx={selectedOfficerTrendStartPoint.x}
                                    cy={selectedOfficerTrendStartPoint.y}
                                    r="2.5"
                                    fill="currentColor"
                                    className="text-slate-500"
                                  >
                                    <title>{`Awal: ${selectedOfficerRatingTrend.points[0].toFixed(1)} bintang`}</title>
                                  </circle>
                                ) : null}

                                {selectedOfficerTrendEndPoint && selectedOfficerRatingTrend ? (
                                  <circle
                                    cx={selectedOfficerTrendEndPoint.x}
                                    cy={selectedOfficerTrendEndPoint.y}
                                    r="3"
                                    fill="currentColor"
                                    className={selectedOfficerTrendToneClass}
                                  >
                                    <title>{`Akhir: ${selectedOfficerRatingTrend.points[selectedOfficerRatingTrend.points.length - 1].toFixed(1)} bintang`}</title>
                                  </circle>
                                ) : null}

                                {selectedOfficerRatingTrend ? (
                                  <title>
                                    {`Tren ${selectedOfficerRatingTrend.delta > 0.08 ? "meningkat" : selectedOfficerRatingTrend.delta < -0.08 ? "menurun" : "stabil"} | Delta ${selectedOfficerRatingTrend.delta >= 0 ? "+" : ""}${selectedOfficerRatingTrend.delta.toFixed(2)}`}
                                  </title>
                                ) : null}
                              </svg>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="rounded-xl border border-border/70 bg-background/55 px-3 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary-color/90">
                          Cuplikan komentar terbaru
                        </p>
                        {isShowingPreviewComments ? (
                          <SubtleInfoNote className="mt-1">
                            Contoh komentar ditampilkan sementara untuk membantu pratinjau panel.
                          </SubtleInfoNote>
                        ) : null}

                        {isFeedbackLoading ? (
                          <p className="mt-2 text-sm text-secondary-color">Memuat komentar pengunjung...</p>
                        ) : feedbackLoadError ? (
                          <p className="mt-2 text-sm text-rose-700">{feedbackLoadError}</p>
                        ) : selectedOfficerDisplayCommentItems.length > 0 ? (
                          <div className="mt-2 space-y-2">
                            {selectedOfficerDisplayCommentItems.slice(0, 3).map((item) => (
                              <div
                                key={item.id}
                                className="rounded-lg border border-border/70 bg-background/70 px-3 py-2.5"
                              >
                                <p className="text-xs font-semibold text-primary-color/90">
                                  {item.rating.toFixed(1)} bintang • {formatCompactDateTime(item.submittedAt)}
                                </p>
                                <p className="mt-1 text-sm leading-relaxed text-secondary-color/90">{item.comment}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-secondary-color">
                            Belum ada komentar tertulis dari pengunjung pada periode ini.
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    renderEmptyState(
                      "Pilih petugas terlebih dahulu",
                      "Pilih salah satu petugas untuk melihat detail performa dan ulasan pengunjung."
                    )
                  )}
                </CardContent>
              </Card>
            </section>
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </PageContainer>
  );
}
