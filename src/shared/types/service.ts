import type { ServiceStatus } from "@/shared/constants/enums";

export type ServiceSummary = {
	id: string;
	name: string;
	code?: string;
	status: ServiceStatus;
	createdAt: string | Date;
	updatedAt: string | Date;
};

export type ServicesListResponse = {
	services: ServiceSummary[];
};

export type ServiceResponse = {
	service: ServiceSummary;
};

export type ServiceDeleteResponse = {
	success: boolean;
};
