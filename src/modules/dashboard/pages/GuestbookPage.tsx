"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  RefreshCcw,
  Search,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TableSkeleton from "@/modules/dashboard/components/skeletons/TableSkeleton";
import { guestbookApi } from "@/services/api/guestbook";
import { Gender, LastEducation, Purpose, QueueStatus } from "@/shared/constants/enums";
import type { ErrorResponse } from "@shared/types/api";
import type { GuestbookEntry, GuestbookSummary } from "@shared/types/guestbook";

type StatusFilter = "ALL" | QueueStatus;
type PurposeFilter = "ALL" | Purpose;

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

const genderLabels: Record<Gender, string> = {
  [Gender.MALE]: "Laki-Laki",
  [Gender.FEMALE]: "Perempuan",
};

const educationLabels: Record<LastEducation, string> = {
  [LastEducation.SD]: "SD",
  [LastEducation.SMP]: "SMP",
  [LastEducation.SMA_SMK]: "SMA / SMK",
  [LastEducation.D1]: "D1",
  [LastEducation.D2]: "D2",
  [LastEducation.D3]: "D3",
  [LastEducation.D4_S1]: "D4 / S1",
  [LastEducation.S2]: "S2",
  [LastEducation.S3]: "S3",
  [LastEducation.LAINNYA]: "Lainnya",
};

const purposeOptions: Array<{ value: Purpose; label: string; accent: string }> = [
  {
    value: Purpose.KONSULTASI_STATISTIK,
    label: "Konsultasi Statistik",
    accent: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-100",
  },
  {
    value: Purpose.PERPUSTAKAAN,
    label: "Perpustakaan",
    accent: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100",
  },
  {
    value: Purpose.REKOMENDASI_STATISTIK,
    label: "Rekomendasi Statistik",
    accent: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100",
  },
  {
    value: Purpose.LAINNYA,
    label: "Lainnya",
    accent: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
  },
];

const statusLabels: Record<QueueStatus, string> = {
  WAITING: "Menunggu",
  SERVING: "Sedang Dilayani",
  COMPLETED: "Selesai",
  CANCELED: "Dibatalkan",
};

const statusBadgeClass: Record<QueueStatus, string> = {
  WAITING: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  SERVING: "border-sky-500/30 bg-sky-500/10 text-sky-700",
  COMPLETED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  CANCELED: "border-red-500/30 bg-red-500/10 text-red-700",
};

const formatDate = (value: string | Date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const formatDateTime = (value: string | Date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));

const formatQueueCode = (queueNumber: number, value: string | Date) => {
  const date = new Date(value);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${queueNumber}-${day}${month}`;
};

export default function GuestbookPage() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [summary, setSummary] = useState<GuestbookSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [purposeFilter, setPurposeFilter] = useState<PurposeFilter>("ALL");
  const [dateFilter, setDateFilter] = useState<"today" | "all">("today");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEntries, setTotalEntries] = useState<number | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<GuestbookEntry | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, purposeFilter, dateFilter, pageSize, debouncedSearch]);

  const fetchGuestbook = useCallback(async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * pageSize;
      const data = await guestbookApi.list({
        status: statusFilter,
        purpose: purposeFilter,
        dateFilter,
        search: debouncedSearch || undefined,
        limit: pageSize,
        offset,
      });

      setEntries(data.entries ?? []);
      setSummary(data.summary);
      setTotalEntries(data.pagination.total);
      setLastFetchedAt(new Date());
    } catch (error) {
      console.error("Error fetching guestbook:", error);
      toast.error(getErrorMessage(error, "Terjadi kesalahan saat memuat buku tamu"));
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    dateFilter,
    debouncedSearch,
    pageSize,
    purposeFilter,
    statusFilter,
  ]);

  useEffect(() => {
    fetchGuestbook();
  }, [fetchGuestbook]);

  const fallbackSummary = useMemo(() => {
    const statusCount = entries.reduce(
      (acc, entry) => {
        acc.total += 1;
        acc.skdPending += entry.filledSKD ? 0 : 1;
        switch (entry.status) {
          case QueueStatus.WAITING:
            acc.waiting += 1;
            break;
          case QueueStatus.SERVING:
            acc.serving += 1;
            break;
          case QueueStatus.COMPLETED:
            acc.completed += 1;
            break;
          case QueueStatus.CANCELED:
            acc.canceled += 1;
            break;
          default:
            break;
        }
        return acc;
      },
      {
        total: 0,
        waiting: 0,
        serving: 0,
        completed: 0,
        canceled: 0,
        skdPending: 0,
      }
    );

    return {
      ...statusCount,
      total: totalEntries ?? statusCount.total,
    };
  }, [entries, totalEntries]);

  const summaryData = summary ?? fallbackSummary;

  const isInitialLoading = loading && entries.length === 0;
  const isRefreshing = loading && entries.length > 0;
  const hasFetched = Boolean(lastFetchedAt);
  const lastFetchedLabel = lastFetchedAt
    ? formatDateTime(lastFetchedAt)
    : loading
      ? "Memuat data..."
      : "Belum ada data";
  const statusLabel = isRefreshing
    ? "Memperbarui data..."
    : hasFetched
      ? "Data terbaru"
      : "Belum ada data";

  const purposeFilterLabel =
    purposeFilter === "ALL"
      ? "Semua keperluan"
      : purposeOptions.find((option) => option.value === purposeFilter)?.label ??
        "Keperluan";

  const statusFilterLabel =
    statusFilter === "ALL" ? "Semua status" : statusLabels[statusFilter];

  const totalItems = totalEntries ?? entries.length;
  const totalPages = totalEntries ? Math.max(1, Math.ceil(totalEntries / pageSize)) : 1;
  const rangeStart = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const rangeEnd = totalItems > 0 ? Math.min(currentPage * pageSize, totalItems) : 0;
  const showingLabel =
    totalEntries !== null
      ? `Menampilkan ${rangeStart}-${rangeEnd} dari ${totalItems} data`
      : `Menampilkan ${entries.length} data`;

  const canPrevPage = currentPage > 1;
  const canNextPage = totalEntries ? currentPage < totalPages : false;

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setPurposeFilter("ALL");
    setDateFilter("today");
  };

  const openDetail = (entry: GuestbookEntry) => {
    setSelectedEntry(entry);
    setDetailOpen(true);
  };

  const handleDetailOpenChange = (open: boolean) => {
    setDetailOpen(open);
    if (!open) {
      setSelectedEntry(null);
    }
  };

  const summaryCards = [
    {
      title: "Total Buku Tamu",
      value: summaryData.total,
      description: "Seluruh kunjungan yang sudah dilayani/selesai",
      icon: Users,
      iconBg: "bg-primary/10",
      iconClassName: "text-primary",
    },
    {
      title: "Sedang Dilayani",
      value: summaryData.serving,
      description: "Pengunjung yang sedang diproses",
      icon: Clock3,
      iconBg: "bg-sky-500/10",
      iconClassName: "text-sky-600",
    },
    {
      title: "Selesai",
      value: summaryData.completed,
      description: "Layanan yang sudah selesai",
      icon: CheckCircle2,
      iconBg: "bg-emerald-500/10",
      iconClassName: "text-emerald-600",
    },
    {
      title: "Belum Isi SKD",
      value: summaryData.skdPending,
      description: "Pengunjung yang belum mengisi SKD",
      icon: AlertTriangle,
      iconBg: "bg-orange-500/10",
      iconClassName: "text-orange-600",
    },
  ];

  const hasActiveFilters =
    statusFilter !== "ALL" ||
    purposeFilter !== "ALL" ||
    dateFilter !== "today" ||
    Boolean(debouncedSearch);
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-primary/15 via-secondary/20 to-background p-6 shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(247,144,57,0.12),transparent_45%)]" />
        <div className="absolute inset-y-0 right-0 w-48 bg-[radial-gradient(circle_at_80%_30%,rgba(154,5,1,0.08),transparent_45%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-primary-color md:text-4xl">
                Buku Tamu PST
              </h1>
              <p className="max-w-xl text-secondary-color">
                Rekapitulasi kunjungan pengunjung yang sudah dilayani atau selesai.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-secondary-color">
              <span>Terakhir diperbarui: {lastFetchedLabel}</span>
              <Badge variant="secondary" className="bg-background/80 text-secondary-color">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isRefreshing
                      ? "bg-primary animate-pulse"
                      : hasFetched
                        ? "bg-emerald-500"
                        : "bg-muted-foreground"
                  }`}
                />
                {statusLabel}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="gap-2 border-border"
                onClick={() => fetchGuestbook()}
                disabled={loading}
              >
                <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Memperbarui..." : "Muat ulang data"}
              </Button>
              <Badge variant="outline" className="border-border/70 bg-background/80">
                Filter: {dateFilter === "today" ? "Hari ini" : "Semua tanggal"}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="border-border/80 bg-card/80 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wide text-secondary-color">
                    {card.title}
                  </CardTitle>
                  <div className="text-2xl font-bold text-primary-color md:text-3xl">
                    {card.value}
                  </div>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${card.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${card.iconClassName}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-secondary-color">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card className="border-border/80 shadow-md">
        <CardHeader className="gap-2">
          <CardTitle className="text-xl font-semibold text-primary-color">
            Daftar Buku Tamu
          </CardTitle>
          <CardDescription className="text-secondary-color">
            Pantau data pengunjung yang sudah dilayani/selesai beserta detail layanan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border/70 bg-muted/30 p-4 space-y-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-color" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Cari nama, instansi, atau nomor"
                  className="bg-background/80 pl-9 pr-10 focus-visible:ring-primary"
                />
                {searchTerm.trim() && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                    onClick={() => setSearchTerm("")}
                    aria-label="Bersihkan pencarian"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={purposeFilter}
                  onValueChange={(value) => setPurposeFilter(value as PurposeFilter)}
                >
                  <SelectTrigger className="w-full sm:w-[220px]">
                    <SelectValue placeholder="Keperluan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua keperluan</SelectItem>
                    {purposeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={dateFilter}
                  onValueChange={(value) => setDateFilter(value as "today" | "all")}
                >
                  <SelectTrigger className="w-full sm:w-[170px]">
                    <SelectValue placeholder="Filter tanggal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hari ini</SelectItem>
                    <SelectItem value="all">Semua tanggal</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => setPageSize(Number(value))}
                >
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Tampil per halaman" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 / Halaman</SelectItem>
                    <SelectItem value="25">25 / Halaman</SelectItem>
                    <SelectItem value="50">50 / Halaman</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border"
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                >
                  Reset filter
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Tabs
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as StatusFilter)}
              >
                <TabsList className="border border-border/70 bg-background/80">
                  <TabsTrigger value="ALL">
                    Semua
                    <span className="rounded-full bg-background/80 px-2 py-0.5 text-[11px] text-secondary-color">
                      {summaryData.total}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value={QueueStatus.SERVING}>
                    Sedang Dilayani
                    <span className="rounded-full bg-background/80 px-2 py-0.5 text-[11px] text-secondary-color">
                      {summaryData.serving}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value={QueueStatus.COMPLETED}>
                    Selesai
                    <span className="rounded-full bg-background/80 px-2 py-0.5 text-[11px] text-secondary-color">
                      {summaryData.completed}
                    </span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-2 text-xs text-secondary-color">
                <Clock3 className="h-4 w-4" />
                <span>{showingLabel}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-secondary-color">
              <Badge variant="secondary" className="bg-background/80 text-secondary-color">
                Status: {statusFilterLabel}
              </Badge>
              <Badge variant="secondary" className="bg-background/80 text-secondary-color">
                Keperluan: {purposeFilterLabel}
              </Badge>
              {debouncedSearch && (
                <Badge variant="secondary" className="bg-background/80 text-secondary-color">
                  Pencarian: "{debouncedSearch}"
                </Badge>
              )}
            </div>
          </div>

          {isInitialLoading ? (
            <div className="overflow-x-auto">
              <TableSkeleton columns={7} rows={5} />
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center">
              <AlertTriangle className="h-8 w-8 text-primary" />
              <div className="space-y-1">
                <p className="text-lg font-semibold text-primary-color">
                  {hasActiveFilters ? "Tidak ada data yang sesuai" : "Belum ada buku tamu"}
                </p>
                <p className="text-sm text-secondary-color">
                  {hasActiveFilters
                    ? "Coba ubah filter atau kata kunci pencarian."
                    : "Data buku tamu akan muncul setelah pengunjung mengisi formulir."}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => fetchGuestbook()} className="gap-2">
                  <RefreshCcw className="h-4 w-4" />
                  Muat ulang data
                </Button>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={resetFilters}>
                    Reset filter
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="hidden overflow-hidden rounded-xl border border-border/80 md:block">
                <Table className="min-w-[1100px]">
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Pengunjung</TableHead>
                      <TableHead>Keperluan</TableHead>
                      <TableHead>Layanan</TableHead>
                      <TableHead>Antrean</TableHead>
                      <TableHead>SKD</TableHead>
                      <TableHead>Waktu</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => {
                      const purposeLabel = purposeOptions.find(
                        (option) => option.value === entry.purpose
                      );

                      return (
                        <TableRow key={entry.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary-color">
                                <Users className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-semibold text-primary-color">
                                  {entry.fullName}
                                </p>
                                <p className="text-xs text-secondary-color">
                                  {entry.institution || "-"}
                                </p>
                                <p className="text-xs text-secondary-color">{entry.phone}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              {purposeLabel ? (
                                <Badge variant="outline" className={purposeLabel.accent}>
                                  {purposeLabel.label}
                                </Badge>
                              ) : (
                                <Badge variant="outline">-</Badge>
                              )}
                              <p className="text-xs text-secondary-color">
                                {entry.occupation || "-"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-primary-color">
                                {entry.serviceName}
                              </p>
                              <p className="text-xs text-secondary-color">
                                {entry.queueType === "ONLINE" ? "Online" : "Offline"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-semibold text-primary-color">
                                {formatQueueCode(entry.queueNumber, entry.createdAt)}
                              </p>
                              <Badge variant="outline" className={statusBadgeClass[entry.status]}>
                                {statusLabels[entry.status]}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                entry.filledSKD
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                                  : "border-red-500/30 bg-red-500/10 text-red-700"
                              }
                            >
                              {entry.filledSKD ? "Sudah" : "Belum"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-sm">
                              <p className="font-medium text-primary-color">
                                {formatDate(entry.createdAt)}
                              </p>
                              <p className="text-xs text-secondary-color">
                                {formatDateTime(entry.createdAt)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() => openDetail(entry)}
                            >
                              <Eye className="h-4 w-4" />
                              Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="space-y-3 md:hidden">
                {entries.map((entry) => {
                  const purposeLabel = purposeOptions.find(
                    (option) => option.value === entry.purpose
                  );
                  return (
                    <div
                      key={entry.id}
                      className="rounded-xl border border-border/70 bg-background/80 p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-primary-color">{entry.fullName}</p>
                          <p className="text-xs text-secondary-color">{entry.phone}</p>
                          <p className="text-xs text-secondary-color">
                            {entry.institution || "-"}
                          </p>
                        </div>
                        <Badge variant="outline" className={statusBadgeClass[entry.status]}>
                          {statusLabels[entry.status]}
                        </Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {purposeLabel ? (
                          <Badge variant="outline" className={purposeLabel.accent}>
                            {purposeLabel.label}
                          </Badge>
                        ) : (
                          <Badge variant="outline">-</Badge>
                        )}
                        <Badge variant="outline">{entry.serviceName}</Badge>
                        <Badge
                          variant="outline"
                          className={
                            entry.filledSKD
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                              : "border-red-500/30 bg-red-500/10 text-red-700"
                          }
                        >
                          SKD {entry.filledSKD ? "Sudah" : "Belum"}
                        </Badge>
                      </div>
                      <div className="mt-2 text-xs text-secondary-color">
                        {formatDateTime(entry.createdAt)}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => openDetail(entry)}
                        >
                          <Eye className="h-4 w-4" />
                          Detail
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t border-border/70 pt-4 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-muted-foreground">
            Halaman {currentPage} dari {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={!canPrevPage || loading}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={!canNextPage || loading}
            >
              Berikutnya
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={detailOpen} onOpenChange={handleDetailOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detail Buku Tamu</DialogTitle>
          </DialogHeader>
          {selectedEntry ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-border/70 bg-muted/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-secondary-color">Kode antrean</p>
                    <p className="text-2xl font-bold text-primary-color">
                      {formatQueueCode(selectedEntry.queueNumber, selectedEntry.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className={statusBadgeClass[selectedEntry.status]}>
                      {statusLabels[selectedEntry.status]}
                    </Badge>
                    <Badge variant="outline">
                      {selectedEntry.queueType === "ONLINE" ? "Online" : "Offline"}
                    </Badge>
                  </div>
                </div>
                <p className="mt-2 text-xs text-secondary-color">
                  Dibuat pada {formatDateTime(selectedEntry.createdAt)}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                  <p className="text-xs font-semibold uppercase text-secondary-color">Data Pengunjung</p>
                  <div className="mt-3 space-y-2 text-sm">
                    <div>
                      <p className="text-xs text-secondary-color">Nama lengkap</p>
                      <p className="font-semibold text-primary-color">{selectedEntry.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-color">Kontak</p>
                      <p>{selectedEntry.phone}</p>
                      <p className="text-secondary-color">{selectedEntry.email || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-color">Alamat</p>
                      <p>{selectedEntry.address || "-"}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <div>
                        <p className="text-xs text-secondary-color">Umur</p>
                        <p>{selectedEntry.age ? `${selectedEntry.age} tahun` : "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-secondary-color">Jenis kelamin</p>
                        <p>
                          {selectedEntry.gender
                            ? genderLabels[selectedEntry.gender]
                            : "-"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-color">Pendidikan terakhir</p>
                      <p>
                        {selectedEntry.lastEducation
                          ? educationLabels[selectedEntry.lastEducation]
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                  <p className="text-xs font-semibold uppercase text-secondary-color">
                    Informasi Kunjungan
                  </p>
                  <div className="mt-3 space-y-2 text-sm">
                    <div>
                      <p className="text-xs text-secondary-color">Asal / Instansi</p>
                      <p>{selectedEntry.institution || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-color">Pekerjaan</p>
                      <p>{selectedEntry.occupation || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-color">Keperluan</p>
                      {selectedEntry.purpose ? (
                        <Badge
                          variant="outline"
                          className={
                            purposeOptions.find(
                              (option) => option.value === selectedEntry.purpose
                            )?.accent
                          }
                        >
                          {
                            purposeOptions.find(
                              (option) => option.value === selectedEntry.purpose
                            )?.label
                          }
                        </Badge>
                      ) : (
                        <p>-</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-secondary-color">Layanan</p>
                      <p className="font-semibold text-primary-color">
                        {selectedEntry.serviceName}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          selectedEntry.filledSKD
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                            : "border-red-500/30 bg-red-500/10 text-red-700"
                        }
                      >
                        SKD {selectedEntry.filledSKD ? "Sudah" : "Belum"}
                      </Badge>
                      {selectedEntry.trackingLink && (
                        <Badge variant="secondary" className="bg-background/80 text-secondary-color">
                          Tracking aktif
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-secondary-color">
              Detail pengunjung tidak ditemukan.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
