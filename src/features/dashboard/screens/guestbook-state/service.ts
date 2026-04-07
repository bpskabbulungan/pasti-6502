import type {
	DateFilter,
	PurposeFilter,
	SortByFilter,
	SortOrderFilter,
	StatusFilter,
} from "./schema";
import { getFilenameFromContentDisposition } from "./helper";

type ExportParams = {
	statusFilter: StatusFilter;
	purposeFilter: PurposeFilter;
	dateFilter: DateFilter;
	year?: number;
	month?: number;
	quarter?: number;
	semester?: number;
	sortBy: SortByFilter;
	sortOrder: SortOrderFilter;
	search?: string;
	format: "xlsx" | "pdf";
};

export async function exportGuestbookData(params: ExportParams) {
	const query = new URLSearchParams();
	if (params.statusFilter !== "ALL") {
		query.set("status", params.statusFilter);
	}
	if (params.purposeFilter !== "ALL") {
		query.set("purpose", params.purposeFilter);
	}
	if (params.search) {
		query.set("search", params.search);
	}
	if (typeof params.year === "number") {
		query.set("year", String(params.year));
	}
	if (typeof params.month === "number") {
		query.set("month", String(params.month));
	}
	if (typeof params.quarter === "number") {
		query.set("quarter", String(params.quarter));
	}
	if (typeof params.semester === "number") {
		query.set("semester", String(params.semester));
	}
	query.set("sortBy", params.sortBy);
	query.set("sortOrder", params.sortOrder);
	query.set("dateFilter", params.dateFilter);
	query.set("format", params.format);

	const response = await fetch(`/api/guestbook/export?${query.toString()}`);
	if (!response.ok) {
		const data = (await response.json().catch(() => null)) as { error?: string } | null;
		throw new Error(data?.error || "Gagal mengunduh data buku tamu");
	}

	const blob = await response.blob();
	const objectUrl = URL.createObjectURL(blob);
	const link = document.createElement("a");
	const serverFileName = getFilenameFromContentDisposition(response.headers.get("content-disposition"));
	link.href = objectUrl;
	link.download = serverFileName ?? `buku-tamu-pst.${params.format}`;
	document.body.appendChild(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(objectUrl);
}
