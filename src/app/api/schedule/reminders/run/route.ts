import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireApiGuard } from "@/lib/api-guard";
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
		const cronAuthorized = isCronRequestAuthorized(req);
		const guard = await requireApiGuard({ request: req, roles: [Role.ADMIN] });
		if (!guard.ok) {
			if (guard.response.status === 403) {
				return guard.response;
			}
			if (!cronAuthorized) {
				return guard.response;
			}
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
