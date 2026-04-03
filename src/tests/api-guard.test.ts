import test from "node:test";
import assert from "node:assert/strict";
import { NextResponse } from "next/server";
import { attachTraceId, getTraceIdFromRequest } from "../lib/api-guard";

test("getTraceIdFromRequest uses x-request-id header when present", () => {
	const request = new Request("http://localhost/api/test", {
		headers: {
			"x-request-id": "trace-123",
		},
	});
	assert.equal(getTraceIdFromRequest(request), "trace-123");
});

test("attachTraceId writes header to response", () => {
	const response = NextResponse.json({ ok: true });
	const traced = attachTraceId(response, "trace-456");
	assert.equal(traced.headers.get("x-request-id"), "trace-456");
});
