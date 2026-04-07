"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/shared/dialogs/confirm-action-dialog";
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
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QueueStatus } from "@/shared/constants/enums";
import { RefreshCcw, Inbox } from "lucide-react";
import { queuesApi } from "@/services/api/queues";
import { useLiveQuery } from "@/hooks/use-live-query";
import TableSkeleton from "@/features/dashboard/components/skeletons/table-skeleton";
import QueueTableRow from "@/features/dashboard/components/rows/queue-row";
import { formatDisplayDateTimeWithSeconds } from "@/lib/date-format";
import type { QueueDetail, QueueListResponse } from "@shared/types/queue";

const queueStatusParamValues = new Set(["WAITING", "SERVING", "COMPLETED", "CANCELED"]);

const parseStatusParam = (value: string | null): QueueStatus | null => {
  if (!value) return null;
  const normalized = value.toUpperCase();
  if (queueStatusParamValues.has(normalized)) {
    return normalized as QueueStatus;
  }
  return null;
};

const parseDateFilterParam = (value: string | null): "today" | "all" | null => {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized === "today" || normalized === "all") {
    return normalized as "today" | "all";
  }
  return null;
};

type Queue = QueueDetail;
type QueuePageProps = {
  initialStatus: QueueStatus;
  initialDateFilter: "today" | "all";
  initialPageData: QueueListResponse;
  initialFetchedAt: string;
};

export default function QueueManagementPage({
  initialStatus,
  initialDateFilter,
  initialPageData,
  initialFetchedAt,
}: QueuePageProps) {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const dateFilterParam = searchParams.get("dateFilter");
  const [statusFilter, setStatusFilter] = useState<QueueStatus>(initialStatus);
  const [dateFilter, setDateFilter] = useState<"today" | "all">(initialDateFilter);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [queueToCancel, setQueueToCancel] = useState<Queue | null>(null);
  const [queueToComplete, setQueueToComplete] = useState<Queue | null>(null);
  const [isCancelingQueue, setIsCancelingQueue] = useState(false);
  const [isCompletingQueue, setIsCompletingQueue] = useState(false);

  useEffect(() => {
    const nextStatus = parseStatusParam(statusParam) ?? "WAITING";
    const nextDateFilter = parseDateFilterParam(dateFilterParam) ?? "today";
    setStatusFilter(nextStatus);
    setDateFilter(nextDateFilter);
    setCurrentPage(1);
  }, [statusParam, dateFilterParam]);

  const offset = (currentPage - 1) * pageSize;
  const queueUrl = queuesApi.listUrl({
    status: statusFilter,
    dateFilter,
    limit: pageSize,
    offset,
  });
  const isUsingInitialPageData =
    currentPage === 1 &&
    pageSize === 10 &&
    statusFilter === initialStatus &&
    dateFilter === initialDateFilter;

  const {
    data: queueData,
    isLoading,
    isRefreshing,
    lastFetchedAt,
    refresh,
  } = useLiveQuery<QueueListResponse>(queueUrl, {
    fallbackData: isUsingInitialPageData ? initialPageData : undefined,
    fallbackEtag:
      isUsingInitialPageData && initialPageData.hash
        ? `"${initialPageData.hash}"`
        : null,
    fallbackFetchedAt: isUsingInitialPageData ? initialFetchedAt : null,
    refreshInterval: 30_000,
    onError: (error) => {
      console.error("Error fetching queues:", error);
      toast.error("Terjadi kesalahan saat memuat antrean");
    },
  });

  const queues = queueData?.queues ?? [];
  const totalQueues = queueData?.pagination?.total ?? null;

  const handleServeQueue = useCallback(
    async (queueId: string) => {
      try {
        await queuesApi.serve(queueId);
        toast.success("Antrean sedang dilayani");
        await refresh();
      } catch (error) {
        console.error("Error serving queue:", error);
        toast.error("Terjadi kesalahan saat melayani antrean");
      }
    },
    [refresh]
  );

  const handleCancelQueue = async (queueId: string) => {
    try {
      setIsCancelingQueue(true);
      await queuesApi.cancel(queueId);
      toast.success("Antrean telah dibatalkan");
      setShowCancelDialog(false);
      setQueueToCancel(null);
      await refresh();
    } catch (error) {
      console.error("Error canceling queue:", error);
      toast.error("Terjadi kesalahan");
    } finally {
      setIsCancelingQueue(false);
    }
  };

  const handleCompleteQueue = async (queueId: string) => {
    try {
      setIsCompletingQueue(true);
      await queuesApi.complete(queueId);
      toast.success("Antrean telah selesai dilayani");
      setShowCompleteDialog(false);
      setQueueToComplete(null);
      await refresh();
    } catch (error) {
      console.error("Error completing queue:", error);
      toast.error("Terjadi kesalahan saat menyelesaikan antrean");
    } finally {
      setIsCompletingQueue(false);
    }
  };

  const openCancelDialog = useCallback((queue: Queue) => {
    setQueueToCancel(queue);
    setShowCancelDialog(true);
  }, []);

  const openCompleteDialog = useCallback((queue: Queue) => {
    setQueueToComplete(queue);
    setShowCompleteDialog(true);
  }, []);

  const getTableColumns = () => (
    <>
      <TableHead className="w-20 text-center">No</TableHead>
      <TableHead className="text-center">Pengunjung</TableHead>
      <TableHead className="text-center">Asal Instansi</TableHead>
      <TableHead className="text-center">Layanan</TableHead>
      <TableHead className="text-center">Nomor Antrean</TableHead>
      <TableHead className="text-center">Tanggal</TableHead>
      <TableHead className="text-center">Petugas</TableHead>
      <TableHead className="text-center">Tracking</TableHead>
      <TableHead className="w-[240px] text-center">Aksi</TableHead>
    </>
  );

  const statusOptions: Array<{ value: QueueStatus; label: string }> = [
    { value: "WAITING", label: "Menunggu" },
    { value: "SERVING", label: "Sedang Dilayani" },
    { value: "COMPLETED", label: "Selesai" },
    { value: "CANCELED", label: "Dibatalkan" },
  ];
  const statusLabel =
    statusOptions.find((option) => option.value === statusFilter)?.label ?? statusFilter;

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as QueueStatus);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (value: string) => {
    setDateFilter(value as "today" | "all");
    setCurrentPage(1);
  };

  const handlePageSizeChange = (value: string) => {
    const nextSize = Number(value);
    if (Number.isNaN(nextSize)) return;
    setPageSize(nextSize);
    setCurrentPage(1);
  };

  const handleManualRefresh = () => {
    if (isRefreshing) return;
    toast.info(`Memperbarui data untuk status "${statusLabel}"...`);
    void refresh();
  };

  const updatedLabel = lastFetchedAt
    ? formatDisplayDateTimeWithSeconds(lastFetchedAt)
    : isLoading && !queues.length
      ? "Memuat data awal..."
      : "Belum ada data";
  const totalLabel = totalQueues ?? "...";
  const totalPages = totalQueues ? Math.max(1, Math.ceil(totalQueues / pageSize)) : 1;
  const canPrevPage = currentPage > 1;
  const canNextPage = totalQueues ? currentPage < totalPages : false;
  const rangeStart = totalQueues && totalQueues > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const rangeEnd =
    totalQueues && totalQueues > 0 ? Math.min(currentPage * pageSize, totalQueues) : queues.length;
  const showingLabel =
    totalQueues !== null
      ? `Menampilkan ${rangeStart}-${rangeEnd} dari ${totalLabel} antrean`
      : `Menampilkan ${queues.length} antrean`;

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleCancelDialogChange = (open: boolean) => {
    setShowCancelDialog(open);
    if (!open) {
      setQueueToCancel(null);
    }
  };

  const handleCompleteDialogChange = (open: boolean) => {
    setShowCompleteDialog(open);
    if (!open) {
      setQueueToComplete(null);
    }
  };

  const confirmCancelQueue = async () => {
    if (!queueToCancel) return;
    await handleCancelQueue(queueToCancel.id);
  };

  const confirmCompleteQueue = async () => {
    if (!queueToComplete) return;
    await handleCompleteQueue(queueToComplete.id);
  };

  return (
    <PageContainer>
      <DashboardPageHeader
        title="Manajemen Antrean"
        description="Halaman kelola status antrean sesuai layanan petugas PASTI 6502."
        meta={
          <>
            <span>Data per: {updatedLabel}</span>
            <LiveStatusBadge
              isRefreshing={isRefreshing}
              hasFetched={Boolean(lastFetchedAt)}
              idleLabel="Auto refresh setiap 30 detik"
            />
          </>
        }
        chips={
          <>
            <div className="dashboard-chip">Status aktif: {statusLabel}</div>
            <div className="dashboard-chip">
              {dateFilter === "today" ? "Data hari ini" : "Semua tanggal"}
            </div>
          </>
        }
        actions={
          <div className="dashboard-header-actions">
            <Button
              variant="outline"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="dashboard-header-action border-border/80 bg-background"
              aria-label="Perbarui data antrean"
            >
              {isRefreshing ? (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                  Memperbarui...
                </>
              ) : (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Perbarui Data
                </>
              )}
            </Button>
          </div>
        }
      />
      <Card className="border-border/80 bg-card shadow-none">
        <CardHeader className="gap-2">
          <CardTitle className="text-xl font-semibold text-primary-color">Daftar Antrean</CardTitle>
          <CardDescription>
            Menampilkan antrean dengan status {statusLabel}{" "}
            {dateFilter === "today" ? "hari ini." : "untuk semua tanggal."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="dashboard-filter-panel">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full sm:w-[210px]">
                  <SelectValue placeholder="Status antrean" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={handleDateFilterChange}>
                <SelectTrigger className="w-full sm:w-[210px]">
                  <SelectValue placeholder="Filter tanggal..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Dibuat Hari Ini</SelectItem>
                  <SelectItem value="all">Semua</SelectItem>
                </SelectContent>
              </Select>
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-full sm:w-[170px]">
                  <SelectValue placeholder="Tampil per halaman" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / Halaman</SelectItem>
                  <SelectItem value="25">25 / Halaman</SelectItem>
                  <SelectItem value="50">50 / Halaman</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-3 rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              {showingLabel}
            </div>
          </div>
          {isLoading && queues.length === 0 ? (
            <div className="overflow-hidden rounded-xl border border-border/80 p-2">
              <TableSkeleton columns={9} rows={5} />
            </div>
          ) : queues.length > 0 ? (
            <div className="dashboard-table-shell">
              <Table className="w-full md:min-w-[1140px]">
                <TableHeader className="hidden bg-muted/35 md:table-header-group">
                  <TableRow>{getTableColumns()}</TableRow>
                </TableHeader>
                <TableBody>
                  {queues.map((queue, index) => (
                    <QueueTableRow
                      key={queue.id}
                      rowNumber={offset + index + 1}
                      queue={queue}
                      onServe={handleServeQueue}
                      onComplete={openCompleteDialog}
                      onOpenCancel={openCancelDialog}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={Inbox}
              title="Tidak ada antrean"
              description={`Belum ada antrean untuk status ${statusLabel.toLowerCase()}.`}
            />
          )}
        </CardContent>
        <CardFooter className="border-t border-border/70 pt-4 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-muted-foreground">
            Halaman {currentPage} dari {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={!canPrevPage || isRefreshing}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!canNextPage || isRefreshing}
            >
              Berikutnya
            </Button>
          </div>
        </CardFooter>
      </Card>
      <ConfirmActionDialog
        open={showCancelDialog}
        onOpenChange={handleCancelDialogChange}
        title="Konfirmasi Batalkan Antrean"
        description="Tindakan ini akan mengubah status antrean menjadi dibatalkan dan tetap tercatat di buku tamu."
        confirmLabel="Ya, Batalkan"
        confirmVariant="warning"
        isProcessing={isCancelingQueue}
        onConfirm={confirmCancelQueue}
        body={
          queueToCancel ? (
            <>
              <p>
                Pengunjung: <strong>{queueToCancel.visitor.name}</strong>
              </p>
              <p>
                Nomor antrean: <strong>{queueToCancel.queueNumber}</strong>
              </p>
              <p>
                Layanan: <strong>{queueToCancel.service.name}</strong>
              </p>
            </>
          ) : null
        }
      />
      <ConfirmActionDialog
        open={showCompleteDialog}
        onOpenChange={handleCompleteDialogChange}
        title="Konfirmasi Selesaikan Antrean"
        description="Tindakan ini akan mengubah status antrean menjadi selesai dilayani dan dicatat di buku tamu."
        confirmLabel="Ya, Selesaikan"
        confirmVariant="success"
        isProcessing={isCompletingQueue}
        onConfirm={confirmCompleteQueue}
        body={
          queueToComplete ? (
            <>
              <p>
                Pengunjung: <strong>{queueToComplete.visitor.name}</strong>
              </p>
              <p>
                Nomor antrean: <strong>{queueToComplete.queueNumber}</strong>
              </p>
              <p>
                Layanan: <strong>{queueToComplete.service.name}</strong>
              </p>
            </>
          ) : null
        }
      />
    </PageContainer>
  );
}
