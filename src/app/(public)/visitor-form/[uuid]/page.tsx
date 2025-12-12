"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useParams } from "next/navigation";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { SelectTrigger } from "@/app/(public)/visitor-form/visitor-form-select";
import {
    Gender,
    LastEducation,
    Purpose,
    ServiceStatus,
} from "@/generated/prisma";
import { Badge } from "@/components/ui/badge";
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Loader2,
    RefreshCcw,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ClientTimestamp } from "@/components/client-timestamp";
import { ThemeToggle } from "@/components/theme-toggle";
import VisitorFormSkeleton from "@/modules/visitor-form/components/VisitorFormSkeleton";
import type { QueueTracking } from "@shared/types/queue";

interface Service {
    id: string;
    name: string;
    status: ServiceStatus;
}

const genderOptions = [
    { value: Gender.MALE, label: "Laki-Laki" },
    { value: Gender.FEMALE, label: "Perempuan" },
];

const educationOptions = [
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

const purposeOptions: { value: Purpose; label: string; description?: string }[] =
    [
        {
            value: Purpose.KONSULTASI_STATISTIK,
            label: "Konsultasi Statistik",
            description: "Diskusi dan pendampingan data",
        },
        {
            value: Purpose.PERPUSTAKAAN,
            label: "Perpustakaan",
            description: "Akses ruang baca & referensi",
        },
        {
            value: Purpose.REKOMENDASI_STATISTIK,
            label: "Rekomendasi Statistik",
            description: "Surat rekomendasi/pendataan",
        },
        { value: Purpose.LAINNYA, label: "Lainnya" },
    ];

const visitorFormSchema = z.object({
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
        .max(150, "Isian terlalu panjang"),
    gender: z.nativeEnum(Gender, {
        required_error: "Jenis kelamin wajib dipilih",
    }),
    lastEducation: z.nativeEnum(LastEducation, {
        required_error: "Pendidikan terakhir wajib dipilih",
    }),
    occupation: z.enum(
        occupationOptions.map((option) => option.value) as [
            string,
            ...string[]
        ],
        { required_error: "Pekerjaan wajib dipilih" }
    ),
    purpose: z.nativeEnum(Purpose, {
        required_error: "Keperluan wajib dipilih",
    }),
    serviceId: z.string().min(1, "Layanan harus dipilih"),
    queueType: z.enum(["ONLINE", "OFFLINE"], {
        required_error: "Tipe antrean harus dipilih",
    }),
});

type VisitorFormFormValues = z.input<typeof visitorFormSchema>;
type VisitorFormValues = z.output<typeof visitorFormSchema>;

export default function VisitorFormPage() {
    const [isLoading, setIsLoading] = useState(true); // Start with loading state
    const [isValid, setIsValid] = useState(true);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isTracking, setIsTracking] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const [queueInfo, setQueueInfo] = useState<{
        queueNumber: number;
        serviceName: string;
        visitorName: string;
        createdAt?: string;
        queueType?: string;
        redirectUrl?: string;
    } | null>(null);
    const [trackingInfo, setTrackingInfo] = useState<QueueTracking | null>(
        null
    );
    const [trackingStatus, setTrackingStatus] = useState<string | null>(null);
    const [trackingMessage, setTrackingMessage] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false); // Control when to show the form
    const [queueHash, setQueueHash] = useState<string>("");
    const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null); // Track when the data was last updated
    const params = useParams<{ uuid: string }>();
    const uuid = params?.uuid || "";

    // Get search params to check for direct form flag    // const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    // const shouldShowForm = searchParams.get('directToForm') === 'true';

    // Format queue time to DDMM format (eg. 1405 for May 14)
    const formatQueueTime = (isoDateString: string | Date): string => {
        const date = new Date(isoDateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-indexed, so add 1
        return `${day}${month}`;
    };

    const form = useForm<VisitorFormFormValues, unknown, VisitorFormValues>({
        resolver: zodResolver(visitorFormSchema),
        defaultValues: {
            name: "",
            email: "",
            address: "",
            phone: "",
            age: undefined,
            institution: "",
            gender: undefined,
            lastEducation: undefined,
            occupation: "Pelajar/Mahasiswa",
            purpose: Purpose.KONSULTASI_STATISTIK,
            serviceId: "",
            queueType: "OFFLINE", // Default to offline
        } satisfies Partial<VisitorFormFormValues>,
    }); // Function to check tracking status
    const checkTrackingStatus = useCallback(
        async (forceRefresh: boolean = false, manageLoading: boolean = true) => {
            let statusResult: string | null = null;
            try {
                // Only show loading indicator on initial load or forced refresh
                if (manageLoading && (!trackingInfo || forceRefresh)) {
                    setIsLoading(true);
                }

                const response = await fetch(`/api/visitor-form/track`, {
                    headers: {
                        "x-visitor-uuid": uuid,
                        // Only send hash for change detection if not forcing refresh
                        ...(!forceRefresh && queueHash
                            ? { "x-queue-hash": queueHash }
                            : {}),
                    },
                });

                if (response.ok) {
                    const data = await response.json(); // Only update the UI if there are changes to the tracking data, this is the first load, or we're forcing a refresh
                    if (data.hasChanges || !trackingInfo || forceRefresh) {
                        if (data.tracking.status === "SUCCESS") {
                            setTrackingInfo(data.tracking.queue);
                            setTrackingStatus("SUCCESS");
                            statusResult = "SUCCESS";
                            setIsTracking(true);
                            setIsValid(true);
                            // Store the hash for future comparisons
                            setQueueHash(data.hash || "");
                            // Update the last updated timestamp
                            setLastUpdatedAt(new Date());
                        } else if (data.tracking.status === "NOT_SUBMITTED") {
                            setTrackingStatus("NOT_SUBMITTED");
                            statusResult = "NOT_SUBMITTED";
                            setTrackingMessage(data.tracking.message);
                            setIsTracking(false);
                            setIsValid(true);
                        }
                    }
                } else {
                    // Handle error conditions only if this is the first load or we're not already tracking
                    if (!trackingInfo || !isTracking) {
                        // Track attempt failed - this could mean invalid UUID or other error
                        setIsTracking(false);
                        setTrackingStatus(null);
                    }
                }
            } catch (error) {
                console.error("Error checking tracking status", error);
                if (!trackingInfo || !isTracking) {
                    setTrackingStatus(null);
                }
            } finally {
                // Only update loading state for initial load or manual refresh
                if (manageLoading && (!trackingInfo || forceRefresh)) {
                    setIsLoading(false);
                }
            }
            return statusResult;
        },
        [uuid, queueHash, trackingInfo, isTracking]
    );

    useEffect(() => {
        const validateUuid = async () => {
            if (!uuid) return;
            try {
                setIsLoading(true);

                const trackingResult = await checkTrackingStatus(true, false);
                if (trackingResult === "SUCCESS") {
                    setIsLoading(false);
                    return;
                }

                // Try to get services directly (valid for dynamic UUID)
                const servicesResponse = await fetch(`/api/visitor-form/services`, {
                    headers: {
                        "x-visitor-uuid": uuid,
                    },
                });

                if (servicesResponse.status === 200) {
                    const data = await servicesResponse.json();
                    setServices(data.services);
                    setIsValid(true);
                    setShowForm(true);
                    setIsLoading(false);
                    return;
                }

                // If services are not available, attempt to exchange static UUID for dynamic
                const uuidResponse = await fetch(`/api/visitor-form/${uuid}`, {
                    headers: {
                        "x-visitor-uuid": uuid,
                    },
                });

                if (uuidResponse.status === 200) {
                    const data = await uuidResponse.json();
                    window.location.href =
                        "/visitor-form/preload?uuid=" + data.dynamicUuid;
                    return;
                }

                setIsValid(false);
            } catch (error) {
                console.error("Error validating UUID", error);
                setIsValid(false);
                toast.error("Terjadi kesalahan, silakan coba lagi");
            } finally {
                setIsLoading(false);
            }
        };

        validateUuid();
    }, [uuid, checkTrackingStatus]);
    useEffect(() => {
        let pollingInterval: NodeJS.Timeout | null = null;

        if (
            isTracking &&
            trackingStatus === "SUCCESS" &&
            trackingInfo?.status !== "COMPLETED"
        ) {
            // Function to poll for changes
            const pollForChanges = () => {
                if (document.visibilityState === "visible") {
                    checkTrackingStatus(false); // Don't force refresh on polling
                }

                // Schedule next poll
                pollingInterval = setTimeout(pollForChanges, 30000); // Refresh every 30 seconds
            };

            // Start polling
            pollingInterval = setTimeout(pollForChanges, 30000);

            // Track document visibility to pause polling when tab is not visible
            const handleVisibilityChange = () => {
                if (
                    document.visibilityState === "visible" &&
                    pollingInterval === null
                ) {
                    // Resume polling when tab becomes visible again
                    checkTrackingStatus(false);
                    pollingInterval = setTimeout(pollForChanges, 30000);
                }
            };

            // Add visibility change listener
            document.addEventListener("visibilitychange", handleVisibilityChange);

            return () => {
                document.removeEventListener(
                    "visibilitychange",
                    handleVisibilityChange
                );
                if (pollingInterval) clearTimeout(pollingInterval);
            };
        }

        // Cleanup
        return () => {
            if (pollingInterval) clearTimeout(pollingInterval);
        };
    }, [isTracking, trackingStatus, trackingInfo, checkTrackingStatus]);

    const onSubmit = async (data: VisitorFormValues) => {
        try {
            setIsLoading(true);
            const {
                name,
                email,
                address,
                phone,
                institution,
                occupation,
                ...rest
            } = data as VisitorFormValues;
            const payload = {
                ...rest,
                name: name.trim(),
                email: email.trim(),
                address: address.trim(),
                phone: phone.trim(),
                institution: institution.trim(),
                occupation: occupation.trim(),
                tempUuid: uuid,
            };

            const response = await fetch("/api/visitor-form/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (response.ok) {
                setQueueInfo(result.data);
                setIsSubmitted(true);
                toast.success("Formulir berhasil dikirim");

                // If redirectUrl is provided, use it to go directly to tracking view
                if (result.data.redirectUrl) {
                    // Add a short delay before redirecting to allow the toast to show
                    setTimeout(() => {
                        window.location.href = result.data.redirectUrl;
                    }, 1000);
                    return;
                }

                // After submission, check tracking status to show queue info
                await checkTrackingStatus();
            } else {
                toast.error(result.error || "Gagal mengirim formulir");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Terjadi kesalahan saat mengirim formulir");
        } finally {
            setIsLoading(false);
        }
    };

    const getQueueStatusBadge = (status: string) => {
        switch (status) {
            case "WAITING":
                return (
                    <Badge
                        variant="outline"
                        className="bg-yellow-100 ml-2 text-yellow-800"
                    >
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
        // TODO: This token is embedded client-side; if it grants privileged access, proxy via a server route or use a safer token mechanism.
        window.open(
            "https://skd.bps.go.id/SKD2025/web/entri/responden/blok1?token=NNLZR0-Ikj98u0ciQHM0bpCHH018ESCbIDW0w90wUTUU2k5dv7OylsciSW4odYl5ZFrBGLweIGNGOYTXy6_AjBPg3QzJvcMRE4Cq",
            "_blank"
        );
    };

    const markSKDFilled = async () => {
        if (!uuid) return;

        try {
            setIsLoading(true);
            const response = await fetch(`/api/visitor-form/skd`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    tempUuid: uuid,
                    filled: true,
                }),
            });
            if (response.ok) {
                toast.success("Terima kasih! Status SKD telah diperbarui");
                // Refresh tracking info to show updated SKD status
                await checkTrackingStatus();
                // Update last updated time
                setLastUpdatedAt(new Date());
            } else {
                toast.error("Gagal memperbarui status SKD");
            }
        } catch (error) {
            console.error("Error updating SKD status:", error);
            toast.error("Terjadi kesalahan saat memperbarui status SKD");
        } finally {
            setIsLoading(false);
        }
    };    // Render loading state
    if (isLoading) {
        return <VisitorFormSkeleton />;
    }

    // Render tracking view
    if (isTracking && trackingInfo) {
        return (
            <div className="relative flex justify-center items-center bg-background p-4 min-h-screen">
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
                        <CardTitle className="text-primary text-center">Status Antrean</CardTitle>
                        <CardDescription className="text-center">
                            BPS Kabupaten Bulungan
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">                        <div className="flex flex-col justify-center items-center space-y-2">                            <p className="font-bold text-accent text-4xl">
                        {trackingInfo.queueNumber}-{formatQueueTime(trackingInfo.createdAt)}
                    </p>
                        <p className="text-lg">Nomor Antrean Anda</p>
                        <div className="flex items-center gap-2">
                            {getQueueStatusBadge(trackingInfo.status)}
                            <Badge
                                variant="outline"
                                className={`${trackingInfo.queueType === "ONLINE"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                                    }`}
                            >
                                {trackingInfo.queueType === "ONLINE" ? "Online" : "Offline"}
                            </Badge>
                        </div>
                    </div>

                        <div className="space-y-3">                            <div className="bg-muted p-3 rounded-md">
                            <p className="mb-1 font-semibold text-sm">
                                Informasi Pengunjung
                            </p>
                            <p className="text-muted-foreground text-sm">
                                Nama: {trackingInfo.visitorName}
                            </p>
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
                                        <p className="font-medium text-yellow-800 text-sm">
                                            Menunggu Giliran
                                        </p>
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
                                        <p className="font-medium text-blue-800 text-sm">
                                            Sedang Dilayani
                                        </p>
                                        <p className="text-blue-700 text-sm">
                                            Anda sedang dalam proses pelayanan
                                        </p>
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
                                        <p className="font-medium text-green-800 text-sm">
                                            Pelayanan Selesai
                                        </p>
                                        <p className="text-green-700 text-sm">
                                            Antrean Anda telah selesai dilayani
                                        </p>
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
                                        <p className="font-medium text-red-800 text-sm">
                                            Antrean Dibatalkan
                                        </p>
                                        <p className="text-red-700 text-sm">
                                            Antrean Anda telah dibatalkan oleh admin
                                        </p>
                                    </div>
                                </div>
                            )}{" "}
                            {/* SKD Form section - show for all queue statuses */}
                            <Alert className="bg-blue-50 text-blue-900">
                                <AlertCircle className="border-blue-900 w-5 h-5" />
                                <AlertTitle className="text-blue-800">
                                    Survei Kebutuhan Data
                                </AlertTitle>
                                <AlertDescription className="text-blue-700">
                                    Mohon luangkan waktu sejenak untuk mengisi Survei Kebutuhan Data.
                                </AlertDescription>
                                <div className="space-y-2 mx-6 mt-4">
                                    <Button className="w-64 md:w-80" onClick={openSKD2025Form}>
                                        Isi SKD 2025
                                    </Button>
                                    {!trackingInfo.filledSKD && (
                                        <Button
                                            variant={"secondary"}
                                            className="w-64 md:w-80"
                                            onClick={markSKDFilled}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Memproses..." : "Saya Sudah Mengisi"}
                                        </Button>
                                    )}
                                    {trackingInfo.filledSKD && (
                                        <div className="flex items-center space-x-2 bg-green-100 mt-1 px-3 py-2 rounded-md outline-2 w-64 md:w-80 text-green-800">
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
                            Status antrean diperbarui otomatis saat ada perubahan. Klik
                            &quot;Perbarui&quot; untuk pembaruan manual. Terakhir diperbarui:{" "}
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
        );
    }

    if (!isValid) {
        return (
            <div className="flex justify-center items-center bg-background p-4 h-screen">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-primary text-center">
                            Link Tidak Valid
                        </CardTitle>
                        <CardDescription className="text-center">
                            Link yang Anda gunakan tidak valid atau sudah kedaluwarsa
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p>
                            Silakan scan QR code di lokasi PST untuk mendapatkan link baru.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isSubmitted && queueInfo) {
        return (
            <div className="flex justify-center items-center bg-background p-4 h-screen">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-primary text-center">
                            Antrean Berhasil Dibuat
                        </CardTitle>
                        <CardDescription className="text-center">
                            Terima kasih telah mengisi formulir
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">                        <div className="flex flex-col justify-center items-center space-y-1">
                        <p className="font-bold text-accent text-3xl">
                            {queueInfo.queueNumber}-{formatQueueTime(queueInfo.createdAt || new Date().toISOString())}
                        </p>
                        <p className="text-xl">Nomor Antrean Anda</p>
                        {queueInfo.queueType && (
                            <Badge
                                variant="outline"
                                className={`${queueInfo.queueType === "ONLINE"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                                    }`}
                            >
                                {queueInfo.queueType === "ONLINE" ? "Online" : "Offline"}
                            </Badge>
                        )}
                    </div>
                        <div className="space-y-2">
                            <p className="text-muted-foreground text-sm">
                                Nama: {queueInfo.visitorName}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                Layanan: {queueInfo.serviceName}
                            </p>
                        </div>
                        <div className="bg-muted p-4 rounded-md text-sm">
                            <p>
                                Silakan tunggu sampai nomor antrean Anda dipanggil oleh petugas.
                            </p>
                        </div>
                        <Alert className="bg-blue-50 border-blue-200">
                            <AlertCircle className="w-5 h-5 text-blue-600" />
                            <AlertTitle className="text-blue-800">Simpan Link Ini</AlertTitle>
                            <AlertDescription className="text-blue-700">
                                Anda dapat melihat status antrean dengan membuka link ini
                                kembali. Bookmark link ini untuk kemudahan akses.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </div>
        );
    }
    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <div className="pointer-events-none absolute inset-0">
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
                                    Buku Tamu PST
                                    <Badge variant="secondary" className="bg-white/80 text-primary dark:bg-slate-900/60">
                                        Wajib Isi
                                    </Badge>
                                </div>
                                <h1 className="text-3xl font-bold leading-tight text-slate-900 dark:text-white md:text-4xl">
                                    Lengkapi data untuk ambil nomor antrean
                                </h1>
                                <p className="max-w-2xl text-slate-600 dark:text-slate-300">
                                    Data lengkap membantu petugas menyiapkan pelayanan yang sesuai. Isi identitas sesuai KTP/instansi.
                                </p>
                            </div>
                        </div>
                        <div className="grid items-start gap-6 lg:grid-cols-[1.15fr,0.85fr]">
                            <Card className="border-slate-200/70 bg-white/80 shadow-2xl backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/60">
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
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-6"
                            >
                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nama Lengkap</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Sesuai KTP atau identitas resmi"
                                                        {...field}
                                                    />
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
                                                                    event.target
                                                                        .value === ""
                                                                        ? undefined
                                                                        : Number(
                                                                              event.target.value
                                                                          )
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
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="bg-sidebar w-full">
                                                            <SelectValue placeholder="Pilih jenis kelamin" />
                                                        </SelectTrigger>
                                                    </FormControl>
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
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="bg-sidebar w-full">
                                                            <SelectValue placeholder="Pilih pendidikan" />
                                                        </SelectTrigger>
                                                    </FormControl>
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
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="bg-sidebar w-full">
                                                            <SelectValue placeholder="Pilih pekerjaan" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {occupationOptions.map((option) => (
                                                            <SelectItem
                                                                key={option.value}
                                                                value={option.value}
                                                            >
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
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="bg-sidebar w-full">
                                                            <SelectValue placeholder="Pilih keperluan" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {purposeOptions.map((option) => (
                                                            <SelectItem
                                                                key={option.value}
                                                                value={option.value}
                                                            >
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
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="bg-sidebar w-full">
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
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="bg-sidebar w-full">
                                                        <SelectValue placeholder="Pilih tipe antrean" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="OFFLINE">Offline (di lokasi PST)</SelectItem>
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
                                    <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
                                        {isLoading ? "Mengirim..." : "Kirim & Ambil Nomor"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
                <div className="space-y-4">
                    <Card className="border-slate-200/70 bg-white/70 shadow-xl backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/60">
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
                    <Card className="border-slate-200/70 bg-white/70 shadow-xl backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/60">
                        <CardHeader className="pb-3">
                            <CardTitle>Layanan tersedia</CardTitle>
                            <CardDescription>
                                Pilih sesuai keperluan kunjungan Anda.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {services.length > 0 ? (
                                services
                                    .filter((service) => service.status === ServiceStatus.ACTIVE)
                                    .map((service) => (
                                        <div
                                            key={service.id}
                                            className="flex items-center justify-between rounded-md border border-dashed border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
                                        >
                                            <span className="font-medium">{service.name}</span>
                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-100">
                                                Aktif
                                            </Badge>
                                        </div>
                                    ))
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Memuat daftar layanan...
                                </p>
                            )}
                            <div className="rounded-md bg-primary/5 p-3 text-sm text-primary dark:bg-primary/10">
                                Pastikan pendidikan, pekerjaan, dan keperluan dipilih agar petugas dapat menyiapkan layanan yang tepat.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
                    </div>
        ) : (
            <Card className="mx-auto w-full max-w-md bg-white/80 shadow-xl backdrop-blur dark:bg-slate-900/70">
                <CardHeader className="text-center">
                    <CardTitle className="text-primary">
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
    );
}



