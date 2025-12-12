import { z } from "zod";
import { Gender, LastEducation, Purpose, QueueType } from "@/generated/prisma";

export const visitorSubmissionSchema = z.object({
	name: z.string().min(2, "Nama lengkap minimal 2 karakter"),
	email: z.string().email("Format email tidak valid"),
	address: z
		.string()
		.min(5, "Alamat minimal 5 karakter")
		.max(200, "Alamat terlalu panjang"),
	phone: z
		.string()
		.min(10, "No. WhatsApp minimal 10 digit")
		.max(20, "No. WhatsApp maksimal 20 digit")
		.regex(/^[0-9+()\s-]+$/, "Gunakan format nomor yang valid"),
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
		{ required_error: "Pekerjaan wajib dipilih" }
	),
	purpose: z.nativeEnum(Purpose, {
		required_error: "Keperluan wajib dipilih",
	}),
	serviceId: z.string().min(1, "Layanan harus dipilih"),
	tempUuid: z.string().min(1, "Link sementara tidak valid"),
	queueType: z.nativeEnum(QueueType, {
		required_error: "Tipe antrean wajib dipilih",
	}),
});
