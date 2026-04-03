import { Purpose } from "@/shared/constants/enums";

type GuestQueuePurpose = (typeof Purpose)[keyof typeof Purpose] | null | undefined;

const prefixByPurpose: Record<Exclude<GuestQueuePurpose, null | undefined>, string> = {
	[Purpose.KONSULTASI_STATISTIK]: "K",
	[Purpose.PERPUSTAKAAN]: "P",
	[Purpose.REKOMENDASI_STATISTIK]: "R",
	[Purpose.LAINNYA]: "K",
};

const DEFAULT_PREFIX = "K";

export function getGuestQueuePrefix(purpose: GuestQueuePurpose): string {
	if (!purpose) {
		return DEFAULT_PREFIX;
	}

	return prefixByPurpose[purpose] ?? DEFAULT_PREFIX;
}

export function formatGuestQueueCode(
	purpose: GuestQueuePurpose,
	queueNumber: number
): string {
	const normalizedQueueNumber =
		Number.isFinite(queueNumber) && queueNumber > 0 ? Math.trunc(queueNumber) : 0;

	return `${getGuestQueuePrefix(purpose)}-${normalizedQueueNumber
		.toString()
		.padStart(3, "0")}`;
}
