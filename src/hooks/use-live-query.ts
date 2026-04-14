"use client";

import { useEffect, useMemo, useRef } from "react";
import useSWR from "swr";
import type { SWRConfiguration } from "swr";

type ApiError = {
  status: number;
  message: string;
  details?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isApiError = (value: unknown): value is ApiError =>
  isRecord(value) && typeof value.status === "number" && typeof value.message === "string";

const normalizeLiveQueryError = (error: unknown): ApiError => {
  if (isApiError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return {
      status: 0,
      message: error.message || "Request failed",
      details: { name: error.name },
    };
  }

  if (typeof error === "string" && error.trim()) {
    return {
      status: 0,
      message: error,
    };
  }

  return {
    status: 0,
    message: "Request failed",
    details: error,
  };
};

async function readErrorDetails(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      // fall through and try text
    }
  }

  try {
    const text = await response.text();
    return text ? { error: text } : undefined;
  } catch {
    return undefined;
  }
}

async function readSuccessPayload<TData>(response: Response): Promise<TData> {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const details = await readErrorDetails(response);
    const error: ApiError = {
      status: response.status,
      message: "Expected JSON response",
      details,
    };
    throw error;
  }

  const fallbackResponse = response.clone();
  try {
    return (await response.json()) as TData;
  } catch {
    const details = await readErrorDetails(fallbackResponse);
    const error: ApiError = {
      status: response.status,
      message: "Invalid JSON response",
      details,
    };
    throw error;
  }
}

type LiveEnvelope<TData> = {
  data: TData;
  etag: string | null;
  fetchedAt: string | null;
};

type UseLiveQueryOptions<TData> = {
  fallbackData?: TData;
  fallbackEtag?: string | null;
  fallbackFetchedAt?: string | null;
  refreshInterval?: number;
  enabled?: boolean;
  onError?: (error: unknown) => void;
};

async function fetchLiveJson<TData>(
  url: string,
  previous?: LiveEnvelope<TData>
): Promise<LiveEnvelope<TData>> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: previous?.etag ? { "If-None-Match": previous.etag } : undefined,
    });

    if (response.status === 304 && previous) {
      return previous;
    }

    if (!response.ok) {
      const details = await readErrorDetails(response);
      const detailsError =
        isRecord(details) && typeof details.error === "string" ? details.error : null;

      const error: ApiError = {
        status: response.status,
        message: detailsError || response.statusText || "Request failed",
        details,
      };
      throw error;
    }

    const data = await readSuccessPayload<TData>(response);

    return {
      data,
      etag: response.headers.get("etag"),
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    throw normalizeLiveQueryError(error);
  }
}

export function useLiveQuery<TData>(
  url: string | null,
  {
    fallbackData,
    fallbackEtag = null,
    fallbackFetchedAt = null,
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
      fetchedAt: fallbackFetchedAt,
    };
  }, [fallbackData, fallbackEtag, fallbackFetchedAt]);

  const previousRef = useRef<LiveEnvelope<TData> | undefined>(initialEnvelope);
  const previousUrlRef = useRef<string | null>(url);

  useEffect(() => {
    if (previousUrlRef.current !== url) {
      previousUrlRef.current = url;
      previousRef.current = initialEnvelope;
    }
  }, [initialEnvelope, url]);

  const swrOptions: SWRConfiguration<LiveEnvelope<TData>, ApiError> = {
    fallbackData: initialEnvelope,
    refreshInterval,
    refreshWhenHidden: false,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    keepPreviousData: true,
    dedupingInterval: 5_000,
    shouldRetryOnError: false,
  };

  if (typeof onError === "function") {
    swrOptions.onError = onError;
  }

  const swr = useSWR<LiveEnvelope<TData>>(
    enabled && url ? url : null,
    (key) => fetchLiveJson<TData>(key, previousRef.current),
    swrOptions
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
