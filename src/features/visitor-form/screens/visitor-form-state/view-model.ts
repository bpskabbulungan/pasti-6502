import { Gender, LastEducation } from "@/shared/constants/enums";

export const TRACKING_POLL_INTERVAL_MS = 60000;

export const genderOptions = [
	{ value: Gender.MALE, label: "Laki-Laki" },
	{ value: Gender.FEMALE, label: "Perempuan" },
] as const;

export const educationOptions = [
	{ value: LastEducation.SD, label: "SD atau setingkatnya" },
	{ value: LastEducation.SMP, label: "SMP atau setingkatnya" },
	{ value: LastEducation.SMA_SMK, label: "SMA atau setingkatnya" },
	{ value: LastEducation.D1, label: "D1" },
	{ value: LastEducation.D2, label: "D2" },
	{ value: LastEducation.D3, label: "D3" },
	{ value: LastEducation.D4_S1, label: "D4 / S1" },
	{ value: LastEducation.S2, label: "S2" },
	{ value: LastEducation.S3, label: "S3" },
	{ value: LastEducation.LAINNYA, label: "Lainnya" },
] as const;

export const occupationOptions = [
	{ value: "Guru/Dosen", label: "Guru/Dosen" },
	{ value: "Karyawan BUMN", label: "Karyawan BUMN" },
	{ value: "Karyawan Swasta", label: "Karyawan Swasta" },
	{ value: "Pelajar/Mahasiswa", label: "Pelajar/Mahasiswa" },
	{ value: "PNS/PPPK", label: "PNS/PPPK" },
	{ value: "TNI/Polri", label: "TNI/Polri" },
	{ value: "Wiraswasta", label: "Wiraswasta" },
	{ value: "Lainnya", label: "Lainnya" },
] as const;
