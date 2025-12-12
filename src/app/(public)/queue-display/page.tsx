"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    RefreshCw,
    ArrowRight,
    UserCog,
    LayoutGrid,
    Calendar,
    Clock3,
    Sparkles,
    UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useSWR from "swr";
import { useQueueDisplay } from "@/modules/queue-display/hooks/useQueueDisplay";

interface Admin {
    id: string;
    name: string;
    role: string;
}

const formatTimestamp = (value: Date | null) =>
    value
        ? new Intl.DateTimeFormat("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        }).format(value)
        : "Belum ada data";

const formatQueueCode = (serviceName: string, queueNumber: number) => {
    const trimmed = serviceName.toLowerCase();
    const prefix = trimmed.startsWith("perpust") ? "P"
        : trimmed.startsWith("konsul") ? "K"
            : trimmed.startsWith("rekomen") ? "R"
                : "L";
    const padded = queueNumber.toString().padStart(3, "0");
    return `${prefix}-${padded}`;
};

export default function QueueDisplayPage() {
    const [selectedAdmin, setSelectedAdmin] = useState<string>("all");
    const [selectedDateFilter, setSelectedDateFilter] = useState<string>("today");

    const {
        servingQueues,
        nextQueue,
        lastUpdatedAt,
        isLoading,
        isValidating,
        error,
        refetch,
    } = useQueueDisplay({ adminId: selectedAdmin, dateFilter: selectedDateFilter });

    const { data: adminData, error: adminError } = useSWR<{ admins: Admin[] }>(
        "/api/queue-display/admins",
        async (url: string) => {
            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok) throw new Error("Failed to fetch admins");
            return res.json();
        },
        { revalidateOnFocus: false }
    );

    const admins = adminData?.admins ?? [];

    const highlightedQueue = useMemo(() => {
        if (nextQueue) return nextQueue;
        if (servingQueues.length > 0) return servingQueues[0];
        return null;
    }, [nextQueue, servingQueues]);

    const handleRefresh = () => {
        toast.info("Memperbarui data antrean...");
        refetch();
    };

    useEffect(() => {
        if (error) {
            toast.error("Gagal memuat data antrean");
        }
    }, [error]);

    useEffect(() => {
        if (adminError) {
            toast.error("Gagal memuat data petugas");
        }
    }, [adminError]);

    return (
        <div
            className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#FFF4EC] via-white to-[#FFE5D3] p-4 md:p-8 dark:from-background dark:via-[#1f1f1f] dark:to-background"
            aria-busy={isValidating}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(247,144,57,0.15),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(154,5,1,0.12),transparent_30%)]" />
            <div className="relative z-10 mx-auto flex w-full max-w-screen-2xl flex-col gap-8">
                <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-custom/80 bg-white/80 px-5 py-4 shadow-md backdrop-blur dark:bg-card">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-primary/10 p-3 text-primary">
                            <LayoutGrid className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary-color">
                                Tampilan Antrean Publik
                            </p>
                            <h1 className="text-2xl font-black text-primary-color md:text-3xl">
                                Informasi Antrean PST
                            </h1>
                            <p className="text-sm text-secondary-color">
                                Nomor yang sedang dan akan dilayani secara real-time.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div
                            className="rounded-full bg-muted/80 px-3 py-2 text-xs text-secondary-color"
                            aria-live="polite"
                        >
                            <Clock3 className="mr-2 inline h-4 w-4 text-primary" />
                            {formatTimestamp(lastUpdatedAt)}
                        </div>
                        <ThemeToggle />
                    </div>
                </header>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:bg-card">
                    <div className="flex flex-wrap gap-3">
                        <Select value={selectedDateFilter} onValueChange={setSelectedDateFilter}>
                            <SelectTrigger className="w-[190px]">
                                <Calendar className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Filter Waktu" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="today">Antrean Hari Ini</SelectItem>
                                <SelectItem value="all">Semua Antrean</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
                            <SelectTrigger className="w-[210px]">
                                <UserRound className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Pilih Petugas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Petugas</SelectItem>
                                {admins.map((admin) => (
                                    <SelectItem key={admin.id} value={admin.id}>
                                        {admin.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2" onClick={handleRefresh} disabled={isLoading || isValidating}>
                            <RefreshCw className={`h-4 w-4 ${isValidating ? "animate-spin" : ""}`} />
                            Perbarui
                        </Button>
                        <Badge variant="secondary" className="gap-2 bg-primary/10 text-primary-color">
                            <Sparkles className="h-4 w-4" />
                            Live update tiap 10 detik
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="relative overflow-hidden border border-custom/80 bg-gradient-to-br from-primary/12 via-white to-white shadow-lg dark:from-primary/10 dark:via-card dark:to-card">
                        <div className="absolute right-4 top-4 h-24 w-24 rounded-full bg-primary/10 blur-3xl" />
                        <CardHeader className="relative pb-2">
                            <CardTitle className="text-xl font-bold text-primary-color">Antrean Berikutnya</CardTitle>
                            <CardDescription className="text-secondary-color">
                                Antrean yang segera dipanggil ke loket.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="relative">
                            {highlightedQueue ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                    <Badge variant="secondary" className="rounded-full bg-white/70 text-primary-color shadow-sm">
                                            Urutan berikutnya
                                        </Badge>
                                        <p className="text-sm text-secondary-color">
                                            {highlightedQueue.queueType === "ONLINE" ? "Online" : "Offline"}
                                        </p>
                                    </div>
                                    <div className="rounded-3xl border border-border/80 bg-white/80 p-8 shadow-lg backdrop-blur dark:bg-card">
                                        <p className="text-sm text-secondary-color">Nomor Antrean</p>
                                        <p className="text-6xl font-black leading-tight text-primary-color md:text-8xl lg:text-9xl">
                                            {formatQueueCode(highlightedQueue.service.name, highlightedQueue.queueNumber)}
                                        </p>
                                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                            <div className="rounded-lg bg-muted/50 px-4 py-3 text-secondary-color">
                                                <p className="font-semibold text-primary-color">Layanan</p>
                                                <p className="text-lg">{highlightedQueue.service.name}</p>
                                            </div>
                                            <div className="rounded-lg bg-muted/50 px-4 py-3 text-secondary-color">
                                                <p className="font-semibold text-primary-color">Petugas</p>
                                                <p className="text-lg">{highlightedQueue.admin?.name || "-"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 bg-white/70 p-10 text-center text-secondary-color backdrop-blur dark:bg-card">
                                    <ArrowRight className="h-12 w-12 text-primary" />
                                    <p className="text-lg font-semibold text-primary-color">Belum ada antrean berikutnya</p>
                                    <p className="text-sm">Data akan muncul otomatis saat antrean baru dibuat.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border border-custom/80 bg-white/80 shadow-lg backdrop-blur dark:bg-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl font-bold text-primary-color">Sedang Dilayani</CardTitle>
                            <CardDescription className="text-secondary-color">
                                Nomor yang saat ini diproses petugas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {servingQueues.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 bg-muted/40 p-10 text-center">
                                    <UserCog className="h-12 w-12 text-primary" />
                                    <p className="text-lg font-semibold text-primary-color">Belum ada antrean aktif</p>
                                    <p className="text-sm text-secondary-color">Nomor akan tampil segera setelah dilayani.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {servingQueues.map((queue) => (
                                        <div
                                            key={queue.id}
                                            className="rounded-3xl border border-border/70 bg-white/80 p-6 shadow-lg backdrop-blur dark:bg-card"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-xs uppercase tracking-wide text-secondary-color">Nomor</p>
                                                    <p className="text-5xl font-black text-primary-color md:text-6xl lg:text-7xl">
                                                        {formatQueueCode(queue.service.name, queue.queueNumber)}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant="secondary"
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${queue.queueType === "ONLINE"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-green-100 text-green-800"
                                                        }`}
                                                >
                                                    {queue.queueType === "ONLINE" ? "Online" : "Offline"}
                                                </Badge>
                                            </div>
                                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                                <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-secondary-color">
                                                    <p className="font-semibold text-primary-color">Layanan</p>
                                                    <p className="text-base">{queue.service.name}</p>
                                                </div>
                                                <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-secondary-color">
                                                    <p className="font-semibold text-primary-color">Petugas</p>
                                                    <p className="text-base">{queue.admin?.name || "-"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <footer className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-white/80 px-4 py-3 text-sm text-secondary-color shadow-sm backdrop-blur dark:bg-card">
                    <div className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4 text-primary" />
                        <span>Data terakhir diperbarui: {formatTimestamp(lastUpdatedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-accent" />
                        <span>Antarmuka publik yang mudah dibaca di layar besar.</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
