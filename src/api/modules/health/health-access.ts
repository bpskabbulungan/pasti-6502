export const isDetailedHealthAuthorized = (detailSecret?: string, requestSecret?: string | null) =>
	Boolean(detailSecret?.trim() && requestSecret?.trim() === detailSecret.trim());
