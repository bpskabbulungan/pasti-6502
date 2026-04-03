import test from "node:test";
import assert from "node:assert/strict";
import type { NextRequest } from "next/server";
import { rateLimit } from "../api/infrastructure/cache/rate-limit";

const createRequest = (ip = "127.0.0.1") =>
	({
		headers: new Headers({
			"x-forwarded-for": ip,
		}),
	} as NextRequest);

const withEnv = async (
	overrides: Record<string, string | undefined>,
	run: () => Promise<void>
) => {
	const previous = new Map<string, string | undefined>();
	for (const [key, value] of Object.entries(overrides)) {
		previous.set(key, process.env[key]);
		if (typeof value === "undefined") {
			delete process.env[key];
		} else {
			process.env[key] = value;
		}
	}

	try {
		await run();
	} finally {
		for (const [key, value] of previous.entries()) {
			if (typeof value === "undefined") {
				delete process.env[key];
			} else {
				process.env[key] = value;
			}
		}
	}
};

test("rate limiter requires Redis in production", async () => {
	await withEnv(
		{
			NODE_ENV: "production",
			REDIS_URL: undefined,
		},
		async () => {
			const originalConsoleError = console.error;
			console.error = () => undefined;
			try {
				await assert.rejects(
					() =>
						rateLimit(createRequest("10.10.10.10"), "sprint3-production-rate-limit", {
							limit: 1,
							windowMs: 1_000,
						}),
					/Redis/i
				);
			} finally {
				console.error = originalConsoleError;
			}
		}
	);
});

test("rate limiter falls back to in-memory outside production", async () => {
	await withEnv(
		{
			NODE_ENV: "test",
			REDIS_URL: undefined,
		},
		async () => {
			const request = createRequest("10.10.10.11");
			const first = await rateLimit(request, "sprint3-memory-rate-limit", {
				limit: 1,
				windowMs: 1_000,
			});
			const second = await rateLimit(request, "sprint3-memory-rate-limit", {
				limit: 1,
				windowMs: 1_000,
			});

			assert.equal(first.allowed, true);
			assert.equal(second.allowed, false);
		}
	);
});
