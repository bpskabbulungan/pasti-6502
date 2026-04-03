import prisma from "@api/infrastructure/database/prisma";
import { generateNotificationsHash } from "./notification.utils";
import {
	buildUnreadNotificationsWhere,
	isNotificationReadForUser,
} from "./notification.read-model";

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

const toNotificationShape = (
	notification: Pick<
		NotificationShape,
		"id" | "type" | "title" | "message" | "createdAt" | "updatedAt" | "userId"
	>,
	isRead: boolean
): NotificationShape => ({
	id: notification.id,
	type: notification.type,
	title: notification.title,
	message: notification.message,
	createdAt: notification.createdAt,
	updatedAt: notification.updatedAt,
	userId: notification.userId,
	isRead,
});

export async function getUnreadNotifications(userId: string) {
	const notifications = await prisma.notification.findMany({
		where: buildUnreadNotificationsWhere(userId),
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
	await prisma.$transaction(async (tx) => {
		const unreadNotifications = await tx.notification.findMany({
			where: buildUnreadNotificationsWhere(userId),
			select: { id: true },
		});

		if (unreadNotifications.length === 0) {
			return;
		}

		await tx.notificationRead.createMany({
			data: unreadNotifications.map((notification) => ({
				notificationId: notification.id,
				userId,
			})),
			skipDuplicates: true,
		});
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
		include: {
			reads: {
				where: { userId },
				select: { userId: true },
				take: 1,
			},
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

	if (isNotificationReadForUser(notification, userId)) {
		return {
			success: true,
			notification: toNotificationShape(notification, true),
			message: "Notification was already marked as read",
		};
	}

	const updatedNotification = await prisma.notificationRead.upsert({
		where: {
			notificationId_userId: {
				notificationId,
				userId,
			},
		},
		create: {
			notificationId,
			userId,
		},
		update: {
			readAt: new Date(),
		},
	});

	return {
		success: true,
		notification: toNotificationShape(
			{
				...notification,
				updatedAt: updatedNotification.readAt,
			},
			true
		),
		message: "Notification marked as read",
	};
}
