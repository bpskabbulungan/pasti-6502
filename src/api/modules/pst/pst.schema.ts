import { z } from "zod";

export const monthYearSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
});

export const toggleOfficerCandidateSchema = z.object({
  isActiveCandidate: z.boolean(),
});

export const holidayCalendarSchema = z.object({
  calendar: z.object({
    LIBURAN: z.array(z.string().trim().regex(/^\d{2}-\d{2}-\d{4}$/)).default([]),
    CUTI_BERSAMA: z.array(z.string().trim().regex(/^\d{2}-\d{2}-\d{4}$/)).default([]),
  }),
});

export const generateMonthlyScheduleSchema = monthYearSchema.extend({
  forceRegenerate: z.boolean().optional(),
  allowSameFridayAssignee: z.boolean().optional(),
  holidayCalendar: holidayCalendarSchema.optional(),
  documentStatus: z.enum(["DRAFT", "FINAL", "REVISI"]).optional(),
  changeNotes: z.string().trim().max(500).optional(),
  downloadPdf: z.boolean().optional(),
});

export const reshuffleSingleSlotSchema = z.object({
  reason: z.string().trim().max(191).optional(),
});

export const swapScheduleSchema = z.object({
  firstScheduleId: z.string().trim().min(1),
  secondScheduleId: z.string().trim().min(1),
  reason: z.string().trim().max(191).optional(),
});
