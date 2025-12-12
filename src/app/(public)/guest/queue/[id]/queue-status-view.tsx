"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@/components/ui/alert";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Clock, CheckCircle2, AlertCircle } from "lucide-react";

type QueueStatus = "WAITING" | "SERVING" | "COMPLETED" | "CANCELED";

type QueueData = {
	queueId: string;
	queueNumber: number;
	status: QueueStatus;
	queueType: "ONLINE" | "OFFLINE";
	serviceName: string;
	visitorName: string;
	createdAt: string;
	startTime: string | null;
	endTime: string | null;
	updatedAt: string;
};

const statusCopy: Record<
	QueueStatus,
	{ title: string; desc: string; badge: string }
> = {
	WAITING: {
		title: "Menunggu giliran",
		desc: "Silakan bersabar, petugas akan memanggil sesuai urutan.",
		badge: "bg-yellow-100 text-yellow-800",
	},
	SERVING: {
		title: "Sedang dilayani",
		desc: "Anda sedang diproses oleh petugas.",
		badge: "bg-blue-100 text-blue-800",
	},
	COMPLETED: {
		title: "Selesai",
		desc: "Pelayanan Anda telah selesai, terima kasih.",
		badge: "bg-emerald-100 text-emerald-800",
	},
	CANCELED: {
		title: "Dibatalkan",
		desc: "Antrean telah dibatalkan oleh petugas.",
		badge: "bg-red-100 text-red-800",
	},
};

function formatQueueDate(iso: string) {
	const date = new Date(iso);
	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	return `${day}${month}`;
}

function formatTime(iso?: string | null) {
	if (!iso) return "-";
	return new Date(iso).toLocaleTimeString("id-ID", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

export default function QueueStatusView({ queueId }: { queueId: string }) {
	const router = useRouter();
	const [data, setData] = useState<QueueData | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

	const queueCode = useMemo(() => {
		if (!data) return "--";
		return `${data.queueNumber}-${formatQueueDate(data.createdAt)}`;
	}, [data]);

	const fetchStatus = async () => {
		if (!queueId) return;
		setIsLoading(true);
		try {
			const response = await fetch(`/api/queue/${queueId}`, {
				cache: "no-store",
			});
			const result = await response.json();

			if (!response.ok) {
				setError(result.error || "Gagal memuat status antrean");
				setData(null);
				return;
			}

			setData(result as QueueData);
			setError(null);
			setLastUpdated(new Date());
		} catch (err) {
			console.error("Error fetching queue status", err);
			setError("Terjadi kesalahan saat memuat status");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		void fetchStatus();
		const interval = setInterval(() => {
			void fetchStatus();
		}, 7000);

		return () => clearInterval(interval);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [queueId]);

	return (
		<main className="relative min-h-screen bg-gradient-to-b from-background via-background to-primary/5 px-4 py-8">
			<div className="pointer-events-none absolute left-6 top-8 h-28 w-28 rounded-full bg-primary/20 blur-3xl md:left-16" />
			<div className="pointer-events-none absolute right-10 top-24 h-32 w-32 rounded-full bg-secondary/30 blur-3xl" />
			<div className="relative mx-auto flex max-w-3xl flex-col gap-5">
				<Card className="border-none bg-card/90 shadow-xl backdrop-blur">
					<CardHeader className="space-y-2">
						<CardTitle className="text-2xl md:text-3xl">
							Terima kasih, data Anda sudah tersimpan.
						</CardTitle>
						<CardDescription>
							Nomor antrean dibuat otomatis berdasarkan urutan hari ini.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex flex-wrap items-center gap-3">
							<div>
								<p className="text-sm text-muted-foreground">
									Nomor Antrean Anda
								</p>
								<p className="text-4xl font-bold tracking-tight md:text-5xl">
									{queueCode}
								</p>
							</div>
							{data?.status ? (
								<Badge
									variant="outline"
									className={`${statusCopy[data.status].badge} px-3 py-1 text-sm font-semibold`}
								>
									Status: {statusCopy[data.status].title}
								</Badge>
							) : null}
							{data?.queueType ? (
								<Badge variant="outline" className="bg-muted">
									{data.queueType === "ONLINE" ? "Online" : "Offline"}
								</Badge>
							) : null}
						</div>

						{data ? (
							<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
								<div className="rounded-lg border border-border/80 bg-background p-4">
									<p className="text-sm font-semibold text-foreground">
										Status: {statusCopy[data.status].title}
									</p>
									<p className="text-sm text-muted-foreground">
										{statusCopy[data.status].desc}
									</p>
									<div className="mt-3 grid grid-cols-2 gap-2 text-sm">
										<span className="text-muted-foreground">Layanan</span>
										<span className="font-semibold text-foreground">
											{data.serviceName}
										</span>
										<span className="text-muted-foreground">Nama</span>
										<span className="font-semibold text-foreground">
											{data.visitorName}
										</span>
										<span className="text-muted-foreground">Dibuat</span>
										<span className="text-foreground">
											{formatTime(data.createdAt)}
										</span>
										<span className="text-muted-foreground">Mulai</span>
										<span className="text-foreground">
											{formatTime(data.startTime)}
										</span>
										<span className="text-muted-foreground">Selesai</span>
										<span className="text-foreground">
											{formatTime(data.endTime)}
										</span>
									</div>
								</div>
								<div className="flex flex-col justify-between gap-3 rounded-lg border border-dashed border-border/70 bg-muted/60 p-4">
									<div className="flex items-start gap-2">
										<Clock className="mt-0.5 h-5 w-5 text-primary" />
										<div>
											<p className="font-semibold text-foreground">
												Pembaruan otomatis
											</p>
											<p className="text-sm text-muted-foreground">
												Status diperbarui tiap 7 detik. Klik tombol di bawah
												untuk memuat ulang manual.
											</p>
										</div>
									</div>
									<div className="flex flex-wrap items-center gap-3">
										<Button
											variant="secondary"
											onClick={() => fetchStatus()}
											disabled={isLoading}
											className="flex items-center gap-2"
										>
											<RefreshCcw
												className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
											/>
											Muat ulang
										</Button>
										<div className="text-xs text-muted-foreground">
											Terakhir diperbarui:{" "}
											{lastUpdated
												? lastUpdated.toLocaleTimeString("id-ID", {
														hour: "2-digit",
														minute: "2-digit",
												  })
												: "Baru saja"}
										</div>
									</div>
								</div>
							</div>
						) : (
							<div className="rounded-lg border border-dashed border-border/80 bg-muted/60 p-4">
								<p className="text-muted-foreground">
									{isLoading
										? "Memuat status antrean..."
										: "Status antrean belum tersedia."}
								</p>
							</div>
						)}
					</CardContent>
				</Card>

				{error ? (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Gagal memuat</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				) : null}

				<Alert className="border-none bg-gradient-to-r from-primary/20 via-card to-secondary/30 text-foreground">
					<CheckCircle2 className="h-4 w-4 text-primary" />
					<AlertTitle>Butuh bantuan?</AlertTitle>
					<AlertDescription className="text-sm">
						Tunjukkan kode antrean kepada petugas PST untuk verifikasi.
						Jika halaman ini tidak diperbarui, tekan <strong>Muat ulang</strong>
						atau kembali ke buku tamu.
					</AlertDescription>
					<div className="mt-3">
						<Button variant="outline" size="sm" onClick={() => router.push("/guest")}>
							Kembali ke Buku Tamu
						</Button>
					</div>
				</Alert>
			</div>
		</main>
	);
}
