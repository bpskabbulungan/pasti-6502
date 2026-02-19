"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock3,
  Pencil,
  Power,
  PowerOff,
  RefreshCcw,
  Search,
  Trash2,
  Wrench,
  X,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { servicesApi } from "@/services/api/services";
import { Role, ServiceStatus } from "@/shared/constants/enums";
import type { ErrorResponse } from "@shared/types/api";
import type { ServiceSummary } from "@shared/types/service";

type StatusFilter = "ALL" | ServiceStatus;

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

const getStatusLabel = (status: ServiceStatus) =>
  status === ServiceStatus.ACTIVE ? "Aktif" : "Nonaktif";

const getStatusBadgeClass = (status: ServiceStatus) =>
  status === ServiceStatus.ACTIVE
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
    : "border-red-500/30 bg-red-500/10 text-red-700";

export default function ServicesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceSummary | null>(null);
  const [serviceName, setServiceName] = useState("");
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>(ServiceStatus.ACTIVE);

  useEffect(() => {
    if (session && session.user.role !== Role.ADMIN) {
      toast.error("Anda tidak memiliki akses ke halaman ini");
      router.push("/dashboard");
    }
  }, [session, router]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await servicesApi.list();
      setServices(data.services ?? []);
      setLastFetchedAt(new Date());
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error(getErrorMessage(error, "Terjadi kesalahan saat memuat layanan"));
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const activeCount = services.filter(
      (service) => service.status === ServiceStatus.ACTIVE
    ).length;
    const inactiveCount = services.filter(
      (service) => service.status === ServiceStatus.INACTIVE
    ).length;
    const latest = services.reduce<Date | null>((acc, service) => {
      const updatedAt = new Date(service.updatedAt ?? service.createdAt);
      if (!acc) return updatedAt;
      return updatedAt.getTime() > acc.getTime() ? updatedAt : acc;
    }, null);

    return {
      total: services.length,
      active: activeCount,
      inactive: inactiveCount,
      latestUpdatedAt: latest,
    };
  }, [services]);

  const filteredServices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return services
      .filter((service) => (statusFilter === "ALL" ? true : service.status === statusFilter))
      .filter((service) => (term ? service.name.toLowerCase().includes(term) : true))
      .sort(
        (a, b) =>
          new Date(b.updatedAt ?? b.createdAt).getTime() -
          new Date(a.updatedAt ?? a.createdAt).getTime()
      );
  }, [services, statusFilter, searchTerm]);

  const trimmedSearch = searchTerm.trim();
  const isInitialLoading = loading && services.length === 0;
  const isRefreshing = loading && services.length > 0;
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
  const activeFilterLabel =
    statusFilter === "ALL"
      ? "Semua status"
      : statusFilter === ServiceStatus.ACTIVE
        ? "Aktif"
        : "Nonaktif";
  const canResetFilters = Boolean(trimmedSearch) || statusFilter !== "ALL";

  const isAddDisabled = !serviceName.trim();
  const isEditDisabled = !selectedService || !serviceName.trim();

  const resetFormFields = () => {
    setServiceName("");
    setServiceStatus(ServiceStatus.ACTIVE);
    setSelectedService(null);
  };

  const openEditDialog = (service: ServiceSummary) => {
    setSelectedService(service);
    setServiceName(service.name);
    setServiceStatus(service.status);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (service: ServiceSummary) => {
    setSelectedService(service);
    setDeleteDialogOpen(true);
  };

  const handleAddService = async () => {
    if (!serviceName.trim()) return;
    try {
      await servicesApi.create(serviceName.trim());
      toast.success("Layanan berhasil ditambahkan");
      setAddDialogOpen(false);
      resetFormFields();
      fetchServices();
    } catch (error) {
      console.error("Error adding service:", error);
      toast.error(getErrorMessage(error, "Terjadi kesalahan saat menambahkan layanan"));
    }
  };

  const handleEditService = async () => {
    if (!selectedService) return;

    try {
      await servicesApi.update(selectedService.id, {
        name: serviceName.trim(),
        status: serviceStatus,
      });
      toast.success("Layanan berhasil diperbarui");
      setEditDialogOpen(false);
      resetFormFields();
      fetchServices();
    } catch (error) {
      console.error("Error updating service:", error);
      toast.error(getErrorMessage(error, "Terjadi kesalahan saat memperbarui layanan"));
    }
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;

    try {
      await servicesApi.delete(selectedService.id);
      toast.success("Layanan berhasil dihapus");
      setDeleteDialogOpen(false);
      resetFormFields();
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error(getErrorMessage(error, "Terjadi kesalahan saat menghapus layanan"));
    }
  };

  const handleToggleServiceStatus = async (service: ServiceSummary) => {
    try {
      const nextStatus =
        service.status === ServiceStatus.ACTIVE ? ServiceStatus.INACTIVE : ServiceStatus.ACTIVE;
      await servicesApi.update(service.id, { status: nextStatus });
      toast.success(
        `Layanan ${nextStatus === ServiceStatus.ACTIVE ? "diaktifkan" : "dinonaktifkan"}`
      );
      fetchServices();
    } catch (error) {
      console.error("Error toggling service status:", error);
      toast.error(getErrorMessage(error, "Terjadi kesalahan saat mengubah status layanan"));
    }
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
      <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-primary/15 via-secondary/20 to-background p-6 shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(247,144,57,0.12),transparent_40%)]" />
        <div className="absolute inset-y-0 right-0 w-48 bg-[radial-gradient(circle_at_80%_30%,rgba(154,5,1,0.08),transparent_45%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-primary-color text-3xl font-black leading-tight md:text-4xl">
                Kelola Layanan
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
            <div className="flex w-full flex-wrap gap-3 lg:w-auto lg:justify-start">
              <Button
                variant="outline"
                className="gap-2 border-border"
                onClick={() => fetchServices()}
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
                    <Wrench className="h-4 w-4" />
                    Tambah Layanan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Tambah Layanan Baru</DialogTitle>
                    <DialogDescription>Lengkapi nama layanan yang ingin ditambahkan.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="service-name">Nama Layanan</Label>
                      <Input
                        id="service-name"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        placeholder="Masukkan nama layanan"
                        autoFocus
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button onClick={handleAddService} disabled={isAddDisabled}>
                      Simpan Layanan
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>

      <Card className="border-border/80 shadow-md">
        <CardHeader className="gap-2">
          <CardTitle className="text-xl font-semibold text-primary-color">Daftar Layanan</CardTitle>
          <CardDescription className="text-secondary-color">
            Kelola status dan nama layanan dengan cepat.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-color" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama layanan"
                  className="bg-background/80 pl-9 pr-10 focus-visible:ring-primary"
                  aria-label="Cari layanan"
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
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as StatusFilter)}
                >
                  <TabsList className="border border-border/70 bg-background/80">
                    <TabsTrigger value="ALL">
                      Semua
                      <span className="rounded-full bg-background/80 px-2 py-0.5 text-[11px] text-secondary-color">
                        {stats.total}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value={ServiceStatus.ACTIVE}>
                      Aktif
                      <span className="rounded-full bg-background/80 px-2 py-0.5 text-[11px] text-secondary-color">
                        {stats.active}
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value={ServiceStatus.INACTIVE}>
                      Nonaktif
                      <span className="rounded-full bg-background/80 px-2 py-0.5 text-[11px] text-secondary-color">
                        {stats.inactive}
                      </span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex items-center gap-2 text-xs text-secondary-color">
                  <Clock3 className="h-4 w-4" />
                  <span>{filteredServices.length} layanan ditampilkan</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("ALL");
                  }}
                  disabled={!canResetFilters}
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
                Menampilkan {filteredServices.length} dari {stats.total} layanan
              </span>
            </div>
          </div>

          {isInitialLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,0.7fr)_minmax(0,0.9fr)_minmax(0,0.8fr)] gap-3 rounded-xl border border-border/70 bg-muted/40 p-4"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20" />
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
          ) : filteredServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center">
              <Wrench className="h-8 w-8 text-primary" />
              <div className="space-y-1">
                <p className="text-lg font-semibold text-primary-color">
                  {services.length === 0 ? "Belum ada layanan" : "Tidak ada layanan yang sesuai"}
                </p>
                <p className="text-sm text-secondary-color">
                  {services.length === 0
                    ? "Tambahkan layanan pertama untuk mulai melayani."
                    : "Coba ubah kata kunci atau status filter."}
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
                  <Wrench className="h-4 w-4" />
                  Tambah Layanan
                </Button>
                {services.length > 0 && canResetFilters && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("ALL");
                    }}
                  >
                    Reset filter
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="hidden overflow-hidden rounded-xl border border-border/80 md:block">
                <Table className="min-w-[760px]">
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Nama Layanan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Diperbarui</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServices.map((service) => {
                      const updatedAt = service.updatedAt ?? service.createdAt;
                      return (
                        <TableRow key={service.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary-color">
                                <Wrench className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-semibold text-primary-color">{service.name}</p>
                                <p className="text-xs text-secondary-color">
                                  {service.status === ServiceStatus.ACTIVE
                                    ? "Aktif untuk antrean"
                                    : "Nonaktif sementara"}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadgeClass(service.status)}>
                              {getStatusLabel(service.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-sm">
                              <p className="font-medium text-primary-color">
                                {formatDate(updatedAt)}
                              </p>
                              <p className="text-xs text-secondary-color">
                                {formatRelativeTime(updatedAt)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => handleToggleServiceStatus(service)}
                                title={`${
                                  service.status === ServiceStatus.ACTIVE
                                    ? "Nonaktifkan"
                                    : "Aktifkan"
                                } layanan`}
                              >
                                {service.status === ServiceStatus.ACTIVE ? (
                                  <PowerOff className="h-4 w-4 text-red-500" />
                                ) : (
                                  <Power className="h-4 w-4 text-emerald-600" />
                                )}
                                <span>
                                  {service.status === ServiceStatus.ACTIVE
                                    ? "Nonaktifkan"
                                    : "Aktifkan"}
                                </span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => openEditDialog(service)}
                              >
                                <Pencil className="h-4 w-4" />
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="gap-2"
                                onClick={() => openDeleteDialog(service)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Hapus
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <div className="space-y-3 md:hidden">
                {filteredServices.map((service) => {
                  const updatedAt = service.updatedAt ?? service.createdAt;
                  return (
                    <div
                      key={service.id}
                      className="rounded-xl border border-border/70 bg-background/80 p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-primary-color">{service.name}</p>
                          <div className="mt-1 text-xs text-secondary-color">
                            {formatDate(updatedAt)}
                          </div>
                        </div>
                        <Badge variant="outline" className={getStatusBadgeClass(service.status)}>
                          {getStatusLabel(service.status)}
                        </Badge>
                      </div>
                      <div className="mt-2 text-xs text-secondary-color">
                        {formatRelativeTime(updatedAt)}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleToggleServiceStatus(service)}
                        >
                          {service.status === ServiceStatus.ACTIVE ? (
                            <PowerOff className="h-4 w-4 text-red-500" />
                          ) : (
                            <Power className="h-4 w-4 text-emerald-600" />
                          )}
                          {service.status === ServiceStatus.ACTIVE ? "Nonaktifkan" : "Aktifkan"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => openEditDialog(service)}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-2"
                          onClick={() => openDeleteDialog(service)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  );
                })}
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
            <DialogTitle>Edit Layanan</DialogTitle>
            <DialogDescription>Perbarui nama atau status layanan.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-service-name">Nama Layanan</Label>
              <Input
                id="edit-service-name"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="Masukkan nama layanan"
              />
            </div>
            <div className="space-y-2">
              <Label>Status Layanan</Label>
              <Select
                value={serviceStatus}
                onValueChange={(value) => setServiceStatus(value as ServiceStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ServiceStatus.ACTIVE}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Aktif
                    </div>
                  </SelectItem>
                  <SelectItem value={ServiceStatus.INACTIVE}>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      Nonaktif
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleEditService} disabled={isEditDisabled}>
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
            <DialogTitle>Hapus Layanan</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Pastikan layanan ini memang perlu dihapus.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <p>
              Layanan <strong>{selectedService?.name}</strong> akan dihapus dari sistem.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteService}>
              Hapus Layanan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
