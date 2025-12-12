export type Notification = {
	id: string;
	type: string;
	title: string;
	message: string;
	isRead: boolean;
	createdAt: string | Date;
	updatedAt?: string | Date;
	userId?: string | null;
};

export type NotificationListResponse = {
	notifications: Notification[];
	hash?: string;
	hasChanges?: boolean;
};
