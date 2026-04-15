"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarRange,
  CheckCircle2,
  Clock3,
  Download,
  Loader2,
  MessageSquareText,
  RefreshCcw,
  Save,
  ShieldAlert,
} from "lucide-react";
import { dutyScheduleApi } from "@/services/api/duty-schedule";
import { pstScheduleApi } from "@/services/api/pst-schedule";
import type {
  DutyDayOff,
  DutyScheduleBootstrapResponse,
  DutyScheduleSettings,
  DutyScheduleSummary,
  DutyStaffMember,
  DutySummaryResponse,
} from "@shared/types/duty-schedule";
import type {
  MonthlySchedulePdfMeta,
  MonthlyScheduleResponse,
  PstGenerateAttemptLog,
} from "@shared/types/pst-schedule";
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

const getErrorStatus = (error: unknown) => {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = Number((error as { status?: unknown }).status);
    if (Number.isInteger(status)) {
      return status;
    }
  }
  return null;
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

type PstGenerateMode = "MONTHLY" | "WEEKLY";
type HistoryReminderFilter = "ALL" | "SUCCESS" | "FAILED" | "PENDING";
type HistorySortKey =
  | "scheduleDate"
  | "staffName"
  | "staffPoints"
  | "cycleId"
  | "reminderStatus"
  | "createdAt";
type HistorySortDirection = "asc" | "desc";

const HISTORY_SORT_DEFAULT_DIRECTION: Record<HistorySortKey, HistorySortDirection> = {
  scheduleDate: "desc",
  staffName: "asc",
  staffPoints: "desc",
  cycleId: "asc",
  reminderStatus: "desc",
  createdAt: "desc",
};

const compareText = (first: string, second: string) =>
  first.localeCompare(second, "id-ID", { sensitivity: "base" });

const toScheduleReminderStatus = (schedule: DutyScheduleSummary) => {
  if (!schedule.reminderLogs?.[0]) return "PENDING";
  return schedule.reminderLogs[0].success ? "SUCCESS" : "FAILED";
};

const toReminderStatusWeight = (status: Exclude<HistoryReminderFilter, "ALL">) => {
  if (status === "SUCCESS") return 2;
  if (status === "FAILED") return 1;
  return 0;
};

const toMonthlyPeriodValue = (month: number, year: number) =>
  `${year}-${String(month).padStart(2, "0")}`;

const formatMonthPeriodLabel = (month: number, year: number) =>
  new Date(year, month - 1, 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

const formatAttemptDuration = (startedAt: string | Date, finishedAt: string | Date | null) => {
  if (!finishedAt) {
    return "-";
  }

  const startMs = new Date(startedAt).getTime();
  const finishMs = new Date(finishedAt).getTime();

  if (Number.isNaN(startMs) || Number.isNaN(finishMs) || finishMs < startMs) {
    return "-";
  }

  const diffSeconds = Math.floor((finishMs - startMs) / 1000);
  if (diffSeconds < 60) {
    return `${diffSeconds} dtk`;
  }

  const minutes = Math.floor(diffSeconds / 60);
  const seconds = diffSeconds % 60;
  return `${minutes}m ${seconds}d`;
};

const toFallbackPstMonthlyPdfMeta = (
  schedule: MonthlyScheduleResponse
): MonthlySchedulePdfMeta => ({
  scheduleId: schedule.id,
  fileName: `jadwal-petugas-pst-${schedule.year}-${String(schedule.month).padStart(2, "0")}-${schedule.id}.pdf`,
  path: "",
  htmlPath: "",
  metadataPath: "",
  month: schedule.month,
  year: schedule.year,
  generatedAt: schedule.generatedAt,
  generatedById: null,
  downloadUrl: pstScheduleApi.getMonthlyPdfDownloadUrl(schedule.id),
});

export default function DutySchedulePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(toInputDate(new Date()));
  const [summary, setSummary] = useState<DutySummaryResponse | null>(null);
  const [settings, setSettings] = useState<DutyScheduleSettings | null>(null);
  const [, setStaff] = useState<DutyStaffMember[]>([]);
  const [schedules, setSchedules] = useState<DutyScheduleSummary[]>([]);
  const [dayOffs, setDayOffs] = useState<DutyDayOff[]>([]);
  const [syncingDayOffs, setSyncingDayOffs] = useState(false);
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyReminderFilter, setHistoryReminderFilter] = useState<HistoryReminderFilter>("ALL");
  const [historyStaffFilter, setHistoryStaffFilter] = useState<string>("ALL");
  const [historyDateFrom, setHistoryDateFrom] = useState("");
  const [historyDateTo, setHistoryDateTo] = useState("");
  const [historySortKey, setHistorySortKey] = useState<HistorySortKey>("scheduleDate");
  const [historySortDirection, setHistorySortDirection] =
    useState<HistorySortDirection>("desc");
  const [pstMonthlyPeriod, setPstMonthlyPeriod] = useState<string>(toInputMonth(new Date()));
  const [pstMonthlyPdfMeta, setPstMonthlyPdfMeta] = useState<MonthlySchedulePdfMeta | null>(null);
  const [pstMonthlyGenerating, setPstMonthlyGenerating] = useState(false);
  const [pstHistoryLoading, setPstHistoryLoading] = useState(false);
  const [pstGenerationHistory, setPstGenerationHistory] = useState<MonthlyScheduleResponse[]>([]);
  const [pstAttemptLogsLoading, setPstAttemptLogsLoading] = useState(false);
  const [pstAttemptLogs, setPstAttemptLogs] = useState<PstGenerateAttemptLog[]>([]);
  const [pstGenerateMode, setPstGenerateMode] = useState<PstGenerateMode>("MONTHLY");
  const [pstWeeklyWeek, setPstWeeklyWeek] = useState("1");
  const [pstGeneratedSchedule, setPstGeneratedSchedule] = useState<MonthlyScheduleResponse | null>(
    null
  );

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

  const isSelectedDateToday = useMemo(
    () => selectedDate === toInputDate(new Date()),
    [selectedDate]
  );

  const canRunReminder = useMemo(
    () => Boolean(summary?.isWorkingDay && summary?.schedule),
    [summary]
  );
  const isBusy = loading || saving;
  const scheduledStaffName = summary?.schedule?.staff?.name ?? "-";
  const hasScheduledStaff = Boolean(summary?.schedule?.staff);
  const latestReminderLog = summary?.schedule?.reminderLogs?.[0] ?? null;
  const latestReminderStatusLabel = latestReminderLog
    ? latestReminderLog.success
      ? "Berhasil"
      : "Gagal"
    : "Belum ada";
  const scheduleStatusTitle = !summary?.isWorkingDay
    ? "Tanggal ini bukan hari kerja aktif."
    : hasScheduledStaff
      ? "Petugas sudah terjadwal"
      : "Belum ada petugas PST terjadwal";
  const scheduleStatusHint = canRunReminder
    ? "Reminder dapat dikirim untuk tanggal ini."
    : summary?.isWorkingDay
      ? "Reminder belum dapat dikirim karena petugas belum terjadwal."
      : (summary?.reason ?? "Reminder tidak tersedia pada tanggal non-hari kerja.");

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

  const historyStaffOptions = useMemo(() => {
    const uniqueStaffById = new Map<string, { id: string; name: string }>();
    schedules.forEach((schedule) => {
      uniqueStaffById.set(schedule.staffId, {
        id: schedule.staffId,
        name: schedule.staff.name,
      });
    });

    return [...uniqueStaffById.values()].sort((first, second) =>
      compareText(first.name, second.name)
    );
  }, [schedules]);

  const assignmentPointsByStaff = useMemo(() => {
    const countByStaff = new Map<string, number>();
    schedules.forEach((schedule) => {
      countByStaff.set(schedule.staffId, (countByStaff.get(schedule.staffId) ?? 0) + 1);
    });
    return countByStaff;
  }, [schedules]);

  const filteredSchedules = useMemo(() => {
    const query = historyQuery.trim().toLowerCase();

    return schedules
      .filter((schedule) => {
        if (historyReminderFilter === "ALL") return true;
        return toScheduleReminderStatus(schedule) === historyReminderFilter;
      })
      .filter((schedule) => {
        if (historyStaffFilter === "ALL") return true;
        return schedule.staffId === historyStaffFilter;
      })
      .filter((schedule) => {
        const scheduleDateInput = toInputDate(schedule.scheduleDate);
        if (historyDateFrom && scheduleDateInput < historyDateFrom) {
          return false;
        }
        if (historyDateTo && scheduleDateInput > historyDateTo) {
          return false;
        }
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
  }, [
    historyDateFrom,
    historyDateTo,
    historyQuery,
    historyReminderFilter,
    historyStaffFilter,
    schedules,
  ]);

  const filteredPointsByStaff = useMemo(() => {
    const countByStaff = new Map<string, number>();
    filteredSchedules.forEach((schedule) => {
      countByStaff.set(schedule.staffId, (countByStaff.get(schedule.staffId) ?? 0) + 1);
    });
    return countByStaff;
  }, [filteredSchedules]);

  const sortedSchedules = useMemo(() => {
    const rows = [...filteredSchedules];

    rows.sort((first, second) => {
      let compareResult = 0;

      if (historySortKey === "scheduleDate") {
        compareResult =
          new Date(first.scheduleDate).getTime() - new Date(second.scheduleDate).getTime();
      } else if (historySortKey === "staffName") {
        compareResult = compareText(first.staff.name, second.staff.name);
      } else if (historySortKey === "staffPoints") {
        compareResult =
          (filteredPointsByStaff.get(first.staffId) ?? 0) -
          (filteredPointsByStaff.get(second.staffId) ?? 0);
      } else if (historySortKey === "cycleId") {
        compareResult = compareText(first.cycleId, second.cycleId);
      } else if (historySortKey === "reminderStatus") {
        compareResult =
          toReminderStatusWeight(toScheduleReminderStatus(first)) -
          toReminderStatusWeight(toScheduleReminderStatus(second));
      } else if (historySortKey === "createdAt") {
        compareResult = new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime();
      }

      if (compareResult !== 0) {
        return historySortDirection === "asc" ? compareResult : -compareResult;
      }

      return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
    });

    return rows;
  }, [filteredPointsByStaff, filteredSchedules, historySortDirection, historySortKey]);

  const historySummary = useMemo(() => {
    let successCount = 0;
    let failedCount = 0;
    let pendingCount = 0;

    filteredSchedules.forEach((schedule) => {
      const reminderStatus = toScheduleReminderStatus(schedule);
      if (reminderStatus === "SUCCESS") successCount += 1;
      if (reminderStatus === "FAILED") failedCount += 1;
      if (reminderStatus === "PENDING") pendingCount += 1;
    });

    const topStaff = [...filteredPointsByStaff.entries()]
      .map(([staffId, points]) => {
        const staffName =
          filteredSchedules.find((schedule) => schedule.staffId === staffId)?.staff.name ?? staffId;
        return { name: staffName, points };
      })
      .sort((first, second) => {
      if (second.points !== first.points) return second.points - first.points;
      return compareText(first.name, second.name);
      })[0];

    const uniqueStaffCount = filteredPointsByStaff.size;
    const totalPoints = filteredSchedules.length;

    return {
      totalRows: filteredSchedules.length,
      totalPoints,
      uniqueStaffCount,
      successCount,
      failedCount,
      pendingCount,
      averagePointsPerStaff: uniqueStaffCount > 0 ? totalPoints / uniqueStaffCount : 0,
      topStaff: topStaff ?? null,
    };
  }, [filteredPointsByStaff, filteredSchedules]);

  const hasActiveHistoryFilters =
    Boolean(historyQuery.trim()) ||
    historyReminderFilter !== "ALL" ||
    historyStaffFilter !== "ALL" ||
    Boolean(historyDateFrom) ||
    Boolean(historyDateTo);

  const handleResetHistoryFilters = () => {
    setHistoryQuery("");
    setHistoryReminderFilter("ALL");
    setHistoryStaffFilter("ALL");
    setHistoryDateFrom("");
    setHistoryDateTo("");
  };

  const handleHistorySort = (key: HistorySortKey) => {
    if (historySortKey === key) {
      setHistorySortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
      return;
    }

    setHistorySortKey(key);
    setHistorySortDirection(HISTORY_SORT_DEFAULT_DIRECTION[key]);
  };

  const renderHistorySortIcon = (key: HistorySortKey) => {
    if (historySortKey !== key) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-secondary-color" />;
    }
    return historySortDirection === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5" />
    );
  };

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

  const handleSyncDayOffsFromSigap = async () => {
    try {
      setSyncingDayOffs(true);
      const result = await dutyScheduleApi.syncDayOffsFromSigap();
      setDayOffs(result.dayOffs);

      const { inserted, updated, removed } = result.summary;
      const totalChanges = inserted + updated + removed;
      if (totalChanges === 0) {
        toast.success("Sinkronisasi SIGAP selesai. Tidak ada perubahan data.");
      } else {
        toast.success(
          `Sinkronisasi SIGAP selesai: ${inserted} baru, ${updated} diperbarui, ${removed} dihapus.`
        );
      }

      await loadData();
    } catch (error) {
      console.error("Error syncing day offs from SIGAP:", serializeErrorForLog(error));
      toast.error(getErrorMessage(error, "Gagal sinkronisasi hari libur/cuti dari SIGAP"));
    } finally {
      setSyncingDayOffs(false);
    }
  };

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

  const handleDownloadLastPstPdf = () => {
    if (!pstMonthlyPdfMeta?.downloadUrl) {
      toast.error("PDF belum tersedia. Silakan generate jadwal bulanan dulu.");
      return;
    }

    window.open(pstMonthlyPdfMeta.downloadUrl, "_blank", "noopener,noreferrer");
  };

  const handleOpenPstGeneratedHistory = (schedule: MonthlyScheduleResponse) => {
    setPstMonthlyPeriod(toMonthlyPeriodValue(schedule.month, schedule.year));
    setPstGenerateMode("MONTHLY");
    setPstGeneratedSchedule(schedule);
    setPstMonthlyPdfMeta(toFallbackPstMonthlyPdfMeta(schedule));
  };

  const handleDownloadPstHistoryPdf = (scheduleId: string) => {
    window.open(
      pstScheduleApi.getMonthlyPdfDownloadUrl(scheduleId),
      "_blank",
      "noopener,noreferrer"
    );
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

  return (
    <div className="dashboard-page pb-28 md:pb-8">
      <DashboardPageHeader
        title="Jadwal Petugas PST BPS Kabupaten Bulungan"
        description="Halaman untuk melihat ringkasan jadwal petugas, mengelola hari libur/cuti, dan mengatur pengingat WhatsApp."
        actionsClassName="xl:w-auto"
      />
      <Tabs defaultValue="ringkasan" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ringkasan">Ringkasan</TabsTrigger>
          <TabsTrigger value="riwayat">Riwayat Penugasan</TabsTrigger>
          <TabsTrigger value="pengaturan">Pengaturan</TabsTrigger>
        </TabsList>

        <TabsContent value="ringkasan" className="space-y-6">
          <section className="space-y-6">
            <Card className="w-full">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-2">
                  <Clock3 className="h-5 w-5" />
                  Ringkasan Jadwal Petugas PST
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="rounded-lg border border-border/70 bg-background/40 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="selected-schedule-date">Tanggal</Label>
                    <Input
                      id="selected-schedule-date"
                      type="date"
                      value={selectedDate}
                      onChange={(event) => setSelectedDate(event.target.value)}
                      disabled={isBusy}
                      className="h-10"
                    />
                  </div>
                  <p className="mt-2 text-xs text-secondary-color">
                    {isSelectedDateToday
                      ? "Menampilkan jadwal hari ini."
                      : "Menampilkan jadwal sesuai tanggal yang dipilih."}
                  </p>
                </div>

                <div className="rounded-md border border-border/70 bg-background/40 p-3">
                  <p className="text-xs text-secondary-color">Petugas PST</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="text-base font-semibold text-primary-color">{scheduledStaffName}</p>
                    <Badge
                      variant="outline"
                      className={
                        hasScheduledStaff
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                          : "border-border/70 bg-background/60 text-secondary-color"
                      }
                    >
                      {hasScheduledStaff ? "Aktif" : "Belum ada"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-secondary-color">
                    Petugas yang bertugas pada tanggal ini.
                  </p>
                </div>

                <div
                  className={`rounded-md border p-3 ${
                    canRunReminder
                      ? "border-emerald-500/30 bg-emerald-500/10"
                      : "border-amber-500/30 bg-amber-500/10"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div
                      className={`flex items-start gap-2 ${
                        canRunReminder ? "text-emerald-700" : "text-amber-700"
                      }`}
                    >
                      {canRunReminder ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                      ) : (
                        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">{scheduleStatusTitle}</p>
                        <p className="text-xs">{scheduleStatusHint}</p>
                      </div>
                    </div>
                    <Button
                      variant="warning"
                      onClick={() => handleRunReminder(true)}
                      disabled={isBusy || !canRunReminder}
                      className="h-10 w-full shrink-0 sm:w-auto sm:min-w-[170px]"
                    >
                      {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <MessageSquareText className="mr-2 h-4 w-4" />
                      )}
                      {saving ? "Memproses..." : "Kirim Reminder"}
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border border-border/70 bg-background/40 p-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-primary-color">Status reminder terakhir</p>
                    <Badge
                      variant="outline"
                      className={
                        !latestReminderLog
                          ? "border-border/70 bg-background/60 text-secondary-color"
                          : latestReminderLog.success
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                            : "border-destructive/30 bg-destructive/10 text-destructive"
                      }
                    >
                      {latestReminderStatusLabel}
                    </Badge>
                  </div>
                  {latestReminderLog ? (
                    <>
                      <p className="mt-2 text-primary-color">
                        {formatDateTime(latestReminderLog.createdAt)}
                      </p>
                      <p
                        className={
                          latestReminderLog.errorMessage
                            ? "mt-1 text-destructive"
                            : "mt-1 text-secondary-color"
                        }
                      >
                        {latestReminderLog.errorMessage || "Tanpa error."}
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-secondary-color">
                      Belum ada riwayat reminder untuk tanggal ini.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
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
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <CardTitle>Hari Libur / Cuti</CardTitle>
                    <CardDescription>
                      Data otomatis mengikuti API SIGAP (`/admin/holidays`) agar konsisten dengan
                      kalender pusat.
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleSyncDayOffsFromSigap}
                    disabled={syncingDayOffs || saving || loading}
                  >
                    <RefreshCcw className={`mr-2 h-4 w-4 ${syncingDayOffs ? "animate-spin" : ""}`} />
                    {syncingDayOffs ? "Sinkronisasi..." : "Sinkronkan Sekarang"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border border-border/70 bg-background/40 px-3 py-2 text-sm text-secondary-color">
                  Sinkronisasi hari libur/cuti dilakukan otomatis dari SIGAP. Perubahan manual pada
                  daftar ini dinonaktifkan.
                </div>

                <div className="max-h-64 overflow-auto rounded-md border border-border/70">
                  <Table className="min-w-[420px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Tipe</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        renderTableSkeletonRows(4, 3, "day-off")
                      ) : dayOffs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            Belum ada hari libur/cuti.
                          </TableCell>
                        </TableRow>
                      ) : (
                        dayOffs.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{formatDate(item.date)}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.type === "LEAVE" ? "Cuti" : "Libur"}</TableCell>
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
                Histori petugas per tanggal dengan filter, sorting, serta ringkasan poin penugasan.
                Poin dihitung dari total jadwal: 1 jadwal = 1 poin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-md border border-border/70 bg-background/40 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-secondary-color">
                    Jadwal Ditampilkan
                  </p>
                  <p className="text-2xl font-semibold text-primary-color">{historySummary.totalRows}</p>
                  <p className="text-xs text-secondary-color">
                    {historySummary.uniqueStaffCount} petugas terlibat
                  </p>
                </div>
                <div className="rounded-md border border-border/70 bg-background/40 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-secondary-color">
                    Total Poin
                  </p>
                  <p className="text-2xl font-semibold text-primary-color">
                    {historySummary.totalPoints}
                  </p>
                  <p className="text-xs text-secondary-color">
                    Rata-rata {historySummary.averagePointsPerStaff.toFixed(1)} poin/petugas
                  </p>
                </div>
                <div className="rounded-md border border-border/70 bg-background/40 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-secondary-color">
                    Status Reminder
                  </p>
                  <p className="text-sm font-medium text-primary-color">
                    {historySummary.successCount} berhasil, {historySummary.failedCount} gagal
                  </p>
                  <p className="text-xs text-secondary-color">
                    {historySummary.pendingCount} belum dikirim
                  </p>
                </div>
                <div className="rounded-md border border-border/70 bg-background/40 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-secondary-color">
                    Poin Tertinggi
                  </p>
                  <p className="text-sm font-medium text-primary-color">
                    {historySummary.topStaff
                      ? `${historySummary.topStaff.name} (${historySummary.topStaff.points} poin)`
                      : "-"}
                  </p>
                  <p className="text-xs text-secondary-color">
                    Berdasarkan hasil filter aktif
                  </p>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
                <Input
                  value={historyQuery}
                  onChange={(event) => setHistoryQuery(event.target.value)}
                  placeholder="Cari tanggal, petugas, atau siklus..."
                  aria-label="Cari riwayat jadwal"
                  className="xl:col-span-2"
                />
                <Select
                  value={historyReminderFilter}
                  onValueChange={(value) =>
                    setHistoryReminderFilter(value as HistoryReminderFilter)
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
                <Select value={historyStaffFilter} onValueChange={setHistoryStaffFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua petugas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua petugas</SelectItem>
                    {historyStaffOptions.map((staffOption) => (
                      <SelectItem key={staffOption.id} value={staffOption.id}>
                        {staffOption.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={historyDateFrom}
                  onChange={(event) => setHistoryDateFrom(event.target.value)}
                  aria-label="Filter tanggal mulai"
                />
                <Input
                  type="date"
                  value={historyDateTo}
                  onChange={(event) => setHistoryDateTo(event.target.value)}
                  aria-label="Filter tanggal akhir"
                />
              </div>

              <div className="flex items-center justify-between rounded-md border border-border/70 bg-background/40 px-3 py-2">
                <p className="text-xs text-secondary-color">
                  Catatan poin: 1 jadwal harian bernilai 1 poin per petugas.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetHistoryFilters}
                  disabled={!hasActiveHistoryFilters}
                >
                  Reset Filter
                </Button>
              </div>

              <div className="overflow-auto rounded-md border border-border/70">
                <Table className="min-w-[980px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[16%]">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-left"
                          onClick={() => handleHistorySort("scheduleDate")}
                        >
                          Tanggal
                          {renderHistorySortIcon("scheduleDate")}
                        </button>
                      </TableHead>
                      <TableHead className="w-[24%]">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-left"
                          onClick={() => handleHistorySort("staffName")}
                        >
                          Petugas Bertugas
                          {renderHistorySortIcon("staffName")}
                        </button>
                      </TableHead>
                      <TableHead className="w-[16%]">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-left"
                          onClick={() => handleHistorySort("staffPoints")}
                        >
                          Poin Petugas
                          {renderHistorySortIcon("staffPoints")}
                        </button>
                      </TableHead>
                      <TableHead className="w-[12%]">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-left"
                          onClick={() => handleHistorySort("cycleId")}
                        >
                          Siklus
                          {renderHistorySortIcon("cycleId")}
                        </button>
                      </TableHead>
                      <TableHead className="w-[14%]">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-left"
                          onClick={() => handleHistorySort("reminderStatus")}
                        >
                          Status Reminder
                          {renderHistorySortIcon("reminderStatus")}
                        </button>
                      </TableHead>
                      <TableHead className="w-[18%]">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-left"
                          onClick={() => handleHistorySort("createdAt")}
                        >
                          Dibuat
                          {renderHistorySortIcon("createdAt")}
                        </button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      renderTableSkeletonRows(6, 6, "history")
                    ) : sortedSchedules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          {schedules.length === 0
                            ? "Belum ada jadwal tercatat."
                            : "Tidak ada riwayat yang sesuai kata kunci/filter."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedSchedules.map((schedule) => {
                        const reminderStatus = toScheduleReminderStatus(schedule);
                        const pointsInView = filteredPointsByStaff.get(schedule.staffId) ?? 0;
                        const globalPoints = assignmentPointsByStaff.get(schedule.staffId) ?? 0;
                        const globalShare =
                          schedules.length > 0 ? (globalPoints / schedules.length) * 100 : 0;

                        return (
                          <TableRow key={schedule.id}>
                            <TableCell>{formatDate(schedule.scheduleDate)}</TableCell>
                            <TableCell className="break-words">
                              <p className="font-medium text-primary-color">{schedule.staff.name}</p>
                              <p className="text-xs text-secondary-color">
                                Porsi global {globalShare.toFixed(1)}%
                              </p>
                            </TableCell>
                            <TableCell>
                              <p className="font-semibold text-primary-color">{pointsInView} poin</p>
                              <p className="text-xs text-secondary-color">Global: {globalPoints} poin</p>
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {schedule.cycleId.slice(0, 8)}
                            </TableCell>
                            <TableCell>
                              {reminderStatus === "SUCCESS" ? (
                                <Badge
                                  variant="outline"
                                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                                >
                                  Berhasil
                                </Badge>
                              ) : reminderStatus === "FAILED" ? (
                                <Badge
                                  variant="outline"
                                  className="border-destructive/30 bg-destructive/10 text-destructive"
                                >
                                  Gagal
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Belum dikirim</Badge>
                              )}
                            </TableCell>
                            <TableCell>{formatDateTime(schedule.createdAt)}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">
        <div className="mx-auto grid w-full max-w-screen-xl grid-cols-[auto_1fr] gap-2 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3">
          <Button
            variant="outline"
            onClick={() => void loadData()}
            disabled={isBusy}
            size="icon"
            aria-label="Muat ulang data"
            title="Muat ulang data"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
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
