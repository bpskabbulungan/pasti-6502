import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDashboardStats } from "@api/modules/dashboard";
import type { DashboardStatsResponse } from "@shared/types/dashboard";

export async function GET(request: Request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const url = new URL(request.url);
		const clientHash = url.searchParams.get("hash");

		const result = await getDashboardStats(clientHash);

		return NextResponse.json<DashboardStatsResponse>(result);
	} catch (error) {
		console.error("Error fetching dashboard stats:", error);
		return NextResponse.json(
			{ error: "Failed to fetch statistics" },
			{ status: 500 }
		);
	}
}
