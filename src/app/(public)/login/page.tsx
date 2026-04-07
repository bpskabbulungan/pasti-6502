import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { LoginForm } from "@/components/auth/login-form";
import PageBackground from "@/components/shared/page-background";
import LoginRedirectGuard from "@/components/auth/login-redirect-guard";
import { authOptions } from "@/lib/auth";
import { ArrowRight } from "lucide-react";
import PublicHomeHeader from "../public-home-header";

export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative isolate min-h-full bg-background">
      <LoginRedirectGuard />
      <PageBackground className="bg-background" />
      <PublicHomeHeader variant="minimal" withBorder={false} />

      <main className="relative z-10">
        <div className="mx-auto flex w-full max-w-6xl items-start justify-center px-4 py-6 sm:px-6 sm:py-8 lg:min-h-[calc(100svh-9rem)] lg:items-center lg:px-8 lg:py-10">
          <section className="w-full max-w-md space-y-3">
            <LoginForm />
            <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 text-center text-sm text-secondary-color">
              <p className="font-semibold text-primary-color">Butuh akses akun?</p>
              <p>Hubungi IPDS 6502 untuk pembuatan atau reset akun.</p>
              <Link
                href="/"
                className="mt-3 inline-flex items-center gap-1.5 font-semibold text-primary transition hover:text-primary/85"
              >
                Kembali ke beranda
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
