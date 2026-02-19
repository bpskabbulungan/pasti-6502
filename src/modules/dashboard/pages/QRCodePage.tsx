"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import QRCodeSkeleton from "@/modules/dashboard/components/skeletons/QRCodeSkeleton";
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

    resolveQr();
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

  return (
    <>
      {isLoading ? (
        <QRCodeSkeleton />
      ) : (
        <div className="container mx-auto p-4 md:p-8">
          <h1 className="mb-6 text-center text-2xl font-bold md:text-3xl">QR Code Buku Tamu PST</h1>

          <div className="flex flex-col items-center space-y-6">
            <div className="rounded-lg border border-gray-300 bg-[#FFF4EC] p-2 shadow-lg dark:border-gray-700">
              {qrImage ? (
                <Image
                  src={qrImage}
                  alt="QR Code Buku Tamu PST BPS Bulungan"
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
              <p className="max-w-xl text-center text-sm text-destructive">{error}</p>
            ) : null}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h2 className="mb-3 text-xl font-semibold">Informasi QR Code</h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                QR code ini bersifat statis (permanen). Cukup dibuat sekali dan dapat digunakan
                berulang untuk pengunjung yang datang ke PST. Data pengunjung akan tersimpan sebagai
                buku tamu digital.
              </p>
              <div className="rounded-md border border-primary/30 bg-primary/10 p-4 text-sm">
                <p className="font-medium text-foreground">QR diarahkan ke halaman buku tamu.</p>
                <p className="text-muted-foreground">
                  Pengunjung mengisi data, sistem membuat nomor antrean otomatis.
                </p>
              </div>
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h2 className="mb-3 text-xl font-semibold">Alur Pengunjung</h2>
              <ol className="ml-2 list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                <li>Pengunjung memindai QR di area PST</li>
                <li>Mengisi buku tamu digital di gawai</li>
                <li>Mendapat nomor antrean otomatis</li>
                <li>Status antrean diproses hingga selesai</li>
                <li>Setelah selesai, pengunjung diminta mengisi SKD</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
