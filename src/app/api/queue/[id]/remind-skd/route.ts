import { NextRequest, NextResponse } from "next/server";
import { requireApiGuard } from "@/lib/api-guard";
import { prepareSkdReminder } from "@api/modules/queues/queue.actions";
import type { ReminderResponse } from "@shared/types/reminder";

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const guard = await requireApiGuard({ request: req });
		if (!guard.ok) {
			return guard.response;
		}

		const { id } = await params;
		const payload = (await req.json().catch(() => ({}))) as { message?: unknown };
		const message = typeof payload.message === "string" ? payload.message : undefined;

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
