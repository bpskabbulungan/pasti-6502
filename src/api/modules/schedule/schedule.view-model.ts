import type { Prisma } from "@prisma/client";
import { formatDisplayDate } from "@/lib/date-format";

type DutySettingsShape = {
	workDays: Prisma.JsonValue;
	reminderEnabled: boolean;
	autoAssignEnabled: boolean;
};

export function toDutySettingsViewModel<T extends DutySettingsShape>(
	settings: T,
	normalizeWorkDays: (value: Prisma.JsonValue) => number[],
	availableTemplatePlaceholders: readonly string[]
) {
	return {
		...settings,
		workDays: normalizeWorkDays(settings.workDays),
		availableTemplatePlaceholders,
	};
}

export function toDutySummaryViewModel<TSchedule, TSettings extends DutySettingsShape>(params: {
	scheduleDate: Date;
	eligibility:
		| { ok: true }
		| {
				ok: false;
				reason: string;
		  };
	settings: TSettings;
	schedule: TSchedule | null;
	normalizeWorkDays: (value: Prisma.JsonValue) => number[];
}) {
	return {
		date: params.scheduleDate,
		dateLabel: formatDisplayDate(params.scheduleDate),
		isWorkingDay: params.eligibility.ok,
		reason: params.eligibility.ok ? null : params.eligibility.reason,
		settings: {
			workDays: params.normalizeWorkDays(params.settings.workDays),
			reminderEnabled: params.settings.reminderEnabled,
			autoAssignEnabled: params.settings.autoAssignEnabled,
		},
		schedule: params.schedule,
	};
}
