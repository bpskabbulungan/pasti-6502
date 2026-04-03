import { NextResponse } from "next/server";
import { requireApiGuard } from "@/lib/api-guard";
import {
	getUnreadNotificationsWithHashCheck,
	markAllNotificationsAsRead,
} from "@api/modules/notifications";
import type { NotificationListResponse } from "@shared/types/notification";

export async function GET(request: Request) {
	try {
		const guard = await requireApiGuard({ request });
		if (!guard.ok) {
			return guard.response;
		}

		const url = new URL(request.url);
		const clientHash = url.searchParams.get("hash");

		const result = await getUnreadNotificationsWithHashCheck(
			guard.session.user.id,
			clientHash
		);

		return NextResponse.json<NotificationListResponse>(result);
	} catch (error) {
		console.error("Error fetching notifications:", error);
		return NextResponse.json(
			{ error: "Failed to fetch notifications" },
			{ status: 500 }
		);
	}
}

export async function POST() {
	try {
		const guard = await requireApiGuard();
		if (!guard.ok) {
			return guard.response;
		}

		const result = await markAllNotificationsAsRead(guard.session.user.id);

		return NextResponse.json<NotificationListResponse>(result);
	} catch (error) {
		console.error("Error marking notifications as read:", error);
		return NextResponse.json(
			{ error: "Failed to mark notifications as read" },
			{ status: 500 }
		);
	}
}
