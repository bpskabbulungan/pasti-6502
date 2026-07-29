"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarRange, Download, Loader2, RefreshCcw } from "lucide-react";
import { pstScheduleApi } from "@/services/api/pst-schedule";
import type { MonthlySchedulePdfMeta, MonthlyScheduleResponse, PstGenerateAttemptLog } from "@shared/types/pst-schedule";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  toInputMonth, 
  formatDate, 
  formatDateTime, 
  getErrorMessage, 
  getErrorStatus, 
  getErrorDetails, 
  triggerFileDownload, 
  triggerUrlDownload, 
  toMonthlyPeriodValue, 
  formatMonthPeriodLabel, 
  formatAttemptDuration, 
  toFallbackPstMonthlyPdfMeta 
} from "./utils";
import { renderTableSkeletonRows } from "./shared";
import { serializeErrorForLog } from "@/lib/error-log";

type PstGenerateMode = "MONTHLY" | "WEEKLY";

export function PstScheduleGenerator() {
  const [pstMonthlyPeriod, setPstMonthlyPeriod] = useState<string>(toInputMonth(new Date()));
  const [pstMonthlyPdfMeta, setPstMonthlyPdfMeta] = useState<MonthlySchedulePdfMeta | null>(null);
  const [pstMonthlyGenerating, setPstMonthlyGenerating] = useState(false);
  const [pstHistoryLoading, setPstHistoryLoading] = useState(false);
  const [pstGenerationHistory, setPstGenerationHistory] = useState<MonthlyScheduleResponse[]>([]);
  const [pstAttemptLogsLoading, setPstAttemptLogsLoading] = useState(false);
  const [pstAttemptLogs, setPstAttemptLogs] = useState<PstGenerateAttemptLog[]>([]);
  const [pstGenerateMode, setPstGenerateMode] = useState<PstGenerateMode>("MONTHLY");
  const [pstWeeklyWeek, setPstWeeklyWeek] = useState("1");
  const [pstGeneratedSchedule, setPstGeneratedSchedule] = useState<MonthlyScheduleResponse | null>(null);

  const getPstMonthYear = useCallback(() => {
    const [yearText, monthText] = pstMonthlyPeriod.split("-");
    const year = Number(yearText);
    const month = Number(monthText);

    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
      return null;
    }

    return { month, year };
  }, [pstMonthlyPeriod]);

  const loadPstGenerationHistory = useCallback(async () => {
    try {
      setPstHistoryLoading(true);
      const result = await pstScheduleApi.listMonthly(24);
      setPstGenerationHistory(result.schedules);
    } catch (error) {
      console.error("Error loading PST generation history:", serializeErrorForLog(error));
      toast.error("Gagal memuat riwayat generate jadwal PST");
    } finally {
      setPstHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPstGenerationHistory();
  }, [loadPstGenerationHistory]);

  const loadPstGenerateAttemptLogs = useCallback(async () => {
    const monthYear = getPstMonthYear();
    if (!monthYear) {
      setPstAttemptLogs([]);
      return;
    }

    try {
      setPstAttemptLogsLoading(true);
      const result = await pstScheduleApi.listGenerateAttempts({
        month: monthYear.month,
        year: monthYear.year,
        limit: 80,
      });
      setPstAttemptLogs(result.logs);
    } catch (error) {
      console.error("Error loading PST generate attempt logs:", serializeErrorForLog(error));
      toast.error("Gagal memuat log percobaan generate PST");
    } finally {
      setPstAttemptLogsLoading(false);
    }
  }, [getPstMonthYear]);

  useEffect(() => {
    void loadPstGenerateAttemptLogs();
  }, [loadPstGenerateAttemptLogs]);

  useEffect(() => {
    const monthYear = getPstMonthYear();
    if (!monthYear) {
      setPstGeneratedSchedule(null);
      setPstMonthlyPdfMeta(null);
      return;
    }

    let cancelled = false;

    const loadSelectedMonthSchedule = async () => {
      try {
        const result = await pstScheduleApi.getMonthly(monthYear.month, monthYear.year);
        if (cancelled) return;
        setPstGeneratedSchedule(result.schedule);
        setPstMonthlyPdfMeta(toFallbackPstMonthlyPdfMeta(result.schedule));
      } catch (error) {
        if (cancelled) return;

        if (getErrorStatus(error) === 404) {
          setPstGeneratedSchedule(null);
          setPstMonthlyPdfMeta(null);
          return;
        }

        console.error("Error loading selected PST monthly schedule:", serializeErrorForLog(error));
        toast.error(getErrorMessage(error, "Gagal memuat jadwal bulanan PST"));
      }
    };

    void loadSelectedMonthSchedule();

    return () => {
      cancelled = true;
    };
  }, [getPstMonthYear]);

  const pstWeekOptions = useMemo(() => {
    const [yearText, monthText] = pstMonthlyPeriod.split("-");
    const year = Number(yearText);
    const month = Number(monthText);

    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
      return ["1", "2", "3", "4", "5"];
    }

    const totalDays = new Date(year, month, 0).getDate();
    const weekCount = Math.ceil(totalDays / 7);
    return Array.from({ length: weekCount }, (_, index) => String(index + 1));
  }, [pstMonthlyPeriod]);

  useEffect(() => {
    if (!pstWeekOptions.includes(pstWeeklyWeek)) {
      setPstWeeklyWeek(pstWeekOptions[0]);
    }
  }, [pstWeekOptions, pstWeeklyWeek]);

  const selectedPstWeek = useMemo(() => Number(pstWeeklyWeek), [pstWeeklyWeek]);

  const pstVisibleWeeks = useMemo(() => {
    if (!pstGeneratedSchedule) {
      return [];
    }

    if (pstGenerateMode === "MONTHLY") {
      return pstGeneratedSchedule.weeks;
    }

    return pstGeneratedSchedule.weeks.filter((weekGroup) => weekGroup.week === selectedPstWeek);
  }, [pstGenerateMode, pstGeneratedSchedule, selectedPstWeek]);

  const pstPreviewRows = useMemo(
    () =>
      pstVisibleWeeks.flatMap((weekGroup) =>
        weekGroup.items.map((item) => ({
          ...item,
          week: weekGroup.week,
        }))
      ),
    [pstVisibleWeeks]
  );

  const pstPreviewSummary = useMemo(() => {
    const holidayCount = pstPreviewRows.filter((item) => item.isHoliday).length;
    const assignedCount = pstPreviewRows.filter(
      (item) => !item.isHoliday && Boolean(item.officerId)
    ).length;
    const unassignedCount = pstPreviewRows.filter(
      (item) => !item.isHoliday && !item.officerId
    ).length;

    return {
      totalRows: pstPreviewRows.length,
      holidayCount,
      assignedCount,
      unassignedCount,
    };
  }, [pstPreviewRows]);

  const handleGeneratePstMonthly = async () => {
    const monthYear = getPstMonthYear();
    if (!monthYear) {
      toast.error("Periode bulanan PST tidak valid");
      return;
    }

    try {
      setPstMonthlyGenerating(true);
      const result = await pstScheduleApi.generateMonthly({
        month: monthYear.month,
        year: monthYear.year,
      });
      setPstMonthlyPdfMeta(result.pdf);
      setPstGeneratedSchedule(result.schedule);

      if (result.alreadyExists) {
        toast.success(
          pstGenerateMode === "MONTHLY"
            ? "Jadwal bulanan sudah ada. PDF verifikasi diperbarui."
            : `Jadwal minggu ke-${selectedPstWeek} dimuat dari jadwal bulanan yang sudah ada.`
        );
      } else {
        toast.success(
          pstGenerateMode === "MONTHLY"
            ? "Generate jadwal bulanan PST berhasil. PDF siap diunduh."
            : `Generate jadwal minggu ke-${selectedPstWeek} berhasil dari periode bulanan terpilih.`
        );
      }
      await loadPstGenerationHistory();
    } catch (error) {
      console.error("Error generating PST monthly schedule:", serializeErrorForLog(error));
      toast.error(getErrorMessage(error, "Gagal generate jadwal bulanan PST"));
    } finally {
      await loadPstGenerateAttemptLogs();
      setPstMonthlyGenerating(false);
    }
  };

  const handleGenerateAndDownloadPstMonthly = async () => {
    if (pstGenerateMode === "WEEKLY") {
      toast.info("Download PDF hanya tersedia untuk mode bulanan.");
      return;
    }

    const monthYear = getPstMonthYear();
    if (!monthYear) {
      toast.error("Periode bulanan PST tidak valid");
      return;
    }

    try {
      setPstMonthlyGenerating(true);
      const result = await pstScheduleApi.generateMonthlyAndDownloadPdf({
        month: monthYear.month,
        year: monthYear.year,
      });
      triggerFileDownload(result.blob, result.fileName);

      try {
        const metadataResult = await pstScheduleApi.generateMonthly({
          month: monthYear.month,
          year: monthYear.year,
        });
        setPstMonthlyPdfMeta(metadataResult.pdf);
        setPstGeneratedSchedule(metadataResult.schedule);
      } catch (metadataError) {
        console.error(
          "Error refreshing PST monthly PDF metadata:",
          serializeErrorForLog(metadataError)
        );
      }

      toast.success("Generate jadwal bulanan PST + download PDF berhasil.");
      await loadPstGenerationHistory();
    } catch (error) {
      console.error("Error generating and downloading PST monthly PDF:", serializeErrorForLog(error));
      toast.error(getErrorMessage(error, "Gagal generate dan download PDF jadwal bulanan PST"));
    } finally {
      await loadPstGenerateAttemptLogs();
      setPstMonthlyGenerating(false);
    }
  };

  const handleDownloadLastPstPdf = async () => {
    if (!pstMonthlyPdfMeta?.scheduleId) {
      toast.error("PDF belum tersedia. Silakan generate jadwal bulanan dulu.");
      return;
    }
    if (process.env.NODE_ENV === "development") {
      triggerUrlDownload(pstScheduleApi.getMonthlyPdfDownloadUrl(pstMonthlyPdfMeta.scheduleId));
      toast.info("Mode development: download langsung lewat endpoint PDF.");
      return;
    }

    try {
      const result = await pstScheduleApi.downloadMonthlyPdf(pstMonthlyPdfMeta.scheduleId);
      triggerFileDownload(result.blob, result.fileName);
      toast.success("Download PDF jadwal bulanan berhasil.");
    } catch (error) {
      const serialized = serializeErrorForLog(error);
      console.error("Error downloading latest PST monthly PDF:", {
        raw: error,
        serialized,
        status: getErrorStatus(error),
        details: getErrorDetails(error),
      });
      if (getErrorStatus(error) === 408) {
        triggerUrlDownload(pstScheduleApi.getMonthlyPdfDownloadUrl(pstMonthlyPdfMeta.scheduleId));
        toast.info("Timeout di client. Download dialihkan langsung ke endpoint PDF.");
        return;
      }
      toast.error(getErrorMessage(error, "Gagal mengunduh PDF jadwal bulanan"));
    }
  };

  const handleOpenPstGeneratedHistory = (schedule: MonthlyScheduleResponse) => {
    setPstMonthlyPeriod(toMonthlyPeriodValue(schedule.month, schedule.year));
    setPstGenerateMode("MONTHLY");
    setPstGeneratedSchedule(schedule);
    setPstMonthlyPdfMeta(toFallbackPstMonthlyPdfMeta(schedule));
  };

  const handleDownloadPstHistoryPdf = async (scheduleId: string) => {
    if (process.env.NODE_ENV === "development") {
      triggerUrlDownload(pstScheduleApi.getMonthlyPdfDownloadUrl(scheduleId));
      toast.info("Mode development: download langsung lewat endpoint PDF.");
      return;
    }

    try {
      const result = await pstScheduleApi.downloadMonthlyPdf(scheduleId);
      triggerFileDownload(result.blob, result.fileName);
      toast.success("Download PDF jadwal bulanan berhasil.");
    } catch (error) {
      const serialized = serializeErrorForLog(error);
      console.error("Error downloading PST monthly history PDF:", {
        raw: error,
        serialized,
        status: getErrorStatus(error),
        details: getErrorDetails(error),
      });
      const status = getErrorStatus(error);
      if (status === 401 || status === 403) {
        toast.error("Akses download ditolak. Silakan login ulang sebagai admin.");
        return;
      }
      if (status === 408) {
        triggerUrlDownload(pstScheduleApi.getMonthlyPdfDownloadUrl(scheduleId));
        toast.info("Timeout di client. Download dialihkan langsung ke endpoint PDF.");
        return;
      }
      toast.error(getErrorMessage(error, "Gagal mengunduh PDF jadwal bulanan"));
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2">
          <CalendarRange className="h-5 w-5" />
          Generator Jadwal PST Bulanan / Mingguan
        </CardTitle>
        <CardDescription>
          Pilih periode bulan lalu tentukan mode generate. Mode mingguan menampilkan hasil
          minggu tertentu dari jadwal bulan terpilih.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-12">
          <div className="space-y-4 rounded-lg border border-border/70 bg-background/40 p-4 xl:col-span-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Periode Bulan</Label>
                <Input
                  type="month"
                  value={pstMonthlyPeriod}
                  onChange={(event) => setPstMonthlyPeriod(event.target.value)}
                  disabled={pstMonthlyGenerating}
                />
              </div>
              <div className="space-y-2">
                <Label>Mode Generate</Label>
                <Select
                  value={pstGenerateMode}
                  onValueChange={(value) => setPstGenerateMode(value as PstGenerateMode)}
                  disabled={pstMonthlyGenerating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Bulanan</SelectItem>
                    <SelectItem value="WEEKLY">Mingguan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Minggu ke-</Label>
              <Select
                value={pstWeeklyWeek}
                onValueChange={setPstWeeklyWeek}
                disabled={pstMonthlyGenerating || pstGenerateMode === "MONTHLY"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pstWeekOptions.map((week) => (
                    <SelectItem key={week} value={week}>
                      Minggu {week}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Button
                variant="success"
                onClick={
                  pstGenerateMode === "MONTHLY"
                    ? handleGenerateAndDownloadPstMonthly
                    : handleGeneratePstMonthly
                }
                disabled={pstMonthlyGenerating}
                className="w-full"
              >
                {pstMonthlyGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : pstGenerateMode === "MONTHLY" ? (
                  <Download className="mr-2 h-4 w-4" />
                ) : (
                  <CalendarRange className="mr-2 h-4 w-4" />
                )}
                {pstMonthlyGenerating
                  ? "Memproses..."
                  : pstGenerateMode === "MONTHLY"
                    ? "Generate + Download PDF"
                    : "Generate Mingguan"}
              </Button>
            </div>

            <Button
              onClick={handleDownloadLastPstPdf}
              disabled={pstMonthlyGenerating || !pstMonthlyPdfMeta}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF Bulanan Terakhir
            </Button>

            <p className="text-xs text-secondary-color">
              {pstGenerateMode === "MONTHLY"
                ? "Mode bulanan akan membangkitkan seluruh slot dalam bulan terpilih."
                : "Mode mingguan tetap menggunakan hasil generate bulanan, lalu menampilkan minggu yang dipilih."}
            </p>
          </div>

          <div className="space-y-4 min-w-0 xl:col-span-7">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border/70 bg-background/40 p-3">
                <p className="text-xs text-secondary-color">Mode Aktif</p>
                <p className="font-semibold text-primary-color">
                  {pstGenerateMode === "MONTHLY" ? "Bulanan" : `Minggu ${selectedPstWeek}`}
                </p>
              </div>
              <div className="rounded-lg border border-border/70 bg-background/40 p-3">
                <p className="text-xs text-secondary-color">Total Slot Ditampilkan</p>
                <p className="font-semibold text-primary-color">
                  {pstPreviewSummary.totalRows}
                </p>
              </div>
              <div className="rounded-lg border border-border/70 bg-background/40 p-3">
                <p className="text-xs text-secondary-color">Terisi</p>
                <p className="font-semibold text-emerald-700">
                  {pstPreviewSummary.assignedCount}
                </p>
              </div>
              <div className="rounded-lg border border-border/70 bg-background/40 p-3">
                <p className="text-xs text-secondary-color">Hari Libur/Cuti</p>
                <p className="font-semibold text-amber-700">
                  {pstPreviewSummary.holidayCount}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border/70 bg-background/40">
              <div className="overflow-x-auto">
              <Table className="min-w-[780px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[14%]">Minggu</TableHead>
                    <TableHead className="w-[20%]">Tanggal</TableHead>
                    <TableHead className="w-[14%]">Hari</TableHead>
                    <TableHead className="w-[16%]">Slot</TableHead>
                    <TableHead className="w-[22%]">Petugas</TableHead>
                    <TableHead className="w-[14%]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!pstGeneratedSchedule ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Belum ada hasil generate. Pilih mode lalu klik Generate.
                      </TableCell>
                    </TableRow>
                  ) : pstPreviewRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Tidak ada slot untuk minggu ke-{selectedPstWeek} pada periode ini.
                      </TableCell>
                    </TableRow>
                  ) : (
                    pstPreviewRows.map((item, index) => (
                      <TableRow
                        key={`${item.date}-${item.role ?? "HOLIDAY"}-${item.week}-${index}`}
                      >
                        <TableCell>Minggu {item.week}</TableCell>
                        <TableCell>{formatDate(item.date)}</TableCell>
                        <TableCell>{item.dayName}</TableCell>
                        <TableCell>
                          {item.isHoliday
                            ? item.holidayType === "CUTI_BERSAMA"
                              ? "Cuti Bersama"
                              : "Libur Nasional"
                            : item.role}
                        </TableCell>
                        <TableCell className="break-words">
                          {item.isHoliday ? "-" : (item.officerName ?? "-")}
                        </TableCell>
                        <TableCell>
                          {item.isHoliday ? (
                            <Badge variant="secondary">Libur</Badge>
                          ) : item.officerId ? (
                            <Badge
                              variant="outline"
                              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                            >
                              Terisi
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-destructive/30 bg-destructive/10 text-destructive"
                            >
                              Kosong
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
            </div>

            <div className="rounded-md border border-border/70 bg-background/40 p-3 text-sm">
              {pstMonthlyPdfMeta ? (
                <div className="space-y-1">
                  <p className="font-medium text-primary-color">PDF verifikasi tersedia</p>
                  <p className="text-secondary-color">File: {pstMonthlyPdfMeta.fileName}</p>
                  <p className="text-secondary-color">
                    Generate: {formatDateTime(pstMonthlyPdfMeta.generatedAt)}
                  </p>
                </div>
              ) : (
                <p className="text-secondary-color">
                  Belum ada PDF verifikasi bulanan pada sesi ini. Jalankan generate bulanan
                  untuk membuat file PDF terbaru.
                </p>
              )}
            </div>

            <div className="rounded-md border border-border/70 bg-background/40 p-3 text-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="font-medium text-primary-color">Riwayat Generate Bulanan</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void loadPstGenerationHistory()}
                  disabled={pstHistoryLoading || pstMonthlyGenerating}
                >
                  <RefreshCcw
                    className={`mr-2 h-4 w-4 ${pstHistoryLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>

              <div className="max-h-64 overflow-auto rounded-md border border-border/70">
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Periode</TableHead>
                      <TableHead>Generate</TableHead>
                      <TableHead>Terisi/Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pstHistoryLoading ? (
                      renderTableSkeletonRows(4, 5, "pst-monthly-history")
                    ) : pstGenerationHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Belum ada riwayat generate bulanan.
                        </TableCell>
                      </TableRow>
                    ) : (
                      pstGenerationHistory.map((schedule) => (
                        <TableRow
                          key={schedule.id}
                          className={
                            pstGeneratedSchedule?.id === schedule.id ? "bg-emerald-500/5" : ""
                          }
                        >
                          <TableCell>
                            {formatMonthPeriodLabel(schedule.month, schedule.year)}
                          </TableCell>
                          <TableCell>{formatDateTime(schedule.generatedAt)}</TableCell>
                          <TableCell>
                            {schedule.summary.totalAssigned}/{schedule.summary.totalSlots}
                          </TableCell>
                          <TableCell>
                            {schedule.summary.totalUnassigned === 0 ? (
                              <Badge
                                variant="outline"
                                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                              >
                                Lengkap
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-amber-500/30 bg-amber-500/10 text-amber-700"
                              >
                                Ada Slot Kosong
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenPstGeneratedHistory(schedule)}
                              >
                                Lihat
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleDownloadPstHistoryPdf(schedule.id)}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                PDF
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="rounded-md border border-border/70 bg-background/40 p-3 text-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="font-medium text-primary-color">
                  Log Percobaan Generate (Periode Aktif)
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void loadPstGenerateAttemptLogs()}
                  disabled={pstAttemptLogsLoading || pstMonthlyGenerating}
                >
                  <RefreshCcw
                    className={`mr-2 h-4 w-4 ${pstAttemptLogsLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>

              <div className="max-h-72 overflow-auto rounded-md border border-border/70">
                <Table className="min-w-[980px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Waktu Klik</TableHead>
                      <TableHead>Aksi</TableHead>
                      <TableHead>Hasil</TableHead>
                      <TableHead>Durasi</TableHead>
                      <TableHead>Oleh</TableHead>
                      <TableHead>Keterangan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pstAttemptLogsLoading ? (
                      renderTableSkeletonRows(5, 6, "pst-attempt-log")
                    ) : pstAttemptLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Belum ada log generate untuk periode ini.
                        </TableCell>
                      </TableRow>
                    ) : (
                      pstAttemptLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{formatDateTime(log.startedAt)}</TableCell>
                          <TableCell>
                            {log.downloadPdf ? "Generate + Download PDF" : "Generate"}
                          </TableCell>
                          <TableCell>
                            {log.status === "PROCESSING" ? (
                              <Badge
                                variant="outline"
                                className="border-sky-500/30 bg-sky-500/10 text-sky-700"
                              >
                                Diproses
                              </Badge>
                            ) : log.status === "FAILED" ? (
                              <Badge
                                variant="outline"
                                className="border-destructive/30 bg-destructive/10 text-destructive"
                              >
                                Gagal
                              </Badge>
                            ) : log.alreadyExists ? (
                              <Badge
                                variant="outline"
                                className="border-amber-500/30 bg-amber-500/10 text-amber-700"
                              >
                                Sukses (Reuse Existing)
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                              >
                                Sukses (Generate Baru)
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {formatAttemptDuration(log.startedAt, log.finishedAt)}
                          </TableCell>
                          <TableCell>{log.requestedByName ?? "-"}</TableCell>
                          <TableCell className="max-w-[360px] break-words text-xs">
                            {log.status === "FAILED"
                              ? (log.errorMessage ?? "Terjadi kesalahan saat generate.")
                              : log.alreadyExists
                                ? "Sistem menggunakan jadwal bulanan yang sudah ada."
                                : "Jadwal bulanan baru berhasil dibentuk."}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
