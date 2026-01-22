import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateDailySchedule } from "@api/modules/schedule";

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json().catch(() => ({}));
		const date = typeof body?.date === "string" ? body.date : null;

		const result = await generateDailySchedule(date);

		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status });
		}

		return NextResponse.json({
			schedule: result.schedule,
			alreadyExists: result.alreadyExists,
		});
	} catch (error) {
		console.error("Error generating schedule:", error);
		return NextResponse.json(
			{ error: "Failed to generate schedule" },
			{ status: 500 }
		);
	}
}
