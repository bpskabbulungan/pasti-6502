"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  format,
  endOfMonth,
  endOfQuarter,
  endOfYear,
  startOfMonth,
  startOfQuarter,
  startOfYear,
} from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LiveStatusBadge } from "@/components/shared/feedback/live-status-badge";
import { PageContainer } from "@/components/shared/layout/page-container";
import { DashboardPageHeader } from "@/features/dashboard/components/layout/dashboard-page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  FileText,
  Filter,
  Loader2,
  PieChart,
  RefreshCcw,
  Timer,
  Users,
} from "lucide-react";
import AnalyticsSkeleton from "@/features/dashboard/components/skeletons/analytics-skeleton";
import { analyticsApi } from "@/services/api/analytics";
import { useLiveQuery } from "@/hooks/use-live-query";
import { formatDisplayDate, formatDisplayDateTimeWithSeconds } from "@/lib/date-format";
import type { AnalyticsExportFormat, AnalyticsSummary } from "@shared/types/analytics";
import type { ErrorResponse } from "@shared/types/api";
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
  Pie,
  Cell,
} from "recharts";

type AnalyticsData = AnalyticsSummary;

type AnalyticsPageProps = {
  initialAnalytics: AnalyticsData;
  initialFetchedAt: string;
};

type PeriodType = "month" | "year" | "quarter" | "semester" | "custom";

type PeriodFilterState = {
  periodType: PeriodType;
  selectedYear: number;
  selectedMonth: number;
  selectedQuarter: number;
  selectedSemester: 1 | 2;
  customStartDate: string;
  customEndDate: string;
};

type ComputedPeriod = {
  startDate: string;
  endDate: string;
  label: string;
  isValid: boolean;
  error?: string;
};

const MAX_FILTER_RANGE_DAYS = 366;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const COLORS = ["#2563EB", "#0F766E", "#8B5CF6", "#EA580C", "#16A34A", "#0891B2", "#E11D48"];
const QUEUE_TYPE_COLORS = ["#2563EB", "#0F766E"];

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
  { value: 1, label: "Q1" },
  { value: 2, label: "Q2" },
  { value: 3, label: "Q3" },
  { value: 4, label: "Q4" },
];

const SEMESTER_OPTIONS = [
  { value: 1, label: "Semester 1" },
  { value: 2, label: "Semester 2" },
];

const PERIOD_TYPE_LABELS: Record<PeriodType, string> = {
  month: "Bulanan",
  year: "Tahunan",
  quarter: "Triwulan",
  semester: "Semester",
  custom: "Rentang Tanggal",
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== "object" || !error) {
    return fallback;
  }

  const errorDetails = (error as { details?: ErrorResponse }).details;
  if (errorDetails?.error) {
    return errorDetails.error;
  }

  const message = (error as { message?: string }).message;
  return message || fallback;
};

const formatDateTime = (value: Date) => formatDisplayDateTimeWithSeconds(value);

const createInitialFilters = (): PeriodFilterState => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;

  return {
    periodType: "month",
    selectedYear: now.getFullYear(),
    selectedMonth: currentMonth,
    selectedQuarter: Math.floor((currentMonth - 1) / 3) + 1,
    selectedSemester: currentMonth <= 6 ? 1 : 2,
    customStartDate: format(startOfMonth(now), "yyyy-MM-dd"),
    customEndDate: format(now, "yyyy-MM-dd"),
  };
};

const parseInputDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const computePeriod = (filter: PeriodFilterState): ComputedPeriod => {
  const buildResult = (start: Date, end: Date, label: string): ComputedPeriod => {
    const totalDays = Math.round((end.getTime() - start.getTime()) / ONE_DAY_MS) + 1;

    if (totalDays > MAX_FILTER_RANGE_DAYS) {
      return {
        startDate: "",
        endDate: "",
        label,
        isValid: false,
        error: `Rentang maksimal ${MAX_FILTER_RANGE_DAYS} hari.`,
      };
    }

    return {
      startDate: format(start, "yyyy-MM-dd"),
      endDate: format(end, "yyyy-MM-dd"),
      label,
      isValid: true,
    };
  };

  if (filter.periodType === "month") {
    const start = new Date(filter.selectedYear, filter.selectedMonth - 1, 1);
    const end = endOfMonth(start);
    const label = format(start, "MMMM yyyy", { locale: localeId });
    return buildResult(start, end, label);
  }

  if (filter.periodType === "year") {
    const start = startOfYear(new Date(filter.selectedYear, 0, 1));
    const end = endOfYear(start);
    return buildResult(start, end, `Tahun ${filter.selectedYear}`);
  }

  if (filter.periodType === "quarter") {
    const quarterStart = new Date(filter.selectedYear, (filter.selectedQuarter - 1) * 3, 1);
    const start = startOfQuarter(quarterStart);
    const end = endOfQuarter(quarterStart);
    return buildResult(start, end, `Q${filter.selectedQuarter} ${filter.selectedYear}`);
  }

  if (filter.periodType === "semester") {
    const semesterStartMonth = filter.selectedSemester === 1 ? 0 : 6;
    const start = new Date(filter.selectedYear, semesterStartMonth, 1);
    const end = new Date(filter.selectedYear, semesterStartMonth + 6, 0);
    return buildResult(start, end, `Semester ${filter.selectedSemester} ${filter.selectedYear}`);
  }

  const start = parseInputDate(filter.customStartDate);
  const end = parseInputDate(filter.customEndDate);

  if (!start || !end) {
    return {
      startDate: "",
      endDate: "",
      label: "Rentang Kustom",
      isValid: false,
      error: "Tanggal awal dan akhir wajib diisi.",
    };
  }

  if (end.getTime() < start.getTime()) {
    return {
      startDate: "",
      endDate: "",
      label: "Rentang Kustom",
      isValid: false,
      error: "Tanggal akhir tidak boleh lebih kecil dari tanggal awal.",
    };
  }

  return buildResult(start, end, `${formatDisplayDate(start)} - ${formatDisplayDate(end)}`);
};

const toSelectValue = (value: number) => String(value);

export default function AnalyticsPageV2({ initialAnalytics, initialFetchedAt }: AnalyticsPageProps) {
  const [initialFilters] = useState<PeriodFilterState>(() => createInitialFilters());
  const [periodType, setPeriodType] = useState<PeriodType>(initialFilters.periodType);
  const [selectedYear, setSelectedYear] = useState<number>(initialFilters.selectedYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(initialFilters.selectedMonth);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(initialFilters.selectedQuarter);
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(initialFilters.selectedSemester);
  const [customStartDate, setCustomStartDate] = useState<string>(initialFilters.customStartDate);
  const [customEndDate, setCustomEndDate] = useState<string>(initialFilters.customEndDate);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>("");
  const [exportingFormat, setExportingFormat] = useState<AnalyticsExportFormat | null>(null);
  const [isFilterTransitioning, setIsFilterTransitioning] = useState(false);

  const currentFilter = useMemo<PeriodFilterState>(
    () => ({
      periodType,
      selectedYear,
      selectedMonth,
      selectedQuarter,
      selectedSemester,
      customStartDate,
      customEndDate,
    }),
    [
      customEndDate,
      customStartDate,
      periodType,
      selectedMonth,
      selectedQuarter,
      selectedSemester,
      selectedYear,
    ]
  );

  const currentPeriod = useMemo(() => computePeriod(currentFilter), [currentFilter]);
  const initialPeriod = useMemo(() => computePeriod(initialFilters), [initialFilters]);

  const currentUrl = currentPeriod.isValid
    ? analyticsApi.summaryUrl({
        startDate: currentPeriod.startDate,
        endDate: currentPeriod.endDate,
      })
    : null;

  const initialUrl = initialPeriod.isValid
    ? analyticsApi.summaryUrl({
        startDate: initialPeriod.startDate,
        endDate: initialPeriod.endDate,
      })
    : null;

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
    enabled: Boolean(currentUrl),
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

    const currentExists = analyticsData.officerDetails.some((item) => item.officerId === selectedOfficerId);
    if (!currentExists) {
      setSelectedOfficerId(analyticsData.officerDetails[0].officerId);
    }
  }, [analyticsData?.officerDetails, selectedOfficerId]);

  const handleExportData = async (exportFormat: AnalyticsExportFormat) => {
    if (!currentPeriod.isValid) {
      toast.error(currentPeriod.error || "Filter periode belum valid");
      return;
    }

    try {
      setExportingFormat(exportFormat);

      const { job } = await analyticsApi.createExportJob({
        startDate: currentPeriod.startDate,
        endDate: currentPeriod.endDate,
        format: exportFormat,
      });

      let completedJob = job;
      for (let attempt = 0; attempt < 40; attempt++) {
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

      const a = document.createElement("a");
      a.href = analyticsApi.downloadUrl(completedJob.id);
      if (completedJob.fileName) {
        a.download = completedJob.fileName;
      }
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success(`Data berhasil diekspor dalam format ${exportFormat.toUpperCase()}`);
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error(getErrorMessage(error, "Terjadi kesalahan saat mengekspor data"));
    } finally {
      setExportingFormat(null);
    }
  };

  const isInitialLoading = isLoading && !analyticsData;

  const updatedLabel = analyticsData?.dataLastUpdatedAt
    ? formatDateTime(new Date(analyticsData.dataLastUpdatedAt))
    : lastFetchedAt
      ? formatDateTime(new Date(lastFetchedAt))
      : isInitialLoading
        ? "Memuat data awal..."
        : "Belum ada data";

  const trackUpdatedLabel = analyticsData?.trackLastUpdated
    ? formatDateTime(new Date(analyticsData.trackLastUpdated))
    : null;

  const renderEmptyState = useCallback(
    (message: string) => (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border/70 bg-background/40 p-6 text-center text-sm text-secondary-color">
        {message}
      </div>
    ),
    []
  );

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 8 }, (_, index) => currentYear - index);
  }, []);

  if (isInitialLoading) {
    return <AnalyticsSkeleton />;
  }

  if (!analyticsData) {
    return (
      <PageContainer maxWidth="6xl">
        <Card className="border-border/80 bg-card/88 p-6 text-center">
          <CardTitle className="text-base text-primary-color">Data analitik tidak tersedia</CardTitle>
          <CardDescription className="mt-2">
            {currentPeriod.isValid
              ? "Coba muat ulang atau periksa koneksi Anda."
              : currentPeriod.error || "Filter periode belum valid."}
          </CardDescription>
          <div className="mt-4 flex justify-center gap-2">
            <Button onClick={() => void refresh()} className="gap-2" disabled={!currentUrl}>
              <RefreshCcw className="h-4 w-4" />
              Muat Ulang
            </Button>
          </div>
        </Card>
      </PageContainer>
    );
  }

  const summaryCards = [
    {
      key: "total",
      title: "Total Pengunjung",
      value: analyticsData.summary.totalVisitors,
      description: "Jumlah pengunjung pada periode terpilih",
      icon: Users,
      iconClassName: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      key: "completed",
      title: "Layanan Selesai",
      value: analyticsData.summary.completedServices,
      description: "Layanan yang telah diselesaikan",
      icon: CheckCircle2,
      iconClassName: "text-emerald-600",
      iconBg: "bg-emerald-500/10",
    },
    {
      key: "wait",
      title: "Rata-rata Waktu Tunggu",
      value: `${analyticsData.summary.averageWaitTimeMinutes} menit`,
      description: "Rata-rata waktu menunggu sebelum dilayani",
      icon: Timer,
      iconClassName: "text-accent",
      iconBg: "bg-accent/10",
    },
    {
      key: "service",
      title: "Rata-rata Waktu Layanan",
      value: `${analyticsData.summary.averageServiceTimeMinutes} menit`,
      description: "Durasi layanan per pengunjung",
      icon: Clock3,
      iconClassName: "text-primary",
      iconBg: "bg-primary/10",
    },
  ];

  const selectedOfficerDetail =
    analyticsData.officerDetails.find((item) => item.officerId === selectedOfficerId) ||
    analyticsData.officerDetails[0] ||
    null;

  const dailyTrendData = analyticsData.dailyTrends.map((item) => ({
    ...item,
    shortDate: item.date.slice(5),
  }));
  const hourlyTrendData = analyticsData.timeAnalysis.map((item) => ({
    ...item,
    hourLabel: `${String(item.hourOfDay).padStart(2, "0")}:00`,
  }));

  const showFilterLoadingOverlay = isFilterTransitioning && isRefreshing;

  return (
    <PageContainer maxWidth="6xl">
      <DashboardPageHeader
        title="Analitik Antrean"
        description="Analisis performa layanan per periode, detail per petugas, dan insight operasional."
        meta={
          <>
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              <span>Data per: {updatedLabel}</span>
            </div>
            <LiveStatusBadge
              isRefreshing={isRefreshing}
              hasFetched={Boolean(lastFetchedAt)}
              idleLabel="Auto refresh 60 detik"
            />
          </>
        }
        chips={
          <>
            <div className="dashboard-chip">Filter: {PERIOD_TYPE_LABELS[periodType]}</div>
            <div className="dashboard-chip">Periode: {currentPeriod.label}</div>
            {trackUpdatedLabel ? (
              <div className="dashboard-chip">Track terakhir: {trackUpdatedLabel}</div>
            ) : null}
          </>
        }
        actionsClassName="lg:w-[520px]"
        actions={
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-2">
              <Select value={periodType} onValueChange={(value) => setPeriodType(value as PeriodType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipe periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Bulanan</SelectItem>
                  <SelectItem value="year">Tahunan</SelectItem>
                  <SelectItem value="quarter">Triwulan</SelectItem>
                  <SelectItem value="semester">Semester</SelectItem>
                  <SelectItem value="custom">Rentang Tanggal</SelectItem>
                </SelectContent>
              </Select>

              {periodType === "month" && (
                <>
                  <Select
                    value={toSelectValue(selectedMonth)}
                    onValueChange={(value) => setSelectedMonth(Number(value))}
                  >
                    <SelectTrigger>
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
                  <Select
                    value={toSelectValue(selectedYear)}
                    onValueChange={(value) => setSelectedYear(Number(value))}
                  >
                    <SelectTrigger>
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
                </>
              )}

              {periodType === "year" && (
                <Select
                  value={toSelectValue(selectedYear)}
                  onValueChange={(value) => setSelectedYear(Number(value))}
                >
                  <SelectTrigger>
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
              )}

              {periodType === "quarter" && (
                <>
                  <Select
                    value={toSelectValue(selectedQuarter)}
                    onValueChange={(value) => setSelectedQuarter(Number(value))}
                  >
                    <SelectTrigger>
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
                  <Select
                    value={toSelectValue(selectedYear)}
                    onValueChange={(value) => setSelectedYear(Number(value))}
                  >
                    <SelectTrigger>
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
                </>
              )}

              {periodType === "semester" && (
                <>
                  <Select
                    value={toSelectValue(selectedSemester)}
                    onValueChange={(value) => setSelectedSemester(Number(value) as 1 | 2)}
                  >
                    <SelectTrigger>
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
                  <Select
                    value={toSelectValue(selectedYear)}
                    onValueChange={(value) => setSelectedYear(Number(value))}
                  >
                    <SelectTrigger>
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
                </>
              )}

              {periodType === "custom" && (
                <>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(event) => setCustomStartDate(event.target.value)}
                  />
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(event) => setCustomEndDate(event.target.value)}
                  />
                </>
              )}
            </div>

            {currentPeriod.isValid ? (
              <div className="rounded-lg border border-border/70 bg-background/55 px-3 py-2 text-xs text-secondary-color">
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5" />
                  <span>
                    Menampilkan data periode {currentPeriod.startDate} s.d. {currentPeriod.endDate}
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {currentPeriod.error || "Filter periode belum valid."}
              </div>
            )}

            <div className="dashboard-header-actions">
              <Button
                variant="outline"
                onClick={() => handleExportData("xlsx")}
                disabled={
                  isRefreshing || exportingFormat !== null || !analyticsData || !currentPeriod.isValid
                }
                className="dashboard-header-action border-border/80"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                {exportingFormat === "xlsx" ? "Menyusun..." : "XLSX"}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExportData("pdf")}
                disabled={
                  isRefreshing || exportingFormat !== null || !analyticsData || !currentPeriod.isValid
                }
                className="dashboard-header-action border-border/80"
              >
                <FileText className="mr-2 h-4 w-4" />
                {exportingFormat === "pdf" ? "Menyusun..." : "PDF"}
              </Button>
              <Button
                onClick={() => void refresh()}
                disabled={isRefreshing || !currentUrl}
                className="dashboard-header-action"
                aria-label="Perbarui data statistik"
              >
                <RefreshCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>{isRefreshing ? "Memperbarui..." : "Perbarui Data"}</span>
              </Button>
            </div>
          </div>
        }
      />

      <div className="relative space-y-4">
        {showFilterLoadingOverlay && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-start justify-center rounded-xl bg-background/55 pt-8 backdrop-blur-[1px]">
            <Badge variant="secondary" className="gap-2 bg-background/90 px-3 py-1 text-primary-color">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Memuat ulang data berdasarkan filter...
            </Badge>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">Ringkasan</TabsTrigger>
            <TabsTrigger value="officer">Per Petugas</TabsTrigger>
            <TabsTrigger value="trend">Tren</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.key}
                className="border-border/80 bg-card/88 transition hover:-translate-y-0.5"
              >
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-xs font-semibold uppercase tracking-wide text-secondary-color">
                      {card.title}
                    </CardTitle>
                    <div className="mt-2 text-2xl font-bold text-primary-color md:text-3xl">
                      {card.value}
                    </div>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${card.iconBg}`}
                  >
                    <Icon className={`h-5 w-5 ${card.iconClassName}`} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-secondary-color">{card.description}</p>
                  {card.key === "completed" && (
                    <p className="text-xs text-secondary-color">
                      Dibatalkan: <span className="font-medium text-destructive">{analyticsData.summary.canceledServices}</span>
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-border/80 bg-card/88">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Layanan Paling Populer</CardTitle>
              <CardDescription>Global pada periode aktif</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-primary-color">
                {analyticsData.insights.mostPopularService?.serviceName || "-"}
              </p>
              <p className="text-xs text-secondary-color">
                {analyticsData.insights.mostPopularService
                  ? `${analyticsData.insights.mostPopularService.count} layanan (${analyticsData.insights.mostPopularService.percentage}%)`
                  : "Belum ada data layanan"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/88">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Petugas Paling Aktif</CardTitle>
              <CardDescription>Jumlah layanan terbanyak</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-primary-color">
                {analyticsData.insights.mostActiveOfficer?.officerName || "-"}
              </p>
              <p className="text-xs text-secondary-color">
                {analyticsData.insights.mostActiveOfficer
                  ? `${analyticsData.insights.mostActiveOfficer.completedCount} layanan`
                  : "Belum ada petugas aktif"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/88">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Online vs Offline</CardTitle>
              <CardDescription>Perbandingan tipe antrean</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-primary-color">
                Online {analyticsData.insights.onlineVsOffline.online} ({analyticsData.insights.onlineVsOffline.onlinePercentage}%)
              </p>
              <p className="text-sm font-medium text-primary-color">
                Offline {analyticsData.insights.onlineVsOffline.offline} ({analyticsData.insights.onlineVsOffline.offlinePercentage}%)
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/88">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Rata-rata Layanan/Petugas</CardTitle>
              <CardDescription>Produktivitas petugas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary-color">{analyticsData.insights.averageServicesPerOfficer}</p>
              <p className="text-xs text-secondary-color">Layanan selesai per petugas aktif</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card className="border-border/80 bg-card/88">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChart className="h-5 w-5" />
                Distribusi Layanan
              </CardTitle>
              <CardDescription>Persentase pengunjung berdasarkan jenis layanan</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {analyticsData.serviceDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={analyticsData.serviceDistribution}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                      label={({ name, percentage }: { name: string; percentage: number }) =>
                        `${name}: ${percentage}%`
                      }
                    >
                      {analyticsData.serviceDistribution.map((entry, index) => (
                        <Cell key={`service-cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} pengunjung`, "Jumlah"]} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                renderEmptyState("Tidak ada data layanan")
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/88">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PieChart className="h-5 w-5" />
                Tipe Antrean
              </CardTitle>
              <CardDescription>Persentase pengunjung berdasarkan tipe antrean</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {analyticsData.queueTypeDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={analyticsData.queueTypeDistribution}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                      label={({ name, percentage }: { name: string; percentage: number }) =>
                        `${name}: ${percentage}%`
                      }
                    >
                      {analyticsData.queueTypeDistribution.map((entry, index) => (
                        <Cell
                          key={`queue-type-cell-${entry.name}-${index}`}
                          fill={QUEUE_TYPE_COLORS[index % QUEUE_TYPE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} pengunjung`, "Jumlah"]} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                renderEmptyState("Tidak ada data tipe antrean")
              )}
            </CardContent>
          </Card>
        </section>

        </TabsContent>

        <TabsContent value="officer" className="space-y-4">
        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border/80 bg-card/88">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart className="h-5 w-5" />
                Kinerja Petugas
              </CardTitle>
              <CardDescription>Jumlah layanan selesai per petugas</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {analyticsData.officerPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={analyticsData.officerPerformance}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="officerName" type="category" width={130} />
                    <Tooltip formatter={(value) => [`${value} layanan`, "Jumlah Layanan"]} />
                    <Legend />
                    <Bar
                      dataKey="completedCount"
                      name="Jumlah Layanan"
                      fill="#2563EB"
                      radius={[6, 6, 6, 6]}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              ) : (
                renderEmptyState("Tidak ada data kinerja petugas")
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/88">
            <CardHeader>
              <CardTitle className="text-base">Distribusi Layanan Per Petugas</CardTitle>
              <CardDescription>Detail layanan yang ditangani masing-masing petugas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {analyticsData.officerDetails.length > 0 ? (
                <>
                  <Select value={selectedOfficerDetail?.officerId || ""} onValueChange={setSelectedOfficerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih petugas" />
                    </SelectTrigger>
                    <SelectContent>
                      {analyticsData.officerDetails.map((officer) => (
                        <SelectItem key={officer.officerId} value={officer.officerId}>
                          {officer.officerName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="h-64">
                    {selectedOfficerDetail && selectedOfficerDetail.serviceBreakdown.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={selectedOfficerDetail.serviceBreakdown}
                            dataKey="count"
                            nameKey="serviceName"
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={80}
                            paddingAngle={2}
                            label={({ serviceName, percentage }: { serviceName: string; percentage: number }) =>
                              `${serviceName}: ${percentage}%`
                            }
                          >
                            {selectedOfficerDetail.serviceBreakdown.map((entry, index) => (
                              <Cell key={`officer-service-cell-${entry.serviceName}-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} layanan`, "Frekuensi"]} />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    ) : (
                      renderEmptyState("Petugas ini belum memiliki data distribusi layanan")
                    )}
                  </div>

                  {selectedOfficerDetail && (
                    <div className="rounded-lg border border-border/70 bg-background/50 p-3 text-xs text-secondary-color">
                      <p className="font-medium text-primary-color">Ringkasan {selectedOfficerDetail.officerName}</p>
                      <p>Total layanan: {selectedOfficerDetail.totalHandled}</p>
                      <p>
                        Top service:{" "}
                        {selectedOfficerDetail.topService
                          ? `${selectedOfficerDetail.topService.serviceName} (${selectedOfficerDetail.topService.count})`
                          : "-"}
                      </p>
                      <p>Rata-rata tunggu: {selectedOfficerDetail.averageWaitTime} menit</p>
                      <p>Rata-rata layanan: {selectedOfficerDetail.averageServiceTime} menit</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-72">{renderEmptyState("Belum ada data petugas untuk periode ini")}</div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4">
          <Card className="border-border/80 bg-card/88">
            <CardHeader>
              <CardTitle className="text-base">Detail Analitik Per Petugas</CardTitle>
              <CardDescription>
                Jumlah layanan, frekuensi jenis layanan, dan top service tiap petugas.
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[430px] overflow-auto">
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Petugas</TableHead>
                    <TableHead>Total Layanan</TableHead>
                    <TableHead>Top Service</TableHead>
                    <TableHead>Frekuensi Layanan</TableHead>
                    <TableHead>Rata-rata Tunggu</TableHead>
                    <TableHead>Rata-rata Layanan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyticsData.officerDetails.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Tidak ada data per petugas pada periode ini.
                      </TableCell>
                    </TableRow>
                  ) : (
                    analyticsData.officerDetails.map((officer) => (
                      <TableRow key={officer.officerId}>
                        <TableCell className="font-medium text-primary-color">{officer.officerName}</TableCell>
                        <TableCell>{officer.totalHandled}</TableCell>
                        <TableCell>
                          {officer.topService
                            ? `${officer.topService.serviceName} (${officer.topService.count})`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex min-w-[260px] flex-wrap gap-1">
                            {officer.serviceBreakdown.length === 0 ? (
                              <Badge variant="secondary">Belum ada data layanan</Badge>
                            ) : (
                              officer.serviceBreakdown.map((service) => (
                                <Badge
                                  key={`${officer.officerId}-${service.serviceName}`}
                                  variant="secondary"
                                  className="bg-background/70 text-[11px] text-secondary-color"
                                >
                                  {service.serviceName}: {service.count}
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{officer.averageWaitTime} menit</TableCell>
                        <TableCell>{officer.averageServiceTime} menit</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        </TabsContent>

        <TabsContent value="trend" className="space-y-4">
          <section className="grid gap-4 md:grid-cols-2">
            <Card className="border-border/80 bg-card/88">
              <CardHeader>
                <CardTitle className="text-base">Tren Harian Status Antrean</CardTitle>
                <CardDescription>Ringkasan waiting, completed, dan canceled per hari</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {dailyTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={dailyTrendData}
                      margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="shortDate" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="waiting" stackId="status" fill="#F59E0B" name="Waiting" />
                      <Bar dataKey="completed" stackId="status" fill="#16A34A" name="Completed" />
                      <Bar dataKey="canceled" stackId="status" fill="#DC2626" name="Canceled" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  renderEmptyState("Tidak ada data tren harian")
                )}
              </CardContent>
            </Card>

            <Card className="border-border/80 bg-card/88">
              <CardHeader>
                <CardTitle className="text-base">Pola Jam Kunjungan</CardTitle>
                <CardDescription>Distribusi antrean berdasarkan jam</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {hourlyTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={hourlyTrendData}
                      margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hourLabel" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} antrean`, "Jumlah"]} />
                      <Bar
                        dataKey="count"
                        fill="#2563EB"
                        name="Jumlah Antrean"
                        radius={[4, 4, 0, 0]}
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  renderEmptyState("Tidak ada data pola jam")
                )}
              </CardContent>
            </Card>
          </section>
        </TabsContent>
      </Tabs>
      </div>
    </PageContainer>
  );
}
