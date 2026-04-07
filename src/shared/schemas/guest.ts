import { z } from "zod";
import {
	Gender,
	LastEducation,
} from "@/shared/constants/enums";

const genderValues = Object.values(Gender) as [Gender, ...Gender[]];
const lastEducationValues = Object.values(LastEducation) as [
	LastEducation,
	...LastEducation[],
];
const fullNameRegex = /^[\p{L}\s'.-]+$/u;
const institutionRegex = /^[\p{L}\p{N}\s.,'"/()&-]+$/u;
const indonesianPhoneRegex = /^(?:08|628)\d{8,12}$/;

export const guestSchema = z.object({
	fullName: z
		.string()
		.trim()
		.min(3, "Nama lengkap minimal 3 karakter")
		.max(120, "Nama lengkap maksimal 120 karakter")
		.regex(fullNameRegex, "Nama lengkap hanya boleh berisi huruf dan tanda baca umum"),
	email: z
		.string()
		.trim()
		.min(1, "Email wajib diisi")
		.max(120, "Email maksimal 120 karakter")
		.email("Format email tidak valid")
		.toLowerCase(),
	address: z
		.string()
		.trim()
		.min(10, "Alamat minimal 10 karakter")
		.max(200, "Alamat terlalu panjang"),
	phone: z
		.string()
		.trim()
		.regex(/^\d+$/, "Nomor HP hanya boleh berisi angka")
		.min(10, "Nomor HP minimal 10 digit")
		.max(15, "Nomor HP maksimal 15 digit")
		.regex(indonesianPhoneRegex, "Nomor HP harus diawali 08 atau 628"),
	age: z.preprocess(
		(value) => {
			if (value === "" || value === null || typeof value === "undefined") {
				return undefined;
			}
			const asNumber = Number(value);
			return Number.isNaN(asNumber) ? value : asNumber;
		},
		z
			.number({
				required_error: "Umur wajib diisi",
				invalid_type_error: "Umur wajib diisi",
			})
			.int()
			.min(1, "Umur minimal 1 tahun")
			.max(120, "Umur tidak valid")
	),
	institution: z
		.string()
		.trim()
		.min(2, "Asal/Instansi minimal 2 karakter")
		.max(150, "Asal/Instansi maksimal 150 karakter")
		.regex(institutionRegex, "Asal/Instansi berisi karakter yang tidak diperbolehkan"),
	gender: z.enum(genderValues, {
		required_error: "Jenis kelamin wajib dipilih",
	}),
	lastEducation: z.enum(lastEducationValues, {
		required_error: "Pendidikan terakhir wajib dipilih",
	}),
	occupation: z.enum(
		[
			"Pelajar/Mahasiswa",
			"PNS/PPPK",
			"TNI/Polri",
			"Pegawai BUMN/BUMD",
			"Pegawai Swasta",
			"Wiraswasta/Usahawan",
			"Guru/Dosen",
			"Tidak/Belum Bekerja",
			"Pensiunan",
			"Lainnya",
		],
		{ required_error: "Pilih pekerjaan" }
	),
	serviceId: z.string().trim().min(1, "Keperluan kunjungan wajib dipilih"),
});
