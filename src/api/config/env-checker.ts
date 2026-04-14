import "server-only";

export const checkWhatsAppBotEnv = (): {
	isValid: boolean;
	message: string;
} => {
	const apiUrl = process.env.NEXT_PUBLIC_WA_API_URL;
	const adminKey = process.env.WA_ADMIN_KEY;

	if (!apiUrl || !adminKey) {
		return {
			isValid: false,
			message:
				"Variabel lingkungan untuk WhatsApp Bot belum dikonfigurasi. Tambahkan NEXT_PUBLIC_WA_API_URL dan WA_ADMIN_KEY di file .env (WA_ADMIN_KEY hanya untuk server).",
		};
	}

	return { isValid: true, message: "" };
};

export const checkSigapEnv = (): {
	isValid: boolean;
	message: string;
} => {
	const baseUrl = process.env.SIGAP_BASE_URL;
	const username = process.env.SIGAP_USERNAME;
	const password = process.env.SIGAP_PASSWORD;

	if (!baseUrl || !username || !password) {
		return {
			isValid: false,
			message:
				"Variabel lingkungan SIGAP belum lengkap. Tambahkan SIGAP_BASE_URL, SIGAP_USERNAME, dan SIGAP_PASSWORD pada environment server.",
		};
	}

	return { isValid: true, message: "" };
};
