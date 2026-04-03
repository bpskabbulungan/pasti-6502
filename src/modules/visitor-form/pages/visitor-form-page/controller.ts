"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { QueueTracking } from "@shared/types/queue";
import type { VisitorFormService } from "@shared/types/visitor-form";
import { getVisitorFormErrorMessage, isVisitorFormApiError } from "./helper";
import {
	visitorFormDefaultValues,
	visitorFormSchema,
	type VisitorFormFormValues,
	type VisitorFormValues,
} from "./schema";
import { visitorFormPageService } from "./service";
import { TRACKING_POLL_INTERVAL_MS } from "./view-model";

type QueueInfo = {
	queueNumber: number;
	serviceName: string;
	visitorName: string;
	createdAt?: string | Date;
	queueType?: string;
	redirectUrl?: string;
};

export function useVisitorFormController() {
	const [isLoading, setIsLoading] = useState(true);
	const [isValid, setIsValid] = useState(true);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isTracking, setIsTracking] = useState(false);
	const [services, setServices] = useState<VisitorFormService[]>([]);
	const [queueInfo, setQueueInfo] = useState<QueueInfo | null>(null);
	const [trackingInfo, setTrackingInfo] = useState<QueueTracking | null>(null);
	const [trackingStatus, setTrackingStatus] = useState<string | null>(null);
	const [trackingMessage, setTrackingMessage] = useState<string | null>(null);
	const [showForm, setShowForm] = useState(false);
	const [queueHash, setQueueHash] = useState<string>("");
	const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
	const params = useParams<{ uuid: string }>();
	const uuid = params?.uuid || "";

	const form = useForm<VisitorFormFormValues, unknown, VisitorFormValues>({
		resolver: zodResolver(visitorFormSchema),
		defaultValues: visitorFormDefaultValues,
	});

	const checkTrackingStatus = useCallback(
		async (forceRefresh = false, manageLoading = true) => {
			let statusResult: string | null = null;
			try {
				if (manageLoading && (!trackingInfo || forceRefresh)) {
					setIsLoading(true);
				}

				const data = await visitorFormPageService.track(
					uuid,
					!forceRefresh ? queueHash : undefined
				);

				if (data.hasChanges || !trackingInfo || forceRefresh) {
					if (data.tracking.status === "SUCCESS") {
						setTrackingInfo(data.tracking.queue);
						setTrackingStatus("SUCCESS");
						statusResult = "SUCCESS";
						setIsTracking(true);
						setIsValid(true);
						setQueueHash(data.hash || "");
						setLastUpdatedAt(new Date());
					} else if (data.tracking.status === "NOT_SUBMITTED") {
						setTrackingStatus("NOT_SUBMITTED");
						statusResult = "NOT_SUBMITTED";
						setTrackingMessage(data.tracking.message);
						setIsTracking(false);
						setIsValid(true);
					}
				}
			} catch (error) {
				console.error("Error checking tracking status", error);
				if (!trackingInfo || !isTracking) {
					setIsTracking(false);
					setTrackingStatus(null);
				}
			} finally {
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

				try {
					const data = await visitorFormPageService.getServices(uuid);
					setServices(data.services);
					setIsValid(true);
					setShowForm(true);
					setIsLoading(false);
					return;
				} catch (error) {
					if (!isVisitorFormApiError(error)) {
						throw error;
					}
				}

				try {
					const data = await visitorFormPageService.getDynamicUuid(uuid);
					window.location.href = "/visitor-form/preload?uuid=" + data.dynamicUuid;
					return;
				} catch (error) {
					if (!isVisitorFormApiError(error)) {
						throw error;
					}
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

		void validateUuid();
	}, [uuid, checkTrackingStatus]);

	useEffect(() => {
		let isActive = true;
		let pollingInterval: NodeJS.Timeout | null = null;

		if (isTracking && trackingStatus === "SUCCESS" && trackingInfo?.status !== "COMPLETED") {
			const clearPoll = () => {
				if (pollingInterval) {
					clearTimeout(pollingInterval);
					pollingInterval = null;
				}
			};

			const scheduleNextPoll = () => {
				if (!isActive || document.visibilityState !== "visible") {
					return;
				}

				pollingInterval = setTimeout(runPoll, TRACKING_POLL_INTERVAL_MS);
			};

			const runPoll = async () => {
				if (!isActive || document.visibilityState !== "visible") {
					clearPoll();
					return;
				}

				await checkTrackingStatus(false);
				scheduleNextPoll();
			};

			const handleVisibilityChange = () => {
				if (!isActive) {
					return;
				}

				if (document.visibilityState === "visible") {
					clearPoll();
					void checkTrackingStatus(false);
					scheduleNextPoll();
				} else {
					clearPoll();
				}
			};

			if (document.visibilityState === "visible") {
				scheduleNextPoll();
			}
			document.addEventListener("visibilitychange", handleVisibilityChange);

			return () => {
				isActive = false;
				document.removeEventListener("visibilitychange", handleVisibilityChange);
				clearPoll();
			};
		}

		return () => {
			isActive = false;
			if (pollingInterval) clearTimeout(pollingInterval);
		};
	}, [isTracking, trackingStatus, trackingInfo, checkTrackingStatus]);

	const submitVisitorForm = async (data: VisitorFormValues) => {
		try {
			setIsLoading(true);
			const { name, email, address, phone, institution, occupation, ...rest } = data;
			const payload = {
				...rest,
				name: name.trim(),
				email: email.trim(),
				address: address.trim(),
				phone: phone.trim(),
				institution: institution.trim(),
				occupation,
				tempUuid: uuid,
			};

			const result = await visitorFormPageService.submit(payload);
			setQueueInfo(result.data);
			setIsSubmitted(true);
			toast.success("Formulir berhasil dikirim");

			if (result.data.redirectUrl) {
				setTimeout(() => {
					window.location.href = result.data.redirectUrl;
				}, 1000);
				return;
			}

			await checkTrackingStatus();
		} catch (error) {
			console.error("Error submitting form:", error);
			toast.error(getVisitorFormErrorMessage(error, "Terjadi kesalahan saat mengirim formulir"));
		} finally {
			setIsLoading(false);
		}
	};

	const markSkdFilled = async () => {
		if (!uuid) return;

		try {
			setIsLoading(true);
			await visitorFormPageService.markSkd(uuid, true);
			toast.success("Terima kasih! Status SKD telah diperbarui");
			await checkTrackingStatus();
			setLastUpdatedAt(new Date());
		} catch (error) {
			console.error("Error updating SKD status:", error);
			toast.error(
				getVisitorFormErrorMessage(error, "Terjadi kesalahan saat memperbarui status SKD")
			);
		} finally {
			setIsLoading(false);
		}
	};

	return {
		form,
		uuid,
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
		markSkdFilled,
	};
}
