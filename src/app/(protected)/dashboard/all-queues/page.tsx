"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card"; // Removed CardHeader, CardTitle
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"; // Removed DialogDescription
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label"; // Added Label import
import { QueueStatus } from "@/generated/prisma";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RefreshCw, Search } from "lucide-react";
import TableSkeleton from "@/modules/dashboard/components/skeletons/TableSkeleton";

// Format queue time to DDMM format (eg. 1405 for May 14) 
const formatQueueTime = (isoDateString: string): string => {
    const date = new Date(isoDateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-indexed, so add 1
    return `${day}${month}`;
};

interface Queue {
    id: string;
    queueNumber: number;
    status: QueueStatus;
    queueType: string;
    createdAt: string;
    startTime: string | null;
    endTime: string | null;
    filledSKD: boolean;
    trackingLink: string | null;
    tempUuid: string | null;
    visitor: {
        name: string;
        phone: string;
        institution: string | null;
    };
    service: {
        name: string;
    };
    admin: {
        name: string;
    } | null;
}

interface TablePaginationProps {
    totalItems: number;
    pageSize: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

// TablePagination component for page controls
function TablePagination({ totalItems, pageSize, currentPage, onPageChange }: TablePaginationProps) {
    const totalPages = Math.ceil(totalItems / pageSize);

    return (
        <div className="flex justify-between items-center mt-4 px-2">
            <div className="text-muted-foreground text-sm">
                Menampilkan {Math.min((currentPage - 1) * pageSize + 1, totalItems)} hingga {Math.min(currentPage * pageSize, totalItems)} dari {totalItems} data
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                >
                    <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-2 text-sm">
                    Halaman {currentPage} dari {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                >
                    <ChevronsRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}

export default function AllQueuesPage() {
    useSession();
    const [queues, setQueues] = useState<Queue[]>([]);
    const [filteredQueues, setFilteredQueues] = useState<Queue[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortColumn, setSortColumn] = useState<string>("queueNumber");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [dataHash, setDataHash] = useState<string>("");
    const [needsRefresh, setNeedsRefresh] = useState<boolean>(false);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null); // Added lastUpdatedAt state

    // New ref for dataHash
    const dataHashRef = useRef(dataHash);

    // Effect to keep dataHashRef updated
    useEffect(() => {
        dataHashRef.current = dataHash;
    }, [dataHash]);

    // Dialog states
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null);

    const filterAndSortQueues = useCallback(() => {
        let result = [...queues];

        // Apply status filter
        if (statusFilter !== "ALL") {
            result = result.filter(queue => queue.status === statusFilter);
        }

        // Apply search filter (search by visitor name, queue number, or service name)
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            result = result.filter(
                queue =>
                    queue.visitor.name.toLowerCase().includes(search) ||
                    queue.queueNumber.toString().includes(search) ||
                    queue.service.name.toLowerCase().includes(search)
            );
        }

        // Apply sorting
        result.sort((a, b) => {
            let comparison = 0;

            if (sortColumn === "queueNumber") {
                comparison = a.queueNumber - b.queueNumber;
            } else if (sortColumn === "visitorName") {
                comparison = a.visitor.name.localeCompare(b.visitor.name);
            } else if (sortColumn === "serviceName") {
                comparison = a.service.name.localeCompare(b.service.name);
            } else if (sortColumn === "status") {
                comparison = a.status.localeCompare(b.status);
            } else if (sortColumn === "createdAt") {
                comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            }

            return sortDirection === "asc" ? comparison : -comparison;
        });

        setFilteredQueues(result);
        // Reset to first page when filters change
        setCurrentPage(1);
    }, [queues, searchTerm, statusFilter, sortColumn, sortDirection]);

    const fetchAllQueues = useCallback(async () => {
        try {
            // setLoading(true); // setLoading is handled by callers
            const response = await fetch(`/api/queue/all`);
            if (response.ok) {
                const data = await response.json();
                setQueues(data.queues);
                setDataHash(data.hash || "");
                setLastUpdatedAt(new Date()); // Update lastUpdatedAt
            } else {
                toast.error("Gagal memuat data antrean");
            }
        } catch (error) {
            console.error("Error fetching queues:", error);
            toast.error("Terjadi kesalahan saat memuat data antrean");
        } finally {
            // setLoading(false); // setLoading is handled by callers
        }
    }, []); // Empty dependency array for stability

    // Revised useEffect for filtering and sorting
    useEffect(() => {
        filterAndSortQueues();
    }, [filterAndSortQueues]); // filterAndSortQueues dependency is correct

    // REMOVE EXISTING SSE useEffect BLOCK
    // useEffect(() => {
    //     setLoading(true);
    //     fetchAllQueues();
    //     const eventSource = new EventSource('/api/queue/updates');
    //     const handleMessage = (event: MessageEvent) => { ... };
    //     eventSource.addEventListener('message', handleMessage);
    //     eventSource.onerror = (error) => { ... };
    //     return () => { ... };
    // }, [fetchAllQueues]);

    // New polling function
    const pollForAllQueuesChanges = useCallback(async () => {
        try {
            const response = await fetch(`/api/queue/all`);
            if (response.ok) {
                const data = await response.json();
                if (data.hash && data.hash !== dataHashRef.current) {
                    setQueues(data.queues);
                    setDataHash(data.hash);
                    setLastUpdatedAt(new Date()); // Update lastUpdatedAt
                }
            }
        } catch (error) {
            console.error("Error polling for all queues changes:", error);
        }
    }, []); // Stable, uses ref

    // New useEffect for initial load and polling
    useEffect(() => {
        setLoading(true);
        fetchAllQueues().finally(() => setLoading(false)); // Initial load

        const intervalId = setInterval(pollForAllQueuesChanges, 30000); // Poll every 30 seconds

        return () => {
            clearInterval(intervalId); // Cleanup interval on unmount
        };
    }, [fetchAllQueues, pollForAllQueuesChanges]); // Stable dependencies

    // Handle manual refresh when needed (useEffect for needsRefresh)
    useEffect(() => {
        if (needsRefresh) {
            // setLoading(true); // setLoading is typically set by the caller of setNeedsRefresh (e.g., handleRefresh)
            fetchAllQueues().finally(() => {
                setLoading(false); // Ensure loading is set to false after fetch completes
                setNeedsRefresh(false);
            });
        }
    }, [needsRefresh, fetchAllQueues]);

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            // Toggle direction if same column is clicked
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            // Set new column and default to ascending
            setSortColumn(column);
            setSortDirection("asc");
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
    };

    const handlePageSizeChange = (value: string) => {
        setPageSize(parseInt(value, 10));
        setCurrentPage(1); // Reset to first page when page size changes
    }; const handleRefresh = () => {
        if (loading) return; // Prevent multiple refreshes while already loading

        setLoading(true); // Show loading state immediately
        setNeedsRefresh(true); // Trigger the useEffect for needsRefresh
        toast.success("Memperbarui data antrean...");
    };

    // const handleViewDetails = (queue: Queue) => {
    //     setSelectedQueue(queue);
    //     setShowDetailsDialog(true);
    // };

    // Calculate pagination
    const paginatedQueues = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredQueues.slice(startIndex, startIndex + pageSize);
    }, [filteredQueues, currentPage, pageSize]); const sortableColumns = [
        { id: "queueNumber", label: "No. Antrean" },
        { id: "visitorName", label: "Nama Pengunjung" },
        { id: "serviceName", label: "Layanan" },
        { id: "queueType", label: "Tipe" },
        { id: "status", label: "Status" },
        { id: "createdAt", label: "Waktu Dibuat" },
        { id: "filledSKD", label: "Status SKD" },
    ];

    // Status badge helper
    const getStatusBadge = (status: QueueStatus) => {
        switch (status) {
            case "WAITING":
                return <span className="bg-yellow-100 px-2 py-1 rounded-full font-semibold text-yellow-800 text-xs">Menunggu</span>;
            case "SERVING":
                return <span className="bg-blue-100 px-2 py-1 rounded-full font-semibold text-blue-800 text-xs">Sedang Dilayani</span>;
            case "COMPLETED":
                return <span className="bg-green-100 px-2 py-1 rounded-full font-semibold text-green-800 text-xs">Selesai</span>;
            case "CANCELED":
                return <span className="bg-red-100 px-2 py-1 rounded-full font-semibold text-red-800 text-xs">Dibatalkan</span>;
            default:
                return <span className="bg-gray-100 px-2 py-1 rounded-full font-semibold text-gray-800 text-xs">Unknown</span>;
        }
    };

    // Duration/time helper
    // const getQueueTimeInfo = (queue: Queue) => {
    //     switch (queue.status) {
    //         case "WAITING":
    //             return formatDistance(new Date(queue.createdAt), new Date(), {
    //                 addSuffix: false,
    //                 locale: id,
    //             });
    //         case "SERVING":
    //             return queue.admin?.name || "-";
    //         case "COMPLETED":
    //             return queue.endTime
    //                 ? new Date(queue.endTime).toLocaleTimeString("id-ID")
    //                 : "-";
    //         case "CANCELED":
    //             return "-";
    //         default:
    //             return "-";
    //     }
    // };

    // Sort indicator helper
    // const getSortIndicator = (column: string) => {
    //     if (sortColumn !== column) return null;
    //     return sortDirection === "asc" ? " ↑" : " ↓";
    // };

    return (
        <div className="space-y-4">
            <div>
                <h1 className="font-bold text-2xl">Semua Antrean</h1>
                <p className="text-muted-foreground">
                    Lihat dan cari semua antrean pengunjung PST
                </p>
            </div>


            <Card className="p-5">
                <div className="flex md:flex-row flex-col justify-between gap-4">

                    <div className="flex md:flex-row flex-col gap-4">
                        <div className="relative">
                            <Search className="top-2.5 left-2 absolute w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari antrean..."
                                className="pl-8 w-full md:w-[300px]"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>

                    {/* Filters and Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Select value={statusFilter} onValueChange={handleStatusChange}>
                            <SelectTrigger className="bg-background border-border w-full md:w-[180px]">
                                <SelectValue placeholder="Filter Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Semua Status</SelectItem>
                                <SelectItem value="WAITING">Menunggu</SelectItem>
                                <SelectItem value="SERVING">Sedang Dilayani</SelectItem>
                                <SelectItem value="COMPLETED">Selesai</SelectItem>
                                <SelectItem value="CANCELED">Dibatalkan</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                            <SelectTrigger className="bg-background border-border w-full md:w-[120px]">
                                <SelectValue placeholder="Per Halaman" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10 / Halaman</SelectItem>
                                <SelectItem value="25">25 / Halaman</SelectItem>
                                <SelectItem value="50">50 / Halaman</SelectItem>
                                <SelectItem value="100">100 / Halaman</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button onClick={handleRefresh} disabled={loading} className="w-full md:w-auto">
                            {loading ? (
                                <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="mr-2 w-4 h-4" />
                            )}
                            Perbarui Data
                        </Button>
                    </div>
                </div>
                <div className="mt-2 text-muted-foreground text-xs">
                    Terakhir diperbarui: {lastUpdatedAt
                        ? new Intl.DateTimeFormat('id-ID', {
                            year: 'numeric', month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
                        }).format(lastUpdatedAt)
                        : (loading && !queues.length ? "Memuat data awal..." : "Belum ada data")}
                </div>
                <CardContent className="mt-4 p-0">
                    {loading && paginatedQueues.length === 0 ? (
                        <TableSkeleton columns={6} rows={10} />
                    ) : filteredQueues.length === 0 ? (
                        <div className="py-8 text-center">Tidak ada antrean yang sesuai dengan filter</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {sortableColumns.map((column) => (
                                            <TableHead
                                                key={column.id}
                                                className={`cursor-pointer ${column.id === sortColumn ? "text-primary" : ""}`}
                                                onClick={() => handleSort(column.id)}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>{column.label}</span>
                                                    {sortColumn === column.id && (
                                                        <span>
                                                            {sortDirection === "asc" ? "↑" : "↓"}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableHead>
                                        ))}
                                        <TableHead>Link Tracking</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedQueues.map((queue) => (
                                        <TableRow key={queue.id}>                                            <TableCell className="font-medium">{queue.queueNumber}-{formatQueueTime(queue.createdAt)}</TableCell>
                                            <TableCell>{queue.visitor.name}</TableCell>
                                            <TableCell>{queue.service.name}</TableCell>
                                            <TableCell>
                                                {queue.queueType === "ONLINE" ? (
                                                    <span className="inline-flex items-center bg-blue-50 px-2 py-1 rounded-full ring-1 ring-blue-600/20 ring-inset font-medium text-blue-700 text-xs">
                                                        Online
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center bg-green-50 px-2 py-1 rounded-full ring-1 ring-green-600/20 ring-inset font-medium text-green-700 text-xs">
                                                        Offline
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {queue.queueType === "ONLINE" ? (
                                                    <span className="inline-flex items-center bg-blue-50 px-2 py-1 rounded-full ring-1 ring-blue-600/20 ring-inset font-medium text-blue-700 text-xs">
                                                        Online
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center bg-green-50 px-2 py-1 rounded-full ring-1 ring-green-600/20 ring-inset font-medium text-green-700 text-xs">
                                                        Offline
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {queue.status === "WAITING" && (
                                                    <span className="inline-flex items-center bg-yellow-50 px-2 py-1 rounded-full ring-1 ring-yellow-600/20 ring-inset font-medium text-yellow-800 text-xs">
                                                        Menunggu
                                                    </span>
                                                )}
                                                {queue.status === "SERVING" && (
                                                    <span className="inline-flex items-center bg-blue-50 px-2 py-1 rounded-full ring-1 ring-blue-600/20 ring-inset font-medium text-blue-700 text-xs">
                                                        Dilayani
                                                    </span>
                                                )}
                                                {queue.status === "COMPLETED" && (
                                                    <span className="inline-flex items-center bg-green-50 px-2 py-1 rounded-full ring-1 ring-green-600/20 ring-inset font-medium text-green-700 text-xs">
                                                        Selesai
                                                    </span>
                                                )}
                                                {queue.status === "CANCELED" && (
                                                    <span className="inline-flex items-center bg-red-50 px-2 py-1 rounded-full ring-1 ring-red-600/20 ring-inset font-medium text-red-700 text-xs">
                                                        Dibatalkan
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(queue.createdAt).toLocaleString("id-ID", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                {queue.filledSKD ? (
                                                    <span className="inline-flex items-center bg-green-50 px-2 py-1 rounded-full ring-1 ring-green-600/20 ring-inset font-medium text-green-700 text-xs">
                                                        Sudah Diisi
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center bg-red-50 px-2 py-1 rounded-full ring-1 ring-red-600/20 ring-inset font-medium text-red-700 text-xs">
                                                        Belum Diisi
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {queue.tempUuid && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-xs"
                                                        onClick={() => {
                                                            // Copy to clipboard
                                                            navigator.clipboard.writeText(`${window.location.origin}/visitor-form/${queue.tempUuid}`);
                                                            toast.success("Link tracking disalin ke clipboard");
                                                        }}
                                                    >
                                                        Salin Link
                                                    </Button>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedQueue(queue);
                                                        setShowDetailsDialog(true);
                                                    }}
                                                >
                                                    Detail
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {!loading && filteredQueues.length > 0 && (
                        <TablePagination
                            totalItems={filteredQueues.length}
                            pageSize={pageSize}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Queue Details Dialog */}
            {selectedQueue && (
                <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Detail Antrean #{selectedQueue.queueNumber}</DialogTitle>
                        </DialogHeader>

                        <div className="gap-4 grid py-4">                            <div className="items-center gap-4 grid grid-cols-3">
                            <Label>Status</Label>
                            <div className="col-span-2">{getStatusBadge(selectedQueue.status)}</div>
                        </div>

                            <div className="items-center gap-4 grid grid-cols-3">
                                <Label>Tipe Antrean</Label>
                                <div className="col-span-2">
                                    {selectedQueue.queueType === "ONLINE" ? (
                                        <span className="inline-flex items-center bg-blue-50 px-2 py-1 rounded-full ring-1 ring-blue-600/20 ring-inset font-medium text-blue-700 text-xs">
                                            Online
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center bg-green-50 px-2 py-1 rounded-full ring-1 ring-green-600/20 ring-inset font-medium text-green-700 text-xs">
                                            Offline
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="items-center gap-4 grid grid-cols-3">
                                <Label>Pengunjung</Label>
                                <div className="col-span-2">{selectedQueue.visitor.name}</div>
                            </div>

                            <div className="items-center gap-4 grid grid-cols-3">
                                <Label>Telepon</Label>
                                <div className="col-span-2">{selectedQueue.visitor.phone}</div>
                            </div>

                            {selectedQueue.visitor.institution && (
                                <div className="items-center gap-4 grid grid-cols-3">
                                    <Label>Institusi</Label>
                                    <div className="col-span-2">{selectedQueue.visitor.institution}</div>
                                </div>
                            )}

                            <div className="items-center gap-4 grid grid-cols-3">
                                <Label>Layanan</Label>
                                <div className="col-span-2">{selectedQueue.service.name}</div>
                            </div>

                            <div className="items-center gap-4 grid grid-cols-3">
                                <Label>Waktu Daftar</Label>
                                <div className="col-span-2">
                                    {new Date(selectedQueue.createdAt).toLocaleString("id-ID")}
                                </div>
                            </div>

                            {selectedQueue.startTime && (
                                <div className="items-center gap-4 grid grid-cols-3">
                                    <Label>Waktu Mulai</Label>
                                    <div className="col-span-2">
                                        {new Date(selectedQueue.startTime).toLocaleString("id-ID")}
                                    </div>
                                </div>
                            )}

                            {selectedQueue.endTime && (
                                <div className="items-center gap-4 grid grid-cols-3">
                                    <Label>Waktu Selesai</Label>
                                    <div className="col-span-2">
                                        {new Date(selectedQueue.endTime).toLocaleString("id-ID")}
                                    </div>
                                </div>
                            )}

                            {selectedQueue.admin && (
                                <div className="items-center gap-4 grid grid-cols-3">
                                    <Label>Petugas</Label>
                                    <div className="col-span-2">{selectedQueue.admin.name}</div>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                                Tutup
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
