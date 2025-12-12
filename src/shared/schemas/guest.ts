import { z } from "zod";
import { Gender, LastEducation, Purpose } from "@/generated/prisma";

export const guestSchema = z.object({
	fullName: z.string().min(2, "Nama lengkap minimal 2 karakter"),
	email: z
		.string()
		.email("Format email tidak valid")
		.optional()
		.or(z.literal("")),
	address: z
		.string()
		.min(5, "Alamat minimal 5 karakter")
		.max(200, "Alamat terlalu panjang")
		.optional(),
	phone: z
		.string()
		.min(8, "Nomor HP minimal 8 digit")
		.max(20, "Nomor HP maksimal 20 digit")
		.regex(/^[0-9+()\s-]+$/, "Nomor HP hanya boleh berisi angka"),
	age: z.preprocess(
		(value) => {
			if (value === "" || value === null || typeof value === "undefined") {
				return undefined;
			}
			const asNumber = Number(value);
			return Number.isNaN(asNumber) ? value : asNumber;
		},
		z
			.number()
			.int()
			.min(1, "Umur minimal 1 tahun")
			.max(120, "Umur tidak valid")
			.optional()
	),
	institution: z
		.string()
		.min(2, "Asal/Instansi minimal 2 karakter")
		.max(150),
	gender: z.nativeEnum(Gender, {
		required_error: "Jenis kelamin wajib dipilih",
	}),
	lastEducation: z.nativeEnum(LastEducation, {
		required_error: "Pendidikan terakhir wajib dipilih",
	}),
	occupation: z.enum(
		[
			"Guru/Dosen",
			"Karyawan BUMN",
			"Karyawan Swasta",
			"Pelajar/Mahasiswa",
			"PNS/PPPK",
			"TNI/Polri",
			"Wiraswasta",
			"Lainnya",
		],
		{ required_error: "Pilih pekerjaan" }
	),
	purpose: z.nativeEnum(Purpose, {
		required_error: "Keperluan wajib dipilih",
	}),
});
