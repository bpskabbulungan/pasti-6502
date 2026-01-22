export const Role = {
	SUPERADMIN: "SUPERADMIN",
	ADMIN: "ADMIN",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const QueueStatus = {
	WAITING: "WAITING",
	CALLED: "CALLED",
	SERVING: "SERVING",
	COMPLETED: "COMPLETED",
	CANCELED: "CANCELED",
} as const;

export type QueueStatus = (typeof QueueStatus)[keyof typeof QueueStatus];

export const QueueType = {
	ONLINE: "ONLINE",
	OFFLINE: "OFFLINE",
} as const;

export type QueueType = (typeof QueueType)[keyof typeof QueueType];

export const ServiceStatus = {
	ACTIVE: "ACTIVE",
	INACTIVE: "INACTIVE",
} as const;

export type ServiceStatus = (typeof ServiceStatus)[keyof typeof ServiceStatus];

export const Gender = {
	MALE: "MALE",
	FEMALE: "FEMALE",
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

export const LastEducation = {
	SD: "SD",
	SMP: "SMP",
	SMA_SMK: "SMA_SMK",
	D1: "D1",
	D2: "D2",
	D3: "D3",
	D4_S1: "D4_S1",
	S2: "S2",
	S3: "S3",
	LAINNYA: "LAINNYA",
} as const;

export type LastEducation =
	(typeof LastEducation)[keyof typeof LastEducation];

export const Purpose = {
	KONSULTASI_STATISTIK: "KONSULTASI_STATISTIK",
	PERPUSTAKAAN: "PERPUSTAKAAN",
	REKOMENDASI_STATISTIK: "REKOMENDASI_STATISTIK",
	LAINNYA: "LAINNYA",
} as const;

export type Purpose = (typeof Purpose)[keyof typeof Purpose];
