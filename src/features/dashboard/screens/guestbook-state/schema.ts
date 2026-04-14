import { z } from "zod";

export const guestbookDateFilterSchema = z.enum([
	"today",
	"all",
	"year",
	"month",
	"quarter",
	"semester",
]);
export const guestbookSortBySchema = z.enum([
	"createdAt",
	"fullName",
	"serviceName",
	"queueCode",
	"officerName",
	"filledSKD",
]);
export const guestbookSortOrderSchema = z.enum(["asc", "desc"]);

export type DateFilter = z.infer<typeof guestbookDateFilterSchema>;
export type SortByFilter = z.infer<typeof guestbookSortBySchema>;
export type SortOrderFilter = z.infer<typeof guestbookSortOrderSchema>;
