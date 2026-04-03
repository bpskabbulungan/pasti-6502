import { Gender, LastEducation, Purpose, QueueStatus } from "@/shared/constants/enums";
import type { GuestbookEntry, GuestbookSummary } from "@shared/types/guestbook";
import type { PurposeFilter, StatusFilter } from "./schema";

export const genderLabels: Record<Gender, string> = {
	[Gender.MALE]: "Laki-Laki",
	[Gender.FEMALE]: "Perempuan",
};

export const educationLabels: Record<LastEducation, string> = {
	[LastEducation.SD]: "SD",
	[LastEducation.SMP]: "SMP",
	[LastEducation.SMA_SMK]: "SMA / SMK",
	[LastEducation.D1]: "D1",
	[LastEducation.D2]: "D2",
	[LastEducation.D3]: "D3",
	[LastEducation.D4_S1]: "D4 / S1",
	[LastEducation.S2]: "S2",
	[LastEducation.S3]: "S3",
	[LastEducation.LAINNYA]: "Lainnya",
};

export const purposeOptions: Array<{ value: Purpose; label: string; accent: string }> = [
	{
		value: Purpose.KONSULTASI_STATISTIK,
		label: "Konsultasi Statistik",
		accent: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-100",
	},
	{
		value: Purpose.PERPUSTAKAAN,
		label: "Perpustakaan",
		accent: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100",
	},
	{
		value: Purpose.REKOMENDASI_STATISTIK,
		label: "Rekomendasi Statistik",
		accent: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100",
	},
	{
		value: Purpose.LAINNYA,
		label: "Lainnya",
		accent: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
	},
];

export const statusLabels: Record<QueueStatus, string> = {
	WAITING: "Menunggu",
	SERVING: "Sedang Dilayani",
	COMPLETED: "Selesai",
	CANCELED: "Dibatalkan",
};

export const statusBadgeClass: Record<QueueStatus, string> = {
	WAITING: "border-amber-500/30 bg-amber-500/10 text-amber-700",
	SERVING: "border-sky-500/30 bg-sky-500/10 text-sky-700",
	COMPLETED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
	CANCELED: "border-red-500/30 bg-red-500/10 text-red-700",
};

export const getPurposeFilterLabel = (purposeFilter: PurposeFilter) =>
	purposeFilter === "ALL"
		? "Semua keperluan"
		: (purposeOptions.find((option) => option.value === purposeFilter)?.label ?? "Keperluan");

export const getStatusFilterLabel = (statusFilter: StatusFilter) =>
	statusFilter === "ALL" ? "Semua status" : statusLabels[statusFilter];

export const buildFallbackSummary = (
	entries: GuestbookEntry[],
	totalEntries: number | null
): GuestbookSummary => {
	const statusCount = entries.reduce(
		(acc, entry) => {
			acc.total += 1;
			acc.skdPending += entry.filledSKD ? 0 : 1;
			switch (entry.status) {
				case QueueStatus.WAITING:
					acc.waiting += 1;
					break;
				case QueueStatus.SERVING:
					acc.serving += 1;
					break;
				case QueueStatus.COMPLETED:
					acc.completed += 1;
					break;
				case QueueStatus.CANCELED:
					acc.canceled += 1;
					break;
				default:
					break;
			}
			return acc;
		},
		{
			total: 0,
			waiting: 0,
			serving: 0,
			completed: 0,
			canceled: 0,
			skdPending: 0,
		}
	);

	return {
		...statusCount,
		total: totalEntries ?? statusCount.total,
	};
};
