import { apiFetch } from "./base-client";
import type {
  GuestQueueDetail,
  GuestServicesResponse,
  GuestSubmissionResponse,
} from "@shared/types/guest";

type GuestQueueFeedbackPayload = {
  rating: number;
  comment?: string;
};

type GuestQueueFeedbackResponse = {
  success: true;
  message: string;
  data: {
    queueId: string;
    serviceRating: number;
    serviceFeedback: string | null;
    feedbackSubmittedAt: string;
  };
};

export const guestApi = {
	detailUrl: (queueId: string) => `/api/guest/queue/${queueId}`,
	services: () => apiFetch<GuestServicesResponse>("/api/guest"),
	submit: (payload: unknown) =>
		apiFetch<GuestSubmissionResponse>("/api/guest", {
			method: "POST",
			body: payload,
		}),
	detail: (queueId: string) =>
		apiFetch<GuestQueueDetail>(`/api/guest/queue/${queueId}`),
	submitFeedback: (queueId: string, payload: GuestQueueFeedbackPayload) =>
		apiFetch<GuestQueueFeedbackResponse>(`/api/guest/queue/${queueId}/feedback`, {
			method: "POST",
			body: payload,
		}),
};
