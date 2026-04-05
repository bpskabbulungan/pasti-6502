"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLiveQuery } from "@/hooks/use-live-query";
import { guestbookApi } from "@/services/api/guestbook";
import type { GuestbookEntry, GuestbookListResponse } from "@shared/types/guestbook";
import { exportGuestbookData } from "./service";
import { formatGuestbookDateTime, getGuestbookErrorMessage } from "./helper";
import type { DateFilter, PurposeFilter, StatusFilter } from "./schema";
import {
	buildFallbackSummary,
	getPurposeFilterLabel,
	getStatusFilterLabel,
} from "./view-model";

export function useGuestbookPageController(
	initialData: GuestbookListResponse,
	initialFetchedAt: string
) {
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
	const [purposeFilter, setPurposeFilter] = useState<PurposeFilter>("ALL");
	const [dateFilter, setDateFilter] = useState<DateFilter>("today");
	const [pageSize, setPageSize] = useState(10);
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedEntry, setSelectedEntry] = useState<GuestbookEntry | null>(null);
	const [detailOpen, setDetailOpen] = useState(false);
	const [exportingFormat, setExportingFormat] = useState<"xlsx" | "pdf" | null>(null);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearch(searchTerm.trim());
		}, 400);
		return () => clearTimeout(handler);
	}, [searchTerm]);

	useEffect(() => {
		setCurrentPage(1);
	}, [statusFilter, purposeFilter, dateFilter, pageSize, debouncedSearch]);

	const offset = (currentPage - 1) * pageSize;
	const guestbookUrl = guestbookApi.listUrl({
		status: statusFilter,
		purpose: purposeFilter,
		dateFilter,
		search: debouncedSearch || undefined,
		limit: pageSize,
		offset,
	});
	const isUsingInitialData =
		currentPage === 1 &&
		pageSize === 10 &&
		statusFilter === "ALL" &&
		purposeFilter === "ALL" &&
		dateFilter === "today" &&
		!debouncedSearch;

	const {
		data: guestbookData,
		isLoading,
		isRefreshing,
		lastFetchedAt,
		refresh,
	} = useLiveQuery<GuestbookListResponse>(guestbookUrl, {
		fallbackData: isUsingInitialData ? initialData : undefined,
		fallbackEtag: isUsingInitialData && initialData.hash ? `"${initialData.hash}"` : null,
		fallbackFetchedAt: isUsingInitialData ? initialFetchedAt : null,
		refreshInterval: 60_000,
		onError: (error) => {
			console.error("Error fetching guestbook:", error);
			toast.error(getGuestbookErrorMessage(error, "Terjadi kesalahan saat memuat buku tamu"));
		},
	});

	const entries = useMemo(() => guestbookData?.entries ?? [], [guestbookData?.entries]);
	const summary = guestbookData?.summary ?? null;
	const totalEntries = guestbookData?.pagination.total ?? null;

	const fallbackSummary = useMemo(
		() => buildFallbackSummary(entries, totalEntries),
		[entries, totalEntries]
	);
	const summaryData = summary ?? fallbackSummary;

	const hasFetched = Boolean(lastFetchedAt);
	const lastFetchedLabel = lastFetchedAt
		? formatGuestbookDateTime(lastFetchedAt)
		: isLoading
			? "Memuat data..."
			: "Belum ada data";
	const statusLabel = isRefreshing
		? "Memperbarui data..."
		: hasFetched
			? "Data terbaru"
			: "Belum ada data";
	const isInitialLoading = isLoading && entries.length === 0;

	const purposeFilterLabel = getPurposeFilterLabel(purposeFilter);
	const statusFilterLabel = getStatusFilterLabel(statusFilter);

	const totalItems = totalEntries ?? entries.length;
	const totalPages = totalEntries ? Math.max(1, Math.ceil(totalEntries / pageSize)) : 1;
	const rangeStart = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
	const rangeEnd = totalItems > 0 ? Math.min(currentPage * pageSize, totalItems) : 0;
	const showingLabel =
		totalEntries !== null
			? `Menampilkan ${rangeStart}-${rangeEnd} dari ${totalItems} data`
			: `Menampilkan ${entries.length} data`;

	const canPrevPage = currentPage > 1;
	const canNextPage = totalEntries ? currentPage < totalPages : false;

	const hasActiveFilters =
		statusFilter !== "ALL" ||
		purposeFilter !== "ALL" ||
		dateFilter !== "today" ||
		Boolean(debouncedSearch);

	const resetFilters = () => {
		setSearchTerm("");
		setStatusFilter("ALL");
		setPurposeFilter("ALL");
		setDateFilter("today");
	};

	const handleExport = async (format: "xlsx" | "pdf") => {
		try {
			setExportingFormat(format);
			await exportGuestbookData({
				statusFilter,
				purposeFilter,
				dateFilter,
				search: debouncedSearch || undefined,
				format,
			});
			toast.success(
				format === "xlsx" ? "Export Excel berhasil diunduh" : "Export PDF berhasil diunduh"
			);
		} catch (error) {
			console.error("Error exporting guestbook:", error);
			toast.error(getGuestbookErrorMessage(error, "Gagal mengekspor data buku tamu"));
		} finally {
			setExportingFormat(null);
		}
	};

	const openDetail = useCallback((entry: GuestbookEntry) => {
		setSelectedEntry(entry);
		setDetailOpen(true);
	}, []);

	const handleDetailOpenChange = (open: boolean) => {
		setDetailOpen(open);
		if (!open) {
			setSelectedEntry(null);
		}
	};

	return {
		searchTerm,
		setSearchTerm,
		statusFilter,
		setStatusFilter,
		purposeFilter,
		setPurposeFilter,
		dateFilter,
		setDateFilter,
		pageSize,
		setPageSize,
		currentPage,
		setCurrentPage,
		selectedEntry,
		detailOpen,
		exportingFormat,
		entries,
		summaryData,
		totalPages,
		canPrevPage,
		canNextPage,
		isInitialLoading,
		isRefreshing,
		hasFetched,
		lastFetchedLabel,
		statusLabel,
		showingLabel,
		purposeFilterLabel,
		statusFilterLabel,
		hasActiveFilters,
		debouncedSearch,
		refresh,
		handleExport,
		openDetail,
		handleDetailOpenChange,
		resetFilters,
	};
}
