"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, RefreshCcw, Save } from "lucide-react";
import { dutyScheduleApi } from "@/services/api/duty-schedule";
import type { DutyDayOff, DutyScheduleSettings } from "@shared/types/duty-schedule";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, getErrorMessage } from "./utils";
import { renderTableSkeletonRows } from "./shared";
import { serializeErrorForLog } from "@/lib/error-log";

const WORK_DAY_OPTIONS = [
  { value: 1, label: "Senin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Kamis" },
  { value: 5, label: "Jumat" },
  { value: 6, label: "Sabtu" },
  { value: 7, label: "Minggu" },
];

interface DutyScheduleSettingsTabProps {
  settings: DutyScheduleSettings | null;
  dayOffs: DutyDayOff[];
  loading: boolean;
  saving: boolean;
  onSettingsChange: (settings: DutyScheduleSettings) => void;
  onDayOffsChange: (dayOffs: DutyDayOff[]) => void;
  onSyncComplete: () => Promise<void>;
  setSaving: (saving: boolean) => void;
}

export function DutyScheduleSettingsTab({
  settings,
  dayOffs,
  loading,
  saving,
  onSettingsChange,
  onDayOffsChange,
  onSyncComplete,
  setSaving,
}: DutyScheduleSettingsTabProps) {
  const [syncingDayOffs, setSyncingDayOffs] = useState(false);

  const handleToggleWorkDay = (day: number, checked: boolean) => {
    if (!settings) return;
    const next = checked
      ? [...new Set([...settings.workDays, day])].sort((a, b) => a - b)
      : settings.workDays.filter((value) => value !== day);
    onSettingsChange({ ...settings, workDays: next.length > 0 ? next : settings.workDays });
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
      onSettingsChange(response.settings);
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
      onDayOffsChange(result.dayOffs);

      const { inserted, updated, removed } = result.summary;
      const totalChanges = inserted + updated + removed;
      if (totalChanges === 0) {
        toast.success("Sinkronisasi SIGAP selesai. Tidak ada perubahan data.");
      } else {
        toast.success(
          `Sinkronisasi SIGAP selesai: ${inserted} baru, ${updated} diperbarui, ${removed} dihapus.`
        );
      }

      await onSyncComplete();
    } catch (error) {
      console.error("Error syncing day offs from SIGAP:", serializeErrorForLog(error));
      toast.error(getErrorMessage(error, "Gagal sinkronisasi hari libur/cuti dari SIGAP"));
    } finally {
      setSyncingDayOffs(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
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
                  settings && onSettingsChange({ ...settings, autoAssignEnabled: checked })
                }
              />
            </label>
            <label className="flex items-center justify-between text-sm">
              <span>Reminder otomatis aktif</span>
              <Switch
                checked={Boolean(settings?.reminderEnabled)}
                onCheckedChange={(checked) =>
                  settings && onSettingsChange({ ...settings, reminderEnabled: checked })
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
                settings && onSettingsChange({ ...settings, reminderTemplate: event.target.value })
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
    </div>
  );
}
