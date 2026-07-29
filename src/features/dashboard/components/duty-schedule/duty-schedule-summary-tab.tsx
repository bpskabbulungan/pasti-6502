"use client";

import { useMemo } from "react";
import { CheckCircle2, Clock3, Loader2, MessageSquareText, ShieldAlert } from "lucide-react";
import type { DutySummaryResponse } from "@shared/types/duty-schedule";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toInputDate, formatDateTime } from "./utils";
import { PstScheduleGenerator } from "./pst-schedule-generator";

interface DutyScheduleSummaryTabProps {
  selectedDate: string;
  onSelectedDateChange: (date: string) => void;
  summary: DutySummaryResponse | null;
  loading: boolean;
  saving: boolean;
  onRunReminder: (force?: boolean) => Promise<void>;
}

export function DutyScheduleSummaryTab({
  selectedDate,
  onSelectedDateChange,
  summary,
  loading,
  saving,
  onRunReminder,
}: DutyScheduleSummaryTabProps) {
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

  return (
    <div className="space-y-6">
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
                  onChange={(event) => onSelectedDateChange(event.target.value)}
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
                  onClick={() => onRunReminder(true)}
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
        <PstScheduleGenerator />
      </section>
    </div>
  );
}
