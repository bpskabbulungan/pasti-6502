"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Loader2,
  MessageSquareText,
  Plus,
  RefreshCcw,
  Save,
  ShieldAlert,
  Trash2,
  Users,
} from "lucide-react";
import { dutyScheduleApi } from "@/services/api/duty-schedule";
import { pstScheduleApi } from "@/services/api/pst-schedule";
import type {
  DutyDayOff,
  DutyScheduleBootstrapResponse,
  DutyReminderLog,
  DutyScheduleSettings,
  DutyScheduleSummary,
  DutyStaffMember,
  DutySummaryResponse,
} from "@shared/types/duty-schedule";
import type { MonthlySchedulePdfMeta } from "@shared/types/pst-schedule";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatDisplayDate, formatDisplayDateTime } from "@/lib/date-format";
import { serializeErrorForLog } from "@/lib/error-log";
import { markNavigationPending } from "@/lib/navigation-pending";
import { DashboardPageHeader } from "@/features/dashboard/components/layout/dashboard-page-header";

const WORK_DAY_OPTIONS = [
  { value: 1, label: "Senin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Kamis" },
  { value: 5, label: "Jumat" },
  { value: 6, label: "Sabtu" },
  { value: 7, label: "Minggu" },
];

const toInputDate = (date: string | Date) => {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toInputMonth = (date: string | Date) => {
  const value = new Date(date);
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
};

const formatDate = (date: string | Date) => formatDisplayDate(date);

const formatDateTime = (date: string | Date) => formatDisplayDateTime(date);

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }
  return fallback;
};

const triggerFileDownload = (blob: Blob, fileName: string) => {
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(objectUrl);
};

export default function DutySchedulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(toInputDate(new Date()));
  const [summary, setSummary] = useState<DutySummaryResponse | null>(null);
  const [settings, setSettings] = useState<DutyScheduleSettings | null>(null);
  const [staff, setStaff] = useState<DutyStaffMember[]>([]);
  const [schedules, setSchedules] = useState<DutyScheduleSummary[]>([]);
  const [dayOffs, setDayOffs] = useState<DutyDayOff[]>([]);
  const [reminderLogs, setReminderLogs] = useState<DutyReminderLog[]>([]);

  const [dayOffDate, setDayOffDate] = useState<string>(toInputDate(new Date()));
  const [dayOffName, setDayOffName] = useState("");
  const [dayOffType, setDayOffType] = useState<"HOLIDAY" | "LEAVE">("HOLIDAY");
  const [dayOffNote, setDayOffNote] = useState("");
  const [logQuery, setLogQuery] = useState("");
  const [logStatusFilter, setLogStatusFilter] = useState<"ALL" | "SUCCESS" | "FAILED">("ALL");
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyReminderFilter, setHistoryReminderFilter] = useState<
    "ALL" | "SUCCESS" | "FAILED" | "PENDING"
  >("ALL");
  const [pstMonthlyPeriod, setPstMonthlyPeriod] = useState<string>(toInputMonth(new Date()));
  const [pstMonthlyPdfMeta, setPstMonthlyPdfMeta] = useState<MonthlySchedulePdfMeta | null>(null);
  const [pstMonthlyGenerating, setPstMonthlyGenerating] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const bootstrap: DutyScheduleBootstrapResponse =
        await dutyScheduleApi.bootstrap(selectedDate);

      setSummary(bootstrap.summary);
      setSettings(bootstrap.settings);
      setStaff(bootstrap.staff);
      setSchedules(bootstrap.schedules);
      setDayOffs(bootstrap.dayOffs);
      setReminderLogs(bootstrap.logs);
    } catch (error) {
      console.error("Error loading duty schedule data:", serializeErrorForLog(error));
      toast.error("Gagal memuat data jadwal petugas");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const activeStaffCount = useMemo(() => staff.length, [staff]);
  const dayOffCount = useMemo(() => dayOffs.length, [dayOffs]);
  const scheduleCount = useMemo(() => schedules.length, [schedules]);
  const recentReminderStats = useMemo(() => {
    const recent = reminderLogs.slice(0, 30);
    const success = recent.filter((log) => log.success).length;
    const total = recent.length;

    if (total === 0) {
      return {
        success,
        total,
        successRateLabel: "-",
      };
    }

    return {
      success,
      total,
      successRateLabel: `${Math.round((success / total) * 100)}%`,
    };
  }, [reminderLogs]);

  const selectedDateLabel = useMemo(() => formatDate(selectedDate), [selectedDate]);

  const isSelectedDateToday = useMemo(
    () => selectedDate === toInputDate(new Date()),
    [selectedDate]
  );

  const canRunReminder = useMemo(
    () => Boolean(summary?.isWorkingDay && summary?.schedule),
    [summary]
  );
  const isBusy = loading || saving;

  const renderTableSkeletonRows = (rowCount: number, colCount: number, keyPrefix: string) =>
    Array.from({ length: rowCount }).map((_, rowIndex) => (
      <TableRow key={`${keyPrefix}-${rowIndex}`}>
        {Array.from({ length: colCount }).map((__, colIndex) => (
          <TableCell key={`${keyPrefix}-${rowIndex}-${colIndex}`}>
            <Skeleton className="h-4 w-full max-w-[160px]" />
          </TableCell>
        ))}
      </TableRow>
    ));

  const filteredReminderLogs = useMemo(() => {
    const query = logQuery.trim().toLowerCase();
    return reminderLogs
      .filter((log) => {
        if (logStatusFilter === "SUCCESS") return log.success;
        if (logStatusFilter === "FAILED") return !log.success;
        return true;
      })
      .filter((log) => {
        if (!query) return true;
        const staffName = log.staff?.name?.toLowerCase() || "";
        const errorMessage = log.errorMessage?.toLowerCase() || "";
        const reminderDate = formatDate(log.reminderDate).toLowerCase();
        return (
          staffName.includes(query) || errorMessage.includes(query) || reminderDate.includes(query)
        );
      })
      .slice(0, 30);
  }, [reminderLogs, logQuery, logStatusFilter]);

  const filteredSchedules = useMemo(() => {
    const query = historyQuery.trim().toLowerCase();

    return schedules
      .filter((schedule) => {
        if (historyReminderFilter === "SUCCESS") return Boolean(schedule.reminderLogs?.[0]?.success);
        if (historyReminderFilter === "FAILED") return Boolean(schedule.reminderLogs?.[0] && !schedule.reminderLogs[0].success);
        if (historyReminderFilter === "PENDING") return !schedule.reminderLogs?.[0];
        return true;
      })
      .filter((schedule) => {
        if (!query) return true;
        const staffName = schedule.staff.name.toLowerCase();
        const dateLabel = formatDate(schedule.scheduleDate).toLowerCase();
        const cycleShort = schedule.cycleId.slice(0, 8).toLowerCase();
        return (
          staffName.includes(query) || dateLabel.includes(query) || cycleShort.includes(query)
        );
      });
  }, [schedules, historyQuery, historyReminderFilter]);

  const handleToggleWorkDay = (day: number, checked: boolean) => {
    if (!settings) return;
    const next = checked
      ? [...new Set([...settings.workDays, day])].sort((a, b) => a - b)
      : settings.workDays.filter((value) => value !== day);
    setSettings({ ...settings, workDays: next.length > 0 ? next : settings.workDays });
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      const response = await dutyScheduleApi.updateSettings({
        workDays: settings.workDays,
        reminderEnabled: settings.reminderEnabled,
        autoAssignEnabled: settings.autoAssignEnabled,
        reminderTemplate: settings.reminderTemplate,
        timezone: settings.timezone,
      });
      setSettings(response.settings);
      toast.success("Pengaturan jadwal berhasil disimpan");
    } catch (error) {
      console.error("Error saving settings:", serializeErrorForLog(error));
      toast.error("Gagal menyimpan pengaturan jadwal");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateSchedule = async () => {
    try {
      setSaving(true);
      const result = await dutyScheduleApi.generateSchedule(selectedDate);
      toast.success(
        result.alreadyExists
          ? "Jadwal tanggal ini sudah tersedia"
          : "Jadwal petugas berhasil dibuat"
      );
      await loadData();
    } catch (error) {
      console.error("Error generating schedule:", serializeErrorForLog(error));
      toast.error("Gagal membuat jadwal petugas");
    } finally {
      setSaving(false);
    }
  };

  const getPstMonthYear = () => {
    const [yearText, monthText] = pstMonthlyPeriod.split("-");
    const year = Number(yearText);
    const month = Number(monthText);

    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
      return null;
    }

    return { month, year };
  };

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

      if (result.alreadyExists) {
        toast.success("Jadwal bulanan sudah ada. PDF verifikasi diperbarui.");
      } else {
        toast.success("Generate jadwal bulanan PST berhasil. PDF siap diunduh.");
      }
    } catch (error) {
      console.error("Error generating PST monthly schedule:", serializeErrorForLog(error));
      toast.error(getErrorMessage(error, "Gagal generate jadwal bulanan PST"));
    } finally {
      setPstMonthlyGenerating(false);
    }
  };

  const handleGenerateAndDownloadPstMonthly = async () => {
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
      } catch (metadataError) {
        console.error(
          "Error refreshing PST monthly PDF metadata:",
          serializeErrorForLog(metadataError)
        );
      }

      toast.success("Generate jadwal bulanan PST + download PDF berhasil.");
    } catch (error) {
      console.error("Error generating and downloading PST monthly PDF:", serializeErrorForLog(error));
      toast.error(getErrorMessage(error, "Gagal generate dan download PDF jadwal bulanan PST"));
    } finally {
      setPstMonthlyGenerating(false);
    }
  };

  const handleDownloadLastPstPdf = () => {
    if (!pstMonthlyPdfMeta?.downloadUrl) {
      toast.error("PDF belum tersedia. Silakan generate jadwal bulanan dulu.");
      return;
    }

    window.open(pstMonthlyPdfMeta.downloadUrl, "_blank", "noopener,noreferrer");
  };

  const handleRunReminder = async (force = false) => {
    try {
      setSaving(true);
      const result = await dutyScheduleApi.runReminder({
        date: selectedDate,
        force,
      });

      if (result.skipped) {
        toast.info(result.reason || "Pengingat tidak dijalankan");
      } else {
        toast.success("Pengingat jadwal berhasil diproses");
      }
      await loadData();
    } catch (error) {
      console.error("Error running reminder:", serializeErrorForLog(error));
      toast.error("Gagal memproses pengingat jadwal");
    } finally {
      setSaving(false);
    }
  };

  const handleAddDayOff = async () => {
    if (!dayOffDate || !dayOffName.trim()) {
      toast.error("Tanggal dan nama hari libur/cuti wajib diisi");
      return;
    }

    try {
      setSaving(true);
      await dutyScheduleApi.createDayOff({
        date: dayOffDate,
        name: dayOffName.trim(),
        type: dayOffType,
        note: dayOffNote.trim() || null,
      });
      setDayOffName("");
      setDayOffNote("");
      toast.success("Hari libur/cuti berhasil ditambahkan");
      await loadData();
    } catch (error) {
      console.error("Error creating day off:", serializeErrorForLog(error));
      toast.error("Gagal menambahkan hari libur/cuti");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDayOff = async (id: string) => {
    try {
      setSaving(true);
      await dutyScheduleApi.deleteDayOff(id);
      toast.success("Hari libur/cuti dihapus");
      await loadData();
    } catch (error) {
      console.error("Error deleting day off:", serializeErrorForLog(error));
      toast.error("Gagal menghapus hari libur/cuti");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-page pb-28 md:pb-8">
      <DashboardPageHeader
        title="Jadwal Petugas"
        description="Kelola rotasi petugas harian, hari libur/cuti, dan pengingat WhatsApp dalam satu alur kerja."
        chips={
          <>
            <div className="dashboard-chip">{activeStaffCount} petugas terdaftar</div>
            <div className="dashboard-chip">
              {summary?.isWorkingDay ? "Hari kerja aktif" : "Non-hari kerja"}
            </div>
            <div className="dashboard-chip">{selectedDateLabel}</div>
            <div className="dashboard-chip">{loading ? "Memuat data..." : "Data siap diproses"}</div>
          </>
        }
        actionsClassName="xl:w-auto"
        actions={
          <div className="grid w-full gap-2 sm:grid-cols-2 xl:grid-cols-3">
            <div className="flex gap-2 sm:col-span-2 xl:col-span-1">
              <Input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="h-9 w-full min-w-[180px]"
              />
              <Button
                variant="outline"
                disabled={isSelectedDateToday || loading || saving}
                onClick={() => setSelectedDate(toInputDate(new Date()))}
                className="shrink-0"
              >
                Hari Ini
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => loadData()}
              disabled={isBusy}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="mr-2 h-4 w-4" />
              )}
              {loading ? "Memproses..." : "Perbarui Data"}
            </Button>
            <Button
              variant="success"
              onClick={handleGenerateSchedule}
              disabled={isBusy || activeStaffCount === 0}
              className="w-full"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CalendarDays className="mr-2 h-4 w-4" />
              )}
              {saving ? "Memproses..." : "Generate Jadwal"}
            </Button>
            <Button
              onClick={() => handleRunReminder(false)}
              disabled={isBusy || !canRunReminder}
              className="w-full"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MessageSquareText className="mr-2 h-4 w-4" />
              )}
              {saving ? "Memproses..." : "Kirim Pengingat"}
            </Button>
            <p className="text-xs text-secondary-color sm:col-span-2 xl:col-span-3">
              {canRunReminder
                ? "Pengingat akan dikirim ke petugas yang terjadwal pada tanggal ini."
                : "Pengingat aktif jika tanggal termasuk hari kerja dan penugasan sudah tersedia."}
            </p>
          </div>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-card/88 transition-shadow hover:shadow-md">
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="text-sm font-semibold text-secondary-color">
              Total Petugas
            </CardTitle>
            <CardDescription>Petugas aktif untuk rotasi jadwal</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <p className="text-3xl font-bold text-primary-color">{activeStaffCount}</p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card/88 transition-shadow hover:shadow-md">
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="text-sm font-semibold text-secondary-color">
              Total Jadwal
            </CardTitle>
            <CardDescription>Riwayat jadwal tersimpan</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <p className="text-3xl font-bold text-primary-color">{scheduleCount}</p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card/88 transition-shadow hover:shadow-md">
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="text-sm font-semibold text-secondary-color">
              Hari Libur/Cuti
            </CardTitle>
            <CardDescription>Daftar pengecualian hari kerja</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <p className="text-3xl font-bold text-primary-color">{dayOffCount}</p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card/88 transition-shadow hover:shadow-md">
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="text-sm font-semibold text-secondary-color">
              Reminder Berhasil
            </CardTitle>
            <CardDescription>30 log reminder terakhir</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 pt-0">
            {loading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <p className="text-3xl font-bold text-primary-color">
                {recentReminderStats.successRateLabel}
              </p>
            )}
            <p className="text-xs text-secondary-color">
              {recentReminderStats.success}/{recentReminderStats.total} reminder sukses
            </p>
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="ringkasan" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="ringkasan">Ringkasan</TabsTrigger>
          <TabsTrigger value="pengaturan">Pengaturan</TabsTrigger>
          <TabsTrigger value="petugas">Reminder WhatsApp</TabsTrigger>
          <TabsTrigger value="riwayat">Riwayat Penugasan</TabsTrigger>
        </TabsList>

        <TabsContent value="ringkasan" className="space-y-6">
          <section className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-2">
                  <Clock3 className="h-5 w-5" />
                  Ringkasan {selectedDateLabel}
                </CardTitle>
                <CardDescription>
                  Cek apakah tanggal aktif, siapa petugas bertugas, dan status reminder terbaru.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-md border border-border/70 bg-background/40 p-3">
                    <p className="text-xs text-secondary-color">Tanggal terpilih</p>
                    <p className="font-medium text-primary-color">
                      {summary?.dateLabel || "Memuat ringkasan..."}
                    </p>
                  </div>
                  <div className="rounded-md border border-border/70 bg-background/40 p-3">
                    <p className="text-xs text-secondary-color">Petugas terjadwal</p>
                    <p className="font-medium text-primary-color">
                      {summary?.schedule?.staff?.name || "-"}
                    </p>
                  </div>
                </div>
                {summary?.isWorkingDay ? (
                  <div className="flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4" />
                    <div>
                      <p className="font-medium">Hari kerja aktif</p>
                      <p>
                        {summary.schedule
                          ? `Petugas bertugas: ${summary.schedule.staff.name}`
                          : "Belum ada petugas terjadwal untuk tanggal ini."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-amber-700">
                    <ShieldAlert className="mt-0.5 h-4 w-4" />
                    <div>
                      <p className="font-medium">Bukan hari kerja</p>
                      <p>{summary?.reason || "Tanggal tidak termasuk hari kerja aktif."}</p>
                    </div>
                  </div>
                )}
                {summary?.schedule?.reminderLogs?.[0] && (
                  <div className="rounded-md border border-border/70 bg-muted/40 p-3 text-xs">
                    <p className="font-medium">Status reminder terakhir</p>
                    <p>
                      {summary.schedule.reminderLogs[0].success ? "Berhasil" : "Gagal"} pada{" "}
                      {formatDateTime(summary.schedule.reminderLogs[0].createdAt)}
                    </p>
                    {summary.schedule.reminderLogs[0].errorMessage && (
                      <p className="text-destructive">
                        {summary.schedule.reminderLogs[0].errorMessage}
                      </p>
                    )}
                  </div>
                )}
                <Button
                  variant="warning"
                  onClick={() => handleRunReminder(true)}
                  disabled={saving || !summary?.schedule}
                  className="w-full sm:w-auto"
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquareText className="mr-2 h-4 w-4" />
                  )}
                  {saving ? "Memproses..." : "Kirim Reminder"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Sumber Petugas
                </CardTitle>
                <CardDescription>
                  Data petugas jadwal diambil otomatis dari manajemen pengguna.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-secondary-color">
                  Petugas jadwal PASTI 6502 diambil otomatis dari daftar pengguna dengan role PETUGAS
                  (menu Kelola Pengguna).
                </p>
                <p className="text-sm text-secondary-color">
                  Untuk reminder WhatsApp, pastikan nomor telepon petugas sudah diisi di data
                  pengguna.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    markNavigationPending();
                    router.push("/dashboard/users");
                  }}
                  className="w-full sm:w-auto"
                >
                  Buka Kelola Pengguna
                </Button>
              </CardContent>
            </Card>
          </section>

          <section>
            <Card>
              <CardHeader className="space-y-2">
                <CardTitle>Verifikasi Jadwal PST Bulanan (Sementara)</CardTitle>
                <CardDescription>
                  Generate jadwal bulanan PST dan unduh PDF untuk memeriksa distribusi slot,
                  fairness, hari libur/cuti, dan slot belum terisi.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Periode Bulanan</Label>
                    <Input
                      type="month"
                      value={pstMonthlyPeriod}
                      onChange={(event) => setPstMonthlyPeriod(event.target.value)}
                      disabled={pstMonthlyGenerating}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="success"
                      onClick={handleGenerateAndDownloadPstMonthly}
                      disabled={pstMonthlyGenerating}
                      className="w-full"
                    >
                      {pstMonthlyGenerating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      {pstMonthlyGenerating ? "Memproses..." : "Generate + Download PDF"}
                    </Button>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={handleGeneratePstMonthly}
                      disabled={pstMonthlyGenerating}
                      className="w-full"
                    >
                      {pstMonthlyGenerating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CalendarDays className="mr-2 h-4 w-4" />
                      )}
                      {pstMonthlyGenerating ? "Memproses..." : "Generate Saja"}
                    </Button>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleDownloadLastPstPdf}
                      disabled={pstMonthlyGenerating || !pstMonthlyPdfMeta}
                      className="w-full"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF Terakhir
                    </Button>
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
                      Belum ada PDF verifikasi bulanan pada sesi ini. Klik{" "}
                      <span className="font-medium text-primary-color">Download PDF</span>{" "}
                      atau <span className="font-medium text-primary-color">Generate</span>.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="pengaturan" className="space-y-6">
          <section className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="space-y-2">
                <CardTitle>Pengaturan Hari Kerja & Reminder</CardTitle>
                <CardDescription>
                  Atur hari kerja aktif, penugasan otomatis, dan template reminder.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {WORK_DAY_OPTIONS.map((day) => (
                    <label
                      key={day.value}
                      className="flex items-center justify-between rounded-md border border-border/70 bg-background/40 px-3 py-2 text-sm"
                    >
                      <span>{day.label}</span>
                      <Switch
                        checked={Boolean(settings?.workDays?.includes(day.value))}
                        onCheckedChange={(checked) => handleToggleWorkDay(day.value, checked)}
                      />
                    </label>
                  ))}
                </div>
                <div className="space-y-3 rounded-md border border-border/70 bg-background/40 p-3">
                  <label className="flex items-center justify-between text-sm">
                    <span>Penugasan otomatis</span>
                    <Switch
                      checked={Boolean(settings?.autoAssignEnabled)}
                      onCheckedChange={(checked) =>
                        settings && setSettings({ ...settings, autoAssignEnabled: checked })
                      }
                    />
                  </label>
                  <label className="flex items-center justify-between text-sm">
                    <span>Reminder otomatis aktif</span>
                    <Switch
                      checked={Boolean(settings?.reminderEnabled)}
                      onCheckedChange={(checked) =>
                        settings && setSettings({ ...settings, reminderEnabled: checked })
                      }
                    />
                  </label>
                </div>
                <div className="space-y-2">
                  <Label>Template Chat Fonnte</Label>
                  <Textarea
                    rows={6}
                    value={settings?.reminderTemplate || ""}
                    onChange={(event) =>
                      settings && setSettings({ ...settings, reminderTemplate: event.target.value })
                    }
                    placeholder="Isi template chat reminder..."
                  />
                  <p className="text-xs text-secondary-color">
                    Placeholder: {settings?.availableTemplatePlaceholders?.join(", ")}
                  </p>
                </div>
                <Button variant="success" onClick={handleSaveSettings} disabled={saving || loading}>
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {saving ? "Menyimpan..." : "Simpan Pengaturan"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-2">
                <CardTitle>Hari Libur / Cuti</CardTitle>
                <CardDescription>
                  Tambahkan hari khusus agar tidak masuk jadwal rotasi petugas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Tanggal</Label>
                    <Input
                      type="date"
                      value={dayOffDate}
                      onChange={(event) => setDayOffDate(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nama</Label>
                    <Input
                      value={dayOffName}
                      onChange={(event) => setDayOffName(event.target.value)}
                      placeholder="Contoh: Libur Nasional"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipe</Label>
                    <Select
                      value={dayOffType}
                      onValueChange={(value) => setDayOffType(value as "HOLIDAY" | "LEAVE")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HOLIDAY">Libur</SelectItem>
                        <SelectItem value="LEAVE">Cuti</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Catatan (opsional)</Label>
                    <Input
                      value={dayOffNote}
                      onChange={(event) => setDayOffNote(event.target.value)}
                      placeholder="Catatan tambahan"
                    />
                  </div>
                  <Button
                    variant="success"
                    onClick={handleAddDayOff}
                    disabled={saving}
                    className="md:col-span-2"
                  >
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    {saving ? "Memproses..." : "Tambah Hari Libur/Cuti"}
                  </Button>
                </div>

                <div className="max-h-64 overflow-auto rounded-md border border-border/70">
                  <Table className="min-w-[520px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        renderTableSkeletonRows(4, 4, "day-off")
                      ) : dayOffs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            Belum ada hari libur/cuti.
                          </TableCell>
                        </TableRow>
                      ) : (
                        dayOffs.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{formatDate(item.date)}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.type === "LEAVE" ? "Cuti" : "Libur"}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteDayOff(item.id)}
                                disabled={saving}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="petugas" className="space-y-6">
          <section className="space-y-6">
            <Card>
              <CardHeader className="space-y-2">
                <CardTitle>Sumber Data Petugas</CardTitle>
                <CardDescription>
                  Daftar petugas dikelola terpusat di menu Kelola Pengguna agar tidak redundan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-secondary-color">
                  Tab ini hanya menampilkan hasil pengiriman reminder. Untuk tambah/edit petugas,
                  gunakan menu Kelola Pengguna.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    markNavigationPending();
                    router.push("/dashboard/users");
                  }}
                  className="w-full sm:w-auto"
                >
                  Buka Kelola Pengguna
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-2">
                <CardTitle>Log Reminder WhatsApp</CardTitle>
                <CardDescription>
                  Menampilkan histori pengiriman pesan WhatsApp (berhasil/gagal + error teknis).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-3">
                  <Input
                    value={logQuery}
                    onChange={(event) => setLogQuery(event.target.value)}
                    placeholder="Cari petugas, tanggal, atau error..."
                    aria-label="Cari log reminder"
                    className="sm:col-span-2"
                  />
                  <Select
                    value={logStatusFilter}
                    onValueChange={(value) =>
                      setLogStatusFilter(value as "ALL" | "SUCCESS" | "FAILED")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Semua status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua status</SelectItem>
                      <SelectItem value="SUCCESS">Berhasil</SelectItem>
                      <SelectItem value="FAILED">Gagal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="max-h-80 overflow-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[20%]">Tanggal</TableHead>
                      <TableHead className="w-[28%]">Petugas</TableHead>
                      <TableHead className="w-[14%]">Status</TableHead>
                      <TableHead className="w-[38%]">Waktu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      renderTableSkeletonRows(5, 4, "reminder-log")
                    ) : filteredReminderLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          {reminderLogs.length === 0
                            ? "Belum ada log reminder."
                            : "Tidak ada log yang sesuai kata kunci/filter."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReminderLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{formatDate(log.reminderDate)}</TableCell>
                          <TableCell className="break-words">{log.staff?.name || "-"}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                log.success
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                                  : "border-destructive/30 bg-destructive/10 text-destructive"
                              }
                            >
                              {log.success ? "Berhasil" : "Gagal"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-xs">
                              <p>{formatDateTime(log.createdAt)}</p>
                              {log.errorMessage && (
                                <p className="flex items-start gap-1 break-words text-destructive">
                                  <AlertCircle className="h-3.5 w-3.5" />
                                  {log.errorMessage}
                                </p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="riwayat">
          <Card>
            <CardHeader className="space-y-2">
              <CardTitle>Riwayat Penugasan Harian</CardTitle>
              <CardDescription>
                Menampilkan histori siapa yang bertugas per tanggal. Status reminder di sini hanya
                ringkasan terakhir per jadwal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-3">
                <Input
                  value={historyQuery}
                  onChange={(event) => setHistoryQuery(event.target.value)}
                  placeholder="Cari tanggal, petugas, atau siklus..."
                  aria-label="Cari riwayat jadwal"
                  className="sm:col-span-2"
                />
                <Select
                  value={historyReminderFilter}
                  onValueChange={(value) =>
                    setHistoryReminderFilter(
                      value as "ALL" | "SUCCESS" | "FAILED" | "PENDING"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua reminder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua reminder</SelectItem>
                    <SelectItem value="SUCCESS">Reminder berhasil</SelectItem>
                    <SelectItem value="FAILED">Reminder gagal</SelectItem>
                    <SelectItem value="PENDING">Belum dikirim</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="overflow-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[18%]">Tanggal</TableHead>
                    <TableHead className="w-[28%]">Petugas Bertugas</TableHead>
                    <TableHead className="w-[14%]">Siklus</TableHead>
                    <TableHead className="w-[18%]">Status Reminder</TableHead>
                    <TableHead className="w-[22%]">Dibuat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    renderTableSkeletonRows(6, 5, "history")
                  ) : filteredSchedules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        {schedules.length === 0
                          ? "Belum ada jadwal tercatat."
                          : "Tidak ada riwayat yang sesuai kata kunci/filter."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSchedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell>{formatDate(schedule.scheduleDate)}</TableCell>
                        <TableCell className="break-words">{schedule.staff.name}</TableCell>
                        <TableCell>{schedule.cycleId.slice(0, 8)}</TableCell>
                        <TableCell>
                          {schedule.reminderLogs?.[0] ? (
                            <Badge
                              variant="outline"
                              className={
                                schedule.reminderLogs[0].success
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                                  : "border-destructive/30 bg-destructive/10 text-destructive"
                              }
                            >
                              {schedule.reminderLogs[0].success ? "Berhasil" : "Gagal"}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Belum dikirim</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDateTime(schedule.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">
        <div className="mx-auto grid w-full max-w-screen-xl grid-cols-2 gap-2 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3">
          <Button
            variant="success"
            onClick={handleGenerateSchedule}
            disabled={isBusy || activeStaffCount === 0}
            className="w-full"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CalendarDays className="mr-2 h-4 w-4" />
            )}
            {saving ? "Memproses..." : "Generate"}
          </Button>
          <Button
            onClick={() => handleRunReminder(false)}
            disabled={isBusy || !canRunReminder}
            className="w-full"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <MessageSquareText className="mr-2 h-4 w-4" />
            )}
            {saving ? "Memproses..." : "Reminder"}
          </Button>
          <p className="col-span-2 text-center text-[11px] text-secondary-color">
            {canRunReminder
              ? `Siap kirim reminder untuk ${summary?.schedule?.staff?.name || "petugas terjadwal"}.`
              : "Pilih tanggal kerja dengan jadwal aktif untuk mengirim reminder."}
          </p>
        </div>
      </div>
    </div>
  );
}
