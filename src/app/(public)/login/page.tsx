import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LoginForm } from "@/components/auth/login-form";
import PageBackground from "@/components/shared/page-background";
import LoginRedirectGuard from "@/components/auth/login-redirect-guard";
import { APP_NAME, APP_TAGLINE } from "@/constants/app";
import { authOptions } from "@/lib/auth";
import { ArrowRight, LifeBuoy, LockKeyhole, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative isolate min-h-full">
      <LoginRedirectGuard />
      <PageBackground className="bg-gradient-to-br from-background via-background to-muted/40 dark:from-background dark:via-background dark:to-muted/35" />
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,color-mix(in_srgb,var(--primary)_14%,transparent),transparent_35%),radial-gradient(circle_at_80%_0%,color-mix(in_srgb,var(--accent)_10%,transparent),transparent_30%)]" />
        <div className="absolute -left-16 top-24 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-10 bottom-12 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="fixed inset-x-0 top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur md:hidden">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Image src="/icon_pst.png" alt="PST" width={24} height={24} className="h-6 w-6" />
            </div>
            <div className="leading-tight">
              <p className="text-base font-bold text-primary-color">{APP_NAME}</p>
              <p className="text-xs text-secondary-color">{APP_TAGLINE}</p>
            </div>
          </Link>
          <ThemeToggle />
        </div>
      </div>

      <header className="relative z-20 hidden md:block">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Image src="/icon_pst.png" alt="PST" width={32} height={32} className="h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-bold text-primary-color">{APP_NAME}</p>
              <p className="text-sm text-secondary-color">{APP_TAGLINE}</p>
            </div>
          </Link>
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-12 pt-24 sm:px-6 md:pt-8 lg:min-h-[calc(100svh-11rem)] lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-10 lg:px-8">
          <section className="order-2 space-y-4 lg:order-1">
            <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/82 p-5 shadow-[var(--shadow-soft)] backdrop-blur sm:p-7">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_8%,color-mix(in_srgb,var(--accent)_18%,transparent),transparent_44%),radial-gradient(circle_at_12%_85%,color-mix(in_srgb,var(--primary)_22%,transparent),transparent_42%)]" />
              <div className="relative space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/75 px-3 py-1 text-xs font-semibold text-secondary-color">
                  <LockKeyhole className="h-3.5 w-3.5 text-primary" />
                  Portal Internal PST
                </div>
                <h1 className="text-2xl font-black tracking-tight text-primary-color sm:text-3xl">
                  Kelola layanan dan operasional dashboard dalam satu tempat.
                </h1>
                <p className="max-w-xl text-sm leading-relaxed text-secondary-color sm:text-base">
                  Akses ini ditujukan untuk petugas internal. Gunakan akun resmi agar pengelolaan
                  antrean, buku tamu, dan monitoring layanan berjalan aman serta terdokumentasi.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-background/75 p-3">
                    <div className="mb-2 inline-flex rounded-full bg-primary/10 p-2 text-primary">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-semibold text-primary-color">Akses Terproteksi</p>
                    <p className="text-xs leading-relaxed text-secondary-color">
                      Validasi kredensial dan pembatasan percobaan login untuk mencegah brute force.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/75 p-3">
                    <div className="mb-2 inline-flex rounded-full bg-accent/10 p-2 text-accent">
                      <LifeBuoy className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-semibold text-primary-color">Bantuan Akun</p>
                    <p className="text-xs leading-relaxed text-secondary-color">
                      Untuk pembuatan akses baru atau reset, hubungi tim IPDS 6502.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="order-1 lg:order-2">
            <div className="mx-auto w-full max-w-md space-y-3">
              <LoginForm />
              <div className="rounded-2xl border border-dashed border-border/80 bg-card/72 px-4 py-3 text-center text-sm text-secondary-color">
                <p className="font-semibold text-primary-color">Butuh akses akun?</p>
                <p>Hubungi IPDS 6502 untuk pembuatan atau reset akun.</p>
                <Link
                  href="/"
                  className="mt-3 inline-flex items-center gap-1.5 font-semibold text-primary transition hover:text-primary/80"
                >
                  Kembali ke beranda
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
