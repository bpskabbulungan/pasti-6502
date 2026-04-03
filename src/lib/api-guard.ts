import { randomUUID } from "node:crypto";
import { Role } from "@prisma/client";
import type { Session } from "next-auth";
import { NextResponse } from "next/server";
import { logger } from "@/api/core/logger";
import { requireRoleSession, requireSession } from "@/lib/api-session";

type GuardBody = Record<string, unknown>;

type ApiGuardOptions = {
	request?: Request;
	roles?: Role[];
	unauthorizedBody?: GuardBody;
	forbiddenBody?: GuardBody;
};

type ApiGuardSuccess = {
	ok: true;
	session: Session;
	traceId: string;
};

type ApiGuardFailure = {
	ok: false;
	response: NextResponse;
	traceId: string;
};

const defaultUnauthorizedBody: GuardBody = { error: "Unauthorized" };
const defaultForbiddenBody: GuardBody = { error: "Forbidden" };

export const getTraceIdFromRequest = (request?: Request) =>
	request?.headers.get("x-request-id")?.trim() || randomUUID();

export const attachTraceId = (response: NextResponse, traceId: string) => {
	response.headers.set("x-request-id", traceId);
	return response;
};

export async function requireApiGuard(options: ApiGuardOptions = {}): Promise<ApiGuardSuccess | ApiGuardFailure> {
	const traceId = getTraceIdFromRequest(options.request);
	const authResult = options.roles?.length
		? await requireRoleSession(options.roles)
		: await requireSession();

	if (authResult.ok) {
		return { ok: true, session: authResult.session, traceId };
	}

	const payload =
		authResult.status === 401
			? options.unauthorizedBody ?? defaultUnauthorizedBody
			: options.forbiddenBody ?? defaultForbiddenBody;

	const response = attachTraceId(NextResponse.json(payload, { status: authResult.status }), traceId);

	let path: string | null = null;
	if (options.request) {
		try {
			path = new URL(options.request.url).pathname;
		} catch {
			path = null;
		}
	}

	logger.warn("API authorization rejected", {
		traceId,
		status: authResult.status,
		path,
		requiredRoles: options.roles ?? [],
	});

	return { ok: false, response, traceId };
}
