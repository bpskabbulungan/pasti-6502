"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { DutyScheduleSummary } from "@shared/types/duty-schedule";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  type HistoryReminderFilter,
  type HistorySortKey,
  type HistorySortDirection,
  HISTORY_SORT_DEFAULT_DIRECTION,
  compareText,
  toScheduleReminderStatus,
  toReminderStatusWeight,
  toInputDate,
  formatDate,
  formatDateTime
} from "./utils";
import { renderTableSkeletonRows } from "./shared";

interface DutyScheduleHistoryTabProps {
  schedules: DutyScheduleSummary[];
  loading: boolean;
}

export function DutyScheduleHistoryTab({ schedules, loading }: DutyScheduleHistoryTabProps) {
  const [historyQuery, setHistoryQuery] = useState("");
  const [historyReminderFilter, setHistoryReminderFilter] = useState<HistoryReminderFilter>("ALL");
  const [historyStaffFilter, setHistoryStaffFilter] = useState<string>("ALL");
  const [historyDateFrom, setHistoryDateFrom] = useState("");
  const [historyDateTo, setHistoryDateTo] = useState("");
  const [historySortKey, setHistorySortKey] = useState<HistorySortKey>("scheduleDate");
  const [historySortDirection, setHistorySortDirection] = useState<HistorySortDirection>("desc");

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

  return (
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
  );
}
