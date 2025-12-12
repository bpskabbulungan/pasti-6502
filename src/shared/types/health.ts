export type HealthServiceStatus = "ok" | "error" | "disabled";

export type HealthSection = {
	status: HealthServiceStatus;
	message: string;
};

export type HealthStatusResponse = {
	status: "ok" | "degraded";
	message: string;
	timestamp: string;
	services: {
		database: HealthSection;
		whatsapp: HealthSection;
		api: HealthSection;
		redis: HealthSection;
	};
};
