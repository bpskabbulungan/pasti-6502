import { QueueStatus } from "@/generated/prisma";

export type AnalyticsServiceDistribution = {
	name: string;
	count: number;
	percentage: number;
};

export type AnalyticsQueueTypeDistribution = {
	name: string;
	count: number;
	percentage: number;
};

export type AnalyticsAdminPerformance = {
	adminName: string;
	completedCount: number;
	averageServiceTime: number;
};

export type AnalyticsTimeAnalysis = {
	hourOfDay: number;
	count: number;
};

export type AnalyticsDailyTrend = {
	date: string;
	waiting: number;
	completed: number;
	canceled: number;
};

export type AnalyticsSummary = {
	summary: {
		totalVisitors: number;
		completedServices: number;
		canceledServices: number;
		averageWaitTimeMinutes: number;
		averageServiceTimeMinutes: number;
	};
	serviceDistribution: AnalyticsServiceDistribution[];
	queueTypeDistribution: AnalyticsQueueTypeDistribution[];
	adminPerformance: AnalyticsAdminPerformance[];
	timeAnalysis: AnalyticsTimeAnalysis[];
	dailyTrends: AnalyticsDailyTrend[];
	hash?: string;
	hasChanges?: boolean;
	dataLastUpdatedAt?: string;
	trackLastUpdated?: string;
};

export type AnalyticsExportRow = {
	queueNumber: number;
	serviceType: string;
	visitorName: string;
	phoneNumber: string;
	createdAt: string;
	startTime: string | "";
	endTime: string | "";
	status: QueueStatus;
	servedBy: string;
	waitTimeMinutes: number | "";
	serviceTimeMinutes: number | "";
};
