"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { APP_NAME } from "@/constants/app";

export default function PublicHomeHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/95 bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Image src="/icon_pst.png" alt={APP_NAME} width={28} height={28} className="h-7 w-7" />
          </div>
          <p className="text-base font-bold text-primary-color sm:text-lg">{APP_NAME}</p>
        </Link>

        <div className="hidden items-center gap-2 sm:flex sm:gap-3">
          <Link href="/queue-display">
            <Button variant="outline" className="border-border bg-background/90">
              Lihat Antrean
            </Button>
          </Link>
          <Link href="/login">
            <Button className="gap-2 bg-primary text-white shadow-md hover:bg-primary/90 dark:text-primary-foreground">
              Login
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <ThemeToggle />
        </div>

        <div className="sm:hidden">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl border-border bg-background/90"
                aria-label="Buka menu navigasi"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DialogTrigger>

            <DialogContent
              showClose={false}
              className="left-auto right-0 top-0 h-dvh max-h-dvh w-[min(20rem,92vw)] max-w-none translate-x-0 translate-y-0 gap-5 rounded-none rounded-l-2xl border-y-0 border-r-0 border-l border-border/80 p-5 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
            >
              <DialogTitle className="sr-only">Navigasi Utama</DialogTitle>

              <div className="flex items-center justify-between border-b border-border/70 pb-4">
                <DialogClose asChild>
                  <Link href="/" className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Image src="/icon_pst.png" alt={APP_NAME} width={24} height={24} className="h-6 w-6" />
                    </div>
                    <p className="font-bold text-primary-color">{APP_NAME}</p>
                  </Link>
                </DialogClose>

                <DialogClose asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-lg border-border/80 bg-background"
                    aria-label="Tutup menu navigasi"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DialogClose>
              </div>

              <nav className="grid gap-3">
                <DialogClose asChild>
                  <Link href="/queue-display">
                    <Button variant="outline" className="w-full justify-start border-border bg-background/90">
                      Lihat Antrean
                    </Button>
                  </Link>
                </DialogClose>

                <DialogClose asChild>
                  <Link href="/login">
                    <Button className="w-full justify-start gap-2 bg-primary text-white dark:text-primary-foreground">
                      Login
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </DialogClose>
              </nav>

              <div className="mt-auto flex items-center justify-between rounded-xl border border-border/80 bg-muted/35 px-3 py-2.5">
                <p className="text-sm font-medium text-secondary-color">Tema</p>
                <ThemeToggle />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
