import { format } from "date-fns";
import prisma from "@api/infrastructure/database/prisma";
import { QueueStatus, Prisma } from "@/generated/prisma";

type DateRange = {
	startDate: Date;
	endDate: Date;
};

const parseDateRange = (
	startDateParam: string,
	endDateParam: string,
	maxRangeDays: number
): { ok: true; range: DateRange } | { ok: false; status: number; error: string } => {
	const startDate = new Date(startDateParam);
	startDate.setHours(0, 0, 0, 0);
	const endDate = new Date(endDateParam);
	endDate.setHours(0, 0, 0, 0);
	endDate.setDate(endDate.getDate() + 1);

	if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
		return {
			ok: false,
			status: 400,
			error: "Tanggal tidak valid, gunakan format YYYY-MM-DD",
		};
	}

	const diffDays =
		(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
	if (diffDays > maxRangeDays) {
		return {
			ok: false,
			status: 400,
			error: `Rentang tanggal terlalu besar. Maksimal ${maxRangeDays} hari.`,
		};
	}

	return { ok: true, range: { startDate, endDate } };
};

export async function getAnalyticsSummary(startDate: Date, endDate: Date) {
	const dateRange = {
		gte: startDate,
		lt: endDate,
	};
	const whereRange = { queueDate: dateRange };

	const [totalVisitors, completedServices, canceledServices] =
		await Promise.all([
			prisma.queue.count({ where: whereRange }),
			prisma.queue.count({
				where: { ...whereRange, status: QueueStatus.COMPLETED },
			}),
			prisma.queue.count({
				where: { ...whereRange, status: QueueStatus.CANCELED },
			}),
		]);

	const queues = await prisma.queue.findMany({
		where: whereRange,
		select: {
			status: true,
			queueType: true,
			serviceId: true,
			createdAt: true,
			queueDate: true,
			startTime: true,
			endTime: true,
			adminId: true,
		},
	});

	let totalWaitTimeMs = 0;
	let totalServiceTimeMs = 0;
	let waitCount = 0;
	let serviceCount = 0;

	queues.forEach((queue) => {
		if (queue.startTime) {
			const waitTimeMs =
				new Date(queue.startTime).getTime() - new Date(queue.createdAt).getTime();
			totalWaitTimeMs += waitTimeMs;
			waitCount++;

			if (queue.endTime && queue.status === QueueStatus.COMPLETED) {
				const serviceTimeMs =
					new Date(queue.endTime).getTime() -
					new Date(queue.startTime).getTime();
				totalServiceTimeMs += serviceTimeMs;
				serviceCount++;
			}
		}
	});

	const averageWaitTimeMinutes =
		waitCount > 0 ? Math.round(totalWaitTimeMs / waitCount / (1000 * 60)) : 0;

	const averageServiceTimeMinutes =
		serviceCount > 0
			? Math.round(totalServiceTimeMs / serviceCount / (1000 * 60))
			: 0;

	const serviceGroups = await prisma.queue.groupBy({
		by: ["serviceId"],
		_count: { _all: true },
		where: whereRange,
	});
	const serviceIds = serviceGroups.map((g) => g.serviceId);
	const services = serviceIds.length
		? await prisma.service.findMany({
				where: { id: { in: serviceIds } },
		  })
		: [];

	const serviceDistribution = serviceGroups
		.map((group) => {
			const service = services.find((s) => s.id === group.serviceId);
			const count = group._count._all;
			const percentage =
				totalVisitors > 0 ? Math.round((count / totalVisitors) * 100) : 0;
			return {
				name: service?.name ?? "Lainnya",
				count,
				percentage,
			};
		})
		.filter((item) => item.count > 0);

	const queueTypeGroups = await prisma.queue.groupBy({
		by: ["queueType"],
		_count: { _all: true },
		where: whereRange,
	});

	const queueTypeDistribution = queueTypeGroups
		.map((group) => {
			const name = group.queueType === "ONLINE" ? "Online" : "Offline";
			return {
				name,
				count: group._count._all,
				percentage:
					totalVisitors > 0
						? Math.round((group._count._all / totalVisitors) * 100)
						: 0,
			};
		})
		.filter((item) => item.count > 0);

	const adminGroups = await prisma.queue.groupBy({
		by: ["adminId"],
		where: { ...whereRange, adminId: { not: null } },
		_count: { _all: true },
	});
	const adminIds = adminGroups
		.map((g) => g.adminId)
		.filter((id): id is string => Boolean(id));
	const admins = adminIds.length
		? await prisma.user.findMany({ where: { id: { in: adminIds } } })
		: [];

	const adminPerformance = admins
		.map((admin) => {
			const adminQueues = queues.filter((q) => q.adminId === admin.id);
			const completedCount = adminQueues.filter(
				(q) => q.status === QueueStatus.COMPLETED
			).length;

			let totalAdminServiceTimeMs = 0;
			let adminServiceCount = 0;

			adminQueues.forEach((queue) => {
				if (
					queue.startTime &&
					queue.endTime &&
					queue.status === QueueStatus.COMPLETED
				) {
					const serviceTimeMs =
						new Date(queue.endTime).getTime() -
						new Date(queue.startTime).getTime();
					totalAdminServiceTimeMs += serviceTimeMs;
					adminServiceCount++;
				}
			});

			const averageServiceTime =
				adminServiceCount > 0
					? Math.round(
							totalAdminServiceTimeMs / adminServiceCount / (1000 * 60)
					  )
					: 0;

			return {
				adminName: admin.name,
				completedCount,
				averageServiceTime,
			};
		})
		.filter((item) => item.completedCount > 0);

	const timeAnalysis = Array.from({ length: 24 }, (_, i) => ({
		hourOfDay: i,
		count: 0,
	}));

	queues.forEach((queue) => {
		const hour = new Date(queue.createdAt).getHours();
		timeAnalysis[hour].count += 1;
	});

	const filteredTimeAnalysis = timeAnalysis.filter((item) => item.count > 0);

	const dailyMap = new Map<string, { date: string; waiting: number; completed: number; canceled: number }>();

	queues.forEach((queue) => {
		const daySource = queue.queueDate ?? queue.createdAt;
		const day = format(new Date(daySource), "yyyy-MM-dd");

		if (!dailyMap.has(day)) {
			dailyMap.set(day, {
				date: day,
				waiting: 0,
				completed: 0,
				canceled: 0,
			});
		}

		const dayData = dailyMap.get(day);

		switch (queue.status) {
			case QueueStatus.WAITING:
			case QueueStatus.SERVING:
				dayData!.waiting += 1;
				break;
			case QueueStatus.COMPLETED:
				dayData!.completed += 1;
				break;
			case QueueStatus.CANCELED:
				dayData!.canceled += 1;
				break;
		}
	});

	const dailyTrends = Array.from(dailyMap.values()).sort((a, b) => {
		return new Date(a.date).getTime() - new Date(b.date).getTime();
	});

	return {
		summary: {
			totalVisitors,
			completedServices,
			canceledServices,
			averageWaitTimeMinutes,
			averageServiceTimeMinutes,
		},
		serviceDistribution,
		queueTypeDistribution,
		adminPerformance,
		timeAnalysis: filteredTimeAnalysis,
		dailyTrends,
	};
}

export async function exportAnalytics(
	range: DateRange,
	exportFormat: "json" | "csv"
) {
	const queueWithRelations = {
		include: {
			visitor: true,
			service: true,
			admin: true,
		},
	} satisfies Prisma.QueueFindManyArgs;

	type QueueWithRelations = Prisma.QueueGetPayload<typeof queueWithRelations>;

	const totalRows = await prisma.queue.count({
		where: {
			queueDate: {
				gte: range.startDate,
				lt: range.endDate,
			},
		},
	});

	if (totalRows === 0) {
		return { ok: false as const, status: 404, error: "No data to export for the selected date range" };
	}

	const makeRow = (queue: QueueWithRelations) => ({
		queueNumber: queue.queueNumber,
		serviceType: queue.service.name,
		visitorName: queue.visitor.name,
		phoneNumber: queue.visitor.phone,
		createdAt: format(new Date(queue.createdAt), "yyyy-MM-dd HH:mm:ss"),
		startTime: queue.startTime
			? format(new Date(queue.startTime), "yyyy-MM-dd HH:mm:ss")
			: "",
		endTime: queue.endTime
			? format(new Date(queue.endTime), "yyyy-MM-dd HH:mm:ss")
			: "",
		status: queue.status,
		servedBy: queue.admin ? queue.admin.name : "",
		waitTimeMinutes: queue.startTime
			? Math.round(
					(new Date(queue.startTime).getTime() -
						new Date(queue.createdAt).getTime()) /
						(1000 * 60)
			  )
			: "",
		serviceTimeMinutes:
			queue.startTime && queue.endTime
				? Math.round(
						(new Date(queue.endTime).getTime() -
							new Date(queue.startTime).getTime()) /
							(1000 * 60)
				  )
				: "",
	});

	const pageSize = 500;
	const encoder = new TextEncoder();

	async function* fetchQueueBatches() {
		let cursor: { id: string } | undefined = undefined;
		let hasMore = true;
		while (hasMore) {
			const batch: QueueWithRelations[] = await prisma.queue.findMany({
				...queueWithRelations,
				where: {
					queueDate: {
						gte: range.startDate,
						lt: range.endDate,
					},
				},
				orderBy: [
					{ createdAt: "asc" },
					{ id: "asc" },
				],
				take: pageSize,
				cursor: cursor ? { id: cursor.id } : undefined,
				skip: cursor ? 1 : 0,
			});

			if (batch.length === 0) {
				break;
			}

			yield batch.map(makeRow);

			if (batch.length < pageSize) {
				hasMore = false;
				continue;
			}

			cursor = { id: batch[batch.length - 1].id };
		}
	}

	if (exportFormat === "json") {
		const stream = new ReadableStream({
			async start(controller) {
				controller.enqueue(encoder.encode("["));
				let isFirst = true;
				for await (const rows of fetchQueueBatches()) {
					for (const row of rows) {
						const prefix = isFirst ? "" : ",";
						isFirst = false;
						controller.enqueue(encoder.encode(`${prefix}${JSON.stringify(row)}`));
					}
				}
				controller.enqueue(encoder.encode("]"));
				controller.close();
			},
		});

		return {
			ok: true as const,
			format: "json" as const,
			stream,
			headers: {
				"Content-Type": "application/json",
			},
		};
	}

	// csv
	let headersWritten = false;
	const stream = new ReadableStream({
		async start(controller) {
			for await (const rows of fetchQueueBatches()) {
				if (rows.length === 0) continue;
				if (!headersWritten) {
					const headers = Object.keys(rows[0]).join(",") + "\n";
					controller.enqueue(encoder.encode(headers));
					headersWritten = true;
				}

				for (const row of rows) {
					const headers = Object.keys(row);
					const values = headers.map((header) => {
						const value = row[header as keyof typeof row];
						return typeof value === "string"
							? `"${value.replace(/"/g, '""')}"`
							: value;
					});
					controller.enqueue(encoder.encode(values.join(",") + "\n"));
				}
			}
			controller.close();
		},
	});

	return {
		ok: true as const,
		format: "csv" as const,
		stream,
		headers: {
			"Content-Type": "text/csv",
		},
	};
}

export { parseDateRange };
