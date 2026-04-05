"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, QrCode, ScanLine } from "lucide-react";

import { PageContainer } from "@/components/shared/layout/page-container";
import { DashboardPageHeader } from "@/features/dashboard/components/layout/dashboard-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import QRCodeSkeleton from "@/features/dashboard/components/skeletons/qr-code-skeleton";
import { qrApi } from "@/services/api/qrcode";
import type { ErrorResponse } from "@shared/types/api";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== "object" || !error) {
    return fallback;
  }

  const errorDetails = (error as { details?: ErrorResponse }).details;
  if (errorDetails?.error) {
    return errorDetails.error;
  }

  const message = (error as { message?: string }).message;
  return message || fallback;
};

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

  if (isLoading) {
    return <QRCodeSkeleton />;
  }

  return (
    <PageContainer maxWidth="6xl">
      <DashboardPageHeader
        title="QR Code Buku Tamu"
        description="Gunakan QR statis ini di area layanan agar pengunjung langsung mengisi buku tamu digital."
        chips={
          <>
            <div className="dashboard-chip">
              <ScanLine className="h-3.5 w-3.5" />
              Akses cepat /guest
            </div>
            {qrTargetUrl ? (
              <div className="dashboard-chip max-w-full" title={qrTargetUrl}>
                <span className="truncate">{qrTargetUrl}</span>
              </div>
            ) : null}
          </>
        }
        actions={
          <div className="dashboard-header-actions">
            <Button
              onClick={handleDownload}
              disabled={!qrImage}
              className="dashboard-header-action"
            >
              <Download className="h-4 w-4" />
              Unduh QR Code
            </Button>
          </div>
        }
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,360px)_1fr]">
        <Card className="border-border/80 bg-card/88">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-primary-color">
              <QrCode className="h-4 w-4" />
              Pratinjau QR
            </CardTitle>
            <CardDescription>
              Cetak dan tempel pada area layanan agar pengunjung dapat memindai dengan cepat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border/80 bg-background/75 p-3 shadow-sm">
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
            {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border/80 bg-card/88">
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
                Pastikan QR ditempatkan di area yang mudah terlihat dan memiliki pencahayaan cukup.
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/88">
            <CardHeader>
              <CardTitle className="text-base text-primary-color">Alur Pengunjung</CardTitle>
              <CardDescription>Langkah ringkas setelah QR dipindai.</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="ml-2 list-inside list-decimal space-y-2 text-sm text-secondary-color">
                <li>Pengunjung memindai QR di area PASTI 6502</li>
                <li>Mengisi buku tamu digital dari ponsel</li>
                <li>Menerima nomor antrean otomatis</li>
                <li>Petugas memproses antrean hingga selesai</li>
                <li>Pengunjung diminta mengisi SKD setelah layanan</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </section>
    </PageContainer>
  );
}
