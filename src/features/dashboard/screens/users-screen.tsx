"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmActionDialog } from "@/components/shared/dialogs/confirm-action-dialog";
import { EmptyState } from "@/components/shared/feedback/empty-state";
import { LiveStatusBadge } from "@/components/shared/feedback/live-status-badge";
import { PageContainer } from "@/components/shared/layout/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Role } from "@/shared/constants/enums";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock3, RefreshCcw, Search, Sparkles, UserPlus, X } from "lucide-react";
import { usersApi } from "@/services/api/users";
import UsersTableRow from "@/features/dashboard/components/rows/users-row";
import { formatDisplayDateTime } from "@/lib/date-format";
import type { ErrorResponse } from "@shared/types/api";
import type { UserSummary } from "@shared/types/users";

type RoleFilter = "ALL" | Role;

type User = UserSummary;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== "object" || !error) {
    return fallback;
  }

  const errorDetails = (error as { details?: ErrorResponse }).details;
  if (errorDetails?.error) {
    return errorDetails.error;
  }

  const message = (error as { message?: string }).message;
  return message || fallback;
};

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");

  const [newUsername, setNewUsername] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    void fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.list();
      setUsers(data.users);
      setLastFetchedAt(new Date());
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(getErrorMessage(error, "Terjadi kesalahan saat memuat pengguna"));
    } finally {
      setLoading(false);
    }
  };
  const stats = useMemo(() => {
    const adminCount = users.filter((user) => user.role === Role.ADMIN).length;
    const petugasCount = users.filter((user) => user.role === Role.PETUGAS).length;
    const latest = users.reduce<Date | null>((acc, user) => {
      const createdAt = new Date(user.createdAt);
      if (!acc) return createdAt;
      return createdAt.getTime() > acc.getTime() ? createdAt : acc;
    }, null);

    return {
      total: users.length,
      admins: adminCount,
      petugas: petugasCount,
      latestCreatedAt: latest,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return users
      .filter((user) => (roleFilter === "ALL" ? true : user.role === roleFilter))
      .filter((user) =>
        term ? `${user.name} ${user.username}`.toLowerCase().includes(term) : true
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [users, roleFilter, searchTerm]);

  const trimmedSearch = searchTerm.trim();
  const isInitialLoading = loading && users.length === 0;
  const isRefreshing = loading && users.length > 0;
  const activeFilterLabel =
    roleFilter === "ALL" ? "Semua role" : roleFilter === Role.ADMIN ? "Admin" : "Petugas";
  const hasFetched = Boolean(lastFetchedAt);
  const lastFetchedLabel = lastFetchedAt
    ? formatDisplayDateTime(lastFetchedAt)
    : loading
      ? "Memuat data..."
      : "Belum ada data";

  const passwordMismatch = Boolean(
    newPassword && confirmPassword && newPassword !== confirmPassword
  );
  const isAddDisabled =
    !newName.trim() || !newUsername.trim() || !newPassword || !confirmPassword || passwordMismatch;
  const isEditDisabled =
    !selectedUser ||
    !newName.trim() ||
    !newUsername.trim() ||
    (newPassword ? !confirmPassword || passwordMismatch : false);
  const handleAddUser = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Password dan konfirmasi password tidak sama");
      return;
    }

    try {
      await usersApi.create({
        name: newName,
        username: newUsername,
        phone: newPhone.trim() || null,
        password: newPassword,
        role: Role.PETUGAS,
      });
      toast.success("Petugas berhasil ditambahkan");
      setAddDialogOpen(false);
      resetFormFields();
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error(getErrorMessage(error, "Terjadi kesalahan saat menambahkan petugas"));
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Password dan konfirmasi password tidak sama");
      return;
    }

    try {
      await usersApi.update(selectedUser.id, {
        name: newName || selectedUser.name,
        username: newUsername || selectedUser.username,
        phone: newPhone.trim() || null,
        ...(newPassword ? { password: newPassword } : {}),
      });
      toast.success("Pengguna berhasil diperbarui");
      setEditDialogOpen(false);
      resetFormFields();
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(getErrorMessage(error, "Terjadi kesalahan saat memperbarui pengguna"));
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await usersApi.remove(selectedUser.id);
      toast.success("Pengguna berhasil dihapus");
      setDeleteDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(getErrorMessage(error, "Terjadi kesalahan saat menghapus pengguna"));
    }
  };

  const resetFormFields = () => {
    setNewUsername("");
    setNewName("");
    setNewPhone("");
    setNewPassword("");
    setConfirmPassword("");
    setSelectedUser(null);
  };

  const openEditDialog = useCallback((user: User) => {
    setSelectedUser(user);
    setNewUsername(user.username);
    setNewName(user.name);
    setNewPhone(user.phone ?? "");
    setNewPassword("");
    setConfirmPassword("");
    setEditDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteDialogChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) {
      resetFormFields();
    }
  };

  return (
    <PageContainer>
      <div className="dashboard-hero p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-primary-color text-2xl font-bold leading-tight sm:text-3xl">
                Kelola Pengguna
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-secondary-color">
              <span>Terakhir diperbarui: {lastFetchedLabel}</span>
              <LiveStatusBadge isRefreshing={isRefreshing} hasFetched={hasFetched} />
            </div>
            <div className="flex w-full flex-wrap justify-start gap-3">
              <Button
                variant="outline"
                className="w-full gap-2 border-border sm:w-auto"
                onClick={() => fetchUsers()}
                disabled={loading}
              >
                <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Memperbarui..." : "Muat ulang data"}
              </Button>
              <Dialog
                open={addDialogOpen}
                onOpenChange={(open) => {
                  setAddDialogOpen(open);
                  if (!open) resetFormFields();
                }}
              >
                <DialogTrigger asChild>
                  <Button className="flex w-full items-center gap-2 sm:w-auto">
                    <UserPlus className="h-4 w-4" />
                    Tambah Petugas
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Tambah Petugas Baru</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nama Lengkap</Label>
                        <Input
                          id="name"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="Masukkan nama lengkap"
                          autoFocus
                          autoComplete="name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          placeholder="contoh: adminpst"
                          autoComplete="username"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimal 8 karakter"
                          autoComplete="new-password"
                          minLength={8}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Ulangi password"
                          autoComplete="new-password"
                          minLength={8}
                          aria-invalid={passwordMismatch}
                        />
                        {passwordMismatch && (
                          <p className="text-xs text-destructive">
                            Password dan konfirmasi tidak sama.
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">No. WhatsApp (opsional)</Label>
                      <Input
                        id="phone"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="08xxxxxxxxxx"
                        autoComplete="tel"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button onClick={handleAddUser} disabled={isAddDisabled}>
                      Simpan Petugas
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
      <section className="grid gap-3 sm:grid-cols-3">
        <Card className="border-border/80 bg-card/88">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-secondary-color">
              Total Pengguna
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary-color">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card/88">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-secondary-color">
              Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary-color">{stats.admins}</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-card/88">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-secondary-color">
              Petugas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">{stats.petugas}</p>
          </CardContent>
        </Card>
      </section>
      <Card className="border-border/80">
        <CardHeader className="gap-2">
          <CardTitle className="text-xl font-semibold text-primary-color">
            Daftar Pengguna
          </CardTitle>
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
              <div className="flex flex-wrap items-center gap-2.5">
                <Tabs
                  value={roleFilter}
                  onValueChange={(value) => setRoleFilter(value as RoleFilter)}
                >
                  <TabsList className="w-full border border-border/70 bg-background/80 sm:w-auto">
                    <TabsTrigger value="ALL">
                      Semua
                      <span className="rounded-full bg-background/80 px-2 py-0.5 text-[11px] text-secondary-color">
                        {stats.total}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value={Role.ADMIN}>
                      Admin
                      <span className="rounded-full bg-background/80 px-2 py-0.5 text-[11px] text-secondary-color">
                        {stats.admins}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value={Role.PETUGAS}>
                      Petugas
                      <span className="rounded-full bg-background/80 px-2 py-0.5 text-[11px] text-secondary-color">
                        {stats.petugas}
                      </span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex items-center gap-2 text-xs text-secondary-color">
                  <Clock3 className="h-4 w-4" />
                  <span>{filteredUsers.length} pengguna ditampilkan</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border"
                  onClick={() => {
                    setSearchTerm("");
                    setRoleFilter("ALL");
                  }}
                  disabled={!trimmedSearch && roleFilter === "ALL"}
                >
                  Reset filter
                </Button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-secondary-color">
              <Badge variant="secondary" className="bg-background/80 text-secondary-color">
                Filter: {activeFilterLabel}
              </Badge>
              {trimmedSearch && (
                <Badge variant="secondary" className="bg-background/80 text-secondary-color">
                  Pencarian: {`"${trimmedSearch}"`}
                </Badge>
              )}
              <span className="text-secondary-color">
                Menampilkan {filteredUsers.length} dari {stats.total} pengguna
              </span>
            </div>
          </div>

          {isInitialLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,0.6fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] gap-3 rounded-xl border border-border/70 bg-muted/40 p-4"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Skeleton className="h-9 w-20 rounded-md" />
                    <Skeleton className="h-9 w-20 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="Belum ada pengguna yang sesuai"
              description="Gunakan tombol tambah petugas atau reset filter pencarian."
              action={
                <>
                  <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Tambah Petugas
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setRoleFilter("ALL");
                      fetchUsers();
                    }}
                  >
                    Reset filter
                  </Button>
                </>
              }
            />
          ) : (
            <div className="space-y-4">
              <div className="dashboard-table-shell">
                <Table className="w-full md:min-w-[720px]">
                  <TableHeader className="hidden bg-muted/50 md:table-header-group">
                    <TableRow>
                      <TableHead className="text-center">Pengelola</TableHead>
                      <TableHead className="text-center">Username</TableHead>
                      <TableHead className="text-center">WhatsApp</TableHead>
                      <TableHead className="text-center">Role</TableHead>
                      <TableHead className="text-center">Dibuat</TableHead>
                      <TableHead className="w-[120px] text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <UsersTableRow
                        key={user.id}
                        user={user}
                        onEdit={openEditDialog}
                        onDelete={openDeleteDialog}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) resetFormFields();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama Lengkap</Label>
              <Input
                id="edit-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Masukkan username"
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Password Baru (opsional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Biarkan kosong jika tidak ingin mengubah"
                autoComplete="new-password"
                minLength={8}
              />
              <p className="text-xs text-secondary-color">
                Biarkan kosong bila tidak ada perubahan.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">No. WhatsApp (opsional)</Label>
              <Input
                id="edit-phone"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                autoComplete="tel"
              />
            </div>
            {newPassword && (
              <div className="space-y-2">
                <Label htmlFor="edit-confirmPassword">Konfirmasi Password</Label>
                <Input
                  id="edit-confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi password baru"
                  autoComplete="new-password"
                  minLength={8}
                  aria-invalid={passwordMismatch}
                />
                {passwordMismatch && (
                  <p className="text-xs text-destructive">Password dan konfirmasi tidak sama.</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleEditUser} disabled={isEditDisabled}>
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmActionDialog
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogChange}
        title="Hapus Pengguna"
        description="Tindakan ini tidak dapat dibatalkan. Pastikan pengguna ini memang perlu dihapus."
        confirmLabel="Hapus Pengguna"
        confirmVariant="destructive"
        onConfirm={handleDeleteUser}
        body={
          <p>
            Pengguna <strong>{selectedUser?.name}</strong> akan dihapus dari sistem. Pastikan tidak
            ada antrean aktif yang masih ditangani olehnya.
          </p>
        }
      />
    </PageContainer>
  );
}


