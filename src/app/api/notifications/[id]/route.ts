import { NextRequest, NextResponse } from "next/server";
import { requireApiGuard } from "@/lib/api-guard";
import { markNotificationAsRead } from "@api/modules/notifications";

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const guard = await requireApiGuard({ request: req });
		if (!guard.ok) {
			return guard.response;
		}

		const userId = guard.session.user?.id;
		if (!userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id: notificationId } = await params;

		const result = await markNotificationAsRead(
			notificationId,
			userId
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
