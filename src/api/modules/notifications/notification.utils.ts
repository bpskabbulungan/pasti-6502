import { createHash } from "crypto";

export function generateNotificationsHash<T>(notifications: T[]): string {
	const payload = JSON.stringify(notifications);
	return createHash("md5").update(payload).digest("hex");
}
