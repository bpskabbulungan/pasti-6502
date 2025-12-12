import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendWhatsAppBotReminder } from "@api/modules/reminders";
import type { ReminderResponse } from "@shared/types/reminder";

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
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
