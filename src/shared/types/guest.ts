import type { Purpose, QueueStatus } from "@/shared/constants/enums";

export type GuestSubmissionResponse = {
  success: true;
  message: string;
  data: {
    queueId: string;
    queueNumber: number;
    queueCode: string;
    status: QueueStatus;
    purpose: Purpose | null;
    serviceName: string;
    guestName: string;
    trackingLink: string | null;
  };
};

export type GuestQueueDetail = GuestSubmissionResponse["data"] & {
  hash?: string;
  hasChanges?: boolean;
};
