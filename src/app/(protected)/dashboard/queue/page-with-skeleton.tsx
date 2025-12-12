"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QueueStatus, Role } from "@/generated/prisma";
import { formatDistance } from "date-fns";
import { id } from "date-fns/locale";
import { RefreshCw, Smartphone, AlertCircle, MessageSquareText } from "lucide-react";
import { queuesApi } from "@/services/api/queues";
import { remindersApi } from "@/services/api/reminders";
import { visitorFormApi } from "@/services/api/visitor-form";
import TableSkeleton from "@/modules/dashboard/components/skeletons/TableSkeleton";
import QueueManagementSkeleton from "@/modules/dashboard/components/skeletons/QueueManagementSkeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { QueueDetail } from "@shared/types/queue";

type Queue = QueueDetail;

export default function QueueManagementPage() {
    const { data: session } = useSession();
    const [queues, setQueues] = useState<Queue[]>([]);
    const [activeTab, setActiveTab] = useState<QueueStatus>("WAITING");
    const [loading, setLoading] = useState(true);
    const [showContinueDialog, setShowContinueDialog] = useState(false);
    const [nextInQueue, setNextInQueue] = useState<Queue | null>(null);
    const [showRemindSkdDialog, setShowRemindSkdDialog] = useState(false);
    const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null);
    const [reminderMessage, setReminderMessage] = useState("");
    const [isSendingReminder, setIsSendingReminder] = useState(false);
    const [reminderError, setReminderError] = useState<string | null>(null);
    const [dataHash, setDataHash] = useState<string>("");
    const [needsRefresh, setNeedsRefresh] = useState<boolean>(false);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
    const [dateFilter, setDateFilter] = useState<'today' | 'all'>('today');
    const [pageLoading, setPageLoading] = useState(true); // Added for initial page load skeleton

    // Efficient polling with change detection
    const pollForChanges = useCallback(async () => {
        try {
            const data = await queuesApi.list({
                status: activeTab,
                hash: dataHash,
                dateFilter,
            });

            if (data.hasChanges) {
                setQueues(data.queues);
                setDataHash(data.hash);
                setLastUpdatedAt(new Date());
            }
        } catch (error) {
            console.error("Error polling for changes:", error);
        }
    }, [activeTab, dataHash, dateFilter]);

    // Initial data loading when tab changes
    const fetchQueues = useCallback(async (status: QueueStatus, filter: 'today' | 'all') => {
        try {
            setLoading(true);
            const data = await queuesApi.list({
                status,
                dateFilter: filter,
            });
            setQueues(data.queues);
            setDataHash(data.hash || "");
            setLastUpdatedAt(new Date());
        } catch (error) {
            console.error("Error fetching queues:", error);
            toast.error("Terjadi kesalahan saat memuat antrean");
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial data loading when tab changes and polling setup
    useEffect(() => {
        fetchQueues(activeTab, dateFilter);

        const interval = setInterval(pollForChanges, 30000);
        return () => clearInterval(interval);
    }, [activeTab, dateFilter, fetchQueues, pollForChanges]);

    // Simulate initial page loading
    useEffect(() => {
        // Add a slight delay to simulate initial loading
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const handleServeQueue = async (queueId: string) => {
        try {
            await queuesApi.serve(queueId);
            toast.success("Antrean sedang dilayani");
            setNeedsRefresh(true);
        } catch (error) {
            console.error("Error serving queue:", error);
            toast.error("Terjadi kesalahan saat melayani antrean");
        }
    };

    const handleCompleteQueue = async (queueId: string) => {
        try {
            await queuesApi.complete(queueId);
            toast.success("Antrean telah selesai dilayani");

            const waitingResponse = await queuesApi.list({ status: "WAITING" });
            if (waitingResponse?.queues?.length > 0) {
                const nextCustomer = waitingResponse.queues[0];
                setNextInQueue(nextCustomer);
                setShowContinueDialog(true);
            }

            setNeedsRefresh(true);
        } catch (error) {
            console.error("Error completing queue:", error);
            toast.error("Terjadi kesalahan");
        }
    };

    const handleCancelQueue = async (queueId: string) => {
        try {
            await queuesApi.cancel(queueId);
            toast.success("Antrean telah dibatalkan");
            setNeedsRefresh(true);
        } catch (error) {
            console.error("Error canceling queue:", error);
            toast.error("Terjadi kesalahan");
        }
    };

    const getWaitingTime = (createdAt: string | Date) => {
        try {
            return formatDistance(new Date(createdAt), new Date(), {
                addSuffix: false,
                locale: id,
            });
        } catch (error) {
            console.log("Error formatting date:", error);

            return "-";
        }
    };

    // Function to handle opening the SKD reminder dialog
    const handleRemindSKD = (queue: Queue) => {
        setSelectedQueue(queue);
        setReminderMessage(
            `Halo ${queue.visitor.name}, mohon kesediaannya untuk mengisi Survei Kebutuhan Data (SKD) 2025 BPS Bulungan melalui link berikut: s.bps.go.id/skd2025_bpsbusel`
        );
        setShowRemindSkdDialog(true);
    };

    // Function to prepare WhatsApp message
    const prepareWhatsAppReminder = async () => {
        if (!selectedQueue) return;

        try {
            setIsSendingReminder(true);
            setReminderError(null);

            const result = await remindersApi.sendWaBot({
                phoneNumber: selectedQueue.visitor.phone,
                message: reminderMessage,
            });

            if (result.success) {
                toast.success("Pengingat berhasil dikirim via WhatsApp Bot");
                setShowRemindSkdDialog(false);
                setNeedsRefresh(true);
            } else {
                setReminderError(result.message);
                toast.error(result.message);
            }
        } catch (error) {
            console.error("Error preparing WhatsApp reminder:", error);
            setReminderError("Terjadi kesalahan saat menyiapkan pengingat WhatsApp");
            toast.error("Terjadi kesalahan saat menyiapkan pengingat WhatsApp");
        } finally {
            setIsSendingReminder(false);
        }
    };

    // Function to send reminder via WhatsApp Bot
    const sendWhatsAppBotReminderHandler = async () => {
        if (!selectedQueue) return;
        await prepareWhatsAppReminder();
    };

    // Function to handle SKD check
    const handleMarkSkdFilled = async (queue: Queue, filled: boolean) => {
        try {
            if (!queue.tempUuid) return;

            await visitorFormApi.markSkd(queue.tempUuid, filled);
            toast.success(
                filled ? "SKD ditandai telah diisi" : "SKD ditandai belum diisi"
            );
            setNeedsRefresh(true);
        } catch (error) {
            console.error("Error updating SKD status:", error);
            toast.error("Terjadi kesalahan saat mengubah status SKD");
        }
    };

    const getActionButtons = (queue: Queue) => {
        const isSuperAdmin = session?.user?.role === Role.SUPERADMIN;
        const actions = [];

        // Add "Remind SKD" button for queues that haven't filled SKD
        if (!queue.filledSKD && queue.tempUuid) {
            actions.push(
                <Button
                    key="remind-skd"
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={() => handleRemindSKD(queue)}
                >
                    <Smartphone className="w-3 h-3" />
                    <span>Kirim Pengingat</span>
                </Button>
            );
        }

        // Add standard action buttons based on queue status
        switch (queue.status) {
            case "WAITING":
                actions.push(
                    <Button
                        key="serve"
                        size="sm"
                        onClick={() => handleServeQueue(queue.id)}
                    >
                        Layani
                    </Button>,
                    <Button
                        key="cancel"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleCancelQueue(queue.id)}
                    >
                        Batalkan
                    </Button>
                );
                break;
            case "SERVING":
                // Only show complete button if the current admin is serving this queue or is superadmin
                if (
                    isSuperAdmin ||
                    (queue.admin && queue.admin.name === session?.user?.name)
                ) {
                    actions.push(
                        <Button
                            key="complete"
                            size="sm"
                            onClick={() => handleCompleteQueue(queue.id)}
                        >
                            Selesai
                        </Button>
                    );
                } else {
                    actions.push(
                        <span key="serving-info">
                            Sedang dilayani oleh {queue.admin?.name}
                        </span>
                    );
                }
                break;
            default:
                break;
        }

        return <div className="flex flex-wrap justify-end gap-2">{actions}</div>;
    };

    const getTableColumns = () => (
        <>
            <TableHead className="w-16">No</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Layanan</TableHead>
            <TableHead>Waktu</TableHead>
            <TableHead>Status SKD</TableHead>
            <TableHead>Link Tracking</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
        </>
    );

    // Function to render queue rows
    const renderQueueRow = (queue: Queue) => (
        <TableRow key={queue.id}>
            <TableCell className="font-medium">{queue.queueNumber}</TableCell>
            <TableCell>
                <div>
                    <p>{queue.visitor.name}</p>
                    <p className="text-muted-foreground text-xs">
                        {queue.visitor.institution || "-"}
                    </p>
                    <p className="text-muted-foreground text-xs">{queue.visitor.phone}</p>
                </div>
            </TableCell>
            <TableCell>{queue.service.name}</TableCell>
            <TableCell>
                <div>
                    <p className="text-muted-foreground text-xs">
                        {getWaitingTime(queue.createdAt)}
                    </p>
                </div>
            </TableCell>
            <TableCell>
                {queue.filledSKD ? (
                    <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center bg-green-50 px-2 py-1 rounded-full ring-1 ring-green-600/20 ring-inset font-medium text-green-700 text-xs">
                            Sudah Diisi
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => handleMarkSkdFilled(queue, false)}
                        >
                            Tandai Belum
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center bg-red-50 px-2 py-1 rounded-full ring-1 ring-red-600/20 ring-inset font-medium text-red-700 text-xs">
                            Belum Diisi
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => handleMarkSkdFilled(queue, true)}
                        >
                            Tandai Sudah
                        </Button>
                    </div>
                )}
            </TableCell>
            <TableCell>
                {queue.trackingLink ? (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => {
                            // Copy to clipboard
                            navigator.clipboard.writeText(
                                `${window.location.origin}/visitor-form/${queue.tempUuid}`
                            );
                            toast.success("Link tracking disalin ke clipboard");
                        }}
                    >
                        Salin Link
                    </Button>
                ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                )}
            </TableCell>
            <TableCell className="text-right">{getActionButtons(queue)}</TableCell>
        </TableRow>
    );

    // Additional effect for manual refresh when needed (triggered by actions like serve, complete, cancel)
    useEffect(() => {
        if (needsRefresh) {
            fetchQueues(activeTab, dateFilter);
            setNeedsRefresh(false);
        }
    }, [needsRefresh, activeTab, dateFilter, fetchQueues]);

    const handleManualRefresh = () => {
        if (loading) return; // Prevent multiple refreshes if already loading
        const tabName = activeTab
            .charAt(0)
            .toUpperCase()
            + activeTab.slice(1).toLowerCase().replace("_", " ");
        toast.info(`Memperbarui data untuk tab "${tabName}"...`);
        fetchQueues(activeTab, dateFilter);
    };

    if (pageLoading) {
        return <QueueManagementSkeleton />;
    }

    return (
        <div className="space-y-4 p-4">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="font-bold text-2xl">Manajemen Antrean</h1>
                    <p className="text-muted-foreground">
                        Kelola antrean pengunjung PST secara langsung
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as 'today' | 'all')}>
                        <SelectTrigger className="w-auto md:w-[180px]">
                            <SelectValue placeholder="Filter tanggal..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Dibuat Hari Ini</SelectItem>
                            <SelectItem value="all">Semua</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleManualRefresh} disabled={loading}>
                        {loading ? (
                            <>
                                <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
                                Memperbarui...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="mr-2 w-4 h-4" />
                                Perbarui Data
                            </>
                        )}
                    </Button>
                </div>
            </div>
            <div className="text-muted-foreground text-xs md:text-sm">
                Data per: {lastUpdatedAt
                    ? new Intl.DateTimeFormat('id-ID', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
                    }).format(lastUpdatedAt)
                    : (loading && !queues.length ? "Memuat data awal..." : "Belum ada data")}
            </div>
            <Tabs
                defaultValue="WAITING"
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as QueueStatus)}
            >
                <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
                    <TabsTrigger value="WAITING">Menunggu</TabsTrigger>
                    <TabsTrigger value="SERVING">Sedang Dilayani</TabsTrigger>
                    <TabsTrigger value="COMPLETED">Selesai</TabsTrigger>
                    <TabsTrigger value="CANCELED">Dibatalkan</TabsTrigger>
                </TabsList>

                {/* WAITING Tab */}
                <TabsContent value="WAITING">
                    <Card>
                        <CardHeader>
                            <CardTitle>Antrean Menunggu</CardTitle>
                            <CardDescription>
                                Daftar pengunjung yang sedang menunggu untuk dilayani.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading && activeTab === "WAITING" ? (
                                <TableSkeleton columns={7} rows={5} />
                            ) : queues.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>{getTableColumns()}</TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {queues.map((queue) => renderQueueRow(queue))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p>Tidak ada antrean menunggu.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SERVING Tab */}
                <TabsContent value="SERVING">
                    <Card>
                        <CardHeader>
                            <CardTitle>Antrean Sedang Dilayani</CardTitle>
                            <CardDescription>
                                Daftar pengunjung yang sedang dalam proses pelayanan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading && activeTab === "SERVING" ? (
                                <TableSkeleton columns={7} rows={5} />
                            ) : queues.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>{getTableColumns()}</TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {queues.map((queue) => renderQueueRow(queue))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p>Tidak ada antrean yang sedang dilayani.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* COMPLETED Tab */}
                <TabsContent value="COMPLETED">
                    <Card>
                        <CardHeader>
                            <CardTitle>Antrean Selesai</CardTitle>
                            <CardDescription>
                                Daftar pengunjung yang telah selesai dilayani.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading && activeTab === "COMPLETED" ? (
                                <TableSkeleton columns={7} rows={5} />
                            ) : queues.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>{getTableColumns()}</TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {queues.map((queue) => renderQueueRow(queue))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p>Tidak ada antrean yang telah selesai.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* CANCELED Tab */}
                <TabsContent value="CANCELED">
                    <Card>
                        <CardHeader>
                            <CardTitle>Antrean Dibatalkan</CardTitle>
                            <CardDescription>
                                Daftar pengunjung yang antreannya dibatalkan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading && activeTab === "CANCELED" ? (
                                <TableSkeleton columns={7} rows={5} />
                            ) : queues.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>{getTableColumns()}</TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {queues.map((queue) => renderQueueRow(queue))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p>Tidak ada antrean yang dibatalkan.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            <Dialog open={showContinueDialog} onOpenChange={setShowContinueDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Lanjut ke Pengunjung Berikutnya?</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        {nextInQueue && (
                            <div className="space-y-2">
                                <p>
                                    Pengunjung berikutnya:{" "}
                                    <strong>{nextInQueue.visitor.name}</strong>
                                </p>
                                <p>
                                    Nomor Antrean: <strong>{nextInQueue.queueNumber}</strong>
                                </p>
                                <p>
                                    Layanan: <strong>{nextInQueue.service.name}</strong>
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="flex justify-end space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowContinueDialog(false)}
                        >
                            Nanti Saja
                        </Button>
                        <Button
                            onClick={() => {
                                if (nextInQueue) {
                                    handleServeQueue(nextInQueue.id);
                                    setShowContinueDialog(false);
                                }
                            }}
                        >
                            Ya, Layani Sekarang
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add SKD Reminder Dialog */}
            <Dialog open={showRemindSkdDialog} onOpenChange={setShowRemindSkdDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Kirim Pengingat SKD</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {selectedQueue && (
                            <>
                                <div className="space-y-2">
                                    <p>
                                        Pengunjung: <strong>{selectedQueue.visitor.name}</strong>
                                    </p>
                                    <p>
                                        No. HP: <strong>{selectedQueue.visitor.phone}</strong>
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reminder-message">Pesan Pengingat:</Label>
                                    <Textarea
                                        id="reminder-message"
                                        value={reminderMessage}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                            setReminderMessage(e.target.value)
                                        }
                                        rows={4}
                                        className="resize-none"
                                        placeholder="Ketik pesan di sini..."
                                    />
                                </div>

                                {reminderError && (
                                    <div className="flex items-start gap-2 bg-destructive/15 p-3 rounded-md text-destructive text-sm">
                                        <AlertCircle className="flex-shrink-0 mt-0.5 w-4 h-4" />
                                        <div>{reminderError}</div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <DialogFooter className="sm:flex-row flex-col gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowRemindSkdDialog(false)}
                        >
                            Batal
                        </Button>
                        <div className="flex flex-1 justify-end gap-2">
                            <Button
                                onClick={prepareWhatsAppReminder}
                                disabled={isSendingReminder}
                                className="gap-2"
                                variant="default"
                            >
                                <MessageSquareText className="w-4 h-4" />
                                Kirim via WA Direct
                            </Button>
                            <Button
                                onClick={sendWhatsAppBotReminderHandler}
                                disabled={isSendingReminder}
                                className="gap-2"
                                variant="secondary"
                            >
                                <Smartphone className="w-4 h-4" />
                                Kirim via WA Bot
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
