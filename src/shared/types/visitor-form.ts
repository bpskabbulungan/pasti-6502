import type { ServiceStatus, QueueType, QueueStatus } from "@/generated/prisma";

export type VisitorFormService = {
	id: string;
	name: string;
	status: ServiceStatus;
};

export type VisitorFormServicesResponse = {
	services: VisitorFormService[];
};

export type VisitorFormSubmitResponse = {
	success: true;
	message: string;
	data: {
		queueNumber: number;
		serviceName: string;
		visitorName: string;
		createdAt: Date;
		queueType: QueueType;
		redirectUrl: string;
	};
};

export type VisitorFormTrackResponse =
	| {
			tracking: {
				status: "NOT_SUBMITTED";
				message: string;
			};
			hash: string;
			hasChanges: boolean;
	  }
	| {
			tracking: {
				status: "SUCCESS";
				queue: {
					queueNumber: number;
					serviceName: string;
					visitorName: string;
					status: QueueStatus;
					queueType: QueueType;
					waitingBefore: number;
					estimated: number;
					createdAt: Date;
					startTime: Date | null;
					endTime: Date | null;
					filledSKD: boolean;
				};
			};
			hash: string;
			hasChanges: boolean;
	  };

export type VisitorFormDynamicUuidResponse = {
	dynamicUuid: string;
};

export type VisitorFormDynamicUuidErrorResponse = {
	error: "Invalid visitor UUID" | "Invalid QR code";
	status?: number;
};
