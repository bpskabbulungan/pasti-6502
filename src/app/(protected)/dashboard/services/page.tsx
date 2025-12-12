"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Role, ServiceStatus } from "@/generated/prisma";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, Power, PowerOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import ServicesManagementSkeleton from "@/modules/dashboard/components/skeletons/ServicesManagementSkeleton";

interface Service {
    id: string;
    name: string;
    status: ServiceStatus;
    createdAt: string;
    updatedAt: string;
}

export default function ServicesManagementPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    // Form states
    const [newServiceName, setNewServiceName] = useState("");
    const [serviceStatus, setServiceStatus] = useState(true); // true = ACTIVE, false = INACTIVE

    // Check if user is superadmin
    useEffect(() => {
        if (session && session.user.role !== Role.SUPERADMIN) {
            toast.error("Anda tidak memiliki akses ke halaman ini");
            router.push("/dashboard");
        }
    }, [session, router]);

    // Fetch services
    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/services");

            if (response.ok) {
                const data = await response.json();
                setServices(data.services);
            } else {
                toast.error("Gagal memuat daftar layanan");
            }
        } catch (error) {
            console.error("Error fetching services:", error);
            toast.error("Terjadi kesalahan saat memuat layanan");
        } finally {
            setLoading(false);
        }
    };

    const handleAddService = async () => {
        if (!newServiceName.trim()) {
            toast.error("Nama layanan tidak boleh kosong");
            return;
        }

        try {
            const response = await fetch("/api/services", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newServiceName,
                }),
            });

            if (response.ok) {
                toast.success("Layanan berhasil ditambahkan");
                setAddDialogOpen(false);
                resetFormFields();
                fetchServices();
            } else {
                const data = await response.json();
                toast.error(data.error || "Gagal menambahkan layanan");
            }
        } catch (error) {
            console.error("Error adding service:", error);
            toast.error("Terjadi kesalahan saat menambahkan layanan");
        }
    };

    const handleEditService = async () => {
        if (!selectedService) return;

        if (!newServiceName.trim()) {
            toast.error("Nama layanan tidak boleh kosong");
            return;
        }

        try {
            const response = await fetch(`/api/services/${selectedService.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newServiceName,
                    status: serviceStatus,
                }),
            });

            if (response.ok) {
                toast.success("Layanan berhasil diperbarui");
                setEditDialogOpen(false);
                resetFormFields();
                fetchServices();
            } else {
                const data = await response.json();
                toast.error(data.error || "Gagal memperbarui layanan");
            }
        } catch (error) {
            console.error("Error updating service:", error);
            toast.error("Terjadi kesalahan saat memperbarui layanan");
        }
    };

    const handleDeleteService = async () => {
        if (!selectedService) return;

        try {
            const response = await fetch(`/api/services/${selectedService.id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("Layanan berhasil dihapus");
                setDeleteDialogOpen(false);
                fetchServices();
            } else {
                const data = await response.json();
                toast.error(data.error || "Gagal menghapus layanan");
            }
        } catch (error) {
            console.error("Error deleting service:", error);
            toast.error("Terjadi kesalahan saat menghapus layanan");
        }
    };

    const handleToggleServiceStatus = async (service: Service) => {
        try {
            const newStatus = service.status === ServiceStatus.ACTIVE ? false : true;
            const response = await fetch(`/api/services/${service.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: newStatus,
                }),
            });

            if (response.ok) {
                toast.success(`Layanan ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
                fetchServices();
            } else {
                const data = await response.json();
                toast.error(data.error || "Gagal mengubah status layanan");
            }
        } catch (error) {
            console.error("Error toggling service status:", error);
            toast.error("Terjadi kesalahan saat mengubah status layanan");
        }
    };

    const resetFormFields = () => {
        setNewServiceName("");
        setServiceStatus(true);
        setSelectedService(null);
    };

    const openEditDialog = (service: Service) => {
        setSelectedService(service);
        setNewServiceName(service.name);
        setServiceStatus(service.status === ServiceStatus.ACTIVE);
        setEditDialogOpen(true);
    };

    const openDeleteDialog = (service: Service) => {
        setSelectedService(service);
        setDeleteDialogOpen(true);
    };

    if (session?.user?.role !== Role.SUPERADMIN) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-bold text-2xl">Kelola Layanan</h1>
                    <p className="text-muted-foreground">
                        Kelola layanan-layanan di sistem antrean
                    </p>
                </div>

                <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 w-4 h-4" />
                            Tambah Layanan
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tambah Layanan Baru</DialogTitle>
                            <DialogDescription>
                                Tambahkan layanan baru untuk antrean PST
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Layanan</Label>
                                <Input
                                    id="name"
                                    value={newServiceName}
                                    onChange={(e) => setNewServiceName(e.target.value)}
                                    placeholder="Contoh: Konsultasi, Permintaan Data, dll"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button onClick={handleAddService}>Simpan</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Layanan</CardTitle>
                    <CardDescription>
                        Daftar semua layanan yang tersedia di sistem antrean
                    </CardDescription>                </CardHeader>
                <CardContent>
                    {loading ? (
                        <ServicesManagementSkeleton />
                    ) : services.length === 0 ? (
                        <div className="py-4 text-center">Tidak ada layanan saat ini</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Layanan</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Tgl Dibuat</TableHead>
                                        <TableHead>Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {services.map((service) => (
                                        <TableRow key={service.id}>
                                            <TableCell className="font-medium">{service.name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <div
                                                        className={`w-3 h-3 rounded-full ${service.status === ServiceStatus.ACTIVE
                                                            ? "bg-green-500"
                                                            : "bg-red-500"
                                                            }`}
                                                    />
                                                    <span>
                                                        {service.status === ServiceStatus.ACTIVE
                                                            ? "Aktif"
                                                            : "Nonaktif"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(service.createdAt).toLocaleDateString("id-ID")}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggleServiceStatus(service)}
                                                        title={`${service.status === ServiceStatus.ACTIVE
                                                            ? "Nonaktifkan"
                                                            : "Aktifkan"
                                                            } layanan`}
                                                    >
                                                        {service.status === ServiceStatus.ACTIVE ? (
                                                            <PowerOff className="w-4 h-4 text-red-500" />
                                                        ) : (
                                                            <Power className="w-4 h-4 text-green-500" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditDialog(service)}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => openDeleteDialog(service)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
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

            {/* Edit Service Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Layanan</DialogTitle>
                        <DialogDescription>
                            Perbarui informasi layanan
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nama Layanan</Label>
                            <Input
                                id="edit-name"
                                value={newServiceName}
                                onChange={(e) => setNewServiceName(e.target.value)}
                                placeholder="Masukkan nama layanan"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-status" className="block mb-2">Status Layanan</Label>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="edit-status"
                                    checked={serviceStatus}
                                    onCheckedChange={setServiceStatus}
                                />
                                <Label htmlFor="edit-status">
                                    {serviceStatus ? "Aktif" : "Nonaktif"}
                                </Label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            Batal
                        </Button>
                        <Button onClick={handleEditService}>Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Service Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Layanan</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus layanan ini?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p>
                            Layanan <strong>{selectedService?.name}</strong> akan dihapus dari sistem.
                            Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <p className="mt-2 text-destructive">
                            Perhatian: Layanan hanya dapat dihapus jika tidak memiliki antrean yang terkait.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteService}>
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
