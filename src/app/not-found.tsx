import Link from "next/link";
import { Button } from "@/components/ui/button";
import PageBackground from "@/components/page-background";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-screen items-center justify-center px-5 py-10">
      <PageBackground className="bg-gradient-to-br from-[#FFF4EC] via-white to-[#FFE5D3] dark:from-background dark:via-[#1f1f1f] dark:to-background" />
      <main className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-border/70 bg-white/85 p-8 text-center shadow-sm backdrop-blur dark:bg-card">
          <p className="text-sm font-semibold tracking-wide text-primary">404</p>
          <h1 className="mt-2 text-2xl font-bold text-primary-color sm:text-3xl">
            Halaman tidak ditemukan
          </h1>
          <p className="mt-3 text-sm text-secondary-color sm:text-base">
            URL yang kamu buka tidak tersedia. Cek kembali alamatnya atau kembali ke beranda.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/" className="w-full sm:w-auto">
              <Button className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Home className="h-4 w-4" />
                Ke Beranda
              </Button>
            </Link>
            <Link href="/guest" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full border-border">
                Halaman Publik
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
