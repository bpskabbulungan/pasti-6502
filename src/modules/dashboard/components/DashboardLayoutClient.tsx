"use client";

import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
	BarChart4,
	BookOpenCheck,
	BookOpenText,
	CalendarClock,
	LayoutDashboard,
	ListChecks,
	LogOut,
	Menu,
	QrCode,
	UserCog,
	Wrench,
	X,
} from "lucide-react";
import NotificationsDropdown from "@/modules/notifications/components/notifications-dropdown";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Role } from "@/shared/constants/enums";

type DashboardLayoutClientProps = {
	children: React.ReactNode;
	user: Session["user"];
};

export default function DashboardLayoutClient({
	children,
	user,
}: DashboardLayoutClientProps) {
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(false);
	const [showLogoutDialog, setShowLogoutDialog] = useState(false);
	const [isSigningOut, setIsSigningOut] = useState(false);

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
		{
			title: "Jadwal Petugas",
			href: "/dashboard/duty-schedule",
			icon: <CalendarClock size={20} />,
		},
	];

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
			<header className="fixed left-0 right-0 top-0 z-50 border-b border-border/70 bg-background/95 shadow-sm backdrop-blur md:hidden">
				<div className="flex items-center gap-3 px-4 py-3">
					<Button
						variant="ghost"
						size="icon"
						className="border border-border/70 bg-background/90 shadow-sm hover:bg-background"
						onClick={() => setIsOpen((prev) => !prev)}
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

			{isOpen ? (
				<div
					className="fixed inset-0 z-30 bg-black/25 backdrop-blur-[1px] md:hidden"
					onClick={() => setIsOpen(false)}
					aria-hidden
				/>
			) : null}

			<aside
				className={cn(
					"w-full bg-sidebar pt-16 text-sidebar-background transition-all duration-300 ease-in-out md:fixed md:inset-y-0 md:left-0 md:z-40 md:w-64 md:shrink-0 md:overflow-y-auto md:border-r md:border-sidebar-border md:pt-0",
					isOpen
						? "fixed inset-y-0 left-0 z-40 block w-[82vw] max-w-[280px] border-r border-sidebar-border shadow-2xl"
						: "hidden md:block"
				)}
			>
				<div className="flex h-full flex-col">
					<div className="border-b border-sidebar-border p-4">
						<Image
							src="/antrean_light.png"
							alt="Logo Antrean"
							width={100}
							height={100}
							className="mx-auto mb-2 block dark:hidden"
						/>
						<Image
							src="/antrean_dark.png"
							alt="Logo Antrean"
							width={100}
							height={100}
							className="mx-auto mb-2 hidden dark:block"
						/>
						<h1 className="text-center font-bold">Sistem Antrean</h1>
						<p className="text-center text-xs">Pelayanan Statistik Terpadu</p>
						<p className="text-center text-xs">BPS Kabupaten Bulungan</p>
					</div>

					<div className="flex grow flex-col space-y-2 p-4">
						<div className="px-4 text-[11px] font-semibold uppercase tracking-widest text-secondary-color">
							Menu Utama
						</div>
						<div className="mt-2 flex flex-col space-y-1">
							{navItems
								.filter((item) => item.allowedRoles.includes(user.role))
								.map((item) => (
									<Link
										key={item.href}
										href={item.href}
										onClick={() => setIsOpen(false)}
										className={cn(
											"flex items-center space-x-2 rounded-md px-4 py-2 transition-colors",
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
						{user.role === Role.ADMIN ? (
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
												"flex items-center space-x-2 rounded-md px-4 py-2 transition-colors",
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
						) : null}
					</div>

					<div className="border-t border-sidebar-border p-4">
						<div className="mb-2 flex items-center justify-between">
							<div>
								<p className="font-medium">{user.name}</p>
								<p className="text-xs text-sidebar-foreground/70">
									{user.role === Role.ADMIN ? "Admin" : "Petugas"}
								</p>
							</div>
							<div className="flex items-center space-x-2">
								<NotificationsDropdown userId={user.id} />
								<ThemeToggle />
							</div>
						</div>
						<Button
							variant="outline"
							className="flex w-full items-center space-x-2"
							onClick={() => setShowLogoutDialog(true)}
							disabled={isSigningOut}
						>
							<LogOut size={16} />
							<span>Logout</span>
						</Button>
					</div>
				</div>
			</aside>

			<main className="min-h-0 min-w-0 flex-1 overflow-auto bg-background md:pl-64">
				<div className="p-6 pt-20 md:pt-6">{children}</div>
			</main>

			<Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Konfirmasi Logout</DialogTitle>
						<DialogDescription>
							Anda akan keluar dari dashboard. Pastikan pekerjaan sudah disimpan.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
							Batal
						</Button>
						<Button
							variant="destructive"
							onClick={confirmSignOut}
							disabled={isSigningOut}
						>
							{isSigningOut ? "Memproses..." : "Logout"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
