"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import AppLoader from "@/components/shared/app-loader";
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
import {
  Gender,
  LastEducation,
  type QueueStatus as QueueStatusType,
} from "@/shared/constants/enums";
import { filterActiveServices } from "@/shared/constants/service-catalog";
import { guestSchema } from "@/shared/schemas/guest";
import type { GuestServiceOption } from "@/shared/types/guest";
import { guestApi } from "@/services/api/guest";
import {
  readLastGuestQueue,
  saveLastGuestQueue,
  type LastGuestQueue,
} from "@/features/guest/utils/last-queue";
import { markNavigationPending } from "@/lib/navigation-pending";
import { serializeErrorForLog } from "@/lib/error-log";
import type { ErrorResponse } from "@shared/types/api";

type GuestFormValues = z.output<typeof guestSchema>;
type GuestFormInput = z.input<typeof guestSchema>;

const educationOptions: { value: LastEducation; label: string }[] = [
  { value: LastEducation.SD, label: "SD atau Sederajat" },
  { value: LastEducation.SMP, label: "SMP atau Sederajat" },
  { value: LastEducation.SMA_SMK, label: "SMA/SMK atau Sederajat" },
  { value: LastEducation.D1, label: "Diploma I/II/III" },
  { value: LastEducation.D4_S1, label: "Diploma IV/Sarjana (S1)" },
  { value: LastEducation.S2, label: "Magister (S2)" },
  { value: LastEducation.S3, label: "Doktor (S3)" },
  { value: LastEducation.LAINNYA, label: "Lainnya" },
];

const genderOptions = [
  { value: Gender.MALE, label: "Laki-Laki" },
  { value: Gender.FEMALE, label: "Perempuan" },
];

const occupationOptions = [
  { value: "Pelajar/Mahasiswa", label: "Pelajar/Mahasiswa" },
  { value: "PNS/PPPK", label: "PNS/PPPK" },
  { value: "TNI/Polri", label: "TNI/Polri" },
  { value: "Pegawai BUMN/BUMD", label: "Pegawai BUMN/BUMD" },
  { value: "Pegawai Swasta", label: "Pegawai Swasta" },
  { value: "Wiraswasta/Usahawan", label: "Wiraswasta/Usahawan" },
  { value: "Guru/Dosen", label: "Guru/Dosen" },
  { value: "Tidak/Belum Bekerja", label: "Tidak/Belum Bekerja" },
  { value: "Pensiunan", label: "Pensiunan" },
  { value: "Lainnya", label: "Lainnya" },
];

const queueStatusText: Record<QueueStatusType, string> = {
  WAITING: "Menunggu",
  SERVING: "Sedang Dilayani",
  COMPLETED: "Selesai",
  CANCELED: "Dibatalkan",
};

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
  const [services, setServices] = useState<GuestServiceOption[]>([]);
  const [isServicesLoading, setIsServicesLoading] = useState(true);
  const [lastQueue, setLastQueue] = useState<LastGuestQueue | null>(null);

  const form = useForm<GuestFormInput, unknown, GuestFormValues>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      fullName: "",
      email: "",
      address: "",
      phone: "",
      age: undefined,
      institution: "",
      gender: undefined,
      lastEducation: undefined,
      occupation: undefined,
      serviceId: "",
    },
  });

  const activeServices = useMemo(
    () => filterActiveServices(services),
    [services]
  );

  useEffect(() => {
    setLastQueue(readLastGuestQueue());
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchServices = async () => {
      setIsServicesLoading(true);
      try {
        const response = await guestApi.services();
        if (cancelled) return;

        const nextServices = response.services ?? [];
        setServices(nextServices);
        const nextActiveServices = filterActiveServices(nextServices);

        const currentServiceId = form.getValues("serviceId");
        const selectedStillAvailable = nextActiveServices.some(
          (service) => service.id === currentServiceId
        );

        if (!selectedStillAvailable) {
          form.setValue("serviceId", nextActiveServices[0]?.id ?? "", {
            shouldDirty: false,
            shouldTouch: false,
            shouldValidate: true,
          });
        }
      } catch (error) {
        console.error("Error fetching guest services", serializeErrorForLog(error));
        if (!cancelled) {
          setServices([]);
          form.setValue("serviceId", "", {
            shouldDirty: false,
            shouldTouch: false,
            shouldValidate: true,
          });
          toast.error("Gagal memuat layanan aktif. Coba muat ulang halaman.");
        }
      } finally {
        if (!cancelled) {
          setIsServicesLoading(false);
        }
      }
    };

    void fetchServices();

    return () => {
      cancelled = true;
    };
  }, [form]);

  const onSubmit = async (values: GuestFormValues) => {
    const payload = {
      ...values,
      fullName: values.fullName.trim(),
      email: values.email.trim().toLowerCase(),
      address: values.address.trim(),
      phone: values.phone.trim(),
      institution: values.institution.trim(),
      serviceId: values.serviceId.trim(),
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
        occupation: undefined,
        serviceId: values.serviceId,
      });
      if (data.queueId) {
        saveLastGuestQueue({
          queueId: data.queueId,
          queueCode: data.queueCode,
          status: data.status,
        });
        setLastQueue(readLastGuestQueue());
        markNavigationPending();
        router.push(`/guest/queue/${data.queueId}`);
      } else {
        toast.error("Nomor antrean belum tersedia, silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error submitting guest form", serializeErrorForLog(error));
      toast.error(getErrorMessage(error, "Terjadi kesalahan, coba lagi sebentar lagi"));
    }
  };

  const requiredLabelClass = "after:ml-1 after:text-red-500 after:content-['*']";
  const isSubmitDisabled =
    form.formState.isSubmitting || isServicesLoading || activeServices.length === 0;
  const canResumeLastQueue = lastQueue && lastQueue.status !== "COMPLETED";

  const handleResumeLastQueue = () => {
    if (!canResumeLastQueue?.queueId) {
      toast.error("Nomor antrean terakhir tidak ditemukan.");
      return;
    }

    markNavigationPending();
    router.push(`/guest/queue/${canResumeLastQueue.queueId}`);
  };

  return (
    <div className="space-y-4">
      <Card className="border border-border/40 bg-card/90 shadow-2xl backdrop-blur">
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {canResumeLastQueue ? (
                <section className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-4 md:p-5">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-color">
                      Lanjutkan Antrean
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Nomor terakhir:{" "}
                      <span className="font-semibold text-foreground">
                        {canResumeLastQueue.queueCode ?? canResumeLastQueue.queueId}
                      </span>
                      {canResumeLastQueue.status && queueStatusText[canResumeLastQueue.status]
                        ? ` - Status: ${queueStatusText[canResumeLastQueue.status]}`
                        : ""}
                    </p>
                  </div>
                  <Button type="button" variant="outline" onClick={handleResumeLastQueue}>
                    Lanjutkan Antrean Terakhir
                  </Button>
                </section>
              ) : null}

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
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="08xxxxxxxxxx"
                            autoComplete="tel-national"
                            {...field}
                            onChange={(event) =>
                              field.onChange(event.target.value.replace(/\D+/g, ""))
                            }
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
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih pekerjaan" />
                          </SelectTrigger>
                          <SelectContent className="max-h-56">
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
                  <p className="text-xs text-muted-foreground">
                    {isServicesLoading
                      ? "Memuat daftar pelayanan aktif..."
                      : `Menampilkan ${activeServices.length} pelayanan aktif.`}
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={requiredLabelClass}>Keperluan Kunjungan</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || undefined}
                          disabled={isServicesLoading || activeServices.length === 0}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih keperluan kunjungan" />
                          </SelectTrigger>
                          <SelectContent>
                            {activeServices.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name}
                              </SelectItem>
                            ))}
                            {isServicesLoading ? (
                              <SelectItem value="loading-services" disabled>
                                Memuat daftar pelayanan...
                              </SelectItem>
                            ) : null}
                            {!isServicesLoading && activeServices.length === 0 ? (
                              <SelectItem value="no-active-services" disabled>
                                Belum ada pelayanan aktif
                              </SelectItem>
                            ) : null}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      {!isServicesLoading && activeServices.length === 0 ? (
                        <p className="text-xs text-destructive">
                          Belum ada layanan aktif. Hubungi petugas untuk mengaktifkan layanan.
                        </p>
                      ) : null}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    Pastikan data sudah benar sebelum mengirim agar antrean diproses.
                  </p>
                  <Button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className="h-10 w-full px-5 text-sm text-white hover:text-white sm:w-auto"
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <AppLoader size="sm" className="mr-2 text-white" />
                        Menyimpan...
                      </>
                    ) : isServicesLoading ? (
                      "Memuat layanan..."
                    ) : (
                      "Ambil Nomor Antrean"
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
