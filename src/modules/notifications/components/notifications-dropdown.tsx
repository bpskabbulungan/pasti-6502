import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { notificationsApi } from "@/services/api/notifications";
import type { Notification } from "@shared/types/notification";

export default function NotificationsDropdown() {
	const { data: session } = useSession();
	const router = useRouter();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
	const [dataHash, setDataHash] = useState<string>("");
	const touch = (message: string) => toast.success(message);

	const fetchNotifications = React.useCallback(async () => {
		if (!session) return;

		try {
			setLoading(true);
			const data = await notificationsApi.list(dataHash);

			if (!("hasChanges" in data) || data.hasChanges) {
				setNotifications(data.notifications);
				if (data.hash) setDataHash(data.hash);
			}
		} catch (error) {
			console.error("Error fetching notifications:", error);
		} finally {
			setLoading(false);
		}
	}, [session, dataHash]);

	const markAllAsRead = async () => {
		if (!session) return;

		try {
			const data = await notificationsApi.markAllRead();
			setNotifications(data.notifications || []);
			if (data.hash) setDataHash(data.hash);
			touch("Semua notifikasi telah dibaca");
		} catch (error) {
			console.error("Error marking notifications as read:", error);
			toast.error("Terjadi kesalahan");
		}
	};

	const formatTime = (dateValue: string | Date) => {
		const date = new Date(dateValue);
		return date.toLocaleString("id-ID", {
			hour: "2-digit",
			minute: "2-digit",
			day: "2-digit",
			month: "short",
		});
	};

	const handleNotificationClick = async (notification: Notification) => {
		try {
			setMarkingAsRead(notification.id);
			await notificationsApi.markOneRead(notification.id);
			setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
			touch("Notifikasi telah dibaca");
		} catch (error) {
			console.error("Error marking notification as read:", error);
			toast.error("Terjadi kesalahan saat menandai notifikasi");
		} finally {
			setMarkingAsRead(null);
		}
		setIsOpen(false);

		if (window.location.pathname !== "/dashboard/queue") {
			router.push("/dashboard/queue");
		}
	};

	useEffect(() => {
		if (isOpen) {
			fetchNotifications();
		}
	}, [fetchNotifications, isOpen]);

	useEffect(() => {
		if (!session) return;

		fetchNotifications();

		const pollInterval = 30000;
		let pollTimer: NodeJS.Timeout | null = null;

		const pollForChanges = () => {
			if (document.visibilityState === "visible") {
				fetchNotifications();
			}
			pollTimer = setTimeout(pollForChanges, pollInterval);
		};

		pollTimer = setTimeout(pollForChanges, pollInterval);

		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible" && pollTimer === null) {
				fetchNotifications();
				pollTimer = setTimeout(pollForChanges, pollInterval);
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			if (pollTimer) clearTimeout(pollTimer);
		};
	}, [fetchNotifications, session]);

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					<Bell className="w-5 h-5" />
					{notifications.length > 0 && (
						<Badge
							variant="destructive"
							className="-top-1 -right-1 absolute flex justify-center items-center p-0 w-5 h-5 text-xs"
						>
							{notifications.length}
						</Badge>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-80">
				<div className="flex justify-between items-center p-2 border-b">
					<h3 className="font-medium">Notifikasi</h3>
					{notifications.length > 0 && (
						<Button variant="ghost" size="sm" onClick={markAllAsRead}>
							Tandai Semua Dibaca
						</Button>
					)}
				</div>
				<div className="max-h-80 overflow-y-auto">
					{loading ? (
						<div className="p-4 text-muted-foreground text-sm text-center">
							Memuat notifikasi...
						</div>
					) : notifications.length > 0 ? (
						notifications.map((notification) => (
							<DropdownMenuItem
								key={notification.id}
								className="focus:bg-secondary p-3 focus:text-accent cursor-pointer"
								onClick={() => handleNotificationClick(notification)}
							>
								<div className="space-y-1 w-full">
									<div className="flex justify-between items-start">
										<span className="font-medium text-sm">
											{notification.title}
										</span>
										<span className="text-muted-foreground text-xs">
											{markingAsRead === notification.id
												? "Menandai dibaca..."
												: formatTime(notification.createdAt)}
										</span>
									</div>
									<p className="text-muted-foreground text-sm">
										{notification.message}
									</p>
								</div>
							</DropdownMenuItem>
						))
					) : (
						<div className="p-4 text-muted-foreground text-sm text-center">
							Tidak ada notifikasi baru
						</div>
					)}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
