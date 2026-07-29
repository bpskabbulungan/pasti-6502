"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, RefreshCcw, Search, Wrench, X, XCircle } from "lucide-react";
import { ConfirmActionDialog } from "@/components/shared/dialogs/confirm-action-dialog";
import { EmptyState } from "@/components/shared/feedback/empty-state";
import { LiveStatusBadge } from "@/components/shared/feedback/live-status-badge";
import { PageContainer } from "@/components/shared/layout/page-container";
import { DashboardPageHeader } from "@/features/dashboard/components/layout/dashboard-page-header";
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
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ServicesTableRow from "@/features/dashboard/components/rows/services-row";
import { servicesApi } from "@/services/api/services";
import { DEFAULT_SERVICE_CATALOG, normalizeServiceCode } from "@/shared/constants/service-catalog";
import { ServiceStatus } from "@/shared/constants/enums";
import { formatDisplayDateTime } from "@/lib/date-format";
import { serializeErrorForLog } from "@/lib/error-log";
import { getErrorMessage } from "@/lib/error-message";
import type { ErrorResponse } from "@shared/types/api";
import type { ServiceSummary } from "@shared/types/service";

type StatusFilter = "ALL" | ServiceStatus;



const isServiceCodeConflictError = (error: unknown) => {
  if (typeof error !== "object" || !error) {
    return false;
  }

  const status = (error as { status?: number }).status;
  const message = (error as { message?: string }).message ?? "";
  return status === 409 && message.toLowerCase().includes("code");
};

const getCodeBadgeClass = (code: string) => {
  if (code === "K") {
    return "border-blue-500/40 bg-blue-500/10 text-blue-700";
  }
  if (code === "P") {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-700";
  }
  if (code === "R") {
    return "border-amber-500/40 bg-amber-500/10 text-amber-700";
  }
  if (code === "D") {
    return "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-700";
  }

  return "border-border/70 bg-muted/60 text-secondary-color";
};

export default function ServicesPage() {
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
  const [addServiceCode, setAddServiceCode] = useState("");
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>(ServiceStatus.ACTIVE);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await servicesApi.list();
      setServices(data.services ?? []);
      setLastFetchedAt(new Date());
    } catch (error) {
      console.error("Error fetching services:", serializeErrorForLog(error));
      toast.error(getErrorMessage(error, "Terjadi kesalahan saat memuat layanan"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchServices();
  }, [fetchServices]);

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
    ? formatDisplayDateTime(lastFetchedAt)
    : loading
      ? "Memuat data..."
      : "Belum ada data";
  const canResetFilters = Boolean(trimmedSearch) || statusFilter !== "ALL";
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
  };

  const isAddDisabled = !serviceName.trim();
  const isEditDisabled = !selectedService || !serviceName.trim();
  const editServiceCode = selectedService?.code ?? "-";

  const resetFormFields = () => {
    setServiceName("");
    setAddServiceCode("");
    setServiceStatus(ServiceStatus.ACTIVE);
    setSelectedService(null);
  };

  const openEditDialog = useCallback((service: ServiceSummary) => {
    setSelectedService(service);
    setServiceName(service.name);
    setServiceStatus(service.status);
    setEditDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((service: ServiceSummary) => {
    setSelectedService(service);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteDialogChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) {
      resetFormFields();
    }
  };

  const handleAddService = async () => {
    if (!serviceName.trim()) return;
    try {
      const customCode = normalizeServiceCode(addServiceCode);
      await servicesApi.create(serviceName.trim(), customCode || undefined);
      toast.success("Layanan berhasil ditambahkan");
      setAddDialogOpen(false);
      resetFormFields();
      fetchServices();
    } catch (error) {
      console.error("Error adding service:", serializeErrorForLog(error));
      if (isServiceCodeConflictError(error)) {
        toast.error(
          `Kode layanan ${normalizeServiceCode(addServiceCode)} sudah dipakai. Gunakan kode lain atau kosongkan agar sistem membuat kode unik otomatis.`
        );
        return;
      }
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
      console.error("Error updating service:", serializeErrorForLog(error));
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
      console.error("Error deleting service:", serializeErrorForLog(error));
      toast.error(getErrorMessage(error, "Terjadi kesalahan saat menghapus layanan"));
    }
  };

  return (
    <PageContainer className="dashboard-page">
      <DashboardPageHeader
        title="Kelola Layanan PASTI"
        description="Halaman untuk mengelola layanan PASTI."
        meta={
          <>
            <span>Terakhir diperbarui: {lastFetchedLabel}</span>
            <LiveStatusBadge isRefreshing={isRefreshing} hasFetched={hasFetched} />
          </>
        }
        actions={
          <div className="dashboard-header-actions">
            <Button
              variant="outline"
              className="dashboard-header-action border-border"
              onClick={() => fetchServices()}
              disabled={loading}
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Memperbarui..." : "Perbarui Data"}
            </Button>
          </div>
        }
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <Card className="border-border/80 border-l-4 border-l-primary/70 bg-card/88">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-secondary-color">
              Total Layanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary-color">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 border-l-4 border-l-emerald-500/70 bg-card/88">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-secondary-color">
              Layanan Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600">{stats.active}</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 border-l-4 border-l-destructive/70 bg-card/88">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-secondary-color">
              Layanan Nonaktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">{stats.inactive}</p>
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/80">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="text-xl font-semibold text-primary-color">Daftar Layanan</CardTitle>
            <CardDescription className="text-secondary-color text-justify">
              Kelola nama layanan, status aktif, dan standar kode antrean agar konsisten di seluruh halaman.
            </CardDescription>
          </div>
          <Button className="shrink-0 gap-2" onClick={() => setAddDialogOpen(true)}>
            <Wrench className="h-4 w-4" />
            Tambah Layanan
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/70 bg-background/70 px-3 py-2">
            {DEFAULT_SERVICE_CATALOG.map((service) => (
              <Badge
                key={service.code}
                variant="secondary"
                className="bg-background/80 text-secondary-color"
              >
                {service.code}: {service.name}
              </Badge>
            ))}
          </div>
          <div className="dashboard-filter-panel">
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
              <div className="flex flex-wrap items-center gap-2.5">
                <Tabs
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as StatusFilter)}
                >
                  <TabsList className="w-full border border-border/70 bg-background/80 sm:w-auto">
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
                <Button
                  variant="outline"
                  size="icon"
                  className="border-border"
                  onClick={resetFilters}
                  disabled={!canResetFilters}
                  title="Reset filter"
                  aria-label="Reset filter"
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {isInitialLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,0.5fr)_minmax(0,0.7fr)_minmax(0,0.9fr)_minmax(0,0.8fr)] gap-3 rounded-xl border border-border/70 bg-muted/40 p-4"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-12" />
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
            <EmptyState
              icon={Wrench}
              title={services.length === 0 ? "Belum ada layanan" : "Tidak ada layanan yang sesuai"}
              description={
                services.length === 0
                  ? "Tambahkan layanan pertama untuk mulai melayani."
                  : "Coba ubah kata kunci atau status filter."
              }
              action={
                <>
                  <Button variant="success" onClick={() => setAddDialogOpen(true)} className="gap-2">
                    <Wrench className="h-4 w-4" />
                    Tambah Layanan
                  </Button>
                  {services.length > 0 && canResetFilters ? (
                    <Button variant="outline" onClick={resetFilters}>
                      Reset filter
                    </Button>
                  ) : null}
                </>
              }
            />
          ) : (
            <div className="space-y-4">
              <div className="dashboard-table-shell">
                <Table className="w-full md:min-w-[880px]">
                  <TableHeader className="hidden bg-muted/50 md:table-header-group">
                    <TableRow>
                      <TableHead className="w-[34%] text-center">Layanan</TableHead>
                      <TableHead className="w-[12%] text-center">Kode</TableHead>
                      <TableHead className="w-[16%] text-center">Status</TableHead>
                      <TableHead className="w-[18%] text-center">Diperbarui</TableHead>
                      <TableHead className="w-[20%] text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServices.map((service) => (
                      <ServicesTableRow
                        key={service.id}
                        service={service}
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
        open={addDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) resetFormFields();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Layanan Baru</DialogTitle>
            <DialogDescription>
              Lengkapi nama layanan yang ingin ditambahkan.
            </DialogDescription>
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
            <div className="space-y-2">
              <Label htmlFor="service-code">Kode Layanan (opsional)</Label>
              <Input
                id="service-code"
                value={addServiceCode}
                onChange={(e) => setAddServiceCode(normalizeServiceCode(e.target.value))}
                placeholder="Contoh: K2, PUSTAKA"
                maxLength={16}
              />
              <p className="text-xs text-secondary-color">
                Biarkan kosong untuk auto-generate kode unik. Jika diisi, kode akan
                divalidasi unik oleh backend.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="success" onClick={handleAddService} disabled={isAddDisabled}>
              Simpan Layanan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <Label htmlFor="edit-service-code">Kode Layanan</Label>
              <div
                id="edit-service-code"
                className="rounded-md border border-border/70 bg-muted/30 px-3 py-3"
              >
                <Badge variant="outline" className={`font-semibold ${getCodeBadgeClass(editServiceCode)}`}>
                  {editServiceCode}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {DEFAULT_SERVICE_CATALOG.map((item) => (
                  <Badge
                    key={`edit-code-${item.code}`}
                    variant="outline"
                    className={getCodeBadgeClass(item.code)}
                  >
                    {item.code}: {item.name}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-secondary-color">
                Kode otomatis mengikuti mapping layanan standar (K/P/R/D).
              </p>
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
            <Button variant="success" onClick={handleEditService} disabled={isEditDisabled}>
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmActionDialog
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogChange}
        title="Hapus Layanan"
        description="Tindakan ini tidak dapat dibatalkan. Pastikan layanan ini memang perlu dihapus."
        confirmLabel="Hapus Layanan"
        confirmVariant="destructive"
        onConfirm={handleDeleteService}
        body={
          <p>
            Layanan <strong>{selectedService?.name}</strong> akan dihapus dari sistem.
          </p>
        }
      />
    </PageContainer>
  );
}


