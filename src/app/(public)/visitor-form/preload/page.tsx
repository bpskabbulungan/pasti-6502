"use client";

import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function VisitorFormPreloadPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Check if it's a tracking view or a form
    useEffect(() => {
        const checkAndRedirect = async () => {
            try {
                // Get the temporary UUID from URL query parameter
                const uuid = searchParams.get('uuid');

                if (!uuid) {
                    // Fallback if somehow there's no UUID
                    router.push('/');
                    return;
                }

                // Check if this UUID is for tracking (has an existing submission)
                const response = await fetch(`/api/visitor-form/track`, {
                    headers: {
                        "x-visitor-uuid": uuid,
                    },
                });

                const data = await response.json();

                // If tracking data exists, go directly to tracking view
                if (response.ok && data.tracking.status === "SUCCESS") {
                    // Always go directly to tracking, never show the form
                    router.push(`/visitor-form/${uuid}`);
                } else {
                    // If no submission exists yet, we need to create a new queue entry
                    // Directly send the user to the form with a directToForm flag
                    // This bypasses UUID validation logic that might redirect back here
                    router.push(`/visitor-form/${uuid}?directToForm=true`);
                }
            } catch (error) {
                console.error("Error during preload check:", error);
                toast.error("Terjadi kesalahan saat memuat data");
                router.push('/');
            }
        };

        // Start the check after a brief delay to show the loading animation
        const timer = setTimeout(() => {
            checkAndRedirect();
        }, 1500);

        return () => clearTimeout(timer);
    }, [router, searchParams]);

    return (
        <div className="flex justify-center items-center bg-background min-h-screen">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-primary">Memuat Data Antrean</CardTitle>
                    <CardDescription>
                        Badan Pusat Statistik Kabupaten Bulungan
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col justify-center items-center space-y-6 py-8">
                    <Loader2 className="w-16 h-16 text-primary animate-spin" />
                    <p className="text-muted-foreground text-center">
                        Mohon tunggu sebentar, kami sedang menyiapkan informasi antrean untuk Anda...
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
