import { z } from "zod";

export const guestbookStatusFilterSchema = z.enum([
	"ALL",
	"WAITING",
	"SERVING",
	"COMPLETED",
	"CANCELED",
]);

export const guestbookPurposeFilterSchema = z.enum([
	"ALL",
	"KONSULTASI_STATISTIK",
	"PERPUSTAKAAN",
	"REKOMENDASI_STATISTIK",
	"LAINNYA",
]);

export const guestbookDateFilterSchema = z.enum(["today", "all"]);

export type StatusFilter = z.infer<typeof guestbookStatusFilterSchema>;
export type PurposeFilter = z.infer<typeof guestbookPurposeFilterSchema>;
export type DateFilter = z.infer<typeof guestbookDateFilterSchema>;
