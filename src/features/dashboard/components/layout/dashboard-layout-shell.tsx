"use client";

import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import NotificationsDropdown from "@/features/notifications/components/notifications-dropdown";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/shared/dialogs/confirm-action-dialog";
import { APP_NAME } from "@/constants/app";
import { dashboardAdminItems, dashboardNavItems } from "@/features/dashboard/constants/navigation";
import { cn } from "@/lib/utils";
import { Role } from "@/shared/constants/enums";

type DashboardLayoutShellProps = {
  children: React.ReactNode;
  user: Session["user"];
};

export default function DashboardLayoutShell({ children, user }: DashboardLayoutShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    document.body.classList.add("dashboard-layout");
    return () => {
      document.body.classList.remove("dashboard-layout");
    };
  }, []);

  useEffect(() => {
    const routesToPrefetch = [
      ...dashboardNavItems
        .filter((item) => item.allowedRoles.includes(user.role))
        .map((item) => item.href),
      ...(user.role === Role.ADMIN ? dashboardAdminItems.map((item) => item.href) : []),
    ];

    const prefetchTimer = window.setTimeout(() => {
      routesToPrefetch.forEach((href) => {
        router.prefetch(href);
      });
    }, 250);

    return () => clearTimeout(prefetchTimer);
  }, [router, user.role]);

  const confirmSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut({ callbackUrl: "/" });
    } finally {
      setIsSigningOut(false);
      setShowLogoutDialog(false);
    }
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden md:flex-row">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/80 bg-background/95 md:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-lg border border-border/80 bg-background"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "Tutup menu" : "Buka menu"}
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </Button>
          <div className="shrink-0 rounded-lg border border-border/80 bg-background p-1">
            <Image
              src="/icon_pst.png"
              alt="Logo PST"
              width={28}
              height={28}
              className="size-7 object-contain"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight text-primary-color">
              {APP_NAME}
            </span>
            <span className="text-[11px] text-secondary-color">BPS Kabupaten Bulungan</span>
          </div>
        </div>
      </header>

      {isOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/32 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden
        />
      ) : null}

      <aside
        className={cn(
          "w-full bg-sidebar pt-16 text-sidebar-foreground transition-all duration-300 ease-in-out md:fixed md:inset-y-0 md:left-0 md:z-40 md:w-64 md:shrink-0 md:overflow-y-auto md:border-r md:border-sidebar-border md:pt-0",
          isOpen
            ? "fixed inset-y-0 left-0 z-40 block w-[84vw] max-w-[300px] border-r border-sidebar-border shadow-lg"
            : "hidden md:block"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-sidebar-border/80 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="shrink-0 rounded-lg border border-sidebar-border/75 bg-background p-1.5">
                <Image
                  src="/icon_pst.png"
                  alt="Logo PST"
                  width={44}
                  height={44}
                  className="block size-11 object-contain"
                />
              </div>
              <div className="min-w-0 space-y-0.5">
                <h1 className="truncate text-sm font-semibold tracking-tight">{APP_NAME}</h1>
                <p className="text-[11px] text-sidebar-foreground/60">BPS Kabupaten Bulungan</p>
              </div>
            </div>
          </div>

          <div className="flex grow flex-col gap-3 p-4">
            <div className="px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/55">
              Menu Utama
            </div>
            <div className="mt-1 flex flex-col gap-1">
              {dashboardNavItems
                .filter((item) => item.allowedRoles.includes(user.role))
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "group flex min-w-0 items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "border-sidebar-primary/30 bg-sidebar-primary/10 text-sidebar-foreground"
                          : "border-transparent text-sidebar-foreground/82 hover:border-sidebar-border/70 hover:bg-sidebar-accent/55"
                      )}
                    >
                      <Icon
                        size={18}
                        className={cn(
                          "shrink-0 transition-opacity",
                          item.iconClassName,
                          isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100"
                        )}
                      />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  );
                })}
            </div>
            {user.role === Role.ADMIN ? (
              <>
                <div className="my-2 border-t border-sidebar-border/70" />
                <div className="px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/55">
                  Menu Admin
                </div>
                <div className="mt-1 flex flex-col gap-1">
                  {dashboardAdminItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "group flex min-w-0 items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "border-sidebar-primary/30 bg-sidebar-primary/10 text-sidebar-foreground"
                            : "border-transparent text-sidebar-foreground/82 hover:border-sidebar-border/70 hover:bg-sidebar-accent/55"
                        )}
                      >
                        <Icon
                          size={18}
                          className={cn(
                            "shrink-0 transition-opacity",
                            item.iconClassName,
                            isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100"
                          )}
                        />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </>
            ) : null}
          </div>

          <div className="border-t border-sidebar-border/80 p-4">
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <NotificationsDropdown userId={user.id} />
                <ThemeToggle />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent/55 hover:text-destructive transition-colors"
                onClick={() => setShowLogoutDialog(true)}
                disabled={isSigningOut}
                title="Logout"
              >
                <LogOut size={16} />
              </Button>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-sidebar-border/60 bg-sidebar-accent/20 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary shadow-sm">
                {user.name ? user.name.substring(0, 2).toUpperCase() : "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-sidebar-foreground">{user.name}</p>
                <p className="truncate text-[11px] text-sidebar-foreground/70">
                  {user.role === Role.ADMIN ? "Administrator" : "Petugas Layanan"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-h-0 min-w-0 flex-1 overflow-auto bg-transparent md:pl-64">
        <div className="mx-auto w-full max-w-[112rem] px-4 pb-6 pt-[4.75rem] sm:px-5 md:px-6 md:pt-6 xl:px-8">
          {children}
        </div>
      </main>

      <ConfirmActionDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        title="Konfirmasi Logout"
        description="Anda akan keluar dari dashboard. Pastikan pekerjaan sudah disimpan."
        confirmLabel="Logout"
        confirmVariant="warning"
        isProcessing={isSigningOut}
        onConfirm={confirmSignOut}
      />
    </div>
  );
}
