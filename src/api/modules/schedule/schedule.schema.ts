import { DayOffType } from "@prisma/client";
import { z } from "zod";

export const scheduleSettingsSchema = z.object({
	workDays: z.array(z.number().int().min(1).max(7)).min(1).max(7).optional(),
	reminderEnabled: z.boolean().optional(),
	autoAssignEnabled: z.boolean().optional(),
	reminderTemplate: z.string().trim().min(1).optional(),
	timezone: z.string().trim().min(1).optional(),
});

export const dayOffSchema = z.object({
	date: z.string().trim().min(1, "Tanggal wajib diisi"),
	name: z.string().trim().min(1, "Nama hari libur/cuti wajib diisi"),
	type: z.nativeEnum(DayOffType).optional(),
	note: z.string().trim().optional().nullable(),
});
