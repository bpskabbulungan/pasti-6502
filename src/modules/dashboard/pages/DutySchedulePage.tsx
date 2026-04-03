"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  Plus,
  RefreshCcw,
  Save,
  ShieldAlert,
  Trash2,
  Users,
} from "lucide-react";
import { dutyScheduleApi } from "@/services/api/duty-schedule";
import type {
  DutyDayOff,
  DutyScheduleBootstrapResponse,
  DutyReminderLog,
  DutyScheduleSettings,
  DutyScheduleSummary,
  DutyStaffMember,
  DutySummaryResponse,
} from "@shared/types/duty-schedule";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { formatDisplayDate, formatDisplayDateTime } from "@/lib/date-format";

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

const formatDate = (date: string | Date) => formatDisplayDate(date);

const formatDateTime = (date: string | Date) => formatDisplayDateTime(date);

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
      console.error("Error loading duty schedule data:", error);
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
      console.error("Error saving settings:", error);
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
      console.error("Error generating schedule:", error);
      toast.error("Gagal membuat jadwal petugas");
    } finally {
      setSaving(false);
    }
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
      console.error("Error running reminder:", error);
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
      console.error("Error creating day off:", error);
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
      console.error("Error deleting day off:", error);
      toast.error("Gagal menghapus hari libur/cuti");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-8 md:px-6">
      <section className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-primary-color">Jadwal Petugas</h1>
              <p className="max-w-2xl text-sm text-secondary-color">
                Penugasan otomatis, pengingat WhatsApp Fonnte, serta pemantauan log layanan petugas
                harian.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-secondary-color">
              <Badge variant="secondary" className="bg-background/70 text-secondary-color">
                {activeStaffCount} petugas terdaftar
              </Badge>
              <Badge variant="secondary" className="bg-background/70 text-secondary-color">
                {summary?.isWorkingDay ? "Hari kerja aktif" : "Non-hari kerja"}
              </Badge>
              <Badge variant="secondary" className="bg-background/70 text-secondary-color">
                {loading ? "Memuat data..." : "Data siap diproses"}
              </Badge>
            </div>
          </div>
          <div className="grid w-full gap-2 sm:grid-cols-2 xl:w-auto">
            <Input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="h-9 w-full min-w-[180px]"
            />
            <Button variant="outline" onClick={() => loadData()} disabled={loading || saving}>
              <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh Data
            </Button>
            <Button onClick={handleGenerateSchedule} disabled={loading || saving}>
              <CalendarDays className="mr-2 h-4 w-4" />
              Generate Jadwal
            </Button>
            <Button onClick={() => handleRunReminder(false)} disabled={loading || saving}>
              <MessageSquareText className="mr-2 h-4 w-4" />
              Kirim Pengingat
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="text-sm font-semibold text-secondary-color">
              Total Petugas
            </CardTitle>
            <CardDescription>Petugas aktif untuk rotasi jadwal</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-bold text-primary-color">{activeStaffCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="text-sm font-semibold text-secondary-color">
              Total Jadwal
            </CardTitle>
            <CardDescription>Riwayat jadwal tersimpan</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-bold text-primary-color">{scheduleCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="text-sm font-semibold text-secondary-color">
              Hari Libur/Cuti
            </CardTitle>
            <CardDescription>Daftar pengecualian hari kerja</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-bold text-primary-color">{dayOffCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="text-sm font-semibold text-secondary-color">
              Reminder Berhasil
            </CardTitle>
            <CardDescription>30 log reminder terakhir</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 pt-0">
            <p className="text-3xl font-bold text-primary-color">
              {recentReminderStats.successRateLabel}
            </p>
            <p className="text-xs text-secondary-color">
              {recentReminderStats.success}/{recentReminderStats.total} reminder sukses
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="h-5 w-5" />
              Ringkasan Tanggal {selectedDate}
            </CardTitle>
            <CardDescription>
              Status jadwal petugas, detail hari kerja, dan hasil reminder untuk tanggal yang
              dipilih.
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
              variant="outline"
              onClick={() => handleRunReminder(true)}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              Paksa Kirim Ulang Reminder
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
              Petugas jadwal PST diambil otomatis dari daftar pengguna dengan role `PETUGAS` (menu
              Kelola Pengguna).
            </p>
            <p className="text-sm text-secondary-color">
              Untuk reminder WhatsApp, pastikan nomor telepon petugas sudah diisi di data pengguna.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/users")}
              className="w-full sm:w-auto"
            >
              Buka Kelola Pengguna
            </Button>
          </CardContent>
        </Card>
      </section>

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
            <Button onClick={handleSaveSettings} disabled={saving || loading}>
              <Save className="mr-2 h-4 w-4" />
              Simpan Pengaturan
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
              <Button onClick={handleAddDayOff} disabled={saving} className="md:col-span-2">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Hari Libur/Cuti
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
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Memuat daftar hari libur/cuti...
                      </TableCell>
                    </TableRow>
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
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDayOff(item.id)}
                            disabled={saving}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>Daftar Petugas</CardTitle>
            <CardDescription>Daftar petugas yang menjadi sumber rotasi jadwal.</CardDescription>
          </CardHeader>
          <CardContent className="max-h-80 overflow-auto">
            <Table className="min-w-[520px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>WhatsApp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Memuat daftar petugas...
                    </TableCell>
                  </TableRow>
                ) : staff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Belum ada petugas.
                    </TableCell>
                  </TableRow>
                ) : (
                  staff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>@{member.username}</TableCell>
                      <TableCell>{member.phone || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>Log Reminder WhatsApp</CardTitle>
            <CardDescription>Status pengiriman reminder terbaru ke petugas.</CardDescription>
          </CardHeader>
          <CardContent className="max-h-80 overflow-auto">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Petugas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Memuat log reminder...
                    </TableCell>
                  </TableRow>
                ) : reminderLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Belum ada log reminder.
                    </TableCell>
                  </TableRow>
                ) : (
                  reminderLogs.slice(0, 30).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatDate(log.reminderDate)}</TableCell>
                      <TableCell>{log.staff?.name || "-"}</TableCell>
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
                            <p className="flex items-center gap-1 text-destructive">
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
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle>Riwayat Penugasan Harian</CardTitle>
          <CardDescription>
            Daftar histori jadwal lengkap beserta status reminder terbaru.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Petugas Bertugas</TableHead>
                <TableHead>Siklus</TableHead>
                <TableHead>Status Reminder</TableHead>
                <TableHead>Dibuat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Memuat riwayat jadwal...
                  </TableCell>
                </TableRow>
              ) : schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Belum ada jadwal tercatat.
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>{formatDate(schedule.scheduleDate)}</TableCell>
                    <TableCell>{schedule.staff.name}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
}
