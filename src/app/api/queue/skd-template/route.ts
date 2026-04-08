import { NextRequest, NextResponse } from "next/server";
import { requireApiGuard } from "@/lib/api-guard";
import { getSkdTemplate, updateSkdTemplate } from "@api/modules/queues/skd-template.service";

export async function GET(req: NextRequest) {
	try {
		const guard = await requireApiGuard({ request: req });
		
		// Type guard: check ok property to narrow union type
		if (guard.ok === false) {
			return guard.response;
		}

		// guard is now narrowed to ApiGuardSuccess
		const result = await getSkdTemplate();

		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: 500 });
		}

		return NextResponse.json({
			success: true,
			template: result.template,
		});
	} catch (error) {
		console.error("Error fetching SKD template:", error);
		return NextResponse.json(
			{ error: "Failed to fetch SKD template" },
			{ status: 500 }
		);
	}
}

export async function PUT(req: NextRequest) {
	try {
		const guard = await requireApiGuard({ request: req });
		
		// Type guard: check ok property to narrow union type
		if (guard.ok === false) {
			return guard.response;
		}

		// guard is now narrowed to ApiGuardSuccess
		const payload = (await req.json().catch(() => ({}))) as { template?: unknown };
		const template = typeof payload.template === "string" ? payload.template : "";

		if (!template.trim()) {
			return NextResponse.json(
				{ error: "Template cannot be empty" },
				{ status: 400 }
			);
		}

		const result = await updateSkdTemplate(template);

		if (!result.ok) {
			return NextResponse.json({ error: result.error }, { status: 500 });
		}

		return NextResponse.json({
			success: true,
			template: result.template,
		});
	} catch (error) {
		console.error("Error updating SKD template:", error);
		return NextResponse.json(
			{ error: "Failed to update SKD template" },
			{ status: 500 }
		);
	}
}
