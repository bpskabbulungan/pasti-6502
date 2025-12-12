import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
	getUnreadNotificationsWithHashCheck,
	markAllNotificationsAsRead,
} from "@api/modules/notifications";
import type { NotificationListResponse } from "@shared/types/notification";

export async function GET(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const url = new URL(request.url);
		const clientHash = url.searchParams.get("hash");

		const result = await getUnreadNotificationsWithHashCheck(
			session.user.id,
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
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const result = await markAllNotificationsAsRead(session.user.id);

		return NextResponse.json<NotificationListResponse>(result);
	} catch (error) {
		console.error("Error marking notifications as read:", error);
		return NextResponse.json(
			{ error: "Failed to mark notifications as read" },
			{ status: 500 }
		);
	}
}
