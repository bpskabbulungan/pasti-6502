import { Gender, LastEducation, QueueStatus } from "@/shared/constants/enums";
import type { GuestbookEntry, GuestbookSummary } from "@shared/types/guestbook";
import type {
	DateFilter,
	SortByFilter,
	SortOrderFilter,
} from "./schema";

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

export const dateFilterLabels: Record<DateFilter, string> = {
	today: "Hari ini",
	all: "Semua tanggal",
	year: "Tahunan",
	month: "Bulanan",
	quarter: "Triwulan",
	semester: "Semester",
};

export const monthOptions = [
	{ value: 1, label: "Januari" },
	{ value: 2, label: "Februari" },
	{ value: 3, label: "Maret" },
	{ value: 4, label: "April" },
	{ value: 5, label: "Mei" },
	{ value: 6, label: "Juni" },
	{ value: 7, label: "Juli" },
	{ value: 8, label: "Agustus" },
	{ value: 9, label: "September" },
	{ value: 10, label: "Oktober" },
	{ value: 11, label: "November" },
	{ value: 12, label: "Desember" },
] as const;

export const quarterOptions = [
	{ value: 1, label: "Triwulan I" },
	{ value: 2, label: "Triwulan II" },
	{ value: 3, label: "Triwulan III" },
	{ value: 4, label: "Triwulan IV" },
] as const;

export const semesterOptions = [
	{ value: 1, label: "Semester I" },
	{ value: 2, label: "Semester II" },
] as const;

export const sortOptions: Array<{
	value: `${SortByFilter}.${SortOrderFilter}`;
	label: string;
}> = [
	{ value: "createdAt.desc", label: "Tanggal datang terbaru" },
	{ value: "createdAt.asc", label: "Tanggal datang terlama" },
	{ value: "queueCode.asc", label: "Kode antrean A-Z" },
	{ value: "queueCode.desc", label: "Kode antrean Z-A" },
	{ value: "fullName.asc", label: "Nama A-Z" },
	{ value: "fullName.desc", label: "Nama Z-A" },
	{ value: "serviceName.asc", label: "Layanan A-Z" },
	{ value: "serviceName.desc", label: "Layanan Z-A" },
	{ value: "officerName.asc", label: "Petugas A-Z" },
	{ value: "officerName.desc", label: "Petugas Z-A" },
	{ value: "filledSKD.asc", label: "Monitoring SKD: Belum -> Sudah" },
	{ value: "filledSKD.desc", label: "Monitoring SKD: Sudah -> Belum" },
];

export const getDateFilterLabel = ({
	dateFilter,
	year,
	month,
	quarter,
	semester,
}: {
	dateFilter: DateFilter;
	year: number;
	month: number;
	quarter: number;
	semester: number;
}) => {
	switch (dateFilter) {
		case "year":
			return `Tahun ${year}`;
		case "month":
			return `${monthOptions.find((option) => option.value === month)?.label ?? "Bulan"} ${year}`;
		case "quarter":
			return `${quarterOptions.find((option) => option.value === quarter)?.label ?? "Triwulan"} ${year}`;
		case "semester":
			return `${semesterOptions.find((option) => option.value === semester)?.label ?? "Semester"} ${year}`;
		default:
			return dateFilterLabels[dateFilter];
	}
};

export const buildFallbackSummary = (
	entries: GuestbookEntry[],
	totalEntries: number | null
): GuestbookSummary => {
	const statusCount = entries.reduce(
		(acc, entry) => {
			acc.total += 1;
			acc.skdPending += entry.filledSKD ? 0 : 1;
			switch (entry.status) {
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
