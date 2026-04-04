"use client";

import { useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import PageBackground from "@/components/shared/page-background";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { markNavigationPending } from "@/lib/navigation-pending";
import { visitorFormApi } from "@/services/api/visitor-form";

const isApiError = (error: unknown): error is { status: number } => {
	return (
		typeof error === "object" &&
		error !== null &&
		"status" in error &&
		typeof (error as { status?: number }).status === "number"
	);
};

export default function VisitorFormPreloadPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	// Check if it's a tracking view or a form
	useEffect(() => {
		const checkAndRedirect = async () => {
			// Get the temporary UUID from URL query parameter
			const uuid = searchParams.get("uuid");

			if (!uuid) {
				// Fallback if somehow there's no UUID
				markNavigationPending();
				router.push("/");
				return;
			}

			try {
				// Check if this UUID is for tracking (has an existing submission)
				const data = await visitorFormApi.track(uuid);

				// If tracking data exists, go directly to tracking view
				if (data.tracking.status === "SUCCESS") {
					// Always go directly to tracking, never show the form
					markNavigationPending();
					router.push(`/visitor-form/${uuid}`);
				} else {
					// If no submission exists yet, we need to create a new queue entry
					// Directly send the user to the form with a directToForm flag
					// This bypasses UUID validation logic that might redirect back here
					markNavigationPending();
					router.push(`/visitor-form/${uuid}?directToForm=true`);
				}
			} catch (error) {
				if (isApiError(error)) {
					markNavigationPending();
					router.push(`/visitor-form/${uuid}?directToForm=true`);
					return;
				}

				console.error("Error during preload check:", error);
				toast.error("Terjadi kesalahan saat memuat data");
				markNavigationPending();
				router.push("/");
			}
		};

		// Start the check after a brief delay to show the loading animation
		const timer = setTimeout(() => {
			checkAndRedirect();
		}, 1500);

		return () => clearTimeout(timer);
	}, [router, searchParams]);

	return (
		<div className="flex min-h-full items-center justify-center">
			<PageBackground className="bg-background" />
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
						Mohon tunggu sebentar, kami sedang menyiapkan informasi antrean untuk
						Anda...
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

