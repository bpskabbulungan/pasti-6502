import test from "node:test";
import assert from "node:assert/strict";
import { Role } from "@prisma/client";
import type { Session } from "next-auth";
import { evaluateAdminSession, evaluateRoleSession, evaluateSession } from "../lib/api-session";

const makeSession = (role: Role): Session =>
	({
		user: {
			id: "user-1",
			name: "Tester",
			username: "tester",
			role,
		},
		expires: new Date(Date.now() + 60_000).toISOString(),
	} as Session);

test("RBAC returns 401 for unauthenticated session", () => {
	const result = evaluateAdminSession(null);
	assert.deepEqual(result, { ok: false, status: 401, error: "Unauthorized" });
});

test("session guard returns 401 for unauthenticated session", () => {
	const result = evaluateSession(null);
	assert.deepEqual(result, { ok: false, status: 401, error: "Unauthorized" });
});

test("RBAC returns 403 for non-admin session", () => {
	const result = evaluateAdminSession(makeSession(Role.PETUGAS));
	assert.deepEqual(result, { ok: false, status: 403, error: "Forbidden" });
});

test("role guard allows configured roles", () => {
	const session = makeSession(Role.PETUGAS);
	const result = evaluateRoleSession(session, [Role.ADMIN, Role.PETUGAS]);
	assert.deepEqual(result, { ok: true, session });
});

test("RBAC allows admin session", () => {
	const session = makeSession(Role.ADMIN);
	const result = evaluateAdminSession(session);
	assert.deepEqual(result, { ok: true, session });
});
