"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gender, LastEducation, Purpose } from "@/generated/prisma";

const guestFormSchema = z.object({
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
		.min(8, "No. HP minimal 8 digit")
		.max(20, "No. HP maksimal 20 digit")
		.regex(/^[0-9+()\s-]+$/, "Gunakan format nomor yang valid"),
	age: z.preprocess(
		(value) => {
			if (value === "" || value === null || value === undefined) {
				return undefined;
			}
			const asNumber = Number(value);
			return Number.isNaN(asNumber) ? value : asNumber;
		},
		z
			.number()
			.int()
			.min(1, "Umur minimal 1 tahun")
			.max(99, "Umur tidak valid")
			.optional()
	),
	institution: z.string().min(2, "Asal/Instansi minimal 2 karakter"),
	gender: z.nativeEnum(Gender, {
		required_error: "Pilih jenis kelamin",
	}),
	lastEducation: z.nativeEnum(LastEducation, {
		required_error: "Pilih pendidikan terakhir",
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
		required_error: "Pilih keperluan",
	}),
});

type GuestFormValues = z.infer<typeof guestFormSchema>;

const educationOptions: { value: LastEducation; label: string }[] = [
	{ value: LastEducation.SD, label: "SD" },
	{ value: LastEducation.SMP, label: "SMP" },
	{ value: LastEducation.SMA_SMK, label: "SMA / SMK" },
	{ value: LastEducation.D1, label: "Diploma I (D1)" },
	{ value: LastEducation.D2, label: "Diploma II (D2)" },
	{ value: LastEducation.D3, label: "Diploma III (D3)" },
	{ value: LastEducation.D4_S1, label: "Diploma IV / S1" },
	{ value: LastEducation.S2, label: "S2" },
	{ value: LastEducation.S3, label: "S3" },
];

const purposeOptions: { value: Purpose; label: string; accent: string }[] = [
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

const genderOptions = [
	{ value: Gender.MALE, label: "Laki-Laki" },
	{ value: Gender.FEMALE, label: "Perempuan" },
];

const occupationOptions = [
	{ value: "Guru/Dosen", label: "Guru/Dosen" },
	{ value: "Karyawan BUMN", label: "Karyawan BUMN" },
	{ value: "Karyawan Swasta", label: "Karyawan Swasta" },
	{ value: "Pelajar/Mahasiswa", label: "Pelajar/Mahasiswa" },
	{ value: "PNS/PPPK", label: "PNS/PPPK" },
	{ value: "TNI/Polri", label: "TNI/Polri" },
	{ value: "Wiraswasta", label: "Wiraswasta" },
	{ value: "Lainnya", label: "Lainnya" },
];

type SubmissionResult = {
	queueId: string;
	queueNumber: number;
	queueCode: string;
	purpose: Purpose | null;
	serviceName: string;
	guestName: string;
};

export default function GuestForm() {
	const router = useRouter();
	const [submission, setSubmission] = useState<SubmissionResult | null>(null);

	const form = useForm<GuestFormValues>({
		resolver: zodResolver(guestFormSchema) as unknown as Resolver<GuestFormValues>,
		defaultValues: {
			fullName: "",
			email: "",
			address: "",
			phone: "",
			age: undefined,
			institution: "",
			gender: undefined,
			lastEducation: undefined,
			occupation: "Pelajar/Mahasiswa",
			purpose: Purpose.KONSULTASI_STATISTIK,
		},
	});

	const selectedPurposeValue = form.watch("purpose");

	const selectedPurpose = useMemo(
		() =>
			purposeOptions.find(
				(option) => option.value === selectedPurposeValue
			)?.label,
		[selectedPurposeValue]
	);

	const onSubmit = async (values: GuestFormValues) => {
		setSubmission(null);
		const payload = {
			...values,
			email: values.email?.trim() || undefined,
			address: values.address?.trim() || undefined,
			institution: values.institution?.trim() || undefined,
		};

		try {
			const response = await fetch("/api/guest", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			const result = await response.json();

			if (!response.ok) {
				toast.error(result.error || "Gagal membuat antrean baru");
				return;
			}

			setSubmission(result.data);
			toast.success("Buku tamu tersimpan, nomor antrean dibuat");
			form.reset({
				fullName: "",
				email: "",
				address: "",
				phone: "",
				age: undefined,
				institution: "",
				gender: undefined,
				lastEducation: undefined,
				occupation: values.occupation ?? "Pelajar/Mahasiswa",
				purpose: values.purpose,
			});
			if (result.data.queueId) {
				router.push(`/guest/queue/${result.data.queueId}`);
			}
		} catch (error) {
			console.error("Error submitting guest form", error);
			toast.error("Terjadi kesalahan, coba lagi sebentar lagi");
		}
	};

	return (
		<div className="space-y-4">
			<Card className="border-none bg-card/90 shadow-2xl backdrop-blur">
				<CardHeader className="space-y-2 md:space-y-3">
					<div className="flex items-center justify-between">
						<CardTitle className="text-xl md:text-2xl">Buku Tamu PST</CardTitle>
						<Badge variant="outline" className="gap-1 bg-primary/20">
							<Smartphone className="h-4 w-4 md:h-5 md:w-5" />
							<span>Mobile-first</span>
						</Badge>
					</div>
					<CardDescription className="text-sm md:text-base">
						Data yang Anda isi otomatis membuat nomor antrean layanan PST BPS
						Bulungan. Tunjukkan kode antrean ke petugas setelah mengirim.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="grid grid-cols-1 gap-4"
						>
							<FormField
								control={form.control}
								name="fullName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Nama Lengkap</FormLabel>
										<FormControl>
											<Input
												placeholder="Contoh: Siti Rahmawati"
												autoComplete="name"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Email</FormLabel>
											<FormControl>
												<Input
													type="email"
													placeholder="email@contoh.id"
													autoComplete="email"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="phone"
									render={({ field }) => (
										<FormItem>
											<FormLabel>No. HP</FormLabel>
											<FormControl>
												<Input
													type="tel"
													inputMode="tel"
													placeholder="08xxxxxxx"
													autoComplete="tel"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<FormField
								control={form.control}
								name="address"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Alamat</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Tulis alamat tempat tinggal atau kantor"
												className="min-h-[80px] resize-none"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
								<FormField
									control={form.control}
									name="age"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Umur</FormLabel>
											<FormControl>
												<Input
													type="number"
													inputMode="numeric"
													min={1}
													max={120}
													placeholder="Umur"
													{...field}
													value={
														field.value === undefined
															? ""
															: Number(field.value)
													}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="gender"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Jenis Kelamin</FormLabel>
											<FormControl>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<SelectTrigger className="w-full bg-background">
														<SelectValue placeholder="Pilih" />
													</SelectTrigger>
													<SelectContent>
														{genderOptions.map((option) => (
															<SelectItem
																key={option.value}
																value={option.value}
															>
																{option.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="lastEducation"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Pendidikan Terakhir</FormLabel>
											<FormControl>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<SelectTrigger className="w-full bg-background">
														<SelectValue placeholder="Pilih" />
													</SelectTrigger>
													<SelectContent>
														{educationOptions.map((option) => (
															<SelectItem
																key={option.value}
																value={option.value}
															>
																{option.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<FormField
								control={form.control}
								name="institution"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Asal / Instansi</FormLabel>
										<FormControl>
											<Input
												placeholder="Universitas, OPD, perusahaan, atau lainnya"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="occupation"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Pekerjaan</FormLabel>
										<FormControl>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<SelectTrigger className="w-full bg-background">
													<SelectValue placeholder="Pilih pekerjaan" />
												</SelectTrigger>
												<SelectContent>
													{occupationOptions.map((option) => (
														<SelectItem key={option.value} value={option.value}>
															{option.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="purpose"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Keperluan</FormLabel>
											<FormControl>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<SelectTrigger className="w-full bg-background">
														<SelectValue placeholder="Pilih keperluan" />
													</SelectTrigger>
													<SelectContent>
														{purposeOptions.map((option) => (
															<SelectItem
																key={option.value}
																value={option.value}
															>
																{option.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<div className="flex flex-col justify-end rounded-lg border border-dashed border-border/80 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
									<p className="font-semibold text-foreground">
										Alur cepat
									</p>
									<ul className="list-disc pl-4">
										<li>Pindai QR ke halaman ini</li>
										<li>Isi data diri dengan benar</li>
										<li>Dapatkan nomor antrean otomatis</li>
										<li>Tunjukkan ke petugas PST</li>
									</ul>
								</div>
							</div>
							<Button
								type="submit"
								disabled={form.formState.isSubmitting}
								className="w-full md:w-auto"
							>
								{form.formState.isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Menyimpan...
									</>
								) : (
									"Daftarkan & Buat Nomor Antrean"
								)}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>

			{submission ? (
				<Card className="border-none bg-gradient-to-br from-primary/20 via-card to-secondary/30 shadow-lg backdrop-blur">
					<CardContent className="space-y-3 py-4">
						<div className="flex items-center gap-2 text-primary">
							<CheckCircle2 className="h-5 w-5" />
							<p className="font-semibold">Nomor antrean berhasil dibuat</p>
						</div>
						<div className="rounded-xl bg-background px-5 py-4 shadow-sm">
							<p className="text-sm text-muted-foreground">Kode antrean</p>
							<p className="text-4xl font-bold text-foreground md:text-5xl">
								{submission.queueCode}
							</p>
							<p className="mt-2 text-sm text-muted-foreground">
								Atas nama {submission.guestName}
							</p>
							<div className="mt-3 flex flex-wrap items-center gap-2">
								<Badge variant="outline">{submission.serviceName}</Badge>
								{submission.purpose ? (
									<Badge
										variant="outline"
										className={
											purposeOptions.find(
												(option) => option.value === submission.purpose
											)?.accent
										}
									>
										{
											purposeOptions.find(
												(option) => option.value === submission.purpose
											)?.label
										}
									</Badge>
								) : null}
								<Badge variant="outline">Nomor: {submission.queueNumber}</Badge>
							</div>
						</div>
						<p className="text-sm text-muted-foreground">
							Tunjukkan kode ini ke petugas PST. Antrean dimulai dengan status{" "}
							<span className="font-semibold text-foreground">menunggu</span>{" "}
							sesuai urutan hari ini.
						</p>
					</CardContent>
				</Card>
			) : (
				<Card className="border-dashed border-border bg-muted/40">
					<CardContent className="p-4 text-sm text-muted-foreground">
						Kode antrean akan muncul di sini setelah buku tamu dikirim.
						{selectedPurpose ? (
							<span className="ml-1 text-foreground">
								Keperluan saat ini: {selectedPurpose}.
							</span>
						) : null}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
