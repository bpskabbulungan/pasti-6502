export type ReminderResponse = {
	success: boolean;
	message: string;
	data?: {
		whatsappUrl?: string;
		phoneNumber?: string;
		phone?: string;
		visitorName?: string;
		message?: string;
		[key: string]: unknown;
	};
};

export type ReminderRequest = {
	phoneNumber: string;
	message: string;
};
