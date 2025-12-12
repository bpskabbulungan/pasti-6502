"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";

type Queue = {
	id: string;
	queueNumber: number;
	status: string;
	queueType: string;
	service: { name: string };
	admin: { name: string } | null;
	createdAt: string;
};

type QueueDisplayResponse = {
	servingQueues: Queue[];
	nextQueue: Queue | null;
	hash?: string;
	hasChanges?: boolean;
};

const fetcher = async (url: string): Promise<QueueDisplayResponse> => {
	const res = await fetch(url, { cache: "no-store" });
	if (!res.ok) {
		throw new Error("Failed to fetch queue display data");
	}
	return res.json();
};

export function useQueueDisplay(params: {
	adminId: string;
	dateFilter: string;
	refreshInterval?: number;
}) {
	const { adminId, dateFilter, refreshInterval = 10_000 } = params;
	const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

	const query = useMemo(() => {
		const searchParams = new URLSearchParams();
		if (adminId && adminId !== "all") searchParams.append("adminId", adminId);
		if (dateFilter) searchParams.append("dateFilter", dateFilter);
		const base = "/api/queue-display";
		return searchParams.size > 0 ? `${base}?${searchParams.toString()}` : base;
	}, [adminId, dateFilter]);

	const {
		data,
		error,
		isLoading,
		isValidating,
		mutate: refetch,
	} = useSWR<QueueDisplayResponse>(query, fetcher, {
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
