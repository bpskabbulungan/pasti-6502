"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Send,
  Clock3,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  FileSpreadsheet,
  Loader2,
  RefreshCcw,
  Search,
  X,
  ChevronDown,
  Pencil,
  MessageCircle,
  AlertCircle,
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
  getGuestbookErrorMessage,
} from "@/features/dashboard/screens/guestbook-state/helper";
import { formatDisplayDate } from "@/lib/date-format";
import { serializeErrorForLog } from "@/lib/error-log";
import {
  educationLabels,
  genderLabels,
} from "@/features/dashboard/screens/guestbook-state/view-model";
import type {
  DateFilter,
  SortByFilter,
  SortOrderFilter,
} from "@/features/dashboard/screens/guestbook-state/schema";

type GuestbookPageProps = {
  initialData: GuestbookListResponse;
  initialFetchedAt: string;
};

const getSkdBadgeClass = (filledSKD: boolean) =>
  filledSKD
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-300/35 dark:bg-emerald-400/10 dark:text-emerald-200"
    : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:border-amber-300/35 dark:bg-amber-400/10 dark:text-amber-200";

const serviceStatusLabel = {
  WAITING: "Menunggu",
  SERVING: "Sedang Dilayani",
  COMPLETED: "Selesai",
  CANCELED: "Dibatalkan",
} as const;

const serviceStatusClass = {
  WAITING:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:border-amber-300/35 dark:bg-amber-400/10 dark:text-amber-200",
  SERVING:
    "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:border-sky-300/35 dark:bg-sky-400/10 dark:text-sky-200",
  COMPLETED:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-300/35 dark:bg-emerald-400/10 dark:text-emerald-200",
  CANCELED:
    "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:border-rose-300/35 dark:bg-rose-400/10 dark:text-rose-200",
} as const;

const filterChipClass =
  "border-border/70 bg-muted/35 text-secondary-color dark:border-border/70 dark:bg-muted/25 dark:text-secondary-color";

const serviceInfoBadgeClass =
  "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:border-sky-300/35 dark:bg-sky-400/10 dark:text-sky-200";

export default function GuestbookPage({ initialData, initialFetchedAt }: GuestbookPageProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewEntry, setPreviewEntry] = useState<GuestbookEntry | null>(null);
  const [previewMessage, setPreviewMessage] = useState("");
  const [previewWhatsAppUrl, setPreviewWhatsAppUrl] = useState<string | null>(null);
  const [previewPhone, setPreviewPhone] = useState<string>("");
  const [isPreparingPreview, setIsPreparingPreview] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [expandVisitorData, setExpandVisitorData] = useState(false);
  const [expandAdditionalData, setExpandAdditionalData] = useState(false);
  const [templateEditOpen, setTemplateEditOpen] = useState(false);
  const [editableTemplate, setEditableTemplate] = useState("");
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const previewRequestSeqRef = useRef(0);

  const {
    searchTerm,
    setSearchTerm,
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
      title: "Total Pengunjung",
      value: summaryData.total,
      description: "Semua pengunjung pada filter aktif.",
      valueClassName: "text-primary-color",
    },
    {
      title: "Selesai Dilayani",
      value: summaryData.completed,
      description: "Layanan yang selesai diproses petugas.",
      valueClassName: "text-primary-color",
    },
    {
      title: "Dibatalkan",
      value: summaryData.canceled,
      description: "Layanan yang dibatalkan oleh petugas.",
      valueClassName: "text-primary-color",
    },
    {
      title: "Belum Isi SKD",
      value: summaryData.skdPending,
      description: "Pengunjung yang belum mengisi SKD.",
      valueClassName: "text-primary-color",
    },
  ];
  const selectedSkdClass = getSkdBadgeClass(Boolean(selectedEntry?.filledSKD));
  const selectedServiceStatusClass = selectedEntry
    ? serviceStatusClass[selectedEntry.status]
    : serviceStatusClass.COMPLETED;
  const selectedServiceStatusLabel = selectedEntry
    ? serviceStatusLabel[selectedEntry.status]
    : serviceStatusLabel.COMPLETED;
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
      previewRequestSeqRef.current += 1;
      resetPreviewState();
    }
  };

  const handleOpenTemplateEditor = async () => {
    try {
      // Always fetch fresh template from server
      const response = await queuesApi.getSkdTemplate();
      const template = response.template ?? "";
      setEditableTemplate(template);
      setTemplateEditOpen(true);
    } catch (error) {
      console.error("Error loading template:", serializeErrorForLog(error));
      toast.error(getGuestbookErrorMessage(error, "Gagal memuat template"));
    }
  };

  const fetchSkdPreviewWithRetry = async (queueId: string) => {
    const requestPreview = async () => {
      const previewResponse = await queuesApi.previewSkdReminder(queueId);
      const previewData = previewResponse.data ?? {};
      const previewMessageValue =
        typeof previewData.message === "string" ? previewData.message : "";
      const previewPhoneValue =
        typeof previewData.phone === "string" ? previewData.phone : "";
      const previewWhatsappUrl =
        typeof previewData.whatsappUrl === "string" ? previewData.whatsappUrl : null;

      return {
        previewMessageValue,
        previewPhoneValue,
        previewWhatsappUrl,
      };
    };

    let result = await requestPreview();
    if (!result.previewMessageValue.trim()) {
      // Retry sekali untuk mengurangi efek respons kosong yang intermittent.
      await new Promise((resolve) => setTimeout(resolve, 150));
      result = await requestPreview();
    }

    return result;
  };

  const handleSaveTemplate = async () => {
    if (!editableTemplate.trim()) {
      toast.error("Template pesan tidak boleh kosong.");
      return;
    }
    
    try {
      setIsSavingTemplate(true);
      await queuesApi.updateSkdTemplate(editableTemplate);
      
      // Refresh preview dengan template baru yang baru disave
      if (previewEntry) {
        const requestSeq = ++previewRequestSeqRef.current;
        setIsPreparingPreview(true);
        try {
          const { previewMessageValue } = await fetchSkdPreviewWithRetry(previewEntry.id);
          if (requestSeq !== previewRequestSeqRef.current) {
            return;
          }
          setPreviewMessage(previewMessageValue);
        } finally {
          if (requestSeq === previewRequestSeqRef.current) {
            setIsPreparingPreview(false);
          }
        }
      }
      
      setEditableTemplate("");
      setTemplateEditOpen(false);
      toast.success("Template pesan berhasil diperbarui.");
    } catch (error) {
      console.error("Error saving template:", serializeErrorForLog(error));
      toast.error(getGuestbookErrorMessage(error, "Gagal menyimpan template"));
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleOpenSkdPreview = async (entry: GuestbookEntry) => {
    if (entry.filledSKD) {
      toast.info("SKD sudah diisi, pengingat tidak diperlukan.");
      return;
    }

    const requestSeq = ++previewRequestSeqRef.current;

    try {
      setPreviewEntry(entry);
      setPreviewMessage("");
      setPreviewPhone(entry.phone);
      setPreviewWhatsAppUrl(null);
      setPreviewOpen(true);
      setIsPreparingPreview(true);

      const {
        previewMessageValue,
        previewPhoneValue,
        previewWhatsappUrl,
      } = await fetchSkdPreviewWithRetry(entry.id);
      if (requestSeq !== previewRequestSeqRef.current) {
        return;
      }

      if (!previewMessageValue.trim()) {
        throw new Error("Template pesan pengingat tidak tersedia.");
      }

      setPreviewMessage(previewMessageValue);
      setPreviewPhone(previewPhoneValue || entry.phone);
      setPreviewWhatsAppUrl(previewWhatsappUrl);
    } catch (error) {
      console.error("Error preparing SKD reminder preview:", serializeErrorForLog(error));
      handlePreviewOpenChange(false);
      toast.error(getGuestbookErrorMessage(error, "Gagal menyiapkan preview pesan"));
    } finally {
      if (requestSeq === previewRequestSeqRef.current) {
        setIsPreparingPreview(false);
      }
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
        console.warn(
          "Bot reminder failed, falling back to manual WhatsApp link:",
          serializeErrorForLog(botError)
        );

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
      console.error("Error sending SKD reminder:", serializeErrorForLog(error));
      toast.error(getGuestbookErrorMessage(error, "Gagal mengirim pengingat SKD"));
    } finally {
      setIsSendingReminder(false);
    }
  };

  return (
    <PageContainer>
      <DashboardPageHeader
        title="Buku Tamu PST BPS Kabupaten Bulungan"
        description="Halaman pencatatan layanan pengunjung dengan status selesai atau dibatalkan."
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
            Daftar Buku Tamu PST
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
                  size="icon"
                  className="border-border"
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                  title="Reset filter"
                  aria-label="Reset filter"
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-border"
                  onClick={() => handleExport("xlsx")}
                  disabled={isRefreshing || exportingFormat !== null}
                  title={exportingFormat === "xlsx" ? "Menyusun export Excel" : "Export Excel"}
                  aria-label={exportingFormat === "xlsx" ? "Menyusun export Excel" : "Export Excel"}
                >
                  {exportingFormat === "xlsx" ? (
                    <RefreshCcw className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4" />
                  )}
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
                {dateFilter !== "today" && (
                  <Badge variant="outline" className={filterChipClass}>
                    Periode: {dateFilterLabel}
                  </Badge>
                )}
                {!isDefaultSort && (
                  <Badge variant="outline" className={filterChipClass}>
                    Urutkan: {sortLabel}
                  </Badge>
                )}
                {debouncedSearch && (
                  <Badge variant="outline" className={filterChipClass}>
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
                      {renderSortableHeader("Nomor Antrean", "queueCode", "text-center")}
                      {renderSortableHeader("Layanan", "serviceName", "text-center")}
                      {renderSortableHeader("Tanggal Datang", "createdAt", "text-center")}
                      {renderSortableHeader("Petugas", "officerName", "text-center")}
                      {renderSortableHeader("Monitoring SKD", "filledSKD", "text-center")}
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
        <DialogContent className="max-w-4xl pr-4 sm:pr-6 max-h-[calc(100vh-6rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Buku Tamu</DialogTitle>
          </DialogHeader>
          {selectedEntry ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold text-primary-color">{selectedEntry.fullName}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/20 px-2.5 py-1.5 text-sm font-medium text-primary-color">
                      <MessageCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{selectedEntry.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <LiveStatusBadge
                      isRefreshing={isRefreshing} 
                      hasFetched={hasFetched}

                    />

                    {selectedTrackingLink && selectedTrackingIsUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => window.open(selectedTrackingLink, "_blank", "noopener,noreferrer")}
                      >
                        <Pencil className="h-4 w-4" />
                        Lacak Layanan 
                      </Button>
                    )}
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
                    <dt className="text-xs text-secondary-color">Layanan</dt>
                    <dd className="break-words font-medium">{selectedEntry.serviceName}</dd>
                  </div>
                  <div className="rounded-md bg-muted/20 px-3 py-2">
                    <dt className="text-xs text-secondary-color">Status layanan</dt>
                    <dd>
                      <Badge variant="outline" className={selectedServiceStatusClass}>
                        {selectedServiceStatusLabel}
                      </Badge>
                    </dd>
                  </div>
                  <div className="rounded-md bg-muted/20 px-3 py-2">
                    <dt className="text-xs text-secondary-color">Petugas</dt>
                    <dd className="break-words">{selectedEntry.officerName || "-"}</dd>
                  </div>
                  <div className="rounded-md bg-muted/20 px-3 py-2">
                    <dt className="text-xs text-secondary-color">Tanggal Kunjungan</dt>
                    <dd>{formatDisplayDate(selectedEntry.createdAt)}</dd>
                  </div>
                  <div className="rounded-md bg-muted/20 px-3 py-2">
                    <dt className="text-xs text-secondary-color">Status SKD</dt>
                    <dd>
                      <Badge variant="outline" className={selectedSkdClass}>
                        {selectedEntry.filledSKD ? "Sudah" : "Belum"}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-lg border-2 border-border/70 bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-color">
                  Monitoring Survei Kebutuhan Data (SKD)
                </p>
                <div className="mt-3 flex flex-col gap-4">
                  <p className="text-sm text-secondary-color">
                    {selectedEntry.filledSKD
                      ? "Pengunjung sudah mengisi SKD."
                      : "Pengunjung belum mengisi SKD."}
                  </p>
                  {!selectedEntry.filledSKD && (
                    <Button
                      onClick={() => void handleOpenSkdPreview(selectedEntry)}
                      disabled={isPreparingPreview || isSendingReminder}
                      className="gap-2 h-9 w-full sm:w-auto"
                    >
                      <span>{isPreparingPreview ? "Mempersiapkan..." : "Kirim Pengingat"}</span>
                      {isPreparingPreview ? (
                        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                      ) : (
                        <Send className="h-4 w-4 shrink-0" />
                      )}
                    </Button>
                  )}
                  {selectedEntry.filledSKD && (
                    <div className="flex items-center gap-2 rounded-md border border-border/70 bg-muted/20 px-3 py-2">
                      <svg className="h-5 w-5 text-primary-color" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      <span className="text-sm font-medium text-primary-color">SKD sudah diisi</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="overflow-hidden rounded-lg border border-border/70 bg-card">
                  <button
                    onClick={() => setExpandVisitorData(!expandVisitorData)}
                    className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-muted/20 active:bg-muted/30 transition-all duration-200 ease-out"
                  >
                    <p className="line-clamp-1 text-xs font-semibold uppercase tracking-wide text-secondary-color">
                      Data Pengunjung
                    </p>
                    <ChevronDown
                      className={`flex-shrink-0 ml-2 h-4 w-4 text-secondary-color transition-transform duration-300 ease-out ${
                        expandVisitorData ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandVisitorData && (
                    <div className="border-t border-border/70 p-4">
                      <dl className="space-y-3 text-sm">
                        <div className="rounded-md bg-muted/20 px-3 py-2">
                          <dt className="text-xs text-secondary-color font-medium">Nama lengkap</dt>
                          <dd className="mt-1 font-semibold text-primary-color break-words">{selectedEntry.fullName}</dd>
                        </div>
                        <div className="rounded-md bg-muted/20 px-3 py-2">
                          <dt className="text-xs text-secondary-color font-medium">Nomor WA</dt>
                          <dd className="mt-1 break-words">{selectedEntry.phone}</dd>
                        </div>
                        <div className="rounded-md bg-muted/20 px-3 py-2">
                          <dt className="text-xs text-secondary-color font-medium">Email</dt>
                          <dd className="mt-1 break-all text-xs">{selectedEntry.email || "-"}</dd>
                        </div>
                        <div className="rounded-md bg-muted/20 px-3 py-2">
                          <dt className="text-xs text-secondary-color font-medium">Asal / Instansi</dt>
                          <dd className="mt-1 break-words">{selectedEntry.institution || "-"}</dd>
                        </div>
                        <div className="rounded-md bg-muted/20 px-3 py-2">
                          <dt className="text-xs text-secondary-color font-medium">Alamat</dt>
                          <dd className="mt-1 break-words">{selectedEntry.address || "-"}</dd>
                        </div>
                      </dl>
                    </div>
                  )}
                </div>
                <div className="overflow-hidden rounded-lg border border-border/70 bg-card">
                  <button
                    onClick={() => setExpandAdditionalData(!expandAdditionalData)}
                    className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-muted/20 active:bg-muted/30 transition-all duration-200 ease-out"
                  >
                    <p className="line-clamp-1 text-xs font-semibold uppercase tracking-wide text-secondary-color">
                      Data Tambahan
                    </p>
                    <ChevronDown
                      className={`flex-shrink-0 ml-2 h-4 w-4 text-secondary-color transition-transform duration-300 ease-out ${
                        expandAdditionalData ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandAdditionalData && (
                    <div className="border-t border-border/70 p-4">
                      <dl className="space-y-3 text-sm">
                        <div className="rounded-md bg-muted/20 px-3 py-2">
                          <dt className="text-xs text-secondary-color font-medium">Umur</dt>
                          <dd className="mt-1">{selectedEntry.age ? `${selectedEntry.age} tahun` : "-"}</dd>
                        </div>
                        <div className="rounded-md bg-muted/20 px-3 py-2">
                          <dt className="text-xs text-secondary-color font-medium">Jenis kelamin</dt>
                          <dd className="mt-1">{selectedEntry.gender ? genderLabels[selectedEntry.gender] : "-"}</dd>
                        </div>
                        <div className="rounded-md bg-muted/20 px-3 py-2">
                          <dt className="text-xs text-secondary-color font-medium">Pendidikan terakhir</dt>
                          <dd className="mt-1">
                            {selectedEntry.lastEducation
                              ? educationLabels[selectedEntry.lastEducation]
                              : "-"}
                          </dd>
                        </div>
                        <div className="rounded-md bg-muted/20 px-3 py-2">
                          <dt className="text-xs text-secondary-color font-medium">Pekerjaan</dt>
                          <dd className="mt-1 break-words">{selectedEntry.occupation || "-"}</dd>
                        </div>
                        <div className="rounded-md bg-muted/20 px-3 py-2">
                          <dt className="text-xs text-secondary-color font-medium">Layanan</dt>
                          <dd className="mt-1">
                            <Badge variant="outline" className={serviceInfoBadgeClass}>
                              {selectedEntry.serviceName || "-"}
                            </Badge>
                          </dd>
                        </div>
                      </dl>
                    </div>
                  )}
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
        <DialogContent className="max-w-2xl max-h-[calc(100vh-6rem)] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-2">
              <DialogTitle>Pratinjau Pesan WhatsApp</DialogTitle>
              <span className="text-xs font-medium text-secondary-color">
                {isPreparingPreview ? "Memuat pesan..." : `${previewMessage.length} karakter`}
              </span>
            </div>
            <DialogDescription>
              Periksa penerima dan preview pesan sebelum mengirim.
            </DialogDescription>
          </DialogHeader>
          {previewEntry ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-primary-color">{previewEntry.fullName}</p>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-sm text-primary-color">
                      <MessageCircle className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">{previewPhone || previewEntry.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {previewMessage.length > 1000 && (
                <div className="flex gap-3 rounded-lg border border-border/70 bg-muted/20 p-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-primary-color mt-0.5" />
                  <div className="text-sm text-primary-color">
                    <p className="font-semibold">Pesan terlalu panjang</p>
                    <p className="text-xs mt-1">Pesan melebihi 1000 karakter ({previewMessage.length} karakter). Pertimbangkan untuk mempersingkat.</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary-color">Pratinjau Pesan</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenTemplateEditor}
                    disabled={isPreparingPreview || isSendingReminder}
                    className="gap-2 h-8"
                    title="Edit template"
                    aria-label="Edit template"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </Button>
                </div>
                <div className="flex justify-center rounded-lg border border-border/40 bg-muted/40 p-6">
                  <div className="max-w-xs space-y-2">
                    {isPreparingPreview ? (
                      <div className="flex min-h-12 items-center gap-2 rounded-lg bg-muted px-4 py-3 text-sm text-secondary-color shadow-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Menyiapkan pesan pengingat...</span>
                      </div>
                    ) : (
                      <div className="rounded-lg bg-emerald-500 px-4 py-3 text-white text-sm break-words shadow-sm">
                        {previewMessage}
                      </div>
                    )}
                    <div className="text-right text-xs text-secondary-color px-4">
                      Hari ini
                    </div>
                  </div>
                </div>
              </div>
              {previewWhatsAppUrl ? (
                <p className="text-xs text-secondary-color rounded-md bg-muted/30 p-2">
                  Jika bot tidak tersedia, pesan akan dibuka melalui tautan WhatsApp.
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
              Kirim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={templateEditOpen} onOpenChange={setTemplateEditOpen}>
        <DialogContent className="max-w-2xl max-h-[calc(100vh-6rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template Pesan SKD</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-lg border border-border/70 bg-muted/20 p-3 text-xs text-secondary-color">
              <p className="font-medium mb-2">Variabel yang tersedia:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>{'{nama}'} - Nama pengunjung</li>
                <li>{'{link}'} - Link survei SKD</li>
                <li>{'{tanggal}'} - Tanggal kunjungan</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium text-primary-color">Template Pesan</label>
                <span className="text-xs font-medium text-secondary-color">{editableTemplate.length} / 2000 karakter</span>
              </div>
              <Textarea
                value={editableTemplate}
                onChange={(e) => setEditableTemplate(e.target.value)}
                placeholder="Tulis template pesan di sini..."
                className="min-h-48 resize-none"
                maxLength={2000}
              />
              {editableTemplate.trim().length === 0 && (
                <div className="flex gap-2 rounded-lg border border-border/70 bg-muted/20 p-2 text-xs text-primary-color">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>Template pesan tidak boleh kosong</span>
                </div>
              )}
              {editableTemplate.trim().length > 0 && editableTemplate.trim().length < 10 && (
                <div className="flex gap-2 rounded-lg border border-border/70 bg-muted/20 p-2 text-xs text-primary-color">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>Template terlalu pendek (minimal 10 karakter)</span>
                </div>
              )}
              <p className="text-xs text-secondary-color">
                Template ini akan otomatis diisi dengan data pengunjung.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setTemplateEditOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={() => void handleSaveTemplate()}
              disabled={isSavingTemplate}
              className="gap-2"
            >
              {isSavingTemplate && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
