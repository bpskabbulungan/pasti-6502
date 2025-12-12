import type { ReminderResponse } from "./reminder-types";

const normalizePhoneNumber = (phoneNumber: string): string => {
	const cleanNumber = phoneNumber.replace(/\s+/g, "");
	if (cleanNumber.startsWith("+62")) {
		return cleanNumber.substring(1); // drop +
	}
	if (cleanNumber.startsWith("0")) {
		return `62${cleanNumber.substring(1)}`;
	}
	if (!cleanNumber.startsWith("62")) {
		return `62${cleanNumber}`;
	}
	return cleanNumber;
};

export async function sendWhatsAppDirectReminder(
	phoneNumber: string,
	message: string
): Promise<ReminderResponse> {
	try {
		const normalized = normalizePhoneNumber(phoneNumber);
		const whatsappUrl = `https://wa.me/${normalized}?text=${encodeURIComponent(
			message
		)}`;

		return {
			success: true,
			message: "WhatsApp reminder link prepared",
			data: { whatsappUrl, phoneNumber: normalized },
		};
	} catch (error) {
		console.error("Error preparing WhatsApp direct reminder:", error);
		return {
			success: false,
			message: "Gagal menyiapkan pengingat via WhatsApp direct",
		};
	}
}

export async function sendWhatsAppBotReminder(
	phoneNumber: string,
	message: string
): Promise<ReminderResponse> {
	try {
		const response = await fetch("/api/reminders/wa-bot", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ phoneNumber, message }),
		});

		const data = (await response.json()) as ReminderResponse;
		if (!response.ok) {
			return {
				success: false,
				message:
					data?.message ||
					"Terjadi kesalahan saat mengirim pengingat via WhatsApp Bot",
			};
		}

		return {
			success: data?.success ?? false,
			message:
				data?.message ||
				"Pengingat berhasil diproses via WhatsApp Bot",
			data: data?.data,
		};
	} catch (error) {
		console.error("Error sending WhatsApp Bot reminder (client):", error);
		return {
			success: false,
			message: "Terjadi kesalahan saat mengirim pengingat via WhatsApp Bot",
		};
	}
}
