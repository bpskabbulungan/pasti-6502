"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLiveQuery } from "@/hooks/use-live-query";
import { guestbookApi } from "@/services/api/guestbook";
import type { GuestbookEntry, GuestbookListResponse } from "@shared/types/guestbook";
import { exportGuestbookData } from "./service";
import { formatGuestbookDateTime, getGuestbookErrorMessage } from "./helper";
import type {
	DateFilter,
	SortByFilter,
	SortOrderFilter,
} from "./schema";
import {
	buildFallbackSummary,
	dateFilterLabels,
	getDateFilterLabel,
	monthOptions,
	quarterOptions,
	semesterOptions,
	sortOptions,
} from "./view-model";

export function useGuestbookPageController(
	initialData: GuestbookListResponse,
	initialFetchedAt: string
) {
	const now = new Date();
	const defaultYear = now.getFullYear();
	const defaultMonth = now.getMonth() + 1;
	const defaultQuarter = Math.ceil(defaultMonth / 3);
	const defaultSemester = defaultMonth <= 6 ? 1 : 2;

	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [dateFilter, setDateFilter] = useState<DateFilter>("today");
	const [filterYear, setFilterYear] = useState(defaultYear);
	const [filterMonth, setFilterMonth] = useState(defaultMonth);
	const [filterQuarter, setFilterQuarter] = useState(defaultQuarter);
	const [filterSemester, setFilterSemester] = useState(defaultSemester);
	const [sortBy, setSortBy] = useState<SortByFilter>("createdAt");
	const [sortOrder, setSortOrder] = useState<SortOrderFilter>("desc");
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
	}, [
		dateFilter,
		filterYear,
		filterMonth,
		filterQuarter,
		filterSemester,
		sortBy,
		sortOrder,
		pageSize,
		debouncedSearch,
	]);

	const periodParams = useMemo(() => {
		switch (dateFilter) {
			case "year":
				return { year: filterYear };
			case "month":
				return { year: filterYear, month: filterMonth };
			case "quarter":
				return { year: filterYear, quarter: filterQuarter };
			case "semester":
				return { year: filterYear, semester: filterSemester };
			default:
				return {};
		}
	}, [dateFilter, filterYear, filterMonth, filterQuarter, filterSemester]);

	const offset = (currentPage - 1) * pageSize;
	const guestbookUrl = guestbookApi.listUrl({
		dateFilter,
		...periodParams,
		sortBy,
		sortOrder,
		search: debouncedSearch || undefined,
		limit: pageSize,
		offset,
	});

	const isUsingInitialData =
		currentPage === 1 &&
		pageSize === 10 &&
		dateFilter === "today" &&
		sortBy === "createdAt" &&
		sortOrder === "desc" &&
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
	const isInitialLoading = isLoading && entries.length === 0;

	const dateFilterLabel = getDateFilterLabel({
		dateFilter,
		year: filterYear,
		month: filterMonth,
		quarter: filterQuarter,
		semester: filterSemester,
	});
	const sortLabel =
		sortOptions.find((option) => option.value === `${sortBy}.${sortOrder}`)?.label ?? "-";
	const isDefaultSort = sortBy === "createdAt" && sortOrder === "desc";
	const yearOptions = useMemo(() => {
		const startYear = defaultYear - 5;
		const endYear = defaultYear + 1;
		return Array.from({ length: endYear - startYear + 1 }, (_, idx) => endYear - idx);
	}, [defaultYear]);

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
		dateFilter !== "today" ||
		!isDefaultSort ||
		Boolean(debouncedSearch);

	const resetFilters = () => {
		setSearchTerm("");
		setDateFilter("today");
		setFilterYear(defaultYear);
		setFilterMonth(defaultMonth);
		setFilterQuarter(defaultQuarter);
		setFilterSemester(defaultSemester);
		setSortBy("createdAt");
		setSortOrder("desc");
	};

	const toggleColumnSort = useCallback((column: SortByFilter) => {
		if (sortBy !== column) {
			setSortBy(column);
			if (column === "createdAt" || column === "queueNumber") {
				setSortOrder("desc");
				return;
			}
			setSortOrder("asc");
			return;
		}

		setSortOrder((currentOrder) => (currentOrder === "asc" ? "desc" : "asc"));
	}, [sortBy]);

	const getColumnSortOrder = useCallback(
		(column: SortByFilter): SortOrderFilter | null =>
			sortBy === column ? sortOrder : null,
		[sortBy, sortOrder]
	);

	const handleExport = async (format: "xlsx" | "pdf") => {
		try {
			setExportingFormat(format);
			await exportGuestbookData({
				dateFilter,
				year: filterYear,
				month: filterMonth,
				quarter: filterQuarter,
				semester: filterSemester,
				sortBy,
				sortOrder,
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
		dateFilter,
		setDateFilter,
		dateFilterLabel,
		filterYear,
		setFilterYear,
		filterMonth,
		setFilterMonth,
		filterQuarter,
		setFilterQuarter,
		filterSemester,
		setFilterSemester,
		sortBy,
		sortOrder,
		sortLabel,
		toggleColumnSort,
		getColumnSortOrder,
		yearOptions,
		monthOptions,
		quarterOptions,
		semesterOptions,
		dateFilterLabels,
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
		showingLabel,
		hasActiveFilters,
		debouncedSearch,
		refresh,
		handleExport,
		openDetail,
		handleDetailOpenChange,
		resetFilters,
	};
}
