"use client";

import type { Session } from "next-auth";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/shared/dialogs/confirm-action-dialog";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QueueStatus } from "@/shared/constants/enums";
import { RefreshCw, Smartphone, AlertCircle, MessageSquareText, Inbox } from "lucide-react";
import { queuesApi } from "@/services/api/queues";
import { useLiveQuery } from "@/hooks/use-live-query";
import TableSkeleton from "@/features/dashboard/components/skeletons/table-skeleton";
import QueueTableRow from "@/features/dashboard/components/rows/queue-row";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  currentUser: Session["user"];
  initialStatus: QueueStatus;
  initialDateFilter: "today" | "all";
  initialPageData: QueueListResponse;
};

export default function QueueManagementPage({
  currentUser,
  initialStatus,
  initialDateFilter,
  initialPageData,
}: QueuePageProps) {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const dateFilterParam = searchParams.get("dateFilter");
  const [statusFilter, setStatusFilter] = useState<QueueStatus>(initialStatus);
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [nextInQueue, setNextInQueue] = useState<Queue | null>(null);
  const [showRemindSkdDialog, setShowRemindSkdDialog] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null);
  const [reminderMessage, setReminderMessage] = useState("");
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [reminderError, setReminderError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<"today" | "all">(initialDateFilter);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [queueToCancel, setQueueToCancel] = useState<Queue | null>(null);
  const [isCancelingQueue, setIsCancelingQueue] = useState(false);

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
  const {
    data: queueData,
    isLoading,
    isRefreshing,
    lastFetchedAt,
    refresh,
  } = useLiveQuery<QueueListResponse>(queueUrl, {
    fallbackData:
      currentPage === 1 &&
      pageSize === 10 &&
      statusFilter === initialStatus &&
      dateFilter === initialDateFilter
        ? initialPageData
        : undefined,
    fallbackEtag:
      currentPage === 1 &&
      pageSize === 10 &&
      statusFilter === initialStatus &&
      dateFilter === initialDateFilter &&
      initialPageData.hash
        ? `"${initialPageData.hash}"`
        : null,
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

  const handleCompleteQueue = useCallback(
    async (queueId: string) => {
      try {
        const result = await queuesApi.complete(queueId);
        toast.success("Antrean telah selesai dilayani");
        await refresh();

        if (result.nextQueue) {
          setNextInQueue(result.nextQueue);
          setShowContinueDialog(true);
        }
      } catch (error) {
        console.error("Error completing queue:", error);
        toast.error("Terjadi kesalahan");
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

  const openCancelDialog = useCallback((queue: Queue) => {
    setQueueToCancel(queue);
    setShowCancelDialog(true);
  }, []);

  // Function to handle opening the SKD reminder dialog
  const handleRemindSKD = useCallback((queue: Queue) => {
    setSelectedQueue(queue);
    setReminderMessage(
      `Halo ${queue.visitor.name}, mohon kesediaannya untuk mengisi Survei Kebutuhan Data (SKD) BPS Bulungan melalui link berikut: s.bps.go.id/skd2025_bpsbusel`
    );
    setShowRemindSkdDialog(true);
  }, []);

  // Function to prepare WhatsApp message
  const prepareWhatsAppReminder = async () => {
    if (!selectedQueue) return;

    try {
      setIsSendingReminder(true);
      setReminderError(null);

      const data = await queuesApi.remindSkd(selectedQueue.id, reminderMessage);
      if (data?.data?.whatsappUrl) {
        window.open(data.data.whatsappUrl, "_blank");
        toast.success("Link WhatsApp berhasil dibuka");
        setShowRemindSkdDialog(false);
      } else {
        toast.error("Gagal menyiapkan pengingat");
      }
    } catch (error) {
      console.error("Error preparing WhatsApp reminder:", error);
      setReminderError("Terjadi kesalahan saat menyiapkan pengingat WhatsApp");
      toast.error("Terjadi kesalahan saat menyiapkan pengingat WhatsApp");
    } finally {
      setIsSendingReminder(false);
    }
  };

  // Function to send reminder via WhatsApp Bot
  const sendWhatsAppBotReminderHandler = async () => {
    if (!selectedQueue) return;

    try {
      setIsSendingReminder(true);
      setReminderError(null);

      const result = await queuesApi.remindSkdBot(selectedQueue.id, reminderMessage);

      if (result.success) {
        toast.success("Pengingat berhasil dikirim via WhatsApp Bot");
        setShowRemindSkdDialog(false);
      } else {
        setReminderError(result.message);
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error sending WhatsApp Bot reminder:", error);
      setReminderError("Terjadi kesalahan saat mengirim pengingat via WhatsApp Bot");
      toast.error("Terjadi kesalahan saat mengirim pengingat via WhatsApp Bot");
    } finally {
      setIsSendingReminder(false);
    }
  };

  // Function to handle SKD check
  const handleMarkSkdFilled = useCallback(
    async (queue: Queue, filled: boolean) => {
      try {
        const status = filled ? "SUDAH_MENGISI" : "BELUM_MENGISI";
        await queuesApi.updateSkdStatus(queue.id, status);
        toast.success(filled ? "SKD ditandai telah diisi" : "SKD ditandai belum diisi");
        await refresh();
      } catch (error) {
        console.error("Error updating SKD status:", error);
        toast.error("Terjadi kesalahan saat mengubah status SKD");
      }
    },
    [refresh]
  );

  const handleCopyTrackingLink = useCallback((tempUuid: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/visitor-form/${tempUuid}`);
    toast.success("Link tracking disalin ke clipboard");
  }, []);

  const getTableColumns = () => (
    <>
      <TableHead className="w-16">No</TableHead>
      <TableHead>Nama</TableHead>
      <TableHead>Layanan</TableHead>
      <TableHead>Tipe</TableHead>
      <TableHead>Waktu</TableHead>
      <TableHead>Dilayani Oleh</TableHead>
      <TableHead>Status SKD</TableHead>
      <TableHead>Link Tracking</TableHead>
      <TableHead className="w-[240px] text-right">Aksi</TableHead>
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

  const confirmCancelQueue = async () => {
    if (!queueToCancel) return;
    await handleCancelQueue(queueToCancel.id);
  };

  return (
    <PageContainer>
      <section className="dashboard-hero p-5 sm:p-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-primary-color sm:text-3xl">Manajemen Antrean</h1>
                <p className="max-w-xl text-sm text-secondary-color">
                  Pantau antrean harian, ubah status layanan, dan lakukan tindak lanjut SKD dari satu
                  halaman.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-secondary-color">
                <span>Data per: {updatedLabel}</span>
                <LiveStatusBadge
                  isRefreshing={isRefreshing}
                  hasFetched={Boolean(lastFetchedAt)}
                  idleLabel="Auto refresh setiap 30 detik"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="dashboard-chip">
                Status aktif: {statusLabel}
              </div>
              <div className="dashboard-chip">
                {dateFilter === "today" ? "Data hari ini" : "Semua tanggal"}
              </div>
            </div>
          </div>

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
              <Button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="w-full sm:w-auto"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Memperbarui...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Perbarui Data
                  </>
                )}
              </Button>
            </div>
            <div className="mt-3 rounded-lg border border-border/70 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
              {showingLabel}
            </div>
          </div>
        </div>
      </section>
      <Card className="border-border/80 bg-card/88">
        <CardHeader className="gap-2">
          <CardTitle className="text-xl font-semibold text-primary-color">Daftar Antrean</CardTitle>
          <CardDescription>
            Menampilkan antrean dengan status {statusLabel}{" "}
            {dateFilter === "today" ? "hari ini." : "untuk semua tanggal."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && queues.length === 0 ? (
            <div className="overflow-hidden rounded-xl border border-border/80 p-2">
              <TableSkeleton columns={9} rows={5} />
            </div>
          ) : queues.length > 0 ? (
            <div className="dashboard-table-shell">
              <Table className="w-full md:min-w-[940px]">
                <TableHeader className="hidden bg-muted/50 md:table-header-group">
                  <TableRow>{getTableColumns()}</TableRow>
                </TableHeader>
                <TableBody>
                  {queues.map((queue) => (
                    <QueueTableRow
                      key={queue.id}
                      queue={queue}
                      currentUserRole={currentUser.role}
                      currentUserName={currentUser.name}
                      onServe={handleServeQueue}
                      onComplete={handleCompleteQueue}
                      onOpenCancel={openCancelDialog}
                      onRemindSkd={handleRemindSKD}
                      onMarkSkdFilled={handleMarkSkdFilled}
                      onCopyTrackingLink={handleCopyTrackingLink}
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
        description="Tindakan ini akan mengubah status antrean menjadi dibatalkan."
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
      <Dialog open={showContinueDialog} onOpenChange={setShowContinueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lanjut ke Pengunjung Berikutnya?</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {nextInQueue && (
              <div className="space-y-2">
                <p>
                  Pengunjung berikutnya: <strong>{nextInQueue.visitor.name}</strong>
                </p>
                <p>
                  Nomor Antrean: <strong>{nextInQueue.queueNumber}</strong>
                </p>
                <p>
                  Layanan: <strong>{nextInQueue.service.name}</strong>
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setShowContinueDialog(false)} className="w-full sm:w-auto">
              Nanti Saja
            </Button>
            <Button
              onClick={() => {
                if (nextInQueue) {
                  handleServeQueue(nextInQueue.id);
                  setShowContinueDialog(false);
                }
              }}
              className="w-full sm:w-auto"
            >
              Ya, Layani Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add SKD Reminder Dialog */}
      <Dialog open={showRemindSkdDialog} onOpenChange={setShowRemindSkdDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kirim Pengingat SKD</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedQueue && (
              <>
                <div className="space-y-2">
                  <p>
                    Pengunjung: <strong>{selectedQueue.visitor.name}</strong>
                  </p>
                  <p>
                    No. HP: <strong>{selectedQueue.visitor.phone}</strong>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder-message">Pesan Pengingat:</Label>
                  <Textarea
                    id="reminder-message"
                    value={reminderMessage}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setReminderMessage(e.target.value)
                    }
                    rows={4}
                    className="resize-none"
                    placeholder="Ketik pesan di sini..."
                  />
                </div>

                {reminderError && (
                  <div className="flex items-start gap-2 bg-destructive/15 p-3 rounded-md text-destructive text-sm">
                    <AlertCircle className="flex-shrink-0 mt-0.5 w-4 h-4" />
                    <div>{reminderError}</div>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter className="sm:flex-row flex-col gap-2">
            <Button variant="outline" onClick={() => setShowRemindSkdDialog(false)} className="w-full sm:w-auto">
              Batal
            </Button>
            <div className="flex w-full flex-col gap-2 sm:flex-1 sm:flex-row sm:justify-end">
              <Button
                onClick={prepareWhatsAppReminder}
                disabled={isSendingReminder}
                className="w-full gap-2 sm:w-auto"
                variant="default"
              >
                <MessageSquareText className="w-4 h-4" />
                Kirim via WA Direct
              </Button>
              <Button
                onClick={sendWhatsAppBotReminderHandler}
                disabled={isSendingReminder}
                className="w-full gap-2 sm:w-auto"
                variant="secondary"
              >
                <Smartphone className="w-4 h-4" />
                Kirim via WA Bot
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}


