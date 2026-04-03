"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { format, startOfToday, startOfWeek, startOfMonth, subMonths } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  FileText,
  PieChart,
  RefreshCcw,
  Timer,
  Users,
} from "lucide-react";
import AnalyticsSkeleton from "@/modules/dashboard/components/skeletons/AnalyticsSkeleton";
import { analyticsApi } from "@/services/api/analytics";
import { useLiveQuery } from "@/hooks/use-live-query";
import { formatDisplayDateTimeWithSeconds } from "@/lib/date-format";
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
import type {
  ValueType,
  NameType,
  Payload as TooltipPayload,
} from "recharts/types/component/DefaultTooltipContent";

type AnalyticsData = AnalyticsSummary;
type AnalyticsPageProps = {
  initialAnalytics: AnalyticsData;
};

const COLORS = ["#2563EB", "#22C55E", "#F59E0B", "#F97316", "#6366F1", "#06B6D4", "#EC4899"];
const QUEUE_TYPE_COLORS = ["#3B82F6", "#10B981"];
const RANGE_LABELS: Record<string, string> = {
  today: "Hari Ini",
  week: "Minggu Ini",
  month: "Bulan Ini",
  "3months": "3 Bulan Terakhir",
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

export default function AnalyticsPage({ initialAnalytics }: AnalyticsPageProps) {
  const [timeRange, setTimeRange] = useState<string>("today");
  const [exportingFormat, setExportingFormat] = useState<AnalyticsExportFormat | null>(null);
  const getDateRangeParams = useCallback((range: string) => {
    const today = new Date();
    let startDate;

    switch (range) {
      case "today":
        startDate = startOfToday();
        break;
      case "week":
        startDate = startOfWeek(today, { weekStartsOn: 1 });
        break;
      case "month":
        startDate = startOfMonth(today);
        break;
      case "3months":
        startDate = subMonths(today, 3);
        break;
      default:
        startDate = startOfToday();
    }

    return {
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(today, "yyyy-MM-dd"),
    };
  }, []);

  const { startDate, endDate } = getDateRangeParams(timeRange);
  const currentUrl = analyticsApi.summaryUrl({ startDate, endDate });
  const initialUrl = analyticsApi.summaryUrl(getDateRangeParams("today"));
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
    refreshInterval: 60_000,
    onError: (error) => {
      console.error("Error fetching analytics data:", error);
      toast.error(getErrorMessage(error, "Terjadi kesalahan saat memuat data analitik"));
    },
  });

  const handleExportData = async (exportFormat: AnalyticsExportFormat) => {
    try {
      setExportingFormat(exportFormat);
      const { startDate, endDate } = getDateRangeParams(timeRange);
      const { job } = await analyticsApi.createExportJob({
        startDate,
        endDate,
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

  if (isInitialLoading) {
    return <AnalyticsSkeleton />;
  }

  if (!analyticsData) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
        <Card className="border-border/80 bg-card/80 p-6 text-center shadow-sm">
          <CardTitle className="text-base text-primary-color">
            Data analitik tidak tersedia
          </CardTitle>
          <CardDescription className="mt-2">
            Coba muat ulang atau periksa koneksi Anda.
          </CardDescription>
          <div className="mt-4 flex justify-center">
            <Button onClick={() => void refresh()} className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Muat Ulang
            </Button>
          </div>
        </Card>
      </div>
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

  const renderEmptyState = (message: string) => (
    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border/70 bg-background/40 p-6 text-center text-sm text-secondary-color">
      {message}
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
      <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6 shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(247,144,57,0.18),transparent_55%)]" />
        <div className="absolute inset-y-0 right-0 w-52 bg-[radial-gradient(circle_at_70%_30%,rgba(154,5,1,0.12),transparent_55%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-primary-color md:text-4xl">
                Analitik Antrean
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-secondary-color">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                <span>Data per: {updatedLabel}</span>
              </div>
              <Badge variant="secondary" className="gap-2 bg-background/70 text-secondary-color">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isRefreshing ? "bg-primary animate-pulse" : "bg-emerald-500"
                  }`}
                />
                {isRefreshing ? "Memperbarui data..." : "Auto refresh 60 detik"}
              </Badge>
              <Badge variant="secondary" className="bg-background/70 text-secondary-color">
                Periode: {RANGE_LABELS[timeRange] ?? "Hari Ini"}
              </Badge>
              {trackUpdatedLabel && (
                <Badge variant="secondary" className="bg-background/70 text-secondary-color">
                  Track terakhir: {trackUpdatedLabel}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto">
            <Select value={timeRange} onValueChange={(value) => setTimeRange(value)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Pilih rentang waktu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hari Ini</SelectItem>
                <SelectItem value="week">Minggu Ini</SelectItem>
                <SelectItem value="month">Bulan Ini</SelectItem>
                <SelectItem value="3months">3 Bulan Terakhir</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => handleExportData("xlsx")}
                disabled={isRefreshing || exportingFormat !== null || !analyticsData}
                className="border-border/80"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                {exportingFormat === "xlsx" ? "Menyusun..." : "XLSX"}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExportData("pdf")}
                disabled={isRefreshing || exportingFormat !== null || !analyticsData}
                className="border-border/80"
              >
                <FileText className="mr-2 h-4 w-4" />
                {exportingFormat === "pdf" ? "Menyusun..." : "PDF"}
              </Button>
              <Button
                onClick={() => void refresh()}
                disabled={isRefreshing}
                className="gap-2 bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                aria-label="Perbarui data statistik"
              >
                <RefreshCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>{isRefreshing ? "Memperbarui..." : "Perbarui Data"}</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.key}
              className="border-border/80 bg-card/80 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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
                {card.key === "total" && analyticsData.queueTypeDistribution.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {analyticsData.queueTypeDistribution.map((type) => (
                      <Badge
                        key={type.name}
                        variant="secondary"
                        className="bg-background/70 text-[11px] text-secondary-color"
                      >
                        {type.name}: {type.count}
                      </Badge>
                    ))}
                  </div>
                )}
                {card.key === "completed" && (
                  <p className="text-xs text-secondary-color">
                    Dibatalkan:{" "}
                    <span className="font-medium text-destructive">
                      {analyticsData.summary.canceledServices}
                    </span>
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/80 bg-card/80 shadow-sm">
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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(
                      value: ValueType,
                      _name: NameType,
                      payload: TooltipPayload<ValueType, NameType>
                    ) => [`${value} pengunjung`, payload?.payload?.name ?? ""]}
                  />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              renderEmptyState("Tidak ada data layanan")
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/80 shadow-sm">
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
                        key={`cell-${index}`}
                        fill={QUEUE_TYPE_COLORS[index % QUEUE_TYPE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(
                      value: ValueType,
                      _name: NameType,
                      payload: TooltipPayload<ValueType, NameType>
                    ) => [`${value} pengunjung`, payload?.payload?.name ?? ""]}
                  />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              renderEmptyState("Tidak ada data tipe antrean")
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4">
        <Card className="border-border/80 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart className="h-5 w-5" />
              Kinerja Petugas
            </CardTitle>
            <CardDescription>Jumlah layanan yang diselesaikan per petugas</CardDescription>
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
                  <YAxis dataKey="officerName" type="category" width={120} />
                  <Tooltip
                    formatter={(value: ValueType) => [`${value} layanan`, "Jumlah Layanan"]}
                  />
                  <Legend />
                  <Bar
                    dataKey="completedCount"
                    name="Jumlah Layanan"
                    fill="#6366F1"
                    radius={[6, 6, 6, 6]}
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              renderEmptyState("Tidak ada data kinerja petugas")
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
