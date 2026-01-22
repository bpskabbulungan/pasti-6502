import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { triggerSkdReminderBot } from "@api/modules/queues";
import type { ReminderResponse } from "@shared/types/reminder";

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
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
