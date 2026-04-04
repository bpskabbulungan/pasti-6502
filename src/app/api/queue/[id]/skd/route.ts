import { NextRequest, NextResponse } from "next/server";
import { requireApiGuard } from "@/lib/api-guard";
import { z } from "zod";
import { updateSkdStatusByQueueId } from "@api/modules/queues/queue.actions";

export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const guard = await requireApiGuard({ request: req });
		if (!guard.ok) {
			return guard.response;
		}

		const { id } = await params;
		const schema = z.object({
			status: z.enum(["BELUM_MENGISI", "SUDAH_MENGISI"]),
		});

		const parsed = schema.safeParse(await req.json());
		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Data tidak valid", details: parsed.error.flatten().fieldErrors },
				{ status: 400 }
			);
		}

		const filled = parsed.data.status === "SUDAH_MENGISI";
		const result = await updateSkdStatusByQueueId(id, filled);

		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status });
		}

		return NextResponse.json({
			message: result.message,
			queue: result.queue,
		});
	} catch (error) {
		console.error("Error updating SKD status:", error);
		return NextResponse.json(
			{ error: "Failed to update SKD status" },
			{ status: 500 }
		);
	}
}
