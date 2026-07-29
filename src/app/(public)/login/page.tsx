import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { LoginForm } from "@/components/auth/login-form";
import LoginRedirectGuard from "@/components/auth/login-redirect-guard";
import { authOptions } from "@/lib/auth";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { APP_NAME, FOOTER_START_YEAR } from "@/constants/app";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import CurrentYear from "@/components/shared/current-year";

export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-full flex-col bg-background md:flex-row">
      <LoginRedirectGuard />
      
      {/* Left Pane - Branding & Illustration (Hidden on Mobile/Tablet) */}
      <div className="hidden md:relative md:flex md:w-1/2 md:flex-col md:justify-between md:border-r md:border-border/80 md:bg-muted/30 md:px-10 md:py-10 lg:px-12 lg:py-12 xl:w-5/12">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
          <div className="mt-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-sm">
            <Image src="/icon_pst.png" alt={APP_NAME} width={40} height={40} className="h-10 w-10" />
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-primary-color lg:text-5xl">
            {APP_NAME}
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-secondary-color lg:text-lg">
            Portal Terpadu untuk manajemen layanan statistik, pencatatan buku tamu, dan pemantauan SKD secara real-time.
          </p>
        </div>
        
        <div className="relative z-10 text-sm font-medium text-muted-foreground">
          &copy; <CurrentYear startYear={FOOTER_START_YEAR} /> BPS Kabupaten Bulungan.
        </div>
      </div>

      {/* Right Pane - Login Form */}
      <main className="relative flex flex-1 flex-col items-center justify-center p-6 sm:p-8 md:p-12 lg:px-12 lg:py-4">
        <div className="absolute right-6 top-6 sm:right-8 sm:top-8 md:right-10 md:top-10">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm space-y-4">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-sm md:hidden">
              <Image src="/icon_pst.png" alt={APP_NAME} width={36} height={36} className="h-9 w-9" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-primary-color sm:text-3xl">
              Masuk ke Dashboard
            </h2>
            <p className="mt-2 text-sm text-secondary-color">
              Gunakan kredensial Anda untuk mengakses sistem {APP_NAME}.
            </p>
          </div>

          <div className="space-y-4">
            <LoginForm />
            
            <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-center text-sm text-secondary-color">
              <p className="font-medium text-primary-color">Butuh akses akun?</p>
              <p className="mt-1">Hubungi IPDS 6502 untuk permintaan atau reset sandi.</p>
              <Link
                href="/"
                className="mt-4 inline-flex items-center gap-1.5 font-semibold text-primary transition hover:text-primary/80 md:hidden"
              >
                Kembali ke beranda
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
