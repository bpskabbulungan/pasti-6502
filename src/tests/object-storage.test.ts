import test from "node:test";
import assert from "node:assert/strict";
import { buildAnalyticsExportStorageKey } from "../api/infrastructure/storage/object-storage";

test("analytics export storage key uses expected extension", () => {
	const pdfKey = buildAnalyticsExportStorageKey("job-1", "pdf");
	const xlsxKey = buildAnalyticsExportStorageKey("job-1", "xlsx");

	assert.equal(pdfKey.endsWith(".pdf"), true);
	assert.equal(xlsxKey.endsWith(".xlsx"), true);
	assert.equal(pdfKey.startsWith("analytics/"), true);
	assert.equal(xlsxKey.startsWith("analytics/"), true);
});
