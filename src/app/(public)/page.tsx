import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#FFF4EC] via-white to-[#FFE5D3] dark:from-background dark:via-[#1f1f1f] dark:to-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(247,144,57,0.16),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(154,5,1,0.12),transparent_30%)]" />
      <div className="absolute -left-16 top-24 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-10 bottom-12 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />

      <header className="relative z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-primary-color">PASTI 6502</p>
              <p className="text-sm text-secondary-color">
                Pelayanan Statistik Terpadu
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button className="gap-2 bg-primary text-primary-foreground shadow-md hover:bg-primary/90">
                Login
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-14">
          <div className="space-y-6 max-w-3xl">
            <Badge
              variant="secondary"
              className="border-border/60 bg-white/70 text-primary-color shadow-sm backdrop-blur"
            >
              <Sparkles className="h-4 w-4" />
              PASTI 6502
            </Badge>
            <div className="space-y-3">
              <h1 className="text-3xl font-black leading-tight text-primary-color sm:text-4xl">
                Pelayanan Statistik Terpadu Terintegrasi (PASTI)
              </h1>
              <div className="space-y-3 text-base text-secondary-color sm:text-lg">
                <p>
                  PASTI bukan sekadar akronim, PASTI merupakan komitmen standar
                  pelayanan yang menuntun setiap proses, dari kedatangan hingga
                  kebutuhan data terpenuhi.
                </p>
                <p>
                  Kami memastikan antrean tertib, alur yang jelas, dan kepastian
                  waktu yang terukur. Masyarakat tidak hanya mendapatkan data
                  yang dibutuhkan, tetapi juga pengalaman pelayanan yang nyaman
                  dan prima.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/login">
                <Button className="gap-2 bg-primary text-primary-foreground shadow-md hover:bg-primary/90">
                  Masuk Admin
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/queue-display">
                <Button
                  variant="outline"
                  className="border-border bg-white/70 backdrop-blur dark:bg-background"
                >
                  Lihat Tampilan Antrean
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-3 rounded-xl border border-custom bg-white/70 p-4 shadow-sm backdrop-blur dark:bg-card">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-primary-color">
                  Kelola Antrean
                </p>
                <p className="text-sm text-secondary-color">
                  Atur jalur antrean yang tertib mulai dari pendaftaran hingga
                  pelayanan selesai.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-custom bg-white/70 p-4 shadow-sm backdrop-blur dark:bg-card">
              <div className="rounded-full bg-accent/10 p-2 text-accent">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-primary-color">
                  Responden SKD
                </p>
                <p className="text-sm text-secondary-color">
                  Monitoring pengunjung agar menyelesaikan Survei Kebutuhan Data
                  dengan cepat dan akurat.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-custom bg-white/70 p-4 shadow-sm backdrop-blur dark:bg-card">
              <div className="rounded-full bg-secondary/10 p-2 text-secondary-foreground">
                <LockKeyhole className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-primary-color">
                  Keamanan Akses
                </p>
                <p className="text-sm text-secondary-color">
                  Autentikasi admin menjaga keamanan data pengunjung PST dan
                  hasil SKD dari responden.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
