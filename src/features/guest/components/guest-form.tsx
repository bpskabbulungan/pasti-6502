"use client";

import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Gender, LastEducation, Purpose } from "@/shared/constants/enums";
import { guestApi } from "@/services/api/guest";
import { markNavigationPending } from "@/lib/navigation-pending";
import type { ErrorResponse } from "@shared/types/api";

const guestFormSchema = z.object({
  fullName: z.string().trim().min(2, "Nama lengkap minimal 2 karakter"),
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  address: z
    .string()
    .trim()
    .min(1, "Alamat wajib diisi")
    .min(5, "Alamat minimal 5 karakter")
    .max(200, "Alamat terlalu panjang"),
  phone: z
    .string()
    .trim()
    .min(8, "No. HP minimal 8 digit")
    .max(20, "No. HP maksimal 20 digit")
    .regex(/^[0-9+()\s-]+$/, "Gunakan format nomor yang valid"),
  age: z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
      return undefined;
    }
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }
    const asNumber = Number(value);
    return Number.isNaN(asNumber) ? value : asNumber;
  }, z.number({
    required_error: "Umur wajib diisi",
    invalid_type_error: "Umur wajib diisi",
  }).int().min(1, "Umur minimal 1 tahun").max(120, "Umur maksimal 120 tahun")),
  institution: z.string().trim().min(2, "Asal/Instansi minimal 2 karakter"),
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
  { value: LastEducation.LAINNYA, label: "Lainnya" },
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

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== "object" || !error) {
    return fallback;
  }

  const errorDetails = (error as { details?: ErrorResponse }).details;
  if (errorDetails?.error) {
    return errorDetails.error;
  }

  const message = (error as { message?: string }).message;
  return message || fallback;
};

export default function GuestForm() {
  const router = useRouter();

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

  const onSubmit = async (values: GuestFormValues) => {
    const payload = {
      ...values,
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      address: values.address.trim(),
      phone: values.phone.trim(),
      institution: values.institution.trim(),
    };

    try {
      const result = await guestApi.submit(payload);
      const data = result.data;

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
        purpose: values.purpose ?? Purpose.KONSULTASI_STATISTIK,
      });
      if (data.queueId) {
        markNavigationPending();
        router.push(`/guest/queue/${data.queueId}`);
      } else {
        toast.error("Nomor antrean belum tersedia, silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error submitting guest form", error);
      toast.error(getErrorMessage(error, "Terjadi kesalahan, coba lagi sebentar lagi"));
    }
  };

  const requiredLabelClass = "after:ml-1 after:text-red-500 after:content-['*']";

  return (
    <div className="space-y-4">
      <Card className="border border-border/40 bg-card/90 shadow-2xl backdrop-blur">
        <CardHeader className="space-y-2 md:space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl md:text-2xl">Selamat Datang!</CardTitle>
            <Badge variant="outline" className="gap-1 bg-primary/20">
              <Smartphone className="h-4 w-4 md:h-5 md:w-5" />
              <span>Mobile-first</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <section className="space-y-4 rounded-xl border border-border/70 bg-background/55 p-4 md:p-5">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-secondary-color">
                    Data Pribadi
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Isi identitas sesuai dokumen resmi untuk memudahkan verifikasi.
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={requiredLabelClass}>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tulis nama sesuai KTP atau kartu identitas resmi lainnya"
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
                        <FormLabel className={requiredLabelClass}>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Tulis email Anda"
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
                        <FormLabel className={requiredLabelClass}>Nomor HP</FormLabel>
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
                      <FormLabel className={requiredLabelClass}>Alamat</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tulis alamat tempat tinggal atau kantor"
                          className="min-h-[96px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <section className="space-y-4 rounded-xl border border-border/70 bg-background/55 p-4 md:p-5">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-secondary-color">
                    Profil Pengunjung
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Informasi ini membantu petugas memahami kebutuhan layanan Anda.
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={requiredLabelClass}>Umur</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={120}
                            placeholder="Umur"
                            {...field}
                            value={field.value === undefined ? "" : Number(field.value)}
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
                        <FormLabel className={requiredLabelClass}>Jenis Kelamin</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Pilih" />
                            </SelectTrigger>
                            <SelectContent>
                              {genderOptions.map((option) => (
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
                  <FormField
                    control={form.control}
                    name="lastEducation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={requiredLabelClass}>Pendidikan Terakhir</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Pilih" />
                            </SelectTrigger>
                            <SelectContent>
                              {educationOptions.map((option) => (
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
                </div>
                <FormField
                  control={form.control}
                  name="institution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={requiredLabelClass}>Asal Instansi atau Domisili</FormLabel>
                      <FormControl>
                        <Input placeholder="Universitas, OPD, perusahaan, atau lainnya" {...field} />
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
                      <FormLabel className={requiredLabelClass}>Pekerjaan</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="w-full">
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
              </section>

              <section className="space-y-4 rounded-xl border border-border/70 bg-background/55 p-4 md:p-5">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-secondary-color">
                    Keperluan Kunjungan
                  </h3>
                </div>
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={requiredLabelClass}>Keperluan</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih keperluan" />
                          </SelectTrigger>
                          <SelectContent>
                            {purposeOptions.map((option) => (
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
                <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    Pastikan data sudah benar sebelum mengirim agar antrean diproses lebih cepat.
                  </p>
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="h-10 w-full px-5 text-sm sm:w-auto"
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Kirim & Dapatkan Nomor Antrean"
                    )}
                  </Button>
                </div>
              </section>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
