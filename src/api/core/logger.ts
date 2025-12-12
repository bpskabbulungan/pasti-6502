/* Lightweight logger wrapper. Swap with pino/winston as needed. */
export const logger = {
	info: (...args: unknown[]) => console.log("[INFO]", ...args),
	error: (...args: unknown[]) => console.error("[ERROR]", ...args),
	warn: (...args: unknown[]) => console.warn("[WARN]", ...args),
	debug: (...args: unknown[]) => {
		if (process.env.NODE_ENV !== "production") {
			console.debug("[DEBUG]", ...args);
		}
	},
};
