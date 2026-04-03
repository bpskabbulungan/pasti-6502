import type { Prisma } from "@prisma/client";

type NotificationReadState = {
	isRead: boolean;
	reads?: Array<{ userId: string }>;
};

export function isNotificationReadForUser(
	notification: NotificationReadState,
	userId: string
) {
	const readByUser = notification.reads?.some((entry) => entry.userId === userId) ?? false;
	return notification.isRead || readByUser;
}

export function buildUnreadNotificationsWhere(userId: string): Prisma.NotificationWhereInput {
	return {
		OR: [{ userId: null }, { userId }],
		isRead: false,
		reads: {
			none: { userId },
		},
	};
}
