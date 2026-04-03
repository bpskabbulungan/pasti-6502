import test from "node:test";
import assert from "node:assert/strict";
import { isDetailedHealthAuthorized } from "../api/modules/health/health-access";

test("health detail access denied when secret is missing", () => {
	assert.equal(isDetailedHealthAuthorized(undefined, "abc"), false);
});

test("health detail access denied when request secret is invalid", () => {
	assert.equal(isDetailedHealthAuthorized("abc", "wrong"), false);
});

test("health detail access allowed when secrets match", () => {
	assert.equal(isDetailedHealthAuthorized("abc", "abc"), true);
});
