"use client";

import { useEffect, useMemo, useRef } from "react";
import useSWR from "swr";

type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

type LiveEnvelope<TData> = {
  data: TData;
  etag: string | null;
  fetchedAt: string;
};

type UseLiveQueryOptions<TData> = {
  fallbackData?: TData;
  fallbackEtag?: string | null;
  refreshInterval?: number;
  enabled?: boolean;
  onError?: (error: unknown) => void;
};

async function fetchLiveJson<TData>(
  url: string,
  previous?: LiveEnvelope<TData>
): Promise<LiveEnvelope<TData>> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: previous?.etag ? { "If-None-Match": previous.etag } : undefined,
  });

  if (response.status === 304 && previous) {
    return previous;
  }

  if (!response.ok) {
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      // ignore parse errors
    }

    const error: ApiError = {
      status: response.status,
      message: response.statusText || "Request failed",
      details,
    };
    throw error;
  }

  return {
    data: (await response.json()) as TData,
    etag: response.headers.get("etag"),
    fetchedAt: new Date().toISOString(),
  };
}

export function useLiveQuery<TData>(
  url: string | null,
  {
    fallbackData,
    fallbackEtag = null,
    refreshInterval = 30_000,
    enabled = true,
    onError,
  }: UseLiveQueryOptions<TData> = {}
) {
  const initialEnvelope = useMemo<LiveEnvelope<TData> | undefined>(() => {
    if (typeof fallbackData === "undefined") {
      return undefined;
    }

    return {
      data: fallbackData,
      etag: fallbackEtag,
      fetchedAt: new Date().toISOString(),
    };
  }, [fallbackData, fallbackEtag]);

  const previousRef = useRef<LiveEnvelope<TData> | undefined>(initialEnvelope);
  const previousUrlRef = useRef<string | null>(url);

  useEffect(() => {
    if (previousUrlRef.current !== url) {
      previousUrlRef.current = url;
      previousRef.current = initialEnvelope;
    }
  }, [initialEnvelope, url]);

  const swr = useSWR<LiveEnvelope<TData>>(
    enabled && url ? url : null,
    (key) => fetchLiveJson<TData>(key, previousRef.current),
    {
      fallbackData: initialEnvelope,
      refreshInterval,
      refreshWhenHidden: false,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      keepPreviousData: true,
      dedupingInterval: 5_000,
      shouldRetryOnError: false,
      onError,
    }
  );

  useEffect(() => {
    if (swr.data) {
      previousRef.current = swr.data;
    }
  }, [swr.data]);

  const data = swr.data?.data ?? fallbackData;

  return {
    data,
    etag: swr.data?.etag ?? fallbackEtag,
    lastFetchedAt: swr.data?.fetchedAt ?? initialEnvelope?.fetchedAt ?? null,
    isLoading: swr.isLoading && typeof data === "undefined",
    isRefreshing: swr.isValidating && typeof data !== "undefined",
    error: swr.error,
    refresh: async () => {
      await swr.mutate();
    },
  };
}
