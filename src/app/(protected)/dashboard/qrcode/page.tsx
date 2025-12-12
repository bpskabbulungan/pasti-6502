"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import QRCodeSkeleton from "@/modules/dashboard/components/skeletons/QRCodeSkeleton";

export default function QRCodePage() {
	const [isLoading, setIsLoading] = useState(true);
	const [qrImage, setQrImage] = useState<string | null>(null);
	const [qrTargetUrl, setQrTargetUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const generateQr = async () => {
			let staticUuid = process.env.NEXT_PUBLIC_STATIC_UUID;

			if (!staticUuid) {
				try {
					const res = await fetch("/api/qrcode/static-uuid");
					if (res.ok) {
						const data = await res.json();
						staticUuid = data.staticUuid;
					} else {
						const data = await res.json().catch(() => null);
						setError(
							data?.error ||
								"Static UUID belum dikonfigurasi. Set variabel NEXT_PUBLIC_STATIC_UUID terlebih dahulu."
						);
						setIsLoading(false);
						return;
					}
				} catch (err) {
					console.error("Failed to resolve static UUID", err);
					setError(
						"Static UUID belum dikonfigurasi. Set variabel NEXT_PUBLIC_STATIC_UUID terlebih dahulu."
					);
					setIsLoading(false);
					return;
				}
			}

			const preferredBaseUrl = process.env.NEXT_PUBLIC_QR_BASE_URL || "";

			const origin =
				preferredBaseUrl ||
				(typeof window !== "undefined" ? window.location.origin : "");

			if (!origin) {
				setError(
					"Base URL QR tidak ditemukan. Tambahkan NEXT_PUBLIC_QR_BASE_URL atau buka dari domain publik."
				);
				setIsLoading(false);
				return;
			}

			const normalizedOrigin = origin.endsWith("/")
				? origin.slice(0, -1)
				: origin;
			const targetUrl = `${normalizedOrigin}/visitor-form/${staticUuid}`;

			try {
				const dataUrl = await QRCode.toDataURL(targetUrl, {
					color: { dark: "#13254e", light: "#FFFFFF" },
					width: 300,
					margin: 1,
				});
				setQrImage(dataUrl);
				setQrTargetUrl(targetUrl);
			} catch (err) {
				console.error("Failed to generate QR code", err);
				setError("Gagal membuat QR code. Coba muat ulang halaman.");
			} finally {
				setIsLoading(false);
			}
		};

		generateQr();
	}, []);

	const handleDownload = () => {
		if (!qrImage) return;

		const link = document.createElement("a");
		link.href = qrImage;
		link.download = "pst_qrcode.png";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<>
			{isLoading ? (
				<QRCodeSkeleton />
			) : (
				<div className="container mx-auto p-4 md:p-8">
					<h1 className="mb-6 text-center text-2xl font-bold md:text-3xl">
						QR Code PST BPS Bulungan
					</h1>

					<div className="flex flex-col items-center space-y-6">
						<div className="rounded-lg border border-gray-300 bg-[#FFF4EC] p-2 shadow-lg dark:border-gray-700">
							{qrImage ? (
								<Image
									src={qrImage}
									alt="QR Code PST BPS Bulungan"
									width={300}
									height={300}
									priority
								/>
							) : (
								<div className="flex h-[300px] w-[300px] items-center justify-center text-center text-sm text-destructive">
									{error ?? "QR Code tidak tersedia."}
								</div>
							)}
						</div>

						<Button
							onClick={handleDownload}
							className="bg-primary text-primary-foreground hover:bg-primary/90"
							disabled={!qrImage}
						>
							<Download className="mr-2 h-5 w-5" />
							Download QR Code
						</Button>

						{qrTargetUrl ? (
							<p className="max-w-xl break-all text-center text-sm text-muted-foreground">
								Link tujuan QR: {qrTargetUrl}
							</p>
						) : error ? (
							<p className="max-w-xl text-center text-sm text-destructive">
								{error}
							</p>
						) : null}
					</div>

					<div className="mt-8 rounded-lg border bg-card p-6 shadow-sm">
						<h2 className="mb-3 text-xl font-semibold">Informasi QR Code</h2>
						<p className="mb-4 text-gray-600 dark:text-gray-400">
							Scan QR code ini untuk mengakses informasi PST BPS Bulungan secara
							cepat dan mudah.
						</p>
						<div className="rounded-md border border-primary/30 bg-primary/10 p-4">
							<h3 className="mb-2 text-md font-medium">Cara Penggunaan:</h3>
							<ol className="ml-2 list-inside list-decimal space-y-2 text-sm">
								<li>Tampilkan QR code di area publik kantor BPS Bulungan</li>
								<li>Pengunjung dapat memindai QR code dengan kamera smartphone</li>
								<li>
									QR code akan mengarahkan pengunjung ke halaman pelayanan
									statistik terpadu
								</li>
								<li>
									Pengunjung dapat langsung mengakses layanan antrean tanpa perlu
									mengetikkan URL
								</li>
							</ol>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
