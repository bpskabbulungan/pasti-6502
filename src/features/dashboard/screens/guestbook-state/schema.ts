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

export const guestbookDateFilterSchema = z.enum([
	"today",
	"all",
	"year",
	"month",
	"quarter",
	"semester",
]);
export const guestbookSortBySchema = z.enum(["createdAt", "fullName", "serviceName"]);
export const guestbookSortOrderSchema = z.enum(["asc", "desc"]);

export type StatusFilter = z.infer<typeof guestbookStatusFilterSchema>;
export type PurposeFilter = z.infer<typeof guestbookPurposeFilterSchema>;
export type DateFilter = z.infer<typeof guestbookDateFilterSchema>;
export type SortByFilter = z.infer<typeof guestbookSortBySchema>;
export type SortOrderFilter = z.infer<typeof guestbookSortOrderSchema>;
