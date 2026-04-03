import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireApiGuard } from "@/lib/api-guard";
import {
	deleteService,
	getService,
	updateService,
} from "@api/modules/services";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const guard = await requireApiGuard({ request: req });
		if (!guard.ok) {
			return guard.response;
		}

		const { id } = await params;
		if (!id) {
			return NextResponse.json(
				{ error: "Service ID is required" },
				{ status: 400 }
			);
		}

		const result = await getService(id);
		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status });
		}

		return NextResponse.json({ service: result.service });
	} catch (error) {
		console.error("Error fetching service:", error);
		return NextResponse.json(
			{ error: "Failed to fetch service" },
			{ status: 500 }
		);
	}
}

export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const guard = await requireApiGuard({ request: req, roles: [Role.ADMIN] });
		if (!guard.ok) {
			return guard.response;
		}

		const { id } = await params;
		if (!id) {
			return NextResponse.json(
				{ error: "Service ID is required" },
				{ status: 400 }
			);
		}

		const body = await req.json();
		const { name, status } = body;

		const statusValue =
			status === undefined
				? undefined
				: status === true || status === "ACTIVE"
					? "ACTIVE"
					: "INACTIVE";

		const result = await updateService(id, { name, status: statusValue });

		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status });
		}

		return NextResponse.json({ service: result.service });
	} catch (error) {
		console.error("Error updating service:", error);
		return NextResponse.json(
			{ error: "Failed to update service" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const guard = await requireApiGuard({ request: req, roles: [Role.ADMIN] });
		if (!guard.ok) {
			return guard.response;
		}

		const { id } = await params;
		if (!id) {
			return NextResponse.json(
				{ error: "Service ID is required" },
				{ status: 400 }
			);
		}

		const result = await deleteService(id);
		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: result.status });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting service:", error);
		return NextResponse.json(
			{ error: "Failed to delete service" },
			{ status: 500 }
		);
	}
}
