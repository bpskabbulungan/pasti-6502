"use client";

import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { format, startOfToday, startOfWeek, startOfMonth, subMonths } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, DownloadIcon, PieChart, RefreshCcw } from "lucide-react";
import AnalyticsSkeleton from "@/modules/dashboard/components/skeletons/AnalyticsSkeleton";
import type { AnalyticsSummary } from "@shared/types/analytics";
import type {
    XAxisProps,
    YAxisProps,
    TooltipProps,
    LegendProps,
    BarProps,
    PieProps,
    CartesianGridProps,
} from "recharts";
import type { ValueType, NameType, Payload as TooltipPayload } from "recharts/types/component/DefaultTooltipContent";

// Lazy-load recharts to reduce main bundle
const ResponsiveContainer = dynamic(
    () => import("recharts").then((m) => m.ResponsiveContainer),
    { ssr: false }
);
const RechartsBarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const RechartsPieChart = dynamic(() => import("recharts").then((m) => m.PieChart), { ssr: false });
const XAxis = dynamic(
    () => import("recharts").then((m) => ({ default: m.XAxis as unknown as React.ComponentType<XAxisProps> })),
    {
        ssr: false,
    }
) as unknown as React.ComponentType<XAxisProps>;
const YAxis = dynamic(
    () => import("recharts").then((m) => ({ default: m.YAxis as unknown as React.ComponentType<YAxisProps> })),
    {
        ssr: false,
    }
) as unknown as React.ComponentType<YAxisProps>;
const CartesianGrid = dynamic(
    () => import("recharts").then((m) => ({ default: m.CartesianGrid as unknown as React.ComponentType<CartesianGridProps> })),
    {
        ssr: false,
    }
) as unknown as React.ComponentType<CartesianGridProps>;
const Tooltip = dynamic(
    () => import("recharts").then((m) => ({ default: m.Tooltip as unknown as React.ComponentType<TooltipProps<ValueType, NameType>> })),
    { ssr: false }
) as unknown as React.ComponentType<TooltipProps<ValueType, NameType>>;
const Legend = dynamic(
    () => import("recharts").then((m) => ({ default: m.Legend as unknown as React.ComponentType<LegendProps> })),
    { ssr: false }
) as unknown as React.ComponentType<LegendProps>;
const Bar = dynamic(
    () => import("recharts").then((m) => ({ default: m.Bar as unknown as React.ComponentType<BarProps> })),
    {
        ssr: false,
    }
) as unknown as React.ComponentType<BarProps>;
const Pie = dynamic(
    () => import("recharts").then((m) => ({ default: m.Pie as unknown as React.ComponentType<PieProps> })),
    {
        ssr: false,
    }
) as unknown as React.ComponentType<PieProps>;
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });

type AnalyticsData = AnalyticsSummary;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

export default function AnalyticsPage() {
    const { data: session } = useSession({
        required: false,
        onUnauthenticated() {
            // Handle unauthenticated users
        }
    });
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<string>("today");
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [dataHash, setDataHash] = useState<string>(""); // Tambahkan state untuk hash data
    const [visibilityState, setVisibilityState] = useState<string>("visible"); // Track browser tab visibility

    const fetchAnalyticsData = useCallback(async (currentRange: string) => {
        if (!session) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            let startDate;
            const today = new Date();

            switch (currentRange) {
                case "today":
                    startDate = startOfToday();
                    break;
                case "week":
                    startDate = startOfWeek(today, { weekStartsOn: 1 });
                    break;
                case "month":
                    startDate = startOfMonth(today);
                    break;
                case "3months":
                    startDate = subMonths(today, 3);
                    break;
                default:
                    startDate = startOfToday();
            }

            const formattedStartDate = format(startDate, "yyyy-MM-dd");
            // Tambahkan parameter hash untuk mendukung pengecekan perubahan data
            const url = `${dataHash ? `&hash=${dataHash}` : ''}`;
            const response = await fetch(`/api/analytics?startDate=${formattedStartDate}${url}`);

            if (response.ok) {
                const data = await response.json();

                // Cek apakah data berubah (jika API mendukung fitur ini)
                if (!data.hasOwnProperty('hasChanges') || data.hasChanges) {
                    setAnalyticsData(data);
                    if (data.hash) setDataHash(data.hash);

                    // Gunakan timestamp dari server jika tersedia
                    if (data.dataLastUpdatedAt) {
                        setLastUpdated(new Date(data.dataLastUpdatedAt));
                    } else {
                        setLastUpdated(new Date());
                    }
                }
            } else {
                toast.error("Gagal memuat data analitik");
                setAnalyticsData(null); // Clear data on error
            }
        } catch (error) {
            console.error("Error fetching analytics data:", error);
            toast.error("Terjadi kesalahan saat memuat data analitik");
            setAnalyticsData(null); // Clear data on error
        } finally {
            setLoading(false);
        }
    }, [session, dataHash]); // Tambahkan dataHash sebagai dependency    // Initial load saat component mount atau timeRange berubah
    useEffect(() => {
        if (session) {
            fetchAnalyticsData(timeRange);
        } else {
            // No session, clear data and reset loading state
            setAnalyticsData(null);
            setLastUpdated(null);
            setLoading(false);
        }
    }, [session, timeRange, fetchAnalyticsData]);

    // Setup document visibility listener to avoid refreshing when tab is hidden/inactive
    useEffect(() => {
        // Track if the document is visible or hidden
        const handleVisibilityChange = () => {
            setVisibilityState(document.visibilityState);
        };

        // Add visibility change listener
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Set initial state
        setVisibilityState(document.visibilityState);

        // Cleanup
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Setup polling for data changes instead of continuous refresh
    useEffect(() => {
        if (!session) return;

        // Flag to track if this component is still mounted
        let isMounted = true;
        // Use polling instead of SSE for more reliable experience
        const pollInterval = 60000; // Poll every 60 seconds (adjust as needed)
        let pollTimer: NodeJS.Timeout | null = null;        // Function to poll for changes
        const pollForChanges = async () => {
            if (!isMounted || visibilityState !== "visible") return;

            try {
                // Use existing dataHash to check for changes
                const startDate = format(
                    timeRange === "today" ? startOfToday() :
                        timeRange === "week" ? startOfWeek(new Date(), { weekStartsOn: 1 }) :
                            timeRange === "month" ? startOfMonth(new Date()) :
                                timeRange === "3months" ? subMonths(new Date(), 3) :
                                    startOfToday(),
                    "yyyy-MM-dd"
                );

                const url = `/api/analytics?startDate=${startDate}${dataHash ? `&hash=${dataHash}` : ''}`;
                const response = await fetch(url);

                if (response.ok && isMounted) {
                    const data = await response.json();

                    // Only update if there are changes
                    if (!data.hasOwnProperty('hasChanges') || data.hasChanges) {
                        console.log('Perubahan data analitik terdeteksi melalui polling');
                        setAnalyticsData(data);
                        if (data.hash) setDataHash(data.hash);

                        // Update timestamp using server time if available, or current time
                        if (data.dataLastUpdatedAt) {
                            setLastUpdated(new Date(data.dataLastUpdatedAt));
                        } else {
                            setLastUpdated(new Date());
                        }
                    }
                }
            } catch (error) {
                console.error('Error polling for analytics data:', error);
            }

            // Schedule next poll if component is still mounted
            if (isMounted) {
                pollTimer = setTimeout(pollForChanges, pollInterval);
            }
        };

        // Initial poll
        pollForChanges();        // Cleanup function
        return () => {
            isMounted = false;
            if (pollTimer) clearTimeout(pollTimer);
        };
    }, [session, timeRange, dataHash, fetchAnalyticsData, visibilityState]);

    const handleExportData = async (exportFormat: string) => {
        try {
            // Calculate date range based on selection
            let startDate;
            const today = new Date();

            switch (timeRange) {
                case "today":
                    startDate = startOfToday();
                    break;
                case "week":
                    startDate = startOfWeek(today, { weekStartsOn: 1 });
                    break;
                case "month":
                    startDate = startOfMonth(today);
                    break;
                case "3months":
                    startDate = subMonths(today, 3);
                    break;
                default:
                    startDate = startOfToday();
            }

            const formattedStartDate = format(startDate, "yyyy-MM-dd");

            // Create a download link for the exported data
            const a = document.createElement("a");
            a.href = `/api/analytics/export?startDate=${formattedStartDate}&format=${exportFormat}`;
            a.download = `pst-queue-report-${format(new Date(), "yyyy-MM-dd")}.${exportFormat}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            toast.success(`Data berhasil diekspor dalam format ${exportFormat.toUpperCase()}`);
        } catch (error) {
            console.error("Error exporting data:", error);
            toast.error("Terjadi kesalahan saat mengekspor data");
        }
    };

    if (!session) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="font-bold text-2xl">Analitik Antrean</h1>
                    <p className="text-muted-foreground">
                        Visualisasi dan laporan antrean PST {/* PST is maintained as per original */}
                    </p>
                </div>

                <div className="flex sm:flex-row flex-col gap-2">
                    <Select defaultValue={timeRange} onValueChange={(value) => setTimeRange(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Pilih rentang waktu" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Hari Ini</SelectItem>
                            <SelectItem value="week">Minggu Ini</SelectItem>
                            <SelectItem value="month">Bulan Ini</SelectItem>
                            <SelectItem value="3months">3 Bulan Terakhir</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => handleExportData("csv")} disabled={loading}>
                            <DownloadIcon className="mr-2 w-4 h-4" />
                            CSV
                        </Button>
                        <Button variant="outline" onClick={() => handleExportData("json")} disabled={loading}>
                            <DownloadIcon className="mr-2 w-4 h-4" />
                            JSON
                        </Button>
                    </div>
                </div>
            </div>            <div className="flex justify-between items-center">
                <div className="text-muted-foreground text-sm">
                    Data terakhir diperbarui: {lastUpdated ? lastUpdated.toLocaleString("id-ID", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : (loading && !analyticsData ? "Memuat data awal..." : "Belum ada data")}
                    {analyticsData?.trackLastUpdated && (
                        <div className="mt-1">
                            Data antrean track terakhir: {new Date(analyticsData.trackLastUpdated).toLocaleString("id-ID", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                    )}
                </div>
                <Button
                    onClick={() => fetchAnalyticsData(timeRange)} // Ensure this calls the new fetchStats
                    disabled={loading}
                    className="flex items-center gap-2 bg-[var(--primary)] hover:bg-orange-800 text-[var(--primary-foreground)] transition-colors duration-200"
                    aria-label="Perbarui data statistik"
                >
                    <RefreshCcw className="w-4 h-4" />
                    <span>Perbarui Data</span>
                </Button>            </div>

            {loading ? (
                <AnalyticsSkeleton />
            ) : analyticsData ? (
                <div className="space-y-6">                    {/* Summary Cards */}
                    <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="font-medium text-sm">Total Pengunjung</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="font-bold text-2xl">{analyticsData.summary.totalVisitors}</div>
                                {analyticsData.queueTypeDistribution && (
                                    <div className="flex flex-col gap-1 mt-2 text-muted-foreground text-xs">
                                        {analyticsData.queueTypeDistribution.map(type => (
                                            <div key={type.name} className="flex justify-between">
                                                <span>{type.name}:</span>
                                                <span className="font-medium">{type.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="font-medium text-sm">Layanan Selesai</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="font-bold text-2xl">{analyticsData.summary.completedServices}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="font-medium text-sm">Rata-rata Waktu Tunggu</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="font-bold text-2xl">{analyticsData.summary.averageWaitTimeMinutes} menit</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="font-medium text-sm">Rata-rata Waktu Layanan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="font-bold text-2xl">{analyticsData.summary.averageServiceTimeMinutes} menit</div>
                            </CardContent>
                        </Card>
                    </div>{/* Charts */}
                    <div className="gap-4 grid md:grid-cols-2">
                        {/* Service Distribution Pie Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <PieChart className="mr-2 w-5 h-5" />
                                    Distribusi Layanan
                                </CardTitle>
                                <CardDescription>
                                    Persentase pengunjung berdasarkan jenis layanan
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-80">
                                {analyticsData.serviceDistribution.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsPieChart>
                                            <Pie
                                                data={analyticsData.serviceDistribution}
                                                dataKey="count"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                fill="#8884d8"
                                                label={({ name, percentage }: { name: string; percentage: number }) =>
                                                    `${name}: ${percentage}%`
                                                }
                                            >
                                                {analyticsData.serviceDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value: ValueType, _name: NameType, payload: TooltipPayload<ValueType, NameType>) => [
                                                    `${value} pengunjung`,
                                                    payload?.payload?.name ?? "",
                                                ]}
                                            />
                                            <Legend />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex justify-center items-center h-full">
                                        <p className="text-muted-foreground">Tidak ada data layanan</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Queue Type Distribution Pie Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <PieChart className="mr-2 w-5 h-5" />
                                    Tipe Antrean
                                </CardTitle>
                                <CardDescription>
                                    Persentase pengunjung berdasarkan tipe antrean (Online/Offline)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-80">
                                {analyticsData.queueTypeDistribution && analyticsData.queueTypeDistribution.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsPieChart>
                                            <Pie
                                                data={analyticsData.queueTypeDistribution}
                                                dataKey="count"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                fill="#8884d8"
                                                label={({ name, percentage }: { name: string; percentage: number }) =>
                                                    `${name}: ${percentage}%`
                                                }
                                            >
                                                <Cell fill="#0088FE" /> {/* Blue for Online */}
                                                <Cell fill="#00C49F" /> {/* Green for Offline */}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value: ValueType, _name: NameType, payload: TooltipPayload<ValueType, NameType>) => [
                                                    `${value} pengunjung`,
                                                    payload?.payload?.name ?? "",
                                                ]}
                                            />
                                            <Legend />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex justify-center items-center h-full">
                                        <p className="text-muted-foreground">Tidak ada data tipe antrean</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Admin Performance Bar Chart row */}
                    <div className="gap-4 grid md:grid-cols-1">
                        {/* Admin Performance Bar Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <BarChart className="mr-2 w-5 h-5" />
                                    Kinerja Admin
                                </CardTitle>
                                <CardDescription>
                                    Jumlah layanan yang diselesaikan per admin
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-80">
                                {analyticsData.adminPerformance.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsBarChart
                                            data={analyticsData.adminPerformance}
                                            layout="vertical"
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" />
                                            <YAxis dataKey="adminName" type="category" width={100} />
                                            <Tooltip formatter={(value: ValueType) => [`${value} layanan`, "Jumlah Layanan"]} />
                                            <Legend />
                                            <Bar dataKey="completedCount" name="Jumlah Layanan" fill="#8884d8" />
                                        </RechartsBarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex justify-center items-center h-full">
                                        <p className="text-muted-foreground">Tidak ada data kinerja admin</p>
                                    </div>
                                )}
                            </CardContent>                        </Card>
                    </div>

                    {/* Daily Trends Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tren Layanan per Hari</CardTitle>
                            <CardDescription>
                                Jumlah antrean per hari berdasarkan status
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                            {analyticsData.dailyTrends.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsBarChart
                                        data={analyticsData.dailyTrends}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="waiting" name="Menunggu" fill="#FFBB28" />
                                        <Bar dataKey="completed" name="Selesai" fill="#00C49F" />
                                        <Bar dataKey="canceled" name="Dibatalkan" fill="#FF8042" />
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex justify-center items-center h-full">
                                    <p className="text-muted-foreground">Tidak ada data tren harian</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Peak Hours Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Jam Sibuk</CardTitle>
                            <CardDescription>
                                Distribusi pengunjung berdasarkan jam
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                            {analyticsData.timeAnalysis.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsBarChart
                                        data={analyticsData.timeAnalysis}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="hourOfDay" tickFormatter={(hour: number) => `${hour}:00`} />
                                        <YAxis />
                                        <Tooltip labelFormatter={(hour: number) => `Jam ${hour}:00`} />
                                        <Legend />
                                        <Bar dataKey="count" name="Jumlah Pengunjung" fill="#8884d8" />
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex justify-center items-center h-full">
                                    <p className="text-muted-foreground">Tidak ada data analisis waktu</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="flex justify-center items-center min-h-[400px]">
                    <p>Gagal memuat data analitik</p>
                </div>
            )}
        </div>
    );
}

