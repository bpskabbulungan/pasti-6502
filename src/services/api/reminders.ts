import { apiFetch } from "./base-client";
import type { ReminderResponse } from "@shared/types/reminder";

export const remindersApi = {
	sendWaBot: (payload: { phoneNumber: string; message: string }) =>
		apiFetch<ReminderResponse>("/api/reminders/wa-bot", {
			method: "POST",
			body: payload,
		}),
};
