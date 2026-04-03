import { Role, ServiceStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireApiGuard } from "@/lib/api-guard";
import { createService, listServices } from "@api/modules/services";

export async function GET(req: NextRequest) {
	try {
		const guard = await requireApiGuard({ request: req });
		if (!guard.ok) {
			return guard.response;
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
		const guard = await requireApiGuard({
			request: req,
			roles: [Role.ADMIN],
		});
		if (!guard.ok) {
			return guard.response;
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
