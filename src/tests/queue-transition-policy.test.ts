import test from "node:test";
import assert from "node:assert/strict";
import { Role } from "@prisma/client";
import {
	QUEUE_TRANSITION_CONFLICT_ERROR,
	canUserManageServingQueue,
	getQueueTransitionConflictResult,
	isTransitionConflict,
} from "../api/modules/queues/queue.transition-policy";

test("queue transition marks zero updates as conflict", () => {
	assert.equal(isTransitionConflict(0), true);
	assert.equal(isTransitionConflict(1), false);
});

test("queue transition conflict payload is stable", () => {
	assert.deepEqual(getQueueTransitionConflictResult(), {
		ok: false,
		status: 409,
		error: QUEUE_TRANSITION_CONFLICT_ERROR,
	});
});

test("serving queue can be managed by admin or assigned officer", () => {
	assert.equal(canUserManageServingQueue(Role.ADMIN, "assigned-user", "another-user"), true);
	assert.equal(canUserManageServingQueue(Role.PETUGAS, "assigned-user", "assigned-user"), true);
	assert.equal(canUserManageServingQueue(Role.PETUGAS, "assigned-user", "other-user"), false);
});
