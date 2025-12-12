import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationsDropdown() {
    const { data: session } = useSession();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [markingAsRead, setMarkingAsRead] = useState<string | null>(null); // Track which notification is being marked as read
    const [dataHash, setDataHash] = useState<string>(""); // Track data hash for change detection    // Fetch notifications
    const fetchNotifications = React.useCallback(async () => {
        if (!session) return;

        try {
            setLoading(true);
            // Add hash parameter to check for changes
            const url = `/api/notifications${dataHash ? `?hash=${dataHash}` : ''}`;

            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include credentials (cookies) with the request
            });

            if (response.ok) {
                const data = await response.json();

                // Only update if there are changes or initial load
                if (!data.hasOwnProperty('hasChanges') || data.hasChanges) {
                    setNotifications(data.notifications);
                    // Store the hash for future comparisons
                    if (data.hash) setDataHash(data.hash);
                }
            } else {
                console.error('Failed to fetch notifications');
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [session, dataHash]);    // Mark all notifications as read
    const markAllAsRead = async () => {
        if (!session) return;

        try {
            const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include credentials (cookies) with the request
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications || []);

                // Update hash after marking all as read
                if (data.hash) {
                    setDataHash(data.hash);
                }

                toast.success('Semua notifikasi telah dibaca');
            } else {
                toast.error('Gagal menandai notifikasi sebagai dibaca');
            }
        } catch (error) {
            console.error('Error marking notifications as read:', error);
            toast.error('Terjadi kesalahan');
        }
    };

    const formatNotificationMessage = (message: string): string => {
        // Match patterns like: #5-1605 or #12-2305
        return message.replace(/#(\d+)-(\d{2})(\d{2})/g, (match) => {
            return match; // For now, return as is since it's already formatted
        });
    };

    // Format notification time
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'short',
        });
    };

    // Handle notification click
    const handleNotificationClick = async (notification: Notification) => {
        // Mark this notification as read
        try {
            setMarkingAsRead(notification.id);
            const response = await fetch(`/api/notifications/${notification.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }, credentials: 'include',
            });

            if (response.ok) {
                // Update local state to remove this notification
                setNotifications(prev => prev.filter(n => n.id !== notification.id));
                toast.success('Notifikasi telah dibaca');
            } else {
                console.error('Failed to mark notification as read');
                toast.error('Gagal menandai notifikasi sebagai dibaca');
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
            toast.error('Terjadi kesalahan saat menandai notifikasi');
        } finally {
            setMarkingAsRead(null);
        }        // Close the dropdown
        setIsOpen(false);

        // Only redirect if not already on the queue page
        const currentPath = window.location.pathname;
        if (currentPath !== '/dashboard/queue') {
            router.push('/dashboard/queue');
        }
    };    // Refresh notifications when dropdown is opened
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [fetchNotifications, isOpen]);

    // Setup polling for data changes with change detection
    useEffect(() => {
        if (!session) return;

        // Initial fetch
        fetchNotifications();

        // Set up polling for changes
        const pollInterval = 30000; // Poll every 30 seconds
        let pollTimer: NodeJS.Timeout | null = null;

        // Function to poll for changes
        const pollForChanges = () => {
            if (document.visibilityState === "visible") {
                fetchNotifications();
            }

            // Schedule next poll
            pollTimer = setTimeout(pollForChanges, pollInterval);
        };

        // Start polling
        pollTimer = setTimeout(pollForChanges, pollInterval);

        // Track document visibility to pause polling when tab is not visible
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible" && pollTimer === null) {
                // Resume polling when tab becomes visible again
                fetchNotifications();
                pollTimer = setTimeout(pollForChanges, pollInterval);
            }
        };

        // Add visibility change listener
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
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
                    ) : notifications.length > 0 ? (notifications.map((notification) => (
                        <DropdownMenuItem
                            key={notification.id}
                            className="focus:bg-secondary p-3 focus:text-accent cursor-pointer"
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className="space-y-1 w-full">
                                <div className="flex justify-between items-start">
                                    <span className="font-medium text-sm">{notification.title}</span>
                                    <span className="text-muted-foreground text-xs">
                                        {markingAsRead === notification.id ? (
                                            "Menandai dibaca..."
                                        ) : (
                                            formatTime(notification.createdAt)
                                        )}
                                    </span>
                                </div>
                                <p className="text-muted-foreground text-sm">{formatNotificationMessage(notification.message)}</p>
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