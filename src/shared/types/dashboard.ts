export type DashboardCounts = {
	waiting: number;
	serving: number;
	completed: number;
	canceled: number;
	total: number;
};

export type DashboardAverages = {
	waitTimeMinutes: number;
	serviceTimeMinutes: number;
};

export type DashboardStatsResponse = {
	counts: DashboardCounts;
	averages: DashboardAverages;
	hash?: string;
	hasChanges?: boolean;
};
