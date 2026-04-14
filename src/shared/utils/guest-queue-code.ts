import {
	DEFAULT_SERVICE_CODE,
	getServiceCodeByName,
	normalizeServiceCode,
} from "@/shared/constants/service-catalog";

type ServiceInfo = { name?: string; code?: string } | null | undefined;

export function getQueuePrefix(serviceName: ServiceInfo): string {
	const persistedCode = serviceName?.code ? normalizeServiceCode(serviceName.code) : "";
	if (persistedCode) {
		return persistedCode;
	}

	if (!serviceName?.name) {
		return DEFAULT_SERVICE_CODE;
	}

	return getServiceCodeByName(serviceName.name);
}

export function formatGuestQueueCode(
	service: ServiceInfo,
	queueNumber: number
): string {
	const normalizedQueueNumber =
		Number.isFinite(queueNumber) && queueNumber > 0 ? Math.trunc(queueNumber) : 0;

	return `${getQueuePrefix(service)}-${normalizedQueueNumber
		.toString()
		.padStart(3, "0")}`;
}
