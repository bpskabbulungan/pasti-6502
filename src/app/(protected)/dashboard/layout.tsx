"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
    LayoutDashboard,
    Users,
    ClipboardList,
    Settings,
    LogOut,
    BarChart4,
    Menu,
    X,
    QrCode, // Import QrCode icon
} from "lucide-react";
import { useEffect, useState } from "react"; // Added useEffect
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Role } from "@/generated/prisma";
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

    const navItems = [
        {
            title: "Dashboard",
            href: "/dashboard",
            icon: <LayoutDashboard size={20} />,
            allowedRoles: [Role.ADMIN, Role.SUPERADMIN],
        },
        {
            title: "Antrean",
            href: "/dashboard/queue",
            icon: <ClipboardList size={20} />,
            allowedRoles: [Role.ADMIN, Role.SUPERADMIN],
        },
        {
            title: "Semua Antrean",
            href: "/dashboard/all-queues",
            icon: <ClipboardList size={20} />,
            allowedRoles: [Role.ADMIN, Role.SUPERADMIN],
        },
        {
            title: "Analisis",
            href: "/dashboard/analytics",
            icon: <BarChart4 size={20} />,
            allowedRoles: [Role.ADMIN, Role.SUPERADMIN],
        },
        {
            title: "Kelola Admin",
            href: "/dashboard/users",
            icon: <Users size={20} />,
            allowedRoles: [Role.SUPERADMIN],
        },
        {
            title: "Kelola Layanan",
            href: "/dashboard/services",
            icon: <Settings size={20} />,
            allowedRoles: [Role.SUPERADMIN],
        },
        {
            title: "QR Code",
            href: "/dashboard/qrcode",
            icon: <QrCode size={20} />,
            allowedRoles: [Role.ADMIN, Role.SUPERADMIN],
        },
    ];

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const handleSignOut = () => {
        signOut({ callbackUrl: "/" });
    };

    return (
        <div className="flex md:flex-row flex-col h-screen">
            {/* Mobile menu button */}
            <Button
                variant="ghost"
                className="md:hidden top-4 right-4 z-50 fixed"
                onClick={toggleSidebar}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>

            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-sidebar text-sidebar-background w-full md:w-64 md:min-h-screen transition-all duration-300 ease-in-out",
                    isOpen ? "block fixed inset-0 z-40" : "hidden md:block"
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
                        <h1 className="font-bold text-center">
                            Sistem Antrean
                        </h1>
                        <p className="text-xs text-center">
                            Pelayanan Statistik Terpadu
                        </p>
                        <p className="text-xs text-center">
                            BPS Kabupaten Bulungan
                        </p>
                    </div>                    <div className="flex flex-col flex-grow space-y-2 p-4">
                        {!isClient && (
                            <NavigationSkeleton />
                        )}
                        {isClient && status === "loading" && (
                            <NavigationSkeleton />
                        )}
                        {isClient && status === "authenticated" &&
                            navItems
                                .filter((item) =>
                                    item.allowedRoles.includes(session?.user?.role || Role.ADMIN)
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
                    </div>                    <div className="p-4 border-sidebar-border border-t">
                        {!isClient && (
                            <UserInfoSkeleton />
                        )}
                        {isClient && status === "loading" && (
                            <UserInfoSkeleton />
                        )}
                        {isClient && session?.user && (
                            <>
                                <div className="flex justify-between items-center mb-2">
                                    <div>
                                        <p className="font-medium">{session.user.name}</p>
                                        <p className="text-sidebar-foreground/70 text-xs">
                                            {session.user.role === Role.SUPERADMIN ? "Super Admin" : "Admin"}
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
            <main className="flex-1 bg-background overflow-auto">
                <div className="p-6 min-h-screen">{children}</div>
            </main>
        </div>
    );
}
