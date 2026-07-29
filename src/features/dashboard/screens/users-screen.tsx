"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RefreshCcw, Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Role } from "@/shared/constants/enums";
import { usersApi } from "@/services/api/users";
import { pstOfficersApi } from "@/services/api/pst-officers";
import { formatDisplayDateTime } from "@/lib/date-format";
import { serializeErrorForLog } from "@/lib/error-log";
import { getErrorMessage } from "@/lib/error-message";
import type { ErrorResponse } from "@shared/types/api";
import type { PstOfficerCandidateSummary, SigapSyncSummary } from "@shared/types/pst-officers";
import type { UserSummary } from "@shared/types/users";

type User = UserSummary;

type ManagementRow = {
  id: string;
  name: string;
  username: string;
  whatsapp: string | null;
  source: "ADMIN" | "SIGAP";
  syncStatusLabel: string;
  isActiveCandidate: boolean | null;
  employmentStatus: string | null;
};

const DEFAULT_PASSWORD = "password";

const MANUAL_USERNAME_BY_NAME: Record<string, string> = {
  "yuda agus irianto": "yuda",
  warsidi: "warsidi2",
  muhamadsyah: "muhamadsyah",
  "dwi prasetyono": "dwipras",
  idhamsyah: "idhamsyah",
  "mohammad agusti rahman": "agusti.rahman",
  "okta wahyu nugraha": "okta.nugraha",
  "rosetina fini alsera": "finialsera",
  shafa: "sha.fa",
  "ari susilowati": "arisusilo",
  "rifki maulana": "rifki.maulana",
  "sega purwa wika": "sega.wika",
  "alphin pratama husada": "alphin.pratama",
  "bambang luhat": "bambang_luhat",
  "chafri fajar erwandra": "chafri.fajar",
  "andi nurdiansyah": "andi.nurdiansyah",
  "afnita rahma auliya putri": "afnita.rahma",
  "anissa nurullya fernanda": "anissa.nurullya",
  "febri fatika sari": "febri.fatika",
  "marini safa aziza": "marinisafa",
  "najwa fairus samaya": "najwa.fairus",
  "fiqah rochmah ningtyas duana putri": "fiqah.putri",
  "lia aulia hayati": "liaauliahayati",
  mardiana: "mar.diana",
  "novanni indi pradana": "novanniindipradana",
  anuar: "anuar",
  jusman: "jusman",
  "marinda saga putra": "marindaputra",
  zulkifli: "zulkifli",
  "insan dienuari": "insandienuari",
  "tsabit bintang herindra": "tsabitbintang",
};

const normalizeNameKey = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");



export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pstOfficers, setPstOfficers] = useState<PstOfficerCandidateSummary[]>([]);
  const [syncSummary, setSyncSummary] = useState<SigapSyncSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncingSigap, setSyncingSigap] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = useCallback(async () => {
    const data = await usersApi.list();
    setUsers(data.users);
  }, []);

  const fetchPstOfficers = useCallback(async () => {
    const data = await pstOfficersApi.list();
    setPstOfficers(data.officers);
    setSyncSummary(data.syncSummary);
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchPstOfficers()]);
      setLastFetchedAt(new Date());
    } catch (error) {
      console.error("Error refreshing users management data:", serializeErrorForLog(error));
      toast.error(getErrorMessage(error, "Terjadi kesalahan saat memuat data pengguna"));
    } finally {
      setLoading(false);
    }
  }, [fetchPstOfficers, fetchUsers]);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const handleSyncSigap = async () => {
    try {
      setSyncingSigap(true);
      const result = await pstOfficersApi.sync();
      setPstOfficers(result.officers);
      setSyncSummary(result.syncSummary);
      setLastFetchedAt(new Date());
      toast.success(
        `${result.syncSummary.message || "Sinkronisasi berhasil"} (${result.syncSummary.totalSaved} tersimpan)`
      );
    } catch (error) {
      console.error("Error syncing SIGAP officers:", serializeErrorForLog(error));
      toast.error(getErrorMessage(error, "Sinkronisasi SIGAP gagal"));
      await fetchPstOfficers();
    } finally {
      setSyncingSigap(false);
    }
  };

  const handleToggleCandidate = async (officerId: string, nextValue: boolean) => {
    try {
      const result = await pstOfficersApi.setActive(officerId, nextValue);
      setPstOfficers((prev) =>
        prev.map((officer) => (officer.id === result.officer.id ? result.officer : officer))
      );
      toast.success(nextValue ? "Kandidat PST diaktifkan" : "Kandidat PST dinonaktifkan");
    } catch (error) {
      console.error("Error toggling candidate activation:", serializeErrorForLog(error));
      toast.error(getErrorMessage(error, "Gagal memperbarui status kandidat"));
    }
  };

  const adminUser = useMemo(() => users.find((user) => user.role === Role.ADMIN) ?? null, [users]);

  const rows = useMemo<ManagementRow[]>(() => {
    const mergedRows: ManagementRow[] = [];

    if (adminUser) {
      const mappedAdminUsername = MANUAL_USERNAME_BY_NAME[normalizeNameKey(adminUser.name)];
      mergedRows.push({
        id: `admin-${adminUser.id}`,
        name: adminUser.name,
        username: mappedAdminUsername || adminUser.username,
        whatsapp: adminUser.phone ?? null,
        source: "ADMIN",
        syncStatusLabel: "ADMIN",
        isActiveCandidate: null,
        employmentStatus: null,
      });
    }

    pstOfficers.forEach((officer) => {
      const mappedUsername = MANUAL_USERNAME_BY_NAME[normalizeNameKey(officer.name)];
      mergedRows.push({
        id: officer.id,
        name: officer.name,
        username: mappedUsername || officer.sigapUsername || officer.sigapContactId,
        whatsapp: officer.whatsappNumber || officer.number || null,
        source: "SIGAP",
        syncStatusLabel: officer.syncStatus,
        isActiveCandidate: officer.isActiveCandidate,
        employmentStatus: officer.employmentStatus,
      });
    });

    return mergedRows;
  }, [adminUser, pstOfficers]);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return rows;
    }

    return rows.filter((row) => `${row.name} ${row.username}`.toLowerCase().includes(term));
  }, [rows, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const canPrevPage = currentPage > 1;
  const canNextPage = currentPage < totalPages;

  const activePstCandidates = pstOfficers.filter((officer) => officer.isActiveCandidate).length;
  const lastSyncLabel = syncSummary?.finishedAt
    ? formatDisplayDateTime(syncSummary.finishedAt)
    : "Belum pernah sinkronisasi";

  const hasFetched = Boolean(lastFetchedAt);
  const isRefreshing = loading && hasFetched;
  const lastFetchedLabel = lastFetchedAt
    ? formatDisplayDateTime(lastFetchedAt)
    : loading
      ? "Memuat data..."
      : "Belum ada data";

  const trimmedSearch = searchTerm.trim();

  return (
    <PageContainer className="dashboard-page">
      <DashboardPageHeader
        title="Kelola Pengguna PASTI"
        description="Halaman untuk mengelola akun petugas PASTI yang terintegrasi dengan SIGAP."
        meta={
          <>
            <span>Terakhir diperbarui: {lastFetchedLabel}</span>
            <LiveStatusBadge isRefreshing={isRefreshing} hasFetched={hasFetched} />
          </>
        }
        actions={
          <div className="dashboard-header-actions">
            <Button
              variant="success"
              className="dashboard-header-action gap-2"
              onClick={handleSyncSigap}
              disabled={syncingSigap}
            >
              <RefreshCcw className={`h-4 w-4 ${syncingSigap ? "animate-spin" : ""}`} />
              {syncingSigap ? "Sinkronisasi..." : "Sinkronkan SIGAP"}
            </Button>
          </div>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/80 bg-card/88 border-l-4 border-l-primary/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-secondary-color">
              Total Pengguna
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary-color">{rows.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card/88 border-l-4 border-l-sky-500/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-secondary-color">
              Admin Utama
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-sky-600 dark:text-sky-300">{adminUser ? 1 : 0}</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card/88 border-l-4 border-l-emerald-500/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-secondary-color">
              Petugas SIGAP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-300">
              {pstOfficers.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card/88 border-l-4 border-l-amber-500/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-secondary-color">
              Kandidat Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-300">
              {activePstCandidates}
            </p>
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/80">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="text-xl font-semibold text-primary-color">
              Daftar Pengguna PASTI
            </CardTitle>
            <CardDescription className="text-secondary-color text-justify">
              Data petugas berasal dari SIGAP. Sistem hanya menampilkan 1 admin utama dari akun
              internal.
            </CardDescription>
          </div>
          <div className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2 text-xs text-secondary-color">
            Sinkronisasi terakhir: {lastSyncLabel}
            <div className="mt-1">
              <Badge
                variant={syncSummary?.success ? "outline" : "secondary"}
                className={
                  syncSummary?.success
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                }
              >
                {syncSummary?.result || "BELUM_SYNC"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="dashboard-filter-panel">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-color" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama atau username"
                  className="bg-background/80 pl-9 pr-10 focus-visible:ring-primary"
                  aria-label="Cari pengguna"
                />
                {trimmedSearch && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                    onClick={() => setSearchTerm("")}
                    aria-label="Bersihkan pencarian"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => setPageSize(Number(value))}
              >
                <SelectTrigger className="w-[160px] border-border bg-background/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / Halaman</SelectItem>
                  <SelectItem value="25">25 / Halaman</SelectItem>
                  <SelectItem value="50">50 / Halaman</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="dashboard-table-shell">
            <Table className="w-full md:min-w-[980px]">
              <TableHeader className="hidden bg-muted/50 md:table-header-group">
                <TableRow>
                  <TableHead className="w-[28%] text-left">Nama</TableHead>
                  <TableHead className="w-[18%] text-left">Username</TableHead>
                  <TableHead className="w-[18%] text-center">WhatsApp</TableHead>
                  <TableHead className="w-[12%] text-center">Sumber</TableHead>
                  <TableHead className="w-[12%] text-center">Status</TableHead>
                  <TableHead className="w-[12%] text-center">Aktif Kandidat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-6 text-center text-secondary-color">
                      Tidak ada data pengguna yang sesuai.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-left font-medium text-primary-color">
                        {row.name}
                      </TableCell>
                      <TableCell className="text-left text-xs text-secondary-color">
                        {row.username}
                      </TableCell>
                      <TableCell className="text-center text-xs text-secondary-color">
                        {row.whatsapp || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={
                            row.source === "ADMIN"
                              ? "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300"
                              : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          }
                        >
                          {row.source}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={
                            row.syncStatusLabel === "SYNCED"
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                              : row.syncStatusLabel === "FAILED"
                                ? "border-destructive/40 bg-destructive/10 text-destructive"
                                : row.source === "ADMIN"
                                  ? "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300"
                                  : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                          }
                        >
                          {row.syncStatusLabel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {row.source === "SIGAP" && row.isActiveCandidate !== null ? (
                          <div className="flex items-center justify-center gap-2">
                            <Switch
                              checked={row.isActiveCandidate}
                              onCheckedChange={(checked) => handleToggleCandidate(row.id, checked)}
                              disabled={syncingSigap}
                              aria-label={`Aktifkan kandidat ${row.name}`}
                            />
                            <span className="text-xs text-secondary-color">
                              {row.isActiveCandidate ? "Aktif" : "Nonaktif"}
                            </span>
                          </div>
                        ) : (
                          <div className="text-center text-xs text-secondary-color">Tetap</div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {filteredRows.length > 0 && (
          <CardFooter className="flex-col gap-2 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-muted-foreground">
              Halaman {currentPage} dari {totalPages} ({filteredRows.length} data)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={!canPrevPage}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={!canNextPage}
              >
                Berikutnya
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </PageContainer>
  );
}
