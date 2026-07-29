"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Copy, Download, ExternalLink, QrCode, ScanLine } from "lucide-react";
import { toast } from "sonner";

import { PageContainer } from "@/components/shared/layout/page-container";
import { DashboardPageHeader } from "@/features/dashboard/components/layout/dashboard-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import QRCodeSkeleton from "@/features/dashboard/components/skeletons/qr-code-skeleton";
import { qrApi } from "@/services/api/qrcode";
import { getErrorMessage } from "@/lib/error-message";



export default function QRCodePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrTargetUrl, setQrTargetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveQr = async () => {
      let staticUuid = process.env.NEXT_PUBLIC_STATIC_UUID;

      if (!staticUuid) {
        try {
          const data = await qrApi.getStaticUuid();
          staticUuid = data.staticUuid;
        } catch (err) {
          console.error("Failed to resolve static UUID", err);
          setError(
            getErrorMessage(
              err,
              "Static UUID belum dikonfigurasi. Set variabel NEXT_PUBLIC_STATIC_UUID terlebih dahulu."
            )
          );
          setIsLoading(false);
          return;
        }
      }

      if (!staticUuid) {
        setError("Static UUID belum dikonfigurasi.");
        setIsLoading(false);
        return;
      }

      const preferredBaseUrl = process.env.NEXT_PUBLIC_QR_BASE_URL || "";
      const origin =
        preferredBaseUrl || (typeof window !== "undefined" ? window.location.origin : "");

      if (!origin) {
        setError(
          "Base URL QR tidak ditemukan. Tambahkan NEXT_PUBLIC_QR_BASE_URL atau buka dari domain publik."
        );
        setIsLoading(false);
        return;
      }

      const normalizedOrigin = origin.endsWith("/") ? origin.slice(0, -1) : origin;
      const targetUrl = `${normalizedOrigin}/guest`;

      setQrImage(qrApi.getImageUrl(staticUuid));
      setQrTargetUrl(targetUrl);
      setError(null);
      setIsLoading(false);
    };

    void resolveQr();
  }, []);

  const handleDownload = async () => {
    if (!qrImage) return;

    try {
      const blob = await qrApi.downloadImage(qrImage);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "pst_qrcode.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download QR code", err);
      setError("Gagal mengunduh QR code. Coba lagi.");
    }
  };

  const handleCopyUrl = async () => {
    if (!qrTargetUrl) return;

    try {
      await navigator.clipboard.writeText(qrTargetUrl);
      toast.success("Tautan buku tamu berhasil disalin.");
    } catch {
      toast.error("Gagal menyalin tautan. Coba lagi.");
    }
  };

  const handleOpenGuestPage = () => {
    if (!qrTargetUrl) return;
    window.open(qrTargetUrl, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return <QRCodeSkeleton />;
  }

  return (
    <PageContainer className="dashboard-page">
      <DashboardPageHeader
        title="QR Code Buku Tamu PST BPS Kabupaten Bulungan"
        description="Halaman untuk menampilkan dan mengelola QR Code buku tamu digital."
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,360px)_1fr]">
        <Card className="dashboard-panel shadow-none">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-base text-primary-color">
                <QrCode className="h-4 w-4" />
                Pratinjau QR
              </CardTitle>
              <Button
                variant="outline"
                size="icon"
                onClick={handleDownload}
                disabled={!qrImage}
                className="h-8 w-8 shrink-0 border-border"
                aria-label="Unduh QR Code"
                title="Unduh QR Code"
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">Unduh QR Code</span>
              </Button>
            </div>
            <CardDescription>
              Cetak dan tempel pada area layanan agar pengunjung dapat memindai dengan cepat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border/80 bg-background/75 p-3">
              {qrImage ? (
                <Image
                  src={qrImage}
                  alt="QR Code Buku Tamu PASTI 6502 BPS Bulungan"
                  width={320}
                  height={320}
                  priority
                  className="h-auto w-full rounded-lg"
                />
              ) : (
                <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed border-border/80 px-4 text-center text-sm text-destructive">
                  {error ?? "QR Code tidak tersedia."}
                </div>
              )}
            </div>
            <p className="mt-3 text-xs text-secondary-color">
              Gunakan ukuran cetak minimal 12 x 12 cm agar pemindaian tetap cepat dari jarak normal.
            </p>
            {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="dashboard-panel shadow-none">
            <CardHeader>
              <CardTitle className="text-base text-primary-color">Informasi QR</CardTitle>
              <CardDescription>
                QR bersifat statis (permanen) dan bisa dipakai berulang untuk operasional harian.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-secondary-color">
              <p>
                Pengunjung yang memindai QR akan diarahkan ke halaman buku tamu untuk mengisi data
                kunjungan dan mendapatkan nomor antrean otomatis.
              </p>
              <div className="rounded-lg border border-border/80 bg-background/70 p-3 text-xs text-muted-foreground">
                Pastikan QR ditempatkan di area yang mudah terlihat, sejajar tinggi mata, dan memiliki
                pencahayaan cukup.
              </div>
              <div className="rounded-lg border border-border/80 bg-muted/40 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-color">
                  Checklist Penempatan
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-secondary-color">
                  <li>Ditempel pada area antrean atau meja penerima tamu</li>
                  <li>Kontras latar baik, tidak terlipat, dan tidak terkena pantulan cahaya</li>
                  <li>Cadangan print tersedia untuk kondisi darurat</li>
                </ul>
              </div>
              <div className="flex flex-col items-center gap-2 pt-1">
                <Button
                  variant="outline"
                  onClick={handleOpenGuestPage}
                  disabled={!qrTargetUrl}
                  className="border-border"
                >
                  <ExternalLink className="h-4 w-4" />
                  Buka Halaman
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Link aktif buku tamu:{" "}
                  <span className="break-all font-medium text-secondary-color">
                    {qrTargetUrl ?? "Belum tersedia"}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-panel shadow-none">
            <CardHeader>
              <CardTitle className="text-base text-primary-color">Alur Pengunjung</CardTitle>
              <CardDescription>Langkah ringkas setelah QR dipindai.</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="ml-2 list-inside list-decimal space-y-2 text-sm text-secondary-color">
                <li>Pengunjung memindai QR di area PST 6502.</li>
                <li>Mengisi buku tamu digital dari ponsel.</li>
                <li>Menerima nomor antrean otomatis.</li>
                <li>Petugas memproses antrean hingga selesai.</li>
                <li>Pengunjung diminta mengisi SKD setelah layanan selesai.</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </section>
    </PageContainer>
  );
}
