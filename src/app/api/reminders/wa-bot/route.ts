import { NextRequest, NextResponse } from "next/server";
import { requireApiGuard } from "@/lib/api-guard";
import { sendWhatsAppBotReminder } from "@api/modules/reminders";
import type { ReminderResponse } from "@shared/types/reminder";

export async function POST(req: NextRequest) {
	try {
		const guard = await requireApiGuard({
			request: req,
			unauthorizedBody: { success: false, message: "Unauthorized" },
			forbiddenBody: { success: false, message: "Forbidden" },
		});
		if (!guard.ok) {
			return guard.response;
		}

		const { phoneNumber, message } = await req.json();

		if (!phoneNumber || typeof phoneNumber !== "string") {
			return NextResponse.json(
				{ success: false, message: "Nomor telepon tidak valid" },
				{ status: 400 }
			);
		}

		if (!message || typeof message !== "string") {
			return NextResponse.json(
				{ success: false, message: "Pesan tidak boleh kosong" },
				{ status: 400 }
			);
		}

		const result = await sendWhatsAppBotReminder(phoneNumber, message);

		return NextResponse.json<ReminderResponse>(result, {
			status: result.success ? 200 : 400,
		});
	} catch (error) {
		console.error("Error handling WA Bot reminder request:", error);
		return NextResponse.json(
			{
				success: false,
				message:
					"Terjadi kesalahan saat memproses permintaan WhatsApp Bot",
			},
			{ status: 500 }
		);
	}
}
