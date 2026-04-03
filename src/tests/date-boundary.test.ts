import test from "node:test";
import assert from "node:assert/strict";
import {
	getDayRangeInTimeZone,
	parseDateOnlyInTimeZone,
	toIsoDateInTimeZone,
} from "../shared/utils/date-boundary";

test("parseDateOnlyInTimeZone parses YYYY-MM-DD reliably", () => {
	const parsed = parseDateOnlyInTimeZone("2026-04-03", "Asia/Makassar");
	assert.ok(parsed);
	assert.equal(toIsoDateInTimeZone(parsed!, "Asia/Makassar"), "2026-04-03");
});

test("getDayRangeInTimeZone returns stable day boundaries", () => {
	const { start, end } = getDayRangeInTimeZone("2026-04-03T12:34:56.000Z", "Asia/Makassar");
	assert.equal(end.getTime() - start.getTime(), 24 * 60 * 60 * 1000);
	assert.equal(toIsoDateInTimeZone(start, "Asia/Makassar"), "2026-04-03");
});
