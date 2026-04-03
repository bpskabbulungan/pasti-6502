import { NextRequest, NextResponse } from "next/server";
import { requireApiGuard } from "@/lib/api-guard";
import { triggerSkdReminderBot } from "@api/modules/queues";
import type { ReminderResponse } from "@shared/types/reminder";

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const guard = await requireApiGuard({
			request: req,
			unauthorizedBody: { success: false, message: "Unauthorized" },
			forbiddenBody: { success: false, message: "Forbidden" },
		});
		if (!guard.ok) {
			return guard.response;
		}

		const { id } = await params;
		const { message } = await req.json();

		const result = await triggerSkdReminderBot(id, message);

		if (!result.ok) {
			return NextResponse.json(
				{ success: false, message: result.error },
				{ status: result.status }
			);
		}

		return NextResponse.json<ReminderResponse>({
			success: true,
			message: "WhatsApp Bot reminder sent",
			data: result.data,
		});
	} catch (error) {
		console.error("Error sending SKD reminder via bot:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to send SKD reminder" },
			{ status: 500 }
		);
	}
}
