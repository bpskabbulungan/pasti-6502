"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, MessageSquareText, RefreshCcw } from "lucide-react";
import { dutyScheduleApi } from "@/services/api/duty-schedule";
import type {
  DutyDayOff,
  DutyScheduleBootstrapResponse,
  DutyScheduleSettings,
  DutyScheduleSummary,
  DutyStaffMember,
  DutySummaryResponse,
} from "@shared/types/duty-schedule";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { serializeErrorForLog } from "@/lib/error-log";
import { DashboardPageHeader } from "@/features/dashboard/components/layout/dashboard-page-header";
import { toInputDate } from "@/features/dashboard/components/duty-schedule/utils";
import { DutyScheduleSummaryTab } from "@/features/dashboard/components/duty-schedule/duty-schedule-summary-tab";
import { DutyScheduleHistoryTab } from "@/features/dashboard/components/duty-schedule/duty-schedule-history-tab";
import { DutyScheduleSettingsTab } from "@/features/dashboard/components/duty-schedule/duty-schedule-settings-tab";

export default function DutySchedulePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(toInputDate(new Date()));
  const [summary, setSummary] = useState<DutySummaryResponse | null>(null);
  const [settings, setSettings] = useState<DutyScheduleSettings | null>(null);
  const [, setStaff] = useState<DutyStaffMember[]>([]);
  const [schedules, setSchedules] = useState<DutyScheduleSummary[]>([]);
  const [dayOffs, setDayOffs] = useState<DutyDayOff[]>([]);

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

  const canRunReminder = useMemo(
    () => Boolean(summary?.isWorkingDay && summary?.schedule),
    [summary]
  );
  
  const isBusy = loading || saving;

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
          <DutyScheduleSummaryTab
            selectedDate={selectedDate}
            onSelectedDateChange={setSelectedDate}
            summary={summary}
            loading={loading}
            saving={saving}
            onRunReminder={handleRunReminder}
          />
        </TabsContent>

        <TabsContent value="pengaturan" className="space-y-6">
          <DutyScheduleSettingsTab
            settings={settings}
            dayOffs={dayOffs}
            loading={loading}
            saving={saving}
            onSettingsChange={setSettings}
            onDayOffsChange={setDayOffs}
            onSyncComplete={loadData}
            setSaving={setSaving}
          />
        </TabsContent>

        <TabsContent value="riwayat">
          <DutyScheduleHistoryTab schedules={schedules} loading={loading} />
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
