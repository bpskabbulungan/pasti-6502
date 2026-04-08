type ServiceInfo = { name?: string } | null | undefined;

const DEFAULT_PREFIX = "K";

export function getQueuePrefix(serviceName: ServiceInfo): string {
	if (!serviceName?.name) {
		return DEFAULT_PREFIX;
	}

	// Use first letter of service name as prefix
	const firstLetter = serviceName.name.charAt(0).toUpperCase();
	return /^[A-Z]$/.test(firstLetter) ? firstLetter : DEFAULT_PREFIX;
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
