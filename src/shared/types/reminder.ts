export type ReminderResponse = {
	success: boolean;
	message: string;
	data?: {
		whatsappUrl?: string;
		phoneNumber?: string;
		[key: string]: unknown;
	};
};

export type ReminderRequest = {
	phoneNumber: string;
	message: string;
};
