"use client";

import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { notificationsApi } from "@/services/api/notifications";
import { formatDisplayDateTime } from "@/lib/date-format";
import type { Notification } from "@shared/types/notification";

const POLL_INTERVAL_MS = 60000;

type NotificationsDropdownProps = {
  userId: string;
};

export default function NotificationsDropdown({ userId }: NotificationsDropdownProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
  const dataHashRef = React.useRef<string>("");
  const touch = (message: string) => toast.success(message);

  const fetchNotifications = React.useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const data = await notificationsApi.list(dataHashRef.current || undefined);

      if (!("hasChanges" in data) || data.hasChanges) {
        setNotifications(data.notifications);
        if (data.hash) dataHashRef.current = data.hash;
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  const markAllAsRead = async () => {
    try {
      const data = await notificationsApi.markAllRead();
      setNotifications(data.notifications || []);
      if (data.hash) dataHashRef.current = data.hash;
      touch("Semua notifikasi telah dibaca");
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      toast.error("Terjadi kesalahan");
    }
  };

  const formatTime = (dateValue: string | Date) => {
    return formatDisplayDateTime(dateValue);
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      setMarkingAsRead(notification.id);
      const data = await notificationsApi.markOneRead(notification.id);
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      if (data.hash) dataHashRef.current = data.hash;
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
    setNotifications([]);
    dataHashRef.current = "";
  }, [userId]);

  useEffect(() => {
    if (isOpen) {
      void fetchNotifications(true);
    }
  }, [fetchNotifications, isOpen]);

  useEffect(() => {
    let isActive = true;
    let pollTimer: NodeJS.Timeout | null = null;

    const clearPoll = () => {
      if (pollTimer) {
        clearTimeout(pollTimer);
        pollTimer = null;
      }
    };

    const scheduleNextPoll = () => {
      if (!isActive || document.visibilityState !== "visible") {
        return;
      }
      pollTimer = setTimeout(runPoll, POLL_INTERVAL_MS);
    };

    const runPoll = async () => {
      if (!isActive || document.visibilityState !== "visible") {
        clearPoll();
        return;
      }

      await fetchNotifications(false);
      scheduleNextPoll();
    };

    const handleVisibilityChange = () => {
      if (!isActive) {
        return;
      }

      if (document.visibilityState === "visible") {
        clearPoll();
        void fetchNotifications(false);
        scheduleNextPoll();
      } else {
        clearPoll();
      }
    };

    void fetchNotifications(false);
    scheduleNextPoll();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isActive = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearPoll();
    };
  }, [fetchNotifications, userId]);

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
                    <span className="font-medium text-sm">{notification.title}</span>
                    <span className="text-muted-foreground text-xs">
                      {markingAsRead === notification.id
                        ? "Menandai dibaca..."
                        : formatTime(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">{notification.message}</p>
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
