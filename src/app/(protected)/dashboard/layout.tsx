"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  UserCog,
  ListChecks,
  Wrench,
  LogOut,
  BarChart4,
  BookOpenText,
  BookOpenCheck,
  Menu,
  X,
  QrCode, // Import QrCode icon
} from "lucide-react";
import { useEffect, useState } from "react"; // Added useEffect
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Role } from "@/shared/constants/enums";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import NotificationsDropdown from "@/modules/notifications/components/notifications-dropdown";
import NavigationSkeleton from "@/modules/dashboard/components/skeletons/NavigationSkeleton";
import UserInfoSkeleton from "@/modules/dashboard/components/skeletons/UserInfoSkeleton";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    document.body.classList.add("dashboard-layout");
    return () => {
      document.body.classList.remove("dashboard-layout");
    };
  }, []);

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard size={20} />,
      allowedRoles: [Role.ADMIN, Role.PETUGAS],
    },
    {
      title: "Antrean",
      href: "/dashboard/queue",
      icon: <ListChecks size={20} />,
      allowedRoles: [Role.ADMIN, Role.PETUGAS],
    },
    {
      title: "Analisis",
      href: "/dashboard/analytics",
      icon: <BarChart4 size={20} />,
      allowedRoles: [Role.ADMIN],
    },
    {
      title: "Buku Tamu",
      href: "/dashboard/guestbook",
      icon: <BookOpenText size={20} />,
      allowedRoles: [Role.ADMIN, Role.PETUGAS],
    },
    {
      title: "Panduan",
      href: "/dashboard/guide",
      icon: <BookOpenCheck size={20} />,
      allowedRoles: [Role.ADMIN, Role.PETUGAS],
    },
  ];

  const adminItems = [
    {
      title: "Kelola Pengguna",
      href: "/dashboard/users",
      icon: <UserCog size={20} />,
    },
    {
      title: "Kelola Layanan",
      href: "/dashboard/services",
      icon: <Wrench size={20} />,
    },
    {
      title: "QR Buku Tamu",
      href: "/dashboard/qrcode",
      icon: <QrCode size={20} />,
    },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden md:flex-row">
      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 border-b border-border/70 bg-background/95 shadow-sm backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            className="border border-border/70 bg-background/90 shadow-sm hover:bg-background"
            onClick={toggleSidebar}
            aria-label={isOpen ? "Tutup menu" : "Buka menu"}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-primary-color">PASTI 6502</span>
            <span className="text-[11px] text-secondary-color">Panel Dashboard</span>
          </div>
        </div>
      </header>

      {/* Sidebar overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/25 backdrop-blur-[1px]"
          onClick={() => setIsOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-sidebar text-sidebar-background w-full pt-16 md:pt-0 transition-all duration-300 ease-in-out",
          "md:fixed md:inset-y-0 md:left-0 md:z-40 md:w-64 md:shrink-0 md:overflow-y-auto md:border-r md:border-sidebar-border",
          isOpen
            ? "block fixed inset-y-0 left-0 z-40 w-[82vw] max-w-[280px] shadow-2xl border-r border-sidebar-border"
            : "hidden md:block"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-sidebar-border border-b">
            <Image
              src="/antrean_light.png"
              alt="Logo Antrean"
              width={100}
              height={100}
              className="dark:hidden block mx-auto mb-2"
            />
            <Image
              src="/antrean_dark.png"
              alt="Logo Antrean"
              width={100}
              height={100}
              className="hidden dark:block mx-auto mb-2"
            />
            <h1 className="font-bold text-center">Sistem Antrean</h1>
            <p className="text-xs text-center">Pelayanan Statistik Terpadu</p>
            <p className="text-xs text-center">BPS Kabupaten Bulungan</p>
          </div>{" "}
          <div className="flex flex-col flex-grow space-y-2 p-4">
            {!isClient && <NavigationSkeleton />}
            {isClient && status === "loading" && <NavigationSkeleton />}
            {isClient && status === "authenticated" && (
              <>
                <div className="px-4 text-[11px] font-semibold uppercase tracking-widest text-secondary-color">
                  Menu Utama
                </div>
                <div className="mt-2 flex flex-col space-y-1">
                  {navItems
                    .filter((item) =>
                      item.allowedRoles.includes(session?.user?.role || Role.PETUGAS)
                    )
                    .map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center space-x-2 px-4 py-2 rounded-md transition-colors",
                          pathname === item.href
                            ? "bg-sidebar-primary font-bold"
                            : "hover:bg-sidebar-accent/30"
                        )}
                      >
                        {item.icon}
                        <span>{item.title}</span>
                      </Link>
                    ))}
                </div>
                {(session?.user?.role || Role.PETUGAS) === Role.ADMIN && (
                  <>
                    <div className="my-3 border-t border-sidebar-border/70" />
                    <div className="px-4 text-[11px] font-semibold uppercase tracking-widest text-secondary-color">
                      Menu Admin
                    </div>
                    <div className="mt-2 flex flex-col space-y-1">
                      {adminItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center space-x-2 px-4 py-2 rounded-md transition-colors",
                            pathname === item.href
                              ? "bg-sidebar-primary font-bold"
                              : "hover:bg-sidebar-accent/30"
                          )}
                        >
                          {item.icon}
                          <span>{item.title}</span>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>{" "}
          <div className="p-4 border-sidebar-border border-t">
            {!isClient && <UserInfoSkeleton />}
            {isClient && status === "loading" && <UserInfoSkeleton />}
            {isClient && session?.user && (
              <>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-medium">{session.user.name}</p>
                    <p className="text-sidebar-foreground/70 text-xs">
                      {session.user.role === Role.ADMIN ? "Admin" : "Petugas"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <NotificationsDropdown />
                    <ThemeToggle />
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 w-full"
                  onClick={handleSignOut}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-0 min-w-0 bg-background overflow-auto md:pl-64">
        <div className="p-6 pt-20 md:pt-6">{children}</div>
      </main>
    </div>
  );
}
