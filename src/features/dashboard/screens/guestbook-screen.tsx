"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  BellRing,
  Clock3,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  FileSpreadsheet,
  FileText,
  Loader2,
  RefreshCcw,
  Search,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/feedback/empty-state";
import { LiveStatusBadge } from "@/components/shared/feedback/live-status-badge";
import { PageContainer } from "@/components/shared/layout/page-container";
import { DashboardPageHeader } from "@/features/dashboard/components/layout/dashboard-page-header";
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
  DialogDescription,
  DialogFooter,
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
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import GuestbookTableRow from "@/features/dashboard/components/rows/guestbook-row";
import TableSkeleton from "@/features/dashboard/components/skeletons/table-skeleton";
import { queuesApi } from "@/services/api/queues";
import type { GuestbookEntry, GuestbookListResponse } from "@shared/types/guestbook";
import { useGuestbookPageController } from "@/features/dashboard/screens/guestbook-state/controller";
import {
  formatGuestbookDateTime,
  getGuestbookErrorMessage,
} from "@/features/dashboard/screens/guestbook-state/helper";
import {
  educationLabels,
  genderLabels,
  purposeOptions,
} from "@/features/dashboard/screens/guestbook-state/view-model";
import type {
  DateFilter,
  PurposeFilter,
  SortByFilter,
  SortOrderFilter,
} from "@/features/dashboard/screens/guestbook-state/schema";

type GuestbookPageProps = {
  initialData: GuestbookListResponse;
  initialFetchedAt: string;
};

export default function GuestbookPage({ initialData, initialFetchedAt }: GuestbookPageProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewEntry, setPreviewEntry] = useState<GuestbookEntry | null>(null);
  const [previewMessage, setPreviewMessage] = useState("");
  const [previewWhatsAppUrl, setPreviewWhatsAppUrl] = useState<string | null>(null);
  const [previewPhone, setPreviewPhone] = useState<string>("");
  const [isPreparingPreview, setIsPreparingPreview] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);

  const {
    searchTerm,
    setSearchTerm,
    purposeFilter,
    setPurposeFilter,
    dateFilter,
    setDateFilter,
    dateFilterLabel,
    filterYear,
    setFilterYear,
    filterMonth,
    setFilterMonth,
    filterQuarter,
    setFilterQuarter,
    filterSemester,
    setFilterSemester,
    sortBy,
    sortOrder,
    sortLabel,
    toggleColumnSort,
    getColumnSortOrder,
    yearOptions,
    monthOptions,
    quarterOptions,
    semesterOptions,
    dateFilterLabels,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    selectedEntry,
    detailOpen,
    exportingFormat,
    entries,
    summaryData,
    totalPages,
    canPrevPage,
    canNextPage,
    isInitialLoading,
    isRefreshing,
    hasFetched,
    lastFetchedLabel,
    showingLabel,
    purposeFilterLabel,
    hasActiveFilters,
    debouncedSearch,
    refresh,
    handleExport,
    openDetail,
    handleDetailOpenChange,
    resetFilters,
  } = useGuestbookPageController(initialData, initialFetchedAt);

  const summaryCards = [
    {
      title: "Total Catatan",
      value: summaryData.total,
      description: "Semua catatan layanan final pada filter aktif.",
      valueClassName: "text-primary-color",
    },
    {
      title: "Selesai Dilayani",
      value: summaryData.completed,
      description: "Layanan yang selesai diproses petugas.",
      valueClassName: "text-emerald-600",
    },
    {
      title: "Dibatalkan",
      value: summaryData.canceled,
      description: "Layanan yang dibatalkan dan tetap tercatat.",
      valueClassName: "text-rose-600",
    },
    {
      title: "Belum Isi SKD",
      value: summaryData.skdPending,
      description: "Pengunjung yang belum mengirim monitoring SKD.",
      valueClassName: "text-amber-600",
    },
  ];
  const selectedPurposeOption = selectedEntry?.purpose
    ? purposeOptions.find((option) => option.value === selectedEntry.purpose) ?? null
    : null;
  const selectedCompletedAtLabel = selectedEntry?.endTime
    ? formatGuestbookDateTime(selectedEntry.endTime)
    : "-";
  const selectedSkdClass = selectedEntry?.filledSKD
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
    : "border-red-500/30 bg-red-500/10 text-red-700";
  const selectedTrackingLink = selectedEntry?.trackingLink ?? null;
  const selectedTrackingIsUrl = selectedTrackingLink
    ? /^https?:\/\//i.test(selectedTrackingLink)
    : false;
  const isDefaultSort = sortBy === "createdAt" && sortOrder === "desc";

  const getSortIcon = (order: SortOrderFilter | null) => {
    if (!order) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-secondary-color/70" />;
    }
    if (order === "asc") {
      return <ArrowUp className="h-3.5 w-3.5 text-primary-color" />;
    }
    return <ArrowDown className="h-3.5 w-3.5 text-primary-color" />;
  };

  const renderSortableHeader = (
    label: string,
    column: SortByFilter,
    extraClassName?: string
  ) => {
    const activeOrder = getColumnSortOrder(column);
    return (
      <TableHead className={extraClassName}>
        <button
          type="button"
          onClick={() => toggleColumnSort(column)}
          className="mx-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-center text-sm font-semibold text-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          aria-label={`Urutkan kolom ${label}`}
          title={`Urutkan ${label}`}
        >
          <span>{label}</span>
          {getSortIcon(activeOrder)}
        </button>
      </TableHead>
    );
  };

  const resetPreviewState = () => {
    setPreviewEntry(null);
    setPreviewMessage("");
    setPreviewWhatsAppUrl(null);
    setPreviewPhone("");
  };

  const handlePreviewOpenChange = (open: boolean) => {
    setPreviewOpen(open);
    if (!open) {
      resetPreviewState();
    }
  };

  const handleOpenSkdPreview = async (entry: GuestbookEntry) => {
    if (entry.filledSKD) {
      toast.info("SKD sudah diisi, pengingat tidak diperlukan.");
      return;
    }

    try {
      setPreviewEntry(entry);
      setPreviewOpen(true);
      setIsPreparingPreview(true);

      const previewResponse = await queuesApi.previewSkdReminder(entry.id);
      const previewData = previewResponse.data ?? {};
      const previewMessageValue =
        typeof previewData.message === "string" ? previewData.message : "";

      if (!previewMessageValue.trim()) {
        throw new Error("Template pesan pengingat tidak tersedia.");
      }

      const previewPhoneValue =
        typeof previewData.phone === "string" ? previewData.phone : entry.phone;
      const previewWhatsappUrl =
        typeof previewData.whatsappUrl === "string" ? previewData.whatsappUrl : null;

      setPreviewMessage(previewMessageValue);
      setPreviewPhone(previewPhoneValue);
      setPreviewWhatsAppUrl(previewWhatsappUrl);
    } catch (error) {
      console.error("Error preparing SKD reminder preview:", error);
      handlePreviewOpenChange(false);
      toast.error(getGuestbookErrorMessage(error, "Gagal menyiapkan preview pesan"));
    } finally {
      setIsPreparingPreview(false);
    }
  };

  const handleConfirmSendSkdReminder = async () => {
    if (!previewEntry) return;
    if (!previewMessage.trim()) {
      toast.error("Template pesan kosong, tidak bisa dikirim.");
      return;
    }

    try {
      setIsSendingReminder(true);
      try {
        await queuesApi.remindSkdBot(previewEntry.id, previewMessage);
        toast.success("Pengingat SKD berhasil dikirim.");
      } catch (botError) {
        console.warn("Bot reminder failed, falling back to manual WhatsApp link:", botError);

        const fallbackResponse = await queuesApi.remindSkd(previewEntry.id, previewMessage);
        const whatsappUrl =
          typeof fallbackResponse.data?.whatsappUrl === "string"
            ? fallbackResponse.data.whatsappUrl
            : previewWhatsAppUrl;

        if (whatsappUrl) {
          window.open(whatsappUrl, "_blank", "noopener,noreferrer");
          toast.success("Bot tidak tersedia, pengingat dibuka via WhatsApp.");
        } else {
          toast.success("Pengingat SKD berhasil disiapkan.");
        }
      }

      handlePreviewOpenChange(false);
    } catch (error) {
      console.error("Error sending SKD reminder:", error);
      toast.error(getGuestbookErrorMessage(error, "Gagal mengirim pengingat SKD"));
    } finally {
      setIsSendingReminder(false);
    }
  };

  return (
    <PageContainer>
      <DashboardPageHeader
        title="Buku Tamu PST 6502"
        description="Catatan akhir layanan pengunjung dengan status selesai atau dibatalkan."
        meta={
          <>
            <span>Terakhir diperbarui: {lastFetchedLabel}</span>
            <LiveStatusBadge isRefreshing={isRefreshing} hasFetched={hasFetched} />
          </>
        }
        actions={
          <div className="dashboard-header-actions">
            <Button
              variant="outline"
              className="dashboard-header-action border-border"
              onClick={() => void refresh()}
              disabled={isRefreshing}
            >
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Memperbarui..." : "Perbarui Data"}
            </Button>
          </div>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          return (
            <Card key={card.title} className="border-border/80 bg-card shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wide text-secondary-color">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-bold ${card.valueClassName}`}>{card.value}</p>
                <p className="mt-1 text-xs text-secondary-color">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card className="border-border/80 bg-card shadow-none">
        <CardHeader className="gap-2">
          <CardTitle className="text-xl font-semibold text-primary-color">
            Daftar Buku Tamu
          </CardTitle>
          <CardDescription className="text-secondary-color">
            Daftar catatan akhir layanan beserta detail pengunjung dan layanan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="dashboard-filter-panel space-y-3">
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
                  onValueChange={(value) => setDateFilter(value as DateFilter)}
                >
                  <SelectTrigger className="w-full sm:w-[190px]">
                    <SelectValue placeholder="Filter tanggal" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(dateFilterLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {dateFilter === "year" ||
                dateFilter === "month" ||
                dateFilter === "quarter" ||
                dateFilter === "semester" ? (
                  <Select
                    value={filterYear.toString()}
                    onValueChange={(value) => setFilterYear(Number(value))}
                  >
                    <SelectTrigger className="w-full sm:w-[145px]">
                      <SelectValue placeholder="Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
                {dateFilter === "month" ? (
                  <Select
                    value={filterMonth.toString()}
                    onValueChange={(value) => setFilterMonth(Number(value))}
                  >
                    <SelectTrigger className="w-full sm:w-[185px]">
                      <SelectValue placeholder="Bulan" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
                {dateFilter === "quarter" ? (
                  <Select
                    value={filterQuarter.toString()}
                    onValueChange={(value) => setFilterQuarter(Number(value))}
                  >
                    <SelectTrigger className="w-full sm:w-[185px]">
                      <SelectValue placeholder="Triwulan" />
                    </SelectTrigger>
                    <SelectContent>
                      {quarterOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
                {dateFilter === "semester" ? (
                  <Select
                    value={filterSemester.toString()}
                    onValueChange={(value) => setFilterSemester(Number(value))}
                  >
                    <SelectTrigger className="w-full sm:w-[185px]">
                      <SelectValue placeholder="Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesterOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
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
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-border"
                  onClick={() => handleExport("xlsx")}
                  disabled={isRefreshing || exportingFormat !== null}
                  title="Export Excel"
                  aria-label="Export Excel"
                >
                  <FileSpreadsheet
                    className={`h-4 w-4 ${exportingFormat === "xlsx" ? "animate-pulse" : ""}`}
                  />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-border"
                  onClick={() => handleExport("pdf")}
                  disabled={isRefreshing || exportingFormat !== null}
                  title="Export PDF"
                  aria-label="Export PDF"
                >
                  <FileText
                    className={`h-4 w-4 ${exportingFormat === "pdf" ? "animate-pulse" : ""}`}
                  />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-secondary-color">
                <Clock3 className="h-4 w-4" />
                <span>{showingLabel}</span>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-secondary-color">
                {purposeFilter !== "ALL" && (
                  <Badge variant="secondary" className="bg-background/80 text-secondary-color">
                    Keperluan: {purposeFilterLabel}
                  </Badge>
                )}
                {dateFilter !== "today" && (
                  <Badge variant="secondary" className="bg-background/80 text-secondary-color">
                    Periode: {dateFilterLabel}
                  </Badge>
                )}
                {!isDefaultSort && (
                  <Badge variant="secondary" className="bg-background/80 text-secondary-color">
                    Urutkan: {sortLabel}
                  </Badge>
                )}
                {debouncedSearch && (
                  <Badge variant="secondary" className="bg-background/80 text-secondary-color">
                    Pencarian: &quot;{debouncedSearch}&quot;
                  </Badge>
                )}
              </div>
            )}
          </div>

          {isInitialLoading ? (
            <div className="overflow-x-auto">
              <TableSkeleton columns={8} rows={5} />
            </div>
          ) : entries.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title={hasActiveFilters ? "Tidak ada data yang sesuai" : "Belum ada buku tamu"}
              description={
                hasActiveFilters
                  ? "Coba ubah filter atau kata kunci pencarian."
                  : "Data buku tamu akan muncul setelah pengunjung mengisi formulir."
              }
              action={
                <>
                  <Button onClick={() => void refresh()} className="gap-2">
                    <RefreshCcw className="h-4 w-4" />
                    Muat ulang data
                  </Button>
                  {hasActiveFilters ? (
                    <Button variant="outline" onClick={resetFilters}>
                      Reset filter
                    </Button>
                  ) : null}
                </>
              }
            />
          ) : (
            <div className="space-y-4">
              <div className="dashboard-table-shell">
                <Table className="w-full md:min-w-[1160px]">
                  <TableHeader className="hidden bg-muted/35 md:table-header-group">
                    <TableRow>
                      <TableHead className="w-20 text-center">No</TableHead>
                      {renderSortableHeader("Pengunjung", "fullName", "text-center")}
                      {renderSortableHeader("Nomor Antrean", "queueNumber", "text-center")}
                      {renderSortableHeader("Layanan", "serviceName", "text-center")}
                      {renderSortableHeader("Tanggal Datang", "createdAt", "text-center")}
                      <TableHead className="text-center">Petugas</TableHead>
                      <TableHead className="text-center">Monitoring SKD</TableHead>
                      <TableHead className="w-[140px] text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry, index) => (
                      <GuestbookTableRow
                        key={entry.id}
                        rowNumber={(currentPage - 1) * pageSize + index + 1}
                        entry={entry}
                        onViewDetail={openDetail}
                      />
                    ))}
                  </TableBody>
                </Table>
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
              disabled={!canPrevPage || isRefreshing}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={!canNextPage || isRefreshing}
            >
              Berikutnya
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={detailOpen} onOpenChange={handleDetailOpenChange}>
        <DialogContent className="max-w-4xl pr-14 sm:pr-16">
          <DialogHeader>
            <DialogTitle>Detail Buku Tamu</DialogTitle>
          </DialogHeader>
          {selectedEntry ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm text-secondary-color">Pengunjung</p>
                    <p className="text-lg font-semibold text-primary-color">{selectedEntry.fullName}</p>
                    <p className="mt-1 text-xs text-secondary-color">No. WA: {selectedEntry.phone}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={selectedSkdClass}>
                      SKD: {selectedEntry.filledSKD ? "Sudah" : "Belum"}
                    </Badge>
                    {!selectedEntry.filledSKD ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void handleOpenSkdPreview(selectedEntry)}
                        disabled={isPreparingPreview || isSendingReminder}
                        className="h-8 gap-1.5 border-border/80"
                      >
                        {isPreparingPreview ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <BellRing className="h-3.5 w-3.5" />
                        )}
                        Kirim Pengingat SKD
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary-color">
                  Ringkasan Layanan
                </p>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <div className="rounded-md bg-muted/20 px-3 py-2">
                    <dt className="text-xs text-secondary-color">Nomor antrean</dt>
                    <dd className="font-semibold text-primary-color">{selectedEntry.queueCode}</dd>
                  </div>
                  <div className="rounded-md bg-muted/20 px-3 py-2">
                    <dt className="text-xs text-secondary-color">Nomor urut sistem</dt>
                    <dd>{selectedEntry.queueNumber}</dd>
                  </div>
                  <div className="rounded-md bg-muted/20 px-3 py-2">
                    <dt className="text-xs text-secondary-color">Layanan</dt>
                    <dd className="break-words font-medium">{selectedEntry.serviceName}</dd>
                  </div>
                  <div className="rounded-md bg-muted/20 px-3 py-2">
                    <dt className="text-xs text-secondary-color">Petugas</dt>
                    <dd className="break-words">{selectedEntry.officerName || "-"}</dd>
                  </div>
                  <div className="rounded-md bg-muted/20 px-3 py-2">
                    <dt className="text-xs text-secondary-color">Tanggal datang / antrean dibuat</dt>
                    <dd>{formatGuestbookDateTime(selectedEntry.createdAt)}</dd>
                  </div>
                  <div className="rounded-md bg-muted/20 px-3 py-2">
                    <dt className="text-xs text-secondary-color">Tanggal selesai pelayanan</dt>
                    <dd>{selectedCompletedAtLabel}</dd>
                  </div>
                  <div className="rounded-md bg-muted/20 px-3 py-2">
                    <dt className="text-xs text-secondary-color">Monitoring SKD</dt>
                    <dd>
                      <Badge variant="outline" className={selectedSkdClass}>
                        {selectedEntry.filledSKD ? "Sudah" : "Belum"}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border/70 bg-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary-color">
                    Data Pengunjung
                  </p>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 rounded-md bg-muted/20 px-3 py-2">
                      <dt className="text-xs text-secondary-color">Nama lengkap</dt>
                      <dd className="break-words font-semibold text-primary-color">{selectedEntry.fullName}</dd>
                    </div>
                    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 rounded-md bg-muted/20 px-3 py-2">
                      <dt className="text-xs text-secondary-color">Nomor WA</dt>
                      <dd>{selectedEntry.phone}</dd>
                    </div>
                    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 rounded-md bg-muted/20 px-3 py-2">
                      <dt className="text-xs text-secondary-color">Email</dt>
                      <dd className="break-all">{selectedEntry.email || "-"}</dd>
                    </div>
                    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 rounded-md bg-muted/20 px-3 py-2">
                      <dt className="text-xs text-secondary-color">Asal / Instansi</dt>
                      <dd className="break-words">{selectedEntry.institution || "-"}</dd>
                    </div>
                    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 rounded-md bg-muted/20 px-3 py-2">
                      <dt className="text-xs text-secondary-color">Alamat</dt>
                      <dd className="break-words">{selectedEntry.address || "-"}</dd>
                    </div>
                  </dl>
                </div>
                <div className="rounded-lg border border-border/70 bg-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary-color">
                    Data Tambahan
                  </p>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 rounded-md bg-muted/20 px-3 py-2">
                      <dt className="text-xs text-secondary-color">Umur</dt>
                      <dd>{selectedEntry.age ? `${selectedEntry.age} tahun` : "-"}</dd>
                    </div>
                    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 rounded-md bg-muted/20 px-3 py-2">
                      <dt className="text-xs text-secondary-color">Jenis kelamin</dt>
                      <dd>{selectedEntry.gender ? genderLabels[selectedEntry.gender] : "-"}</dd>
                    </div>
                    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 rounded-md bg-muted/20 px-3 py-2">
                      <dt className="text-xs text-secondary-color">Pendidikan terakhir</dt>
                      <dd>
                        {selectedEntry.lastEducation
                          ? educationLabels[selectedEntry.lastEducation]
                          : "-"}
                      </dd>
                    </div>
                    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 rounded-md bg-muted/20 px-3 py-2">
                      <dt className="text-xs text-secondary-color">Pekerjaan</dt>
                      <dd className="break-words">{selectedEntry.occupation || "-"}</dd>
                    </div>
                    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 rounded-md bg-muted/20 px-3 py-2">
                      <dt className="text-xs text-secondary-color">Keperluan</dt>
                      {selectedPurposeOption ? (
                        <dd>
                          <Badge variant="secondary" className="bg-muted/40 text-primary-color">
                            {selectedPurposeOption.label}
                          </Badge>
                        </dd>
                      ) : (
                        <dd>-</dd>
                      )}
                    </div>
                    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 rounded-md bg-muted/20 px-3 py-2">
                      <dt className="text-xs text-secondary-color">Link monitoring</dt>
                      {selectedTrackingLink ? (
                        <dd>
                          {selectedTrackingIsUrl ? (
                            <a
                              href={selectedTrackingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="break-all text-primary hover:underline"
                            >
                              {selectedTrackingLink}
                            </a>
                          ) : (
                            <span className="break-all font-mono text-[13px] text-primary-color">
                              {selectedTrackingLink}
                            </span>
                          )}
                        </dd>
                      ) : (
                        <dd>-</dd>
                      )}
                    </div>
                  </dl>
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

      <Dialog open={previewOpen} onOpenChange={handlePreviewOpenChange}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Preview Pesan</DialogTitle>
            <DialogDescription>
              Periksa template pesan sebelum mengirim pengingat SKD ke pengunjung.
            </DialogDescription>
          </DialogHeader>
          {previewEntry ? (
            <div className="space-y-3">
              <div className="rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-sm">
                <p>
                  Penerima: <strong>{previewEntry.fullName}</strong>
                </p>
                <p>
                  Nomor WA: <strong>{previewPhone || previewEntry.phone}</strong>
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-primary-color">Isi pesan</p>
                <Textarea
                  value={previewMessage}
                  readOnly
                  className="min-h-44 resize-none bg-background/80"
                />
              </div>
              {previewWhatsAppUrl ? (
                <p className="text-xs text-secondary-color">
                  Fallback WhatsApp link sudah disiapkan jika bot tidak tersedia.
                </p>
              ) : null}
            </div>
          ) : null}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => handlePreviewOpenChange(false)}>
              Tutup
            </Button>
            <Button
              onClick={() => void handleConfirmSendSkdReminder()}
              disabled={isPreparingPreview || isSendingReminder || !previewEntry || !previewMessage}
              className="gap-2"
            >
              {isSendingReminder ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Kirim Pengingat SKD
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
