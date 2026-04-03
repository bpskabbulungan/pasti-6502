import { Role } from "@prisma/client";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type SessionAuthFailure = {
	ok: false;
	status: 401 | 403;
	error: "Unauthorized" | "Forbidden";
};

type SessionAuthSuccess = {
	ok: true;
	session: Session;
};

export type RequireSessionResult = SessionAuthSuccess | SessionAuthFailure;

export type RequireAdminSessionResult =
	| {
			ok: true;
			session: Session;
	  }
	| {
			ok: false;
			status: 401 | 403;
			error: "Unauthorized" | "Forbidden";
	  };

export function evaluateSession(session: Session | null): RequireSessionResult {
	if (!session) {
		return { ok: false, status: 401, error: "Unauthorized" };
	}

	return { ok: true, session };
}

export function evaluateRoleSession(
	session: Session | null,
	allowedRoles: Role[]
): RequireSessionResult {
	const evaluatedSession = evaluateSession(session);
	if (!evaluatedSession.ok) {
		return evaluatedSession;
	}

	if (!allowedRoles.includes(evaluatedSession.session.user.role)) {
		return { ok: false, status: 403, error: "Forbidden" };
	}

	return evaluatedSession;
}

export function evaluateAdminSession(session: Session | null): RequireAdminSessionResult {
	return evaluateRoleSession(session, [Role.ADMIN]);
}

export async function requireSession(): Promise<RequireSessionResult> {
	const session = await getServerSession(authOptions);
	return evaluateSession(session);
}

export async function requireRoleSession(allowedRoles: Role[]): Promise<RequireSessionResult> {
	const session = await getServerSession(authOptions);
	return evaluateRoleSession(session, allowedRoles);
}

export async function requireAdminSession(): Promise<RequireAdminSessionResult> {
	const session = await getServerSession(authOptions);
	return evaluateAdminSession(session);
}
