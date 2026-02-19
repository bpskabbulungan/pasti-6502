import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginForm } from "@/components/LoginForm";
import PageBackground from "@/components/page-background";
import LoginRedirectGuard from "@/components/auth/login-redirect-guard";
import { authOptions } from "@/lib/auth";
import { LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative isolate min-h-full">
      <LoginRedirectGuard />
      <PageBackground className="bg-gradient-to-br from-[#FFF4EC] via-white to-[#FFE5D3] dark:from-background dark:via-[#1f1f1f] dark:to-background" />
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(247,144,57,0.16),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(154,5,1,0.12),transparent_30%)]" />
        <div className="absolute -left-16 top-24 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-10 bottom-12 h-64 w-64 rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="fixed inset-x-0 top-0 z-30 border-b border-border/60 bg-white/90 backdrop-blur dark:bg-background/85 md:hidden">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <img src="/icon_pst.png" alt="PST" className="h-6 w-6" />
            </div>
            <div className="leading-tight">
              <p className="text-base font-bold text-primary-color">PASTI 6502</p>
              <p className="text-xs text-secondary-color">Pelayanan Statistik Terpadu</p>
            </div>
          </Link>
          <ThemeToggle />
        </div>
      </div>

      <header className="relative z-20 hidden md:block">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <img src="/icon_pst.png" alt="PST" className="h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-bold text-primary-color">PASTI 6502</p>
              <p className="text-sm text-secondary-color">Pelayanan Statistik Terpadu</p>
            </div>
          </Link>
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-12 pt-24 md:pt-8 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-8">
          <div className="contents lg:block lg:space-y-5">
            <section className="space-y-5">
              <Badge
                variant="secondary"
                className="border-border/60 bg-white/70 text-primary-color shadow-sm backdrop-blur"
              >
                <LockKeyhole className="h-4 w-4" />
                Akses Internal 6502
              </Badge>
              <div className="space-y-3">
                <p className="max-w-xl text-base text-secondary-color sm:text-lg">
                  Masuk sebagai admin atau petugas untuk mengelola antrean, memantau SKD, dan
                  memastikan layanan berjalan konsisten.
                </p>
              </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-2xl border border-custom/80 bg-white/80 p-4 shadow-sm backdrop-blur dark:bg-card">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-primary-color">Keamanan terjaga</p>
                  <p className="text-sm text-secondary-color">
                    Autentikasi terverifikasi untuk melindungi data layanan.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-custom/80 bg-white/80 p-4 shadow-sm backdrop-blur dark:bg-card">
                <div className="rounded-full bg-accent/10 p-2 text-accent">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-primary-color">Kontrol real-time</p>
                  <p className="text-sm text-secondary-color">
                    Pantau antrean, jadwal petugas, dan buku tamu digital.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="contents lg:block lg:justify-self-end lg:space-y-3">
            <div className="w-full">
              <LoginForm />
            </div>
            <div className="rounded-2xl border border-dashed border-border/80 bg-white/70 p-4 text-center text-sm text-secondary-color backdrop-blur dark:bg-card">
              <p className="font-semibold text-primary-color">Butuh akses akun?</p>
              <p>Hubungi IPDS 6502 untuk pembuatan atau reset akun.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
