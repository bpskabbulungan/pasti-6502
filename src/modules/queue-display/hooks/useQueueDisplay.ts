"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";
import { queueDisplayApi } from "@/services/api/queue-display";
import type { QueueDisplayResponse } from "@shared/types/queue";

export function useQueueDisplay(params: {
	adminId: string;
	dateFilter: string;
	refreshInterval?: number;
}) {
	const { adminId, dateFilter, refreshInterval = 10_000 } = params;
	const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

	const swrKey = useMemo(
		() => ["queue-display", adminId, dateFilter] as const,
		[adminId, dateFilter]
	);
	const fetcher = async (key: typeof swrKey) =>
		queueDisplayApi.get({ adminId: key[1], dateFilter: key[2] });

	const {
		data,
		error,
		isLoading,
		isValidating,
		mutate: refetch,
	} = useSWR<QueueDisplayResponse>(swrKey, fetcher, {
		refreshInterval,
		revalidateOnFocus: true,
		dedupingInterval: 5_000,
		onSuccess: () => setLastUpdatedAt(new Date()),
	});

	return {
		servingQueues: data?.servingQueues ?? [],
		nextQueue: data?.nextQueue ?? null,
		lastUpdatedAt,
		isLoading,
		isValidating,
		error,
		refetch,
	};
}
