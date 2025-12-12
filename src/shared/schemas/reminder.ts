import { z } from "zod";

export const reminderRequestSchema = z.object({
	phoneNumber: z.string().min(8, "Nomor telepon tidak valid"),
	message: z.string().min(1, "Pesan tidak boleh kosong"),
});
