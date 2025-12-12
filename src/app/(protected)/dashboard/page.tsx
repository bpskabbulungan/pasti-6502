"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Role } from "@/generated/prisma";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Hourglass, Users, CheckCircle, XCircle, RefreshCcw, Settings } from "lucide-react";
import AuthLoadingSkeleton from "@/modules/dashboard/components/skeletons/AuthLoadingSkeleton";
import DashboardSkeleton from "@/modules/dashboard/components/skeletons/DashboardSkeleton";

interface DashboardStats {
    counts: {
        waiting: number;
        serving: number;
        completed: number;
        canceled: number;
        total: number;
    };
    averages: {
        waitTimeMinutes: number;
        serviceTimeMinutes: number;
    };
    hash?: string;
    hasChanges?: boolean;
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null); // State untuk menyimpan waktu update terakhir
    const [dataHash, setDataHash] = useState<string>(""); // Track data hash for change detection

    const fetchStats = useCallback(async (forceRefresh: boolean = false) => {
        if (!session) {
            setLoading(false);
            return;
        }

        // Only show loading indicator on forced refresh or initial load
        if (forceRefresh || !stats) {
            setLoading(true);
        }

        try {
            // Add hash parameter to check for changes unless force refreshing
            const url = `/api/dashboard/stats${!forceRefresh && dataHash ? `?hash=${dataHash}` : ''}`;

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();

                // Only update if there are changes or initial load or force refresh
                if (forceRefresh || !data.hasOwnProperty('hasChanges') || data.hasChanges) {
                    setStats(data);
                    setLastUpdatedAt(new Date()); // Set waktu saat ini sebagai waktu update terakhir

                    // Store the hash for future comparisons
                    if (data.hash) setDataHash(data.hash);
                }
            } else {
                const errorData = await response.json().catch(() => ({ error: "Gagal memuat statistik" }));
                toast.error(errorData.error || "Gagal memuat statistik");
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
            toast.error("Terjadi kesalahan saat memuat statistik");
        } finally {
            if (forceRefresh || !stats) {
                setLoading(false);
            }
        }
    }, [session, dataHash, stats]);

    // Setup polling for data changes with change detection
    useEffect(() => {
        if (!session) return;

        // Initial fetch
        fetchStats();

        // Set up polling for changes
        const pollInterval = 30000; // Poll every 30 seconds
        let pollTimer: NodeJS.Timeout | null = null;

        // Function to poll for changes
        const pollForChanges = () => {
            if (document.visibilityState === "visible") {
                fetchStats(false); // Don't force refresh on polling
            }

            // Schedule next poll
            pollTimer = setTimeout(pollForChanges, pollInterval);
        };

        // Start polling
        pollTimer = setTimeout(pollForChanges, pollInterval);

        // Track document visibility to pause polling when tab is not visible
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible" && pollTimer === null) {
                // Resume polling when tab becomes visible again
                fetchStats();
                pollTimer = setTimeout(pollForChanges, pollInterval);
            }
        };

        // Add visibility change listener
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (pollTimer) clearTimeout(pollTimer);
        };
    }, [fetchStats, session]); if (!session && loading) {
        // Use Auth Loading Skeleton component for better UX
        return <AuthLoadingSkeleton />;
    }

    if (!session) {
        return <AuthLoadingSkeleton />;
    }

    return (
        <div className="space-y-8 mx-auto px-4 py-6 container">
            {/* Header Section */}
            <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                    <h1 className="font-bold text-text-primary text-3xl">Dashboard</h1>
                    <p className="text-secondary-color">Statistik antrean hari ini.</p>
                </div>
                <div className="flex gap-2">
                    {session.user.role === Role.ADMIN && (
                        <Link href="/dashboard/ui-showcase">
                            <Button
                                variant="outline"
                                className="flex items-center gap-2 hover:bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)]"
                                aria-label="UI Showcase"
                            >
                                <span>UI Showcase</span>
                            </Button>
                        </Link>
                    )}                    <Button
                        onClick={() => fetchStats(true)} // Call with forceRefresh=true
                        disabled={loading}
                        className="flex items-center gap-2 bg-[var(--primary)] hover:bg-orange-800 transition-colors duration-200"
                        aria-label="Perbarui data statistik"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        <span>Perbarui Data</span>
                    </Button>
                </div>
            </div>
            <div className="text-secondary-color text-xs md:text-sm">
                Data per: {lastUpdatedAt
                    ? new Intl.DateTimeFormat('id-ID', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
                    }).format(lastUpdatedAt)
                    : (loading && !stats ? "Memuat data awal..." : "Belum ada data")}
            </div>            {loading && !stats ? (
                <DashboardSkeleton />
            ) : stats ? (
                <>
                    {/* Metric Cards */}
                    <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="bg-surface shadow-md hover:shadow-lg border-custom h-full overflow-hidden transition-all duration-200">
                            <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                                <CardTitle className="font-semibold text-primary-color text-base">Antrean Menunggu</CardTitle>
                                <Hourglass className="w-5 h-5 text-accent" />
                            </CardHeader>
                            <CardContent>
                                <div className="font-bold text-primary-color text-2xl md:text-3xl">{stats.counts.waiting}</div>
                                <p className="mt-1 text-secondary-color text-xs">
                                    Pengunjung yang sedang menunggu layanan
                                </p>
                            </CardContent>
                            <CardFooter className="mt-auto pt-2">
                                <Link href="/dashboard/queue" className="w-full">
                                    <Button variant="ghost" className="justify-start p-2 w-full text-accent hover:text-muted text-xs">Lihat Detail</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                        <Card className="bg-surface shadow-md hover:shadow-lg border-custom h-full overflow-hidden transition-all duration-200">
                            <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                                <CardTitle className="font-semibold text-primary-color text-base">Sedang Dilayani</CardTitle>
                                <Users className="w-5 h-5 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="font-bold text-primary-color text-2xl md:text-3xl">{stats.counts.serving}</div>
                                <p className="mt-1 text-secondary-color text-xs">
                                    Pengunjung yang sedang dalam proses layanan
                                </p>
                            </CardContent>
                            <CardFooter className="mt-auto pt-2">
                                <Link href="/dashboard/queue#serving" className="w-full">
                                    <Button variant="ghost" className="justify-start p-2 w-full text-primary hover:text-muted text-xs">Lihat Detail</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                        <Card className="bg-surface shadow-md hover:shadow-lg border-custom h-full overflow-hidden transition-all duration-200">
                            <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                                <CardTitle className="font-semibold text-primary-color text-base">Selesai Dilayani</CardTitle>
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="font-bold text-primary-color text-2xl md:text-3xl">{stats.counts.completed}</div>
                                <p className="mt-1 text-secondary-color text-xs">
                                    Layanan yang telah selesai hari ini
                                </p>
                            </CardContent>
                            <CardFooter className="mt-auto pt-2">
                                <Link href="/dashboard/all-queues?status=COMPLETED" className="w-full">
                                    <Button variant="ghost" className="justify-start p-2 w-full text-green-500 hover:text-muted text-xs">Lihat Detail</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                        <Card className="bg-surface shadow-md hover:shadow-lg border-custom h-full overflow-hidden transition-all duration-200">
                            <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                                <CardTitle className="font-semibold text-primary-color text-base">Dibatalkan</CardTitle>
                                <XCircle className="w-5 h-5 text-destructive" />
                            </CardHeader>
                            <CardContent>
                                <div className="font-bold text-primary-color text-2xl md:text-3xl">{stats.counts.canceled}</div>
                                <p className="mt-1 text-secondary-color text-xs">
                                    Antrean yang dibatalkan hari ini
                                </p>
                            </CardContent>
                            <CardFooter className="mt-auto pt-2">
                                <Link href="/dashboard/all-queues?status=CANCELED" className="w-full">
                                    <Button variant="ghost" className="justify-start p-2 w-full text-destructive hover:text-muted text-xs">Lihat Detail</Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Detailed Stat Cards */}                    <div className="gap-6 grid md:grid-cols-2 mt-8">
                        <Card className="bg-surface shadow-md hover:shadow-lg border-custom overflow-hidden transition-all duration-200">
                            <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                                <CardTitle className="font-semibold text-primary-color text-base">Rata-rata Waktu Tunggu</CardTitle>
                                <RefreshCcw className="w-5 h-5 text-accent" />
                            </CardHeader>
                            <CardContent>
                                <div className="font-bold text-accent text-2xl md:text-3xl">
                                    {stats.averages.waitTimeMinutes} <span className="font-normal text-secondary-color text-sm">menit</span>
                                </div>
                                <p className="mt-1 text-secondary-color text-xs">
                                    Waktu rata-rata pengunjung menunggu sebelum dilayani
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-surface shadow-md hover:shadow-lg border-custom overflow-hidden transition-all duration-200">
                            <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                                <CardTitle className="font-semibold text-primary-color text-base">Rata-rata Waktu Layanan</CardTitle>
                                <RefreshCcw className="w-5 h-5 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="font-bold text-primary text-2xl md:text-3xl">
                                    {stats.averages.serviceTimeMinutes} <span className="font-normal text-secondary-color text-sm">menit</span>
                                </div>
                                <p className="mt-1 text-secondary-color text-xs">
                                    Durasi rata-rata layanan per pengunjung
                                </p>
                            </CardContent>
                        </Card>
                    </div>                    {/* Admin section */}
                    {session.user.role === Role.SUPERADMIN && (
                        <div className="gap-6 grid md:grid-cols-2 mt-8">
                            <Card className="bg-surface shadow-md hover:shadow-lg border-custom overflow-hidden transition-all duration-200">
                                <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                                    <CardTitle className="font-semibold text-primary-color text-base">Total Pengunjung Hari Ini</CardTitle>
                                    <Users className="w-5 h-5 text-info" />
                                </CardHeader>
                                <CardContent>
                                    <div className="font-bold text-info text-2xl md:text-3xl">
                                        {stats.counts.total} <span className="font-normal text-secondary-color text-sm">pengunjung</span>
                                    </div>
                                    <p className="mt-1 text-secondary-color text-xs">
                                        Jumlah total pengunjung yang terdaftar hari ini
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="bg-surface shadow-md hover:shadow-lg border-custom overflow-hidden transition-all duration-200">
                                <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                                    <CardTitle className="font-semibold text-primary-color text-base">Pengaturan Sistem</CardTitle>
                                    <Settings className="w-5 h-5 text-info" />
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-3 text-secondary-color text-xs">
                                        Akses cepat ke halaman konfigurasi sistem
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <Link href="/dashboard/services">
                                            <Button variant="outline" size="sm" className="text-xs">Kelola Layanan</Button>
                                        </Link>
                                        <Link href="/dashboard/users">
                                            <Button variant="outline" size="sm" className="text-xs">Kelola Pengguna</Button>
                                        </Link>
                                        <Link href="/dashboard/qrcode">
                                            <Button variant="outline" size="sm" className="text-xs">QR Code</Button>
                                        </Link>
                                        <Link href="/dashboard/analytics">
                                            <Button variant="outline" size="sm" className="text-xs">Analisis</Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}{/* User Manual Card */}
                    <div className="mt-8">
                        <Card className="bg-surface shadow-md hover:shadow-lg border-custom overflow-hidden transition-all duration-200">
                            <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                                <CardTitle className="font-semibold text-primary-color text-base">Panduan Pengguna</CardTitle>
                                <Users className="w-5 h-5 text-info" />
                            </CardHeader>
                            <CardContent>
                                <div className="gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                    <div className="hover:shadow-sm p-3 border border-border rounded-lg transition-all duration-200">
                                        <h4 className="mb-2 font-medium text-primary-color text-sm">Cara Melihat Antrean</h4>
                                        <p className="text-secondary-color text-xs">Klik tombol &ldquo;Lihat Detail&rdquo; pada kartu Antrean Menunggu untuk melihat daftar antrean saat ini.</p>
                                    </div>
                                    <div className="hover:shadow-sm p-3 border border-border rounded-lg transition-all duration-200">
                                        <h4 className="mb-2 font-medium text-primary-color text-sm">Cara Melayani Pengunjung</h4>
                                        <p className="text-secondary-color text-xs">Pilih pengunjung dari daftar antrean dan klik tombol &ldquo;Mulai Layanan&rdquo; untuk memulai proses layanan.</p>
                                    </div>
                                    <div className="hover:shadow-sm p-3 border border-border rounded-lg transition-all duration-200">
                                        <h4 className="mb-2 font-medium text-primary-color text-sm">Cara Menyelesaikan Layanan</h4>
                                        <p className="text-secondary-color text-xs">Setelah selesai melayani pengunjung, klik tombol &ldquo;Selesaikan&rdquo; untuk menandai layanan sebagai selesai.</p>
                                    </div>
                                    <div className="hover:shadow-sm p-3 border border-border rounded-lg transition-all duration-200">
                                        <h4 className="mb-2 font-medium text-primary-color text-sm">Memperbarui Data</h4>
                                        <p className="text-secondary-color text-xs">Klik tombol &ldquo;Perbarui Data&rdquo; di pojok kanan atas untuk memuat ulang data terbaru.</p>
                                    </div>
                                    <div className="hover:shadow-sm p-3 border border-border rounded-lg transition-all duration-200">
                                        <h4 className="mb-2 font-medium text-primary-color text-sm">Melihat Riwayat</h4>
                                        <p className="text-secondary-color text-xs">Gunakan halaman &ldquo;Selesai Dilayani&rdquo; untuk melihat riwayat layanan yang sudah selesai.</p>
                                    </div>
                                    <div className="hover:shadow-sm p-3 border border-border rounded-lg transition-all duration-200">
                                        <h4 className="mb-2 font-medium text-primary-color text-sm">Bantuan</h4>
                                        <p className="text-secondary-color text-xs">Jika Anda memerlukan bantuan lebih lanjut, hubungi administrator sistem.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            ) : (
                <div className="bg-surface shadow-md p-6 border border-custom rounded-xl text-center">
                    <p className="text-text-secondary">Tidak ada data statistik untuk ditampilkan.</p>                    <Button onClick={() => fetchStats(true)} className="bg-primary hover:bg-primary/90 mt-4 px-4 py-2 rounded text-primary-foreground">
                        Muat Ulang
                    </Button>
                </div>
            )}
        </div>
    );
}
