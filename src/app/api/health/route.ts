import { NextResponse } from "next/server";
import { getHealthStatus } from "@api/modules/health";
import type { HealthStatusResponse } from "@shared/types/health";

export async function GET() {
	const payload = await getHealthStatus();
	return NextResponse.json<HealthStatusResponse>(payload, { status: 200 });
}
