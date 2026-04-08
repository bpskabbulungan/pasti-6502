import type { QueueStatus, ServiceStatus } from "@/shared/constants/enums";

export type GuestServiceOption = {
  id: string;
  name: string;
  status: ServiceStatus;
};

export type GuestServicesResponse = {
  services: GuestServiceOption[];
};

export type GuestSubmissionResponse = {
  success: true;
  message: string;
  data: {
    queueId: string;
    queueNumber: number;
    queueCode: string;
    status: QueueStatus;
    serviceName: string;
    guestName: string;
    trackingLink: string | null;
  };
};

export type GuestQueueDetail = GuestSubmissionResponse["data"] & {
  officerName?: string | null;
  filledSKD?: boolean;
  serviceRating?: number | null;
  serviceFeedback?: string | null;
  feedbackSubmittedAt?: string | null;
  hash?: string;
  hasChanges?: boolean;
};
