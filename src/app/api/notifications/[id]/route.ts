import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { markNotificationAsRead } from "@api/modules/notifications";

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || !session.user || !session.user.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id: notificationId } = await params;

		const result = await markNotificationAsRead(
			notificationId,
			session.user.id
		);

		if (!result.success) {
			return NextResponse.json(
				{ error: result.error },
				{ status: result.status }
			);
		}

		return NextResponse.json({
			success: true,
			message: result.message,
			notification: result.notification,
		});
	} catch (error: unknown) {
		console.error("Error marking notification as read:", error);
		let errorMessage = "Failed to process request to mark notification as read";
		if (error instanceof Error) {
			errorMessage = error.message;
		}
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
