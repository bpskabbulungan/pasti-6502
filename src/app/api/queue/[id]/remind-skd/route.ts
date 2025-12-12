import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prepareSkdReminder } from "@api/modules/queues";
import type { ReminderResponse } from "@shared/types/reminder";

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const { message } = await req.json();

		if (!id) {
			return NextResponse.json({ error: "Missing queue ID" }, { status: 400 });
		}

		const result = await prepareSkdReminder(id, message);

		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status });
		}

		return NextResponse.json<ReminderResponse>({
			success: true,
			message: "WhatsApp reminder prepared",
			data: result.data,
		});
	} catch (error) {
		console.error("Error preparing SKD reminder:", error);
		return NextResponse.json(
			{ error: "Failed to prepare SKD reminder" },
			{ status: 500 }
		);
	}
}
