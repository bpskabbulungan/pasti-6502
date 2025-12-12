export type ReminderResponse = {
	success: boolean;
	message: string;
	data?: {
		whatsappUrl?: string;
		phoneNumber?: string;
	};
};

export type ReminderRequest = {
	phoneNumber: string;
	message: string;
};
