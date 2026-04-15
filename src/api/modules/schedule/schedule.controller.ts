import {
	createDutyDayOff as createDutyDayOffService,
	generateDailySchedule as generateDailyScheduleService,
	getDutyScheduleBootstrap as getDutyScheduleBootstrapService,
	getDutySettings as getDutySettingsService,
	getDutySummary as getDutySummaryService,
	listDutyDayOffs as listDutyDayOffsService,
	listDutyReminderLogs as listDutyReminderLogsService,
	listDutyStaff as listDutyStaffService,
	listSchedules as listSchedulesService,
	removeDutyDayOff as removeDutyDayOffService,
	runDutyReminder as runDutyReminderService,
	syncDutyDayOffsFromSigapNow as syncDutyDayOffsFromSigapNowService,
	updateDutySettings as updateDutySettingsService,
} from "./schedule.service";

export const createDutyDayOff = (payload: unknown) => createDutyDayOffService(payload);
export const generateDailySchedule = (dateParam?: string | null) =>
	generateDailyScheduleService(dateParam);
export const getDutyScheduleBootstrap = (dateParam?: string | null) =>
	getDutyScheduleBootstrapService(dateParam);
export const getDutySettings = () => getDutySettingsService();
export const getDutySummary = (dateParam?: string | null) => getDutySummaryService(dateParam);
export const listDutyStaff = () => listDutyStaffService();
export const listDutyDayOffs = (fromParam?: string | null, toParam?: string | null) =>
	listDutyDayOffsService(fromParam, toParam);
export const listDutyReminderLogs = (fromParam?: string | null, toParam?: string | null) =>
	listDutyReminderLogsService(fromParam, toParam);
export const listSchedules = (fromParam?: string | null, toParam?: string | null) =>
	listSchedulesService(fromParam, toParam);
export const removeDutyDayOff = (id: string) => removeDutyDayOffService(id);
export const runDutyReminder = (dateParam?: string | null, force = false) =>
	runDutyReminderService(dateParam, force);
export const syncDutyDayOffsFromSigapNow = () => syncDutyDayOffsFromSigapNowService();
export const updateDutySettings = (payload: unknown) => updateDutySettingsService(payload);
