"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  FileText,
  RefreshCcw,
  Search,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/feedback/empty-state";
import { LiveStatusBadge } from "@/components/shared/feedback/live-status-badge";
import { PageContainer } from "@/components/shared/layout/page-container";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GuestbookTableRow from "@/features/dashboard/components/rows/guestbook-row";
import TableSkeleton from "@/features/dashboard/components/skeletons/table-skeleton";
import { QueueStatus } from "@/shared/constants/enums";
import type { GuestbookListResponse } from "@shared/types/guestbook";
import { useGuestbookPageController } from "@/features/dashboard/screens/guestbook-state/controller";
import { formatGuestbookDateTime } from "@/features/dashboard/screens/guestbook-state/helper";
import {
  educationLabels,
  genderLabels,
  purposeOptions,
  statusBadgeClass,
  statusLabels,
} from "@/features/dashboard/screens/guestbook-state/view-model";
import type { PurposeFilter, StatusFilter } from "@/features/dashboard/screens/guestbook-state/schema";

type GuestbookPageProps = {
  initialData: GuestbookListResponse;
};

export default function GuestbookPage({ initialData }: GuestbookPageProps) {
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    purposeFilter,
    setPurposeFilter,
    dateFilter,
    setDateFilter,
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
    statusFilterLabel,
    hasActiveFilters,
    debouncedSearch,
    refresh,
    handleExport,
    openDetail,
    handleDetailOpenChange,
    resetFilters,
  } = useGuestbookPageController(initialData);

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

  return (
    <PageContainer>
      <section className="dashboard-hero p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-primary-color sm:text-3xl">Buku Tamu PST</h1>
              <p className="max-w-xl text-secondary-color">
                Rekapitulasi kunjungan pengunjung yang sudah dilayani atau selesai.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-secondary-color">
              <span>Terakhir diperbarui: {lastFetchedLabel}</span>
              <LiveStatusBadge isRefreshing={isRefreshing} hasFetched={hasFetched} />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="w-full gap-2 border-border sm:w-auto"
                onClick={() => void refresh()}
                disabled={isRefreshing}
              >
                <RefreshCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Memperbarui..." : "Muat ulang data"}
              </Button>
              <Badge variant="outline" className="border-border/70 bg-background/80">
                Filter: {dateFilter === "today" ? "Hari ini" : "Semua tanggal"}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="border-border/80 bg-card/88">
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

      <Card className="border-border/80">
        <CardHeader className="gap-2">
          <CardTitle className="text-xl font-semibold text-primary-color">
            Daftar Buku Tamu
          </CardTitle>
          <CardDescription className="text-secondary-color">
            Pantau data pengunjung yang sudah dilayani/selesai beserta detail layanan.
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
              <Tabs
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as StatusFilter)}
              >
                <TabsList className="w-full border border-border/70 bg-background/80 sm:w-auto">
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

            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-secondary-color">
                {statusFilter !== "ALL" && (
                  <Badge variant="secondary" className="bg-background/80 text-secondary-color">
                    Status: {statusFilterLabel}
                  </Badge>
                )}
                {purposeFilter !== "ALL" && (
                  <Badge variant="secondary" className="bg-background/80 text-secondary-color">
                    Keperluan: {purposeFilterLabel}
                  </Badge>
                )}
                {dateFilter !== "today" && (
                  <Badge variant="secondary" className="bg-background/80 text-secondary-color">
                    Tanggal: Semua tanggal
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
              <TableSkeleton columns={7} rows={5} />
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
                <Table className="w-full md:min-w-[1080px]">
                  <TableHeader className="hidden bg-muted/50 md:table-header-group">
                    <TableRow>
                      <TableHead className="text-center">Pengunjung</TableHead>
                      <TableHead className="text-center">Layanan</TableHead>
                      <TableHead className="text-center">Antrean</TableHead>
                      <TableHead className="text-center">Waktu</TableHead>
                      <TableHead className="text-center">SKD</TableHead>
                      <TableHead className="text-center">Petugas</TableHead>
                      <TableHead className="w-[90px] text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <GuestbookTableRow
                        key={entry.id}
                        entry={entry}
                        statusLabels={statusLabels}
                        statusBadgeClass={statusBadgeClass}
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
                      {selectedEntry.queueCode}
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
                  Dibuat pada {formatGuestbookDateTime(selectedEntry.createdAt)}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border/70 bg-background/80 p-4">
                  <p className="text-xs font-semibold uppercase text-secondary-color">
                    Data Pengunjung
                  </p>
                  <div className="mt-3 space-y-2 text-sm">
                    <div>
                      <p className="text-xs text-secondary-color">Nama lengkap</p>
                      <p className="break-words font-semibold text-primary-color">{selectedEntry.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-color">Kontak</p>
                      <p>{selectedEntry.phone}</p>
                      <p className="text-secondary-color">{selectedEntry.email || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-color">Alamat</p>
                      <p className="break-words">{selectedEntry.address || "-"}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <div>
                        <p className="text-xs text-secondary-color">Umur</p>
                        <p>{selectedEntry.age ? `${selectedEntry.age} tahun` : "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-secondary-color">Jenis kelamin</p>
                        <p>{selectedEntry.gender ? genderLabels[selectedEntry.gender] : "-"}</p>
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
                      <p className="break-words">{selectedEntry.institution || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-color">Pekerjaan</p>
                      <p className="break-words">{selectedEntry.occupation || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-secondary-color">Keperluan</p>
                      {selectedEntry.purpose ? (
                        <Badge
                          variant="outline"
                          className={
                            purposeOptions.find((option) => option.value === selectedEntry.purpose)
                              ?.accent
                          }
                        >
                          {
                            purposeOptions.find((option) => option.value === selectedEntry.purpose)
                              ?.label
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
                    <div>
                      <p className="text-xs text-secondary-color">Petugas</p>
                      <p>{selectedEntry.officerName || "-"}</p>
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
                        <Badge
                          variant="secondary"
                          className="bg-background/80 text-secondary-color"
                        >
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
    </PageContainer>
  );
}



