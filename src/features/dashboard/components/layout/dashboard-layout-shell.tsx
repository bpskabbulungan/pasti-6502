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
import {
	dashboardAdminItems,
	dashboardNavItems,
} from "@/features/dashboard/constants/navigation";
import { cn } from "@/lib/utils";
import { Role } from "@/shared/constants/enums";

type DashboardLayoutShellProps = {
	children: React.ReactNode;
	user: Session["user"];
};

export default function DashboardLayoutShell({
	children,
	user,
}: DashboardLayoutShellProps) {
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
			<header className="fixed inset-x-0 top-0 z-50 border-b border-border/80 bg-background/90 shadow-sm backdrop-blur-xl md:hidden">
				<div className="flex items-center gap-3 px-4 py-3">
					<Button
						variant="ghost"
						size="icon"
						className="size-9 rounded-xl border border-border/80 bg-background/80 shadow-sm"
						onClick={() => setIsOpen((prev) => !prev)}
						aria-label={isOpen ? "Tutup menu" : "Buka menu"}
					>
						{isOpen ? <X size={18} /> : <Menu size={18} />}
					</Button>
					<div className="flex flex-col leading-tight">
						<span className="text-sm font-semibold text-primary-color">{APP_NAME}</span>
						<span className="text-[11px] text-secondary-color">Dashboard</span>
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
					"w-full bg-sidebar/95 pt-16 text-sidebar-foreground transition-all duration-300 ease-in-out md:fixed md:inset-y-0 md:left-0 md:z-40 md:w-64 md:shrink-0 md:overflow-y-auto md:border-r md:border-sidebar-border md:pt-0",
					isOpen
						? "fixed inset-y-0 left-0 z-40 block w-[84vw] max-w-[300px] border-r border-sidebar-border shadow-[var(--shadow-strong)]"
						: "hidden md:block"
				)}
			>
				<div className="flex h-full flex-col">
					<div className="border-b border-sidebar-border/80 px-5 py-4">
						<div className="mx-auto w-fit rounded-2xl border border-sidebar-border/75 bg-background/45 p-2.5 shadow-sm">
							<Image
								src="/antrean_light.png"
								alt="Logo Antrean"
								width={72}
								height={72}
								className="mx-auto block dark:hidden"
							/>
							<Image
								src="/antrean_dark.png"
								alt="Logo Antrean"
								width={72}
								height={72}
								className="mx-auto hidden dark:block"
							/>
						</div>
						<div className="mt-3 space-y-0.5 text-center">
							<h1 className="text-sm font-semibold tracking-tight">Sistem Antrean</h1>
							<p className="text-xs text-sidebar-foreground/80">Pelayanan Statistik Terpadu</p>
							<p className="text-[11px] text-sidebar-foreground/65">BPS Kabupaten Bulungan</p>
						</div>
					</div>

					<div className="flex grow flex-col gap-4 p-4">
						<div className="px-3 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/55">
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
												"group flex min-w-0 items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
												isActive
													? "border-sidebar-primary/35 bg-sidebar-primary/20 text-sidebar-foreground shadow-sm"
													: "border-transparent text-sidebar-foreground/85 hover:border-sidebar-border/80 hover:bg-sidebar-accent/70"
											)}
										>
											<Icon
												size={18}
												className={cn(
													"shrink-0",
													isActive ? "text-primary" : "text-sidebar-foreground/70"
												)}
											/>
											<span className="truncate">{item.title}</span>
										</Link>
									);
								})}
						</div>
						{user.role === Role.ADMIN ? (
							<>
								<div className="my-3 border-t border-sidebar-border/70" />
								<div className="px-3 text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/55">
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
													"group flex min-w-0 items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
													isActive
														? "border-sidebar-primary/35 bg-sidebar-primary/20 text-sidebar-foreground shadow-sm"
														: "border-transparent text-sidebar-foreground/85 hover:border-sidebar-border/80 hover:bg-sidebar-accent/70"
												)}
											>
												<Icon
													size={18}
													className={cn(
														"shrink-0",
														isActive ? "text-primary" : "text-sidebar-foreground/70"
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
						<div className="rounded-xl border border-sidebar-border/75 bg-background/45 p-3">
							<div className="mb-3 flex items-center justify-between gap-2">
								<div className="min-w-0">
									<p className="truncate text-sm font-semibold">{user.name}</p>
									<p className="text-xs text-sidebar-foreground/70">
										{user.role === Role.ADMIN ? "Admin" : "Petugas"}
									</p>
								</div>
								<div className="flex items-center gap-2">
									<NotificationsDropdown userId={user.id} />
									<ThemeToggle />
								</div>
							</div>
							<Button
								variant="outline"
								className="w-full justify-start gap-2 border-sidebar-border bg-background/70 text-sidebar-foreground hover:bg-background"
								onClick={() => setShowLogoutDialog(true)}
								disabled={isSigningOut}
							>
								<LogOut size={16} />
								<span>Logout</span>
							</Button>
						</div>
					</div>
				</div>
			</aside>

			<main className="min-h-0 min-w-0 flex-1 overflow-auto bg-transparent md:pl-64">
				<div className="mx-auto w-full max-w-[112rem] px-4 pb-6 pt-[5.1rem] sm:px-5 md:px-6 md:pt-6 xl:px-8">
					{children}
				</div>
			</main>

			<ConfirmActionDialog
				open={showLogoutDialog}
				onOpenChange={setShowLogoutDialog}
				title="Konfirmasi Logout"
				description="Anda akan keluar dari dashboard. Pastikan pekerjaan sudah disimpan."
				confirmLabel="Logout"
				confirmVariant="destructive"
				isProcessing={isSigningOut}
				onConfirm={confirmSignOut}
			/>
		</div>
	);
}


