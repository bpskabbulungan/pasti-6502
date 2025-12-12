import { createHash } from "crypto";

export function generateQueueHash<T>(queues: T[]): string {
	const queueString = JSON.stringify(queues);
	return createHash("sha256").update(queueString).digest("hex");
}
