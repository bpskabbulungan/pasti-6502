"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Role } from "@/shared/constants/enums";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock3,
  Pencil,
  RefreshCcw,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { usersApi } from "@/services/api/users";
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
  const { data: session } = useSession();
  const router = useRouter();
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
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (session && session.user.role !== Role.ADMIN) {
      toast.error("Anda tidak memiliki akses ke halaman ini");
      router.push("/dashboard");
    }
  }, [session, router]);

  useEffect(() => {
    fetchUsers();
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
    ? new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(lastFetchedAt)
    : loading
      ? "Memuat data..."
      : "Belum ada data";
  const statusLabel = isRefreshing
    ? "Memperbarui data..."
    : hasFetched
      ? "Data terbaru"
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
    setNewPassword("");
    setConfirmPassword("");
    setSelectedUser(null);
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setNewUsername(user.username);
    setNewName(user.name);
    setNewPassword("");
    setConfirmPassword("");
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const getInitials = (value: string) => {
    if (!value) return "AD";
    const parts = value.trim().split(" ").filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const formatDate = (value: string | Date) =>
    new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));

  const formatRelativeTime = (value: string | Date) => {
    const diff = Date.now() - new Date(value).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days <= 0) return "Hari ini";
    if (days === 1) return "Kemarin";
    if (days < 7) return `${days} hari lalu`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} minggu lalu`;
    const months = Math.floor(days / 30);
    return `${months} bulan lalu`;
  };
  if (session?.user?.role !== Role.ADMIN) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-custom bg-gradient-to-r from-primary/15 via-secondary/20 to-background shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(247,144,57,0.12),transparent_40%)]" />
        <div className="absolute inset-y-0 right-0 w-48 bg-[radial-gradient(circle_at_80%_30%,rgba(154,5,1,0.08),transparent_45%)]" />
        <div className="relative flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-primary-color text-3xl font-black leading-tight md:text-4xl">
                Kelola Pengguna
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-secondary-color">
              <span>Terakhir diperbarui: {lastFetchedLabel}</span>
              <Badge variant="secondary" className="bg-background/80 text-secondary-color">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isRefreshing
                      ? "bg-primary animate-pulse"
                      : hasFetched
                        ? "bg-emerald-500"
                        : "bg-muted-foreground"
                  }`}
                />
                {statusLabel}
              </Badge>
            </div>
            <div className="flex w-full flex-wrap justify-start gap-3">
              <Button
                variant="outline"
                className="gap-2 border-border"
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
                  <Button className="flex items-center gap-2 bg-primary text-primary-foreground shadow-md hover:bg-primary/90">
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
      <Card className="border-border/80 shadow-md">
        <CardHeader className="gap-2">
          <CardTitle className="text-xl font-semibold text-primary-color">
            Daftar Pengguna
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
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
              <div className="flex flex-wrap items-center gap-3">
                <Tabs
                  value={roleFilter}
                  onValueChange={(value) => setRoleFilter(value as RoleFilter)}
                >
                  <TabsList className="border border-border/70 bg-background/80">
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
                  Pencarian: "{trimmedSearch}"
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
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center">
              <Sparkles className="h-8 w-8 text-primary" />
              <div className="space-y-1">
                <p className="text-lg font-semibold text-primary-color">
                  Belum ada pengguna yang sesuai
                </p>
                <p className="text-sm text-secondary-color">
                  Gunakan tombol tambah petugas atau reset filter pencarian.
                </p>
              </div>
              <div className="flex gap-2">
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
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="hidden overflow-hidden rounded-xl border border-border/80 md:block">
                <Table className="min-w-[720px]">
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Pengelola</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Dibuat</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="bg-primary/10 text-primary-color">
                              <AvatarFallback>
                                {getInitials(user.name || user.username)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-primary-color">{user.name}</p>
                              <p className="text-xs text-secondary-color">@{user.username}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.role === Role.ADMIN ? "secondary" : "outline"}
                            className={`border-border ${
                              user.role === Role.ADMIN
                                ? "bg-primary/10 text-primary-color"
                                : "bg-accent/10 text-accent"
                            }`}
                          >
                            {user.role === Role.ADMIN ? "Admin" : "Petugas"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <p className="font-medium text-primary-color">
                              {formatDate(user.createdAt)}
                            </p>
                            <p className="text-xs text-secondary-color">
                              {formatRelativeTime(user.createdAt)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() => openEditDialog(user)}
                              disabled={user.role === Role.ADMIN}
                              title={
                                user.role === Role.ADMIN
                                  ? "Akun admin tidak dapat diedit"
                                  : "Edit pengguna"
                              }
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-2"
                              onClick={() => openDeleteDialog(user)}
                              disabled={user.role === Role.ADMIN}
                              title={
                                user.role === Role.ADMIN
                                  ? "Akun admin tidak dapat dihapus"
                                  : "Hapus pengguna"
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                              Hapus
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="space-y-3 md:hidden">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="rounded-xl border border-border/70 bg-background/80 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="bg-primary/10 text-primary-color">
                          <AvatarFallback>{getInitials(user.name || user.username)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-primary-color">{user.name}</p>
                          <p className="text-xs text-secondary-color">@{user.username}</p>
                        </div>
                      </div>
                      <Badge
                        variant={user.role === Role.ADMIN ? "secondary" : "outline"}
                        className={`border-border ${
                          user.role === Role.ADMIN
                            ? "bg-primary/10 text-primary-color"
                            : "bg-accent/10 text-accent"
                        }`}
                      >
                        {user.role === Role.ADMIN ? "Admin" : "Petugas"}
                      </Badge>
                    </div>
                    <div className="mt-3 space-y-1 text-xs text-secondary-color">
                      <p className="text-primary-color">{formatDate(user.createdAt)}</p>
                      <p>{formatRelativeTime(user.createdAt)}</p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => openEditDialog(user)}
                        disabled={user.role === Role.ADMIN}
                        title={
                          user.role === Role.ADMIN
                            ? "Akun admin tidak dapat diedit"
                            : "Edit pengguna"
                        }
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        onClick={() => openDeleteDialog(user)}
                        disabled={user.role === Role.ADMIN}
                        title={
                          user.role === Role.ADMIN
                            ? "Akun admin tidak dapat dihapus"
                            : "Hapus pengguna"
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                ))}
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

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) resetFormFields();
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Pengguna</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Pastikan pengguna ini memang perlu dihapus.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <p>
              Pengguna <strong>{selectedUser?.name}</strong> akan dihapus dari sistem. Pastikan
              tidak ada antrean aktif yang masih ditangani olehnya.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Hapus Pengguna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
