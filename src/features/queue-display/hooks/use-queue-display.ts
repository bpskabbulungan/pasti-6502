"use client";

import useSWR from "swr";
import { useMemo, useRef, useState } from "react";
import { queueDisplayApi } from "@/services/api/queue-display";
import type { QueueDisplayResponse } from "@shared/types/queue";

export function useQueueDisplay(params: {
	adminId: string;
	dateFilter: string;
	refreshInterval?: number;
}) {
	const { adminId, dateFilter, refreshInterval = 10_000 } = params;
	const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
	const hashRef = useRef<string>("");
	const snapshotRef = useRef<QueueDisplayResponse | null>(null);

	const swrKey = useMemo(
		() => ["queue-display", adminId, dateFilter] as const,
		[adminId, dateFilter]
	);
	const fetcher = async (key: typeof swrKey) => {
		const response = await queueDisplayApi.get({
			adminId: key[1],
			dateFilter: key[2],
			hash: hashRef.current || undefined,
		});

		if (response.hash) {
			hashRef.current = response.hash;
		}

		if (response.hasChanges === false && snapshotRef.current) {
			return {
				...snapshotRef.current,
				hash: response.hash ?? snapshotRef.current.hash,
				hasChanges: false,
			};
		}

		snapshotRef.current = response;
		return response;
	};

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
		onSuccess: (response) => {
			if (!response || response.hasChanges === false) {
				return;
			}
			setLastUpdatedAt(new Date());
		},
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
