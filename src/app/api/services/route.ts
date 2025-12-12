import { ServiceStatus } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createService, listServices } from "@api/modules/services";

export async function GET(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(req.url);
		const statusFilter = searchParams.get("status") as ServiceStatus | null;

		const result = await listServices(statusFilter);

		return NextResponse.json(result);
	} catch (error) {
		console.error("Error fetching services:", error);
		return NextResponse.json(
			{ error: "Failed to fetch services" },
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await req.json();
		const { name } = body;

		const result = await createService({ name });

		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status });
		}

		return NextResponse.json({ service: result.service }, { status: 201 });
	} catch (error) {
		console.error("Error creating service:", error);
		return NextResponse.json(
			{ error: "Failed to create service" },
			{ status: 500 }
		);
	}
}
