import prisma from "@api/infrastructure/database/prisma";
import { generateNotificationsHash } from "./notification.utils";

type NotificationShape = {
	id: string;
	type: string;
	title: string;
	message: string;
	isRead: boolean;
	createdAt: Date;
	updatedAt: Date;
	userId: string | null;
};

export async function getUnreadNotifications(userId: string) {
	const notifications = await prisma.notification.findMany({
		where: {
			isRead: false,
			OR: [{ userId: null }, { userId }],
		},
		orderBy: {
			createdAt: "desc",
		},
		take: 20,
	});

	const hash = generateNotificationsHash(notifications);

	return {
		notifications,
		hash,
		hasChanges: true, // caller will decide based on client hash
	};
}

export async function getUnreadNotificationsWithHashCheck(
	userId: string,
	clientHash?: string | null
) {
	const result = await getUnreadNotifications(userId);
	const hasChanges = !clientHash || clientHash !== result.hash;
	return { ...result, hasChanges };
}

export async function markAllNotificationsAsRead(userId: string) {
	await prisma.notification.updateMany({
		where: {
			isRead: false,
			OR: [{ userId: null }, { userId }],
		},
		data: {
			isRead: true,
		},
	});

	const refreshed = await getUnreadNotifications(userId);
	return {
		success: true,
		notifications: refreshed.notifications,
		hash: refreshed.hash,
	};
}

export async function markNotificationAsRead(
	notificationId: string,
	userId: string
): Promise<
	| { success: true; notification: NotificationShape; message?: string }
	| { success: false; status: number; error: string }
> {
	const notification = await prisma.notification.findUnique({
		where: {
			id: notificationId,
		},
	});

	if (!notification) {
		return { success: false, status: 404, error: "Notification not found" };
	}

	if (notification.userId !== null && notification.userId !== userId) {
		return {
			success: false,
			status: 403,
			error: "Forbidden: You are not authorized to update this notification",
		};
	}

	if (notification.isRead) {
		return {
			success: true,
			notification,
			message: "Notification was already marked as read",
		};
	}

	const updatedNotification = await prisma.notification.update({
		where: {
			id: notificationId,
		},
		data: {
			isRead: true,
		},
	});

	return {
		success: true,
		notification: updatedNotification,
		message: "Notification marked as read",
	};
}
