import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { runDutyReminder } from "@api/modules/schedule";

const isCronRequestAuthorized = (req: NextRequest) => {
	const expectedSecret = process.env.SCHEDULE_CRON_SECRET;
	if (!expectedSecret) {
		return false;
	}
	const incomingSecret = req.headers.get("x-cron-secret");
	return incomingSecret === expectedSecret;
};

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		const cronAuthorized = isCronRequestAuthorized(req);

		if (!session && !cronAuthorized) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		if (session && session.user.role !== Role.ADMIN) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const body = await req.json().catch(() => ({}));
		const date = typeof body?.date === "string" ? body.date : null;
		const force = body?.force === true;

		const result = await runDutyReminder(date, force);

		if (!result.ok) {
			const payload: { error: string; log?: unknown } = {
				error: result.error,
			};
			if ("log" in result) {
				payload.log = result.log;
			}
			return NextResponse.json(payload, { status: result.status });
		}

		return NextResponse.json(result);
	} catch (error) {
		console.error("Error running duty reminder:", error);
		return NextResponse.json(
			{ error: "Failed to run duty reminder" },
			{ status: 500 }
		);
	}
}
