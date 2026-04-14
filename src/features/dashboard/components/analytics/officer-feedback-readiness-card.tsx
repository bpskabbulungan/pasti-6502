import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { OfficerPerformanceStatus } from "./officer-performance-status";
import type { OfficerFeedbackSummary } from "@shared/types/analytics";

type OfficerFeedbackReadinessCardProps = {
  selectedOfficerName: string | null;
  selectedOfficerServiceMix: string;
  performanceStatus: OfficerPerformanceStatus;
  potentialRatingRange: string;
  readinessDescription: string;
  feedbackSummary?: OfficerFeedbackSummary | null;
  isFeedbackLoading?: boolean;
  feedbackError?: string | null;
};

export function OfficerFeedbackReadinessCard({
  selectedOfficerName,
  selectedOfficerServiceMix,
  performanceStatus,
  potentialRatingRange,
  readinessDescription,
  feedbackSummary,
  isFeedbackLoading = false,
  feedbackError = null,
}: OfficerFeedbackReadinessCardProps) {
  return (
    <Card className="border-border/80 bg-card/95 shadow-none">
      <CardHeader className="space-y-2">
        <CardTitle className="text-base text-primary-color">Panel Evaluasi Petugas</CardTitle>
        <CardDescription>
          Ringkasan cepat untuk membaca kualitas layanan petugas dan kesiapan fitur feedback pengguna.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pb-6">
        <div className="rounded-xl border border-border/70 bg-background/55 px-3 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary-color">
            Petugas terpilih
          </p>
          <p className="mt-1 text-sm font-semibold text-primary-color">
            {selectedOfficerName || "Belum dipilih"}
          </p>
          <p className="mt-1 text-xs text-secondary-color">{selectedOfficerServiceMix}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border/70 bg-background/55 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary-color">
              Kesiapan feedback
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${performanceStatus.dotClassName}`} />
              <Badge variant="outline" className={performanceStatus.badgeClassName}>
                {performanceStatus.label}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-secondary-color">{performanceStatus.description}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/55 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary-color">
              Potensi skor awal
            </p>
            <p className="mt-1 text-base font-semibold text-primary-color">{potentialRatingRange}</p>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-border/80 bg-background/40 px-3 py-3">
          <p className="text-sm font-semibold text-primary-color">Rencana Integrasi Feedback</p>
          <p className="mt-1 text-sm leading-relaxed text-secondary-color">
            Saat fitur feedback aktif, panel ini siap menampilkan rating rata-rata bintang (1-5), jumlah ulasan, tren komentar, dan korelasi rating terhadap waktu tunggu serta waktu layanan.
          </p>
          <p className="mt-2 text-xs text-secondary-color">{readinessDescription}</p>
        </div>

        <div className="rounded-xl border border-border/70 bg-background/55 px-3 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary-color">
            Data feedback aktual
          </p>
          {isFeedbackLoading ? (
            <p className="mt-1 text-sm text-secondary-color">Memuat ringkasan feedback petugas...</p>
          ) : feedbackError ? (
            <p className="mt-1 text-sm text-rose-700">{feedbackError}</p>
          ) : feedbackSummary ? (
            <div className="mt-1 space-y-1 text-sm text-secondary-color">
              <p>
                Rating rata-rata: <span className="font-semibold text-primary-color">{feedbackSummary.averageRating.toFixed(1)}</span>
              </p>
              <p>
                Total ulasan: <span className="font-semibold text-primary-color">{feedbackSummary.totalReviews}</span>
              </p>
              <p>
                Positive rate: <span className="font-semibold text-primary-color">{feedbackSummary.positiveRate !== null ? `${feedbackSummary.positiveRate}%` : "-"}</span>
              </p>
              <p>
                Ulasan terakhir: <span className="font-semibold text-primary-color">{feedbackSummary.latestFeedbackAt ?? "-"}</span>
              </p>
            </div>
          ) : (
            <p className="mt-1 text-sm text-secondary-color">
              Belum ada data feedback dari pengguna. Struktur komponen sudah siap dihubungkan ke data API feedback.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
