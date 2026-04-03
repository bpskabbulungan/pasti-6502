import { NextRequest, NextResponse } from "next/server";
import { getHealthStatus } from "@api/modules/health";
import { isDetailedHealthAuthorized } from "@api/modules/health/health-access";
import type { HealthStatusResponse } from "@shared/types/health";

type PublicHealthResponse = Pick<HealthStatusResponse, "status" | "message" | "timestamp">;

export async function GET(req: NextRequest) {
	const publicPayload: PublicHealthResponse = {
		status: "ok",
		message: "OK",
		timestamp: new Date().toISOString(),
	};

	const wantsDetailed =
		req.nextUrl.searchParams.get("detail") === "1" || req.headers.get("x-health-detail") === "1";
	if (!wantsDetailed) {
		return NextResponse.json(publicPayload, { status: 200 });
	}

	const detailSecret = process.env.HEALTH_DETAIL_SECRET?.trim();
	const requestSecret = req.headers.get("x-health-secret")?.trim();
	if (!isDetailedHealthAuthorized(detailSecret, requestSecret)) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const payload = await getHealthStatus();
	return NextResponse.json<HealthStatusResponse>(payload, { status: 200 });
}
