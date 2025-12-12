import "server-only";
import { checkWhatsAppBotEnv } from "@/lib/env-checker";
import type { ReminderResponse } from "./reminder-types";
export type { ReminderResponse } from "./reminder-types";

type TokenCache = {
	token: string;
	expiresAt: number;
};

const TOKEN_TTL_FALLBACK_MS = 50 * 60 * 1000; // 50 minutes as safe default
const TOKEN_EXPIRY_BUFFER_MS = 60 * 1000; // refresh 1 minute before expiry
const REQUEST_TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;
let cachedToken: TokenCache | null = null;

const fetchWithTimeout = async (
	input: string,
	init?: RequestInit
): Promise<Response> => {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
	try {
		return await fetch(input, { ...init, signal: controller.signal });
	} finally {
		clearTimeout(timeout);
	}
};

const fetchWithRetry = async (
	input: string,
	init?: RequestInit,
	retries = MAX_RETRIES
): Promise<Response> => {
	let lastError: unknown;
	for (let attempt = 0; attempt <= retries; attempt++) {
		try {
			const response = await fetchWithTimeout(input, init);
			if (!response.ok && response.status >= 500 && attempt < retries) {
				continue;
			}
			return response;
		} catch (error) {
			lastError = error;
			if (attempt >= retries) {
				throw error;
			}
		}
	}
	throw lastError ?? new Error("Failed to fetch");
};

const getCachedToken = async (
	apiUrl: string,
	adminKey: string
): Promise<string> => {
	const now = Date.now();
	if (cachedToken && cachedToken.expiresAt > now) {
		return cachedToken.token;
	}

	const tokenResponse = await fetchWithRetry(`${apiUrl}/api/tokens/generate`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			adminKey,
			name: "BPS Bulungan SKD Reminder",
		}),
	});

	const tokenData = await tokenResponse.json();
	if (!tokenData?.success || !tokenData?.token) {
		throw new Error(tokenData?.message || "Gagal mendapatkan token WA Bot");
	}

	const ttlMs =
		typeof tokenData.expiresIn === "number"
			? Math.max(0, tokenData.expiresIn * 1000 - TOKEN_EXPIRY_BUFFER_MS)
			: TOKEN_TTL_FALLBACK_MS;

	cachedToken = {
		token: tokenData.token,
		expiresAt: now + ttlMs,
	};

	return tokenData.token;
};

/**
 * Sends a reminder via WhatsApp direct link
 * @param phoneNumber The recipient phone number
 * @param message The message to send
 * @returns Response with success status and URL
 */
export async function sendWhatsAppDirectReminder(
	phoneNumber: string,
	message: string
): Promise<ReminderResponse> {
	try {
		// Clean phone number
		let cleanNumber = phoneNumber.replace(/\s+/g, "");
		if (cleanNumber.startsWith("+62")) {
			cleanNumber = cleanNumber.substring(1); // Remove the + sign
		} else if (cleanNumber.startsWith("0")) {
			cleanNumber = "62" + cleanNumber.substring(1);
		} else if (!cleanNumber.startsWith("62")) {
			cleanNumber = "62" + cleanNumber;
		}

		// Create WhatsApp URL
		const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
			message
		)}`;

		return {
			success: true,
			message: "WhatsApp reminder link prepared",
			data: { whatsappUrl, phoneNumber: cleanNumber },
		};
	} catch (error) {
		console.error("Error preparing WhatsApp direct reminder:", error);
		return {
			success: false,
			message: "Gagal menyiapkan pengingat via WhatsApp direct",
		};
	}
}

/**
 * Sends a reminder via WhatsApp Bot API
 * @param phoneNumber The recipient phone number
 * @param message The message to send
 * @returns Response with success status
 */
export async function sendWhatsAppBotReminder(
	phoneNumber: string,
	message: string
): Promise<ReminderResponse> {
	try {
		// Check env variables
		const envCheck = checkWhatsAppBotEnv();
		if (!envCheck.isValid) {
			return {
				success: false,
				message: envCheck.message,
			};
		}

		const apiUrl = process.env.NEXT_PUBLIC_WA_API_URL;
		const adminKey = process.env.WA_ADMIN_KEY;
		if (!apiUrl || !adminKey) {
			return {
				success: false,
				message: "Konfigurasi WhatsApp Bot belum lengkap di server.",
			};
		}

		// Clean phone number
		let cleanNumber = phoneNumber.replace(/\s+/g, "");
		if (cleanNumber.startsWith("+62")) {
			cleanNumber = cleanNumber.substring(1); // Remove the + sign
		} else if (cleanNumber.startsWith("0")) {
			cleanNumber = "62" + cleanNumber.substring(1);
		} else if (!cleanNumber.startsWith("62")) {
			cleanNumber = "62" + cleanNumber;
		}

		const token = await getCachedToken(apiUrl, adminKey);

		// Check if number exists on WhatsApp
		const checkResponse = await fetchWithRetry(`${apiUrl}/api/check-number`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				number: cleanNumber,
			}),
		});

		const checkData = await checkResponse.json();
		if (!checkData.success) {
			return {
				success: false,
				message: `Gagal memeriksa nomor: ${checkData.message}`,
			};
		}

		if (!checkData.exists) {
			return {
				success: false,
				message: `Nomor ${phoneNumber} tidak terdaftar di WhatsApp`,
			};
		}

		// If number exists, send the message
		const messageResponse = await fetchWithRetry(
			`${apiUrl}/api/send-message`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					number: cleanNumber,
					message: message,
				}),
			}
		);

		const messageData = await messageResponse.json();
		if (!messageData.success) {
			return {
				success: false,
				message: `Gagal mengirim pesan: ${messageData.message}`,
			};
		}

		return {
			success: true,
			message: `Pesan berhasil dikirim ke ${cleanNumber}`,
			data: { messageData },
		};
	} catch (error) {
		console.error("Error sending WhatsApp bot reminder", error);
		return {
			success: false,
			message: "Terjadi kesalahan saat mengirim pesan via WhatsApp Bot",
		};
	}
}
