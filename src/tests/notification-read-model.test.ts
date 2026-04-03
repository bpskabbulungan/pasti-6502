import test from "node:test";
import assert from "node:assert/strict";
import {
	buildUnreadNotificationsWhere,
	isNotificationReadForUser,
} from "../api/modules/notifications/notification.read-model";

test("notification dual-read treats legacy isRead=true as read", () => {
	const isRead = isNotificationReadForUser({ isRead: true, reads: [] }, "user-1");
	assert.equal(isRead, true);
});

test("notification dual-read treats per-user read record as read", () => {
	const isRead = isNotificationReadForUser(
		{
			isRead: false,
			reads: [{ userId: "user-1" }],
		},
		"user-1"
	);
	assert.equal(isRead, true);
});

test("notification dual-read returns unread when no legacy or per-user read exists", () => {
	const isRead = isNotificationReadForUser({ isRead: false, reads: [] }, "user-1");
	assert.equal(isRead, false);
});

test("unread notifications where-clause enforces per-user read exclusion + legacy fallback", () => {
	const where = buildUnreadNotificationsWhere("user-1");
	assert.deepEqual(where, {
		OR: [{ userId: null }, { userId: "user-1" }],
		isRead: false,
		reads: {
			none: { userId: "user-1" },
		},
	});
});
