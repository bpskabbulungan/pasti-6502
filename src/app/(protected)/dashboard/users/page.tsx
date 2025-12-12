"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Role } from "@/generated/prisma";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock3, Pencil, RefreshCcw, Search, Shield, ShieldCheck, Sparkles, Trash2, UserPlus } from "lucide-react";

type RoleFilter = "ALL" | Role;

interface User {
    id: string;
    name: string;
    username: string;
    role: Role;
    createdAt: string;
}

export default function UsersManagementPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
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
        if (session && session.user.role !== Role.SUPERADMIN) {
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
            const response = await fetch("/api/users");

            if (response.ok) {
                const data = await response.json();
                setUsers(data.users);
            } else {
                toast.error("Gagal memuat daftar pengguna");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Terjadi kesalahan saat memuat pengguna");
        } finally {
            setLoading(false);
        }
    };
    const stats = useMemo(() => {
        const adminCount = users.filter((user) => user.role === Role.ADMIN).length;
        const superAdminCount = users.filter((user) => user.role === Role.SUPERADMIN).length;
        const latest = users.reduce<string | null>((acc, user) => {
            if (!acc) return user.createdAt;
            return new Date(user.createdAt).getTime() > new Date(acc).getTime() ? user.createdAt : acc;
        }, null);

        return {
            total: users.length,
            admins: adminCount,
            superadmins: superAdminCount,
            latestCreatedAt: latest,
        };
    }, [users]);

    const filteredUsers = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        return users
            .filter((user) => (roleFilter === "ALL" ? true : user.role === roleFilter))
            .filter((user) => (term ? `${user.name} ${user.username}`.toLowerCase().includes(term) : true))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [users, roleFilter, searchTerm]);
    const handleAddUser = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("Password dan konfirmasi password tidak sama");
            return;
        }

        try {
            const response = await fetch("/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newName,
                    username: newUsername,
                    password: newPassword,
                    role: Role.ADMIN,
                }),
            });

            if (response.ok) {
                toast.success("Admin berhasil ditambahkan");
                setAddDialogOpen(false);
                resetFormFields();
                fetchUsers();
            } else {
                const data = await response.json();
                toast.error(data.error || "Gagal menambahkan admin");
            }
        } catch (error) {
            console.error("Error adding user:", error);
            toast.error("Terjadi kesalahan saat menambahkan admin");
        }
    };

    const handleEditUser = async () => {
        if (!selectedUser) return;

        if (newPassword && newPassword !== confirmPassword) {
            toast.error("Password dan konfirmasi password tidak sama");
            return;
        }

        try {
            const response = await fetch(`/api/users/${selectedUser.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newName || selectedUser.name,
                    username: newUsername || selectedUser.username,
                    ...(newPassword ? { password: newPassword } : {}),
                }),
            });

            if (response.ok) {
                toast.success("Admin berhasil diperbarui");
                setEditDialogOpen(false);
                resetFormFields();
                fetchUsers();
            } else {
                const data = await response.json();
                toast.error(data.error || "Gagal memperbarui admin");
            }
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error("Terjadi kesalahan saat memperbarui admin");
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;

        try {
            const response = await fetch(`/api/users/${selectedUser.id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("Admin berhasil dihapus");
                setDeleteDialogOpen(false);
                fetchUsers();
            } else {
                const data = await response.json();
                toast.error(data.error || "Gagal menghapus admin");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Terjadi kesalahan saat menghapus admin");
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

    const formatDate = (dateString: string) =>
        new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(new Date(dateString));

    const formatRelativeTime = (dateString: string) => {
        const diff = Date.now() - new Date(dateString).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days <= 0) return "Hari ini";
        if (days === 1) return "Kemarin";
        if (days < 7) return `${days} hari lalu`;
        const weeks = Math.floor(days / 7);
        if (weeks < 4) return `${weeks} minggu lalu`;
        const months = Math.floor(days / 30);
        return `${months} bulan lalu`;
    };
    if (session?.user?.role !== Role.SUPERADMIN) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl border border-custom bg-gradient-to-r from-primary/15 via-secondary/20 to-background shadow-md">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(247,144,57,0.12),transparent_40%)]" />
                <div className="absolute inset-y-0 right-0 w-48 bg-[radial-gradient(circle_at_80%_30%,rgba(154,5,1,0.08),transparent_45%)]" />
                <div className="relative flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-secondary-color">
                            <Sparkles className="h-4 w-4 text-accent" />
                            <span>Panel Admin</span>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-primary-color text-3xl font-black leading-tight md:text-4xl">
                                Kelola Admin
                            </h1>
                            <p className="text-secondary-color max-w-3xl">
                                Buat, perbarui, dan awasi admin dengan tampilan yang lebih ringkas dan ramah pengguna.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="bg-background/80 text-primary-color border-border dark:bg-card/80">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Hak akses terkontrol
                            </Badge>
                            <Badge variant="outline" className="border-border text-secondary-color">
                                <RefreshCcw className="h-3.5 w-3.5" />
                                Sinkron real-time
                            </Badge>
                            <Badge variant="outline" className="border-border text-secondary-color">
                                <Sparkles className="h-3.5 w-3.5 text-accent" />
                                UX lebih ramah
                            </Badge>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Dialog open={addDialogOpen} onOpenChange={(open) => { setAddDialogOpen(open); if (!open) resetFormFields(); }}>
                                <DialogTrigger asChild>
                                    <Button className="flex items-center gap-2 bg-primary text-primary-foreground shadow-md hover:bg-primary/90">
                                        <UserPlus className="h-4 w-4" />
                                        Tambah Admin
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Tambah Admin Baru</DialogTitle>
                                        <DialogDescription>
                                            Lengkapi data admin untuk memberikan akses ke sistem antrean PST.
                                        </DialogDescription>
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
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="username">Username</Label>
                                                <Input
                                                    id="username"
                                                    value={newUsername}
                                                    onChange={(e) => setNewUsername(e.target.value)}
                                                    placeholder="contoh: adminpst"
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
                                                />
                                            </div>
                                        </div>
                                        <div className="rounded-lg border border-dashed border-border/80 bg-muted/40 p-3 text-xs text-secondary-color">
                                            <p className="font-semibold text-primary-color">Tips keamanan</p>
                                            <p>Buat password yang kuat dan unik, lalu bagikan melalui kanal aman.</p>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                                            Batal
                                        </Button>
                                        <Button onClick={handleAddUser}>Simpan Admin</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <Button
                                variant="outline"
                                className="gap-2 border-border"
                                onClick={() => fetchUsers()}
                                disabled={loading}
                            >
                                <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                                Muat ulang data
                            </Button>
                        </div>
                    </div>
                    <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:min-w-[260px] lg:w-[340px]">
                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-secondary-color">
                                <Shield className="h-4 w-4 text-primary" />
                                Total Admin
                            </p>
                            <div className="mt-2 text-3xl font-bold text-primary-color">{stats.total}</div>
                            <p className="text-xs text-secondary-color">Akun aktif di sistem</p>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-secondary-color">
                                <ShieldCheck className="h-4 w-4 text-accent" />
                                Super Admin
                            </p>
                            <div className="mt-2 text-3xl font-bold text-primary-color">{stats.superadmins}</div>
                            <p className="text-xs text-secondary-color">Akses penuh &amp; kontrol</p>
                        </div>
                        <div className="col-span-2 rounded-xl border border-border bg-background/70 p-4 shadow-sm dark:bg-card">
                            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-secondary-color">
                                <Clock3 className="h-4 w-4 text-primary" />
                                Aktivitas terbaru
                            </p>
                            {stats.latestCreatedAt ? (
                                <p className="mt-2 text-sm text-primary-color">
                                    Admin terbaru ditambahkan {formatDate(stats.latestCreatedAt)} - {formatRelativeTime(stats.latestCreatedAt)}
                                </p>
                            ) : (
                                <p className="mt-2 text-sm text-secondary-color">Belum ada aktivitas baru</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Card className="border-border/80 shadow-md">
                <CardHeader className="gap-2">
                    <CardTitle className="text-xl font-semibold text-primary-color">Tim Pengelola</CardTitle>
                    <CardDescription className="text-secondary-color">
                        Lihat dan kelola akun admin dengan filter modern dan pencarian cepat.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full lg:w-96">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-color" />
                            <Input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari nama atau username"
                                className="bg-background/80 pl-9 focus-visible:ring-primary"
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Tabs value={roleFilter} onValueChange={(value) => setRoleFilter(value as RoleFilter)}>
                                <TabsList>
                                    <TabsTrigger value="ALL">Semua</TabsTrigger>
                                    <TabsTrigger value={Role.ADMIN}>Admin</TabsTrigger>
                                    <TabsTrigger value={Role.SUPERADMIN}>Super Admin</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <div className="flex items-center gap-2 text-xs text-secondary-color">
                                <Clock3 className="h-4 w-4" />
                                <span>{filteredUsers.length} pengguna ditampilkan</span>
                            </div>
                        </div>
                    </div>

                    {loading ? (
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
                                <p className="text-lg font-semibold text-primary-color">Belum ada admin yang sesuai</p>
                                <p className="text-sm text-secondary-color">
                                    Gunakan tombol tambah admin atau reset filter pencarian.
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
                                    <UserPlus className="h-4 w-4" />
                                    Tambah Admin
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
                        <div className="overflow-hidden rounded-xl border border-border/80">
                            <Table>
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
                                                    variant={user.role === Role.SUPERADMIN ? "secondary" : "outline"}
                                                    className="border-border text-primary-color"
                                                >
                                                    {user.role === Role.SUPERADMIN ? "Super Admin" : "Admin"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1 text-sm">
                                                    <p className="font-medium text-primary-color">{formatDate(user.createdAt)}</p>
                                                    <p className="text-xs text-secondary-color">{formatRelativeTime(user.createdAt)}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-2"
                                                        onClick={() => openEditDialog(user)}
                                                        disabled={user.role === Role.SUPERADMIN}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="gap-2"
                                                        onClick={() => openDeleteDialog(user)}
                                                        disabled={user.role === Role.SUPERADMIN}
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
                    )}
                </CardContent>
            </Card>
            <Dialog open={editDialogOpen} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) resetFormFields(); }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Admin</DialogTitle>
                        <DialogDescription>Perbarui informasi admin dengan cepat.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nama Lengkap</Label>
                            <Input
                                id="edit-name"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Masukkan nama lengkap"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-username">Username</Label>
                            <Input
                                id="edit-username"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                placeholder="Masukkan username"
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
                            />
                            <p className="text-xs text-secondary-color">Biarkan kosong bila tidak ada perubahan.</p>
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
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleEditUser}>Simpan Perubahan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteDialogOpen} onOpenChange={(open) => { setDeleteDialogOpen(open); if (!open) resetFormFields(); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Hapus Admin</DialogTitle>
                        <DialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Pastikan admin ini memang perlu dihapus.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-2">
                        <p>
                            Admin <strong>{selectedUser?.name}</strong> akan dihapus dari sistem. Pastikan tidak ada antrean
                            aktif yang masih ditangani olehnya.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteUser}>
                            Hapus Admin
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
