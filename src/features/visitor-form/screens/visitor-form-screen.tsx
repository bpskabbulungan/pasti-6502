"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { SelectTrigger } from "@/features/visitor-form/components/visitor-form-select";
import { ServiceStatus } from "@/shared/constants/enums";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, Loader2, RefreshCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ClientTimestamp } from "@/components/shared/client-timestamp";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import PageBackground from "@/components/shared/page-background";
import VisitorFormSkeleton from "@/features/visitor-form/components/visitor-form-skeleton";
import { useVisitorFormController } from "@/features/visitor-form/screens/visitor-form-state/controller";
import { formatQueueTime } from "@/features/visitor-form/screens/visitor-form-state/helper";
import {
  educationOptions,
  genderOptions,
  occupationOptions,
  purposeOptions,
} from "@/features/visitor-form/screens/visitor-form-state/view-model";

export default function VisitorFormPage() {
  const {
    form,
    isLoading,
    isValid,
    isSubmitted,
    isTracking,
    services,
    queueInfo,
    trackingInfo,
    trackingStatus,
    trackingMessage,
    showForm,
    lastUpdatedAt,
    checkTrackingStatus,
    submitVisitorForm,
    markSkdFilled: markSKDFilled,
  } = useVisitorFormController();

  const getQueueStatusBadge = (status: string) => {
    switch (status) {
      case "WAITING":
        return (
          <Badge variant="outline" className="bg-yellow-100 ml-2 text-yellow-800">
            Menunggu
          </Badge>
        );
      case "SERVING":
        return (
          <Badge variant="outline" className="bg-blue-100 ml-2 text-blue-800">
            Sedang Dilayani
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge variant="outline" className="bg-green-100 ml-2 text-green-800">
            Selesai
          </Badge>
        );
      case "CANCELED":
        return (
          <Badge variant="outline" className="bg-red-100 ml-2 text-red-800">
            Dibatalkan
          </Badge>
        );
      default:
        return null;
    }
  };
  const openSKD2025Form = () => {
    window.open("/api/visitor-form/skd/open", "_blank", "noopener,noreferrer");
  };
  // Render loading state
  if (isLoading) {
    return (
      <>
        <PageBackground className="bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        <VisitorFormSkeleton />
      </>
    );
  }

  // Render tracking view
  if (isTracking && trackingInfo) {
    return (
      <>
        <PageBackground className="bg-background" />
        <div className="relative flex min-h-full items-center justify-center p-4">
          {/* Theme toggle button at top right */}
          <div className="top-4 right-4 z-10 absolute flex space-x-1">
            <ThemeToggle />
            <Button
              onClick={() => checkTrackingStatus(true)}
              disabled={isLoading}
              className="flex items-center gap-1 rounded-full"
            >
              <RefreshCcw className="w-3 h-3" />
              <span>{isLoading ? "Memuat..." : "Perbarui"}</span>
            </Button>
          </div>
          <Card className="w-full max-w-md">
            {" "}
            <CardHeader>
              <CardTitle className="text-center text-primary-color">Status Antrean</CardTitle>
              <CardDescription className="text-center">BPS Kabupaten Bulungan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {" "}
              <div className="flex flex-col justify-center items-center space-y-2">
                {" "}
                <p className="font-bold text-accent text-4xl">
                  {trackingInfo.queueNumber}-{formatQueueTime(trackingInfo.createdAt)}
                </p>
                <p className="text-lg">Nomor Antrean Anda</p>
                <div className="flex items-center gap-2">
                  {getQueueStatusBadge(trackingInfo.status)}
                  <Badge
                    variant="outline"
                    className={`${
                      trackingInfo.queueType === "ONLINE"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {trackingInfo.queueType === "ONLINE" ? "Online" : "Offline"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-3">
                {" "}
                <div className="bg-muted p-3 rounded-md">
                  <p className="mb-1 font-semibold text-sm">Informasi Pengunjung</p>
                  <p className="text-muted-foreground text-sm">Nama: {trackingInfo.visitorName}</p>
                  <p className="text-muted-foreground text-sm">
                    Layanan: {trackingInfo.serviceName}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Tipe Antrean: {trackingInfo.queueType === "ONLINE" ? "Online" : "Offline"}
                  </p>
                </div>
                {trackingInfo.status === "WAITING" && (
                  <div className="flex items-start space-x-3 bg-yellow-50 p-3 rounded-md">
                    <Clock className="mt-0.5 w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="font-medium text-yellow-800 text-sm">Menunggu Giliran</p>
                      <p className="text-yellow-700 text-sm">
                        Ada {trackingInfo.waitingBefore} antrean sebelum Anda
                      </p>
                      <p className="text-yellow-700 text-sm">
                        Estimasi waktu tunggu: ~{trackingInfo.estimated} menit
                      </p>
                    </div>
                  </div>
                )}
                {trackingInfo.status === "SERVING" && (
                  <div className="flex items-start space-x-3 bg-blue-50 p-3 rounded-md">
                    <Loader2 className="mt-0.5 w-5 h-5 text-blue-500 animate-spin" />
                    <div>
                      <p className="font-medium text-blue-800 text-sm">Sedang Dilayani</p>
                      <p className="text-blue-700 text-sm">Anda sedang dalam proses pelayanan</p>
                      <p className="text-blue-700 text-sm">
                        Mulai dilayani:{" "}
                        <ClientTimestamp
                          timestamp={trackingInfo.startTime}
                          format="time"
                          locale="id-ID"
                        />
                      </p>
                    </div>
                  </div>
                )}
                {trackingInfo.status === "COMPLETED" && (
                  <div className="flex items-start space-x-3 bg-green-50 p-3 rounded-md">
                    <CheckCircle className="mt-0.5 w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium text-green-800 text-sm">Pelayanan Selesai</p>
                      <p className="text-green-700 text-sm">Antrean Anda telah selesai dilayani</p>
                      <p className="text-green-700 text-sm">
                        Selesai pada:{" "}
                        {trackingInfo.endTime
                          ? new Date(trackingInfo.endTime).toLocaleTimeString("id-ID")
                          : "-"}
                      </p>
                    </div>
                  </div>
                )}
                {trackingInfo.status === "CANCELED" && (
                  <div className="flex items-start space-x-3 bg-red-50 p-3 rounded-md">
                    <AlertCircle className="mt-0.5 w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium text-red-800 text-sm">Antrean Dibatalkan</p>
                      <p className="text-red-700 text-sm">
                        Antrean Anda telah dibatalkan oleh admin
                      </p>
                    </div>
                  </div>
                )}{" "}
                {/* SKD Form section - show for all queue statuses */}
                <Alert className="bg-blue-50 text-blue-900">
                  <AlertCircle className="border-blue-900 w-5 h-5" />
                  <AlertTitle className="text-blue-800">Survei Kebutuhan Data</AlertTitle>
                  <AlertDescription className="text-blue-700">
                    Mohon luangkan waktu sejenak untuk mengisi Survei Kebutuhan Data.
                  </AlertDescription>
                  <div className="mx-0 mt-4 space-y-2">
                    <Button className="w-full" onClick={openSKD2025Form}>
                      Isi SKD 2025
                    </Button>
                    {!trackingInfo.filledSKD && (
                      <Button
                        variant={"secondary"}
                        className="w-full"
                        onClick={markSKDFilled}
                        disabled={isLoading}
                      >
                        {isLoading ? "Memproses..." : "Saya Sudah Mengisi"}
                      </Button>
                    )}
                    {trackingInfo.filledSKD && (
                      <div className="mt-1 flex w-full items-center space-x-2 rounded-md bg-green-100 px-3 py-2 text-green-800">
                        <CheckCircle className="w-4 h-4" />
                        <span>Survei sudah diisi, terima kasih!</span>
                      </div>
                    )}
                  </div>
                </Alert>
              </div>
            </CardContent>{" "}
            <CardFooter className="flex justify-center">
              <p className="text-muted-foreground text-xs text-center">
                Status antrean diperbarui otomatis saat ada perubahan. Klik &quot;Perbarui&quot;
                untuk pembaruan manual. Terakhir diperbarui:{" "}
                {lastUpdatedAt
                  ? new Intl.DateTimeFormat("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    }).format(lastUpdatedAt)
                  : "Baru saja"}
              </p>
            </CardFooter>
          </Card>
        </div>
      </>
    );
  }

  if (!isValid) {
    return (
      <>
        <PageBackground className="bg-background" />
        <div className="flex min-h-full items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-primary-color">Link Tidak Valid</CardTitle>
              <CardDescription className="text-center">
                Link yang Anda gunakan tidak valid atau sudah kedaluwarsa
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p>Silakan scan QR code di lokasi PST untuk mendapatkan link baru.</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (isSubmitted && queueInfo) {
    return (
      <>
        <PageBackground className="bg-background" />
        <div className="flex min-h-full items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-primary-color">Antrean Berhasil Dibuat</CardTitle>
              <CardDescription className="text-center">
                Terima kasih telah mengisi formulir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col justify-center items-center space-y-1">
                <p className="font-bold text-accent text-3xl">
                  {queueInfo.queueNumber}-
                  {formatQueueTime(queueInfo.createdAt || new Date().toISOString())}
                </p>
                <p className="text-xl">Nomor Antrean Anda</p>
                {queueInfo.queueType && (
                  <Badge
                    variant="outline"
                    className={`${
                      queueInfo.queueType === "ONLINE"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {queueInfo.queueType === "ONLINE" ? "Online" : "Offline"}
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Nama: {queueInfo.visitorName}</p>
                <p className="text-muted-foreground text-sm">Layanan: {queueInfo.serviceName}</p>
              </div>
              <div className="bg-muted p-4 rounded-md text-sm">
                <p>Silakan tunggu sampai nomor antrean Anda dilayani oleh petugas.</p>
              </div>
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <AlertTitle className="text-blue-800">Simpan Link Ini</AlertTitle>
                <AlertDescription className="text-blue-700">
                  Anda dapat melihat status antrean dengan membuka link ini kembali. Bookmark link
                  ini untuk kemudahan akses.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }
  return (
    <>
      <PageBackground className="bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      <div className="relative min-h-full overflow-hidden">
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute left-1/3 top-1/2 h-48 w-48 rounded-full bg-amber-300/10 blur-3xl" />
        </div>
        <div className="absolute right-4 top-4 z-20">
          <ThemeToggle />
        </div>
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col px-4 py-10 md:py-12">
          {showForm ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    Buku Tamu PST 6502
                    <Badge
                      variant="secondary"
                      className="bg-white/80 text-primary-color dark:bg-slate-900/60"
                    >
                      Wajib Isi
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold leading-tight text-slate-900 dark:text-white md:text-4xl">
                    Lengkapi data untuk ambil nomor antrean
                  </h1>
                  <p className="max-w-2xl text-slate-600 dark:text-slate-300">
                    Data lengkap membantu petugas menyiapkan pelayanan yang sesuai. Isi identitas
                    sesuai KTP/instansi.
                  </p>
                </div>
              </div>
              <div className="grid items-start gap-6 lg:grid-cols-[1.15fr,0.85fr]">
                <Card className="border-border/70 bg-white/85 shadow-[var(--shadow-strong)] backdrop-blur dark:bg-card">
                  <CardHeader className="pb-4">
                    <CardTitle>Form Pengunjung</CardTitle>
                    <CardDescription>
                      Seluruh kolom wajib diisi untuk memproses antrean Anda.
                    </CardDescription>
                    {trackingStatus === "NOT_SUBMITTED" && (
                      <Alert className="mt-4 border-blue-200 bg-blue-50 dark:border-blue-900/40 dark:bg-blue-900/30">
                        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                        <AlertDescription className="text-blue-800 dark:text-blue-100">
                          {trackingMessage}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(submitVisitorForm)} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nama Lengkap</FormLabel>
                                <FormControl>
                                  <Input placeholder="Sesuai KTP atau identitas resmi" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="Email aktif untuk konfirmasi"
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
                                  placeholder="Tuliskan alamat domisili lengkap"
                                  rows={3}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>No. WhatsApp</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Contoh: 0812xxxxxxx"
                                    inputMode="tel"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => {
                              const { onChange, value, ...rest } = field;
                              const normalizedValue: number | string =
                                typeof value === "number"
                                  ? value
                                  : value == null
                                    ? ""
                                    : String(value);

                              return (
                                <FormItem>
                                  <FormLabel>Umur</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      inputMode="numeric"
                                      min={1}
                                      max={120}
                                      placeholder="Masukkan umur"
                                      value={normalizedValue}
                                      onChange={(event) =>
                                        onChange(
                                          event.target.value === ""
                                            ? undefined
                                            : Number(event.target.value)
                                        )
                                      }
                                      {...rest}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="institution"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Asal/Instansi</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Tuliskan daerah/instansi tempat kerja"
                                    {...field}
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">
                                  Asal = daerah/kota, Instansi = tempat kerja/organisasi.
                                </p>
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Pilih jenis kelamin" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {genderOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="lastEducation"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pendidikan Terakhir</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Pilih pendidikan" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {educationOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Pilih pekerjaan" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {occupationOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="purpose"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Keperluan</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Pilih keperluan" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {purposeOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        <div className="flex flex-col">
                                          <span>{option.label}</span>
                                          {option.description && (
                                            <span className="text-xs text-muted-foreground">
                                              {option.description}
                                            </span>
                                          )}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="serviceId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Layanan</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Pilih layanan" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {services
                                      .filter((service) => service.status === ServiceStatus.ACTIVE)
                                      .map((service) => (
                                        <SelectItem key={service.id} value={service.id}>
                                          {service.name}
                                        </SelectItem>
                                      ))}
                                    {services.length === 0 && (
                                      <SelectItem value="loading" disabled>
                                        Memuat daftar layanan...
                                      </SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="queueType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipe Antrean</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih tipe antrean" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="OFFLINE">Offline (di lokasi PASTI 6502)</SelectItem>
                                  <SelectItem value="ONLINE">Online (daring)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <p className="text-sm text-muted-foreground">
                            Pastikan data sudah benar sebelum mengirim.
                          </p>
                          <Button type="submit" className="h-10 w-full md:w-auto" disabled={isLoading}>
                            {isLoading ? "Mengirim..." : "Kirim & Ambil Nomor"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
                <div className="space-y-4">
                  <Card className="border-border/70 bg-white/80 shadow-md backdrop-blur dark:bg-card">
                    <CardHeader className="pb-3">
                      <CardTitle>Tips pengisian cepat</CardTitle>
                      <CardDescription>
                        Data lengkap mempercepat verifikasi di loket.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                        <div>
                          <p className="font-medium">Kontak aktif</p>
                          <p className="text-sm text-muted-foreground">
                            Email dan WhatsApp digunakan untuk status antrean.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                        <div>
                          <p className="font-medium">Asal/Instansi</p>
                          <p className="text-sm text-muted-foreground">
                            Asal = daerah/kota, Instansi = kantor/sekolah/tempat kerja.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                        <div>
                          <p className="font-medium">Keperluan jelas</p>
                          <p className="text-sm text-muted-foreground">
                            Pilih layanan sesuai kebutuhan agar diarahkan ke loket tepat.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/70 bg-white/80 shadow-md backdrop-blur dark:bg-card">
                    <CardHeader className="pb-3">
                      <CardTitle>Layanan tersedia</CardTitle>
                      <CardDescription>Pilih sesuai keperluan kunjungan Anda.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {services.length > 0 ? (
                        services
                          .filter((service) => service.status === ServiceStatus.ACTIVE)
                          .map((service) => (
                            <div
                              key={service.id}
                              className="flex items-center justify-between rounded-md border border-dashed border-border/70 px-3 py-2 text-sm"
                            >
                              <span className="font-medium">{service.name}</span>
                              <Badge
                                variant="outline"
                                className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100"
                              >
                                Aktif
                              </Badge>
                            </div>
                          ))
                      ) : (
                        <p className="text-sm text-muted-foreground">Memuat daftar layanan...</p>
                      )}
                      <div className="rounded-md bg-primary/5 p-3 text-sm text-primary dark:bg-primary/10">
                        Pastikan pendidikan, pekerjaan, dan keperluan dipilih agar petugas dapat
                        menyiapkan layanan yang tepat.
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <Card className="mx-auto w-full max-w-md border-border/70 bg-white/85 shadow-xl backdrop-blur dark:bg-card">
              <CardHeader className="text-center">
                <CardTitle className="text-primary-color">
                  <div className="mx-auto h-8 w-3/4 rounded bg-secondary animate-pulse"></div>
                </CardTitle>
                <CardDescription>
                  <div className="mt-2 h-6 w-full rounded bg-secondary animate-pulse"></div>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6 py-4">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="mt-4 text-center text-muted-foreground">
                  Memeriksa informasi antrean...
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}





