type LogLevel = "info" | "warn" | "error" | "debug";

const shouldLogDebug = () => process.env.NODE_ENV !== "production";

const normalizeArgs = (args: unknown[]) => {
	if (args.length === 0) {
		return { message: "", data: undefined as unknown };
	}

	const [first, ...rest] = args;
	const message = typeof first === "string" ? first : "log";

	if (rest.length === 0) {
		return {
			message,
			data: typeof first === "string" ? undefined : first,
		};
	}

	return {
		message,
		data: rest.length === 1 ? rest[0] : rest,
	};
};

const writeLog = (level: LogLevel, args: unknown[]) => {
	if (level === "debug" && !shouldLogDebug()) {
		return;
	}

	const { message, data } = normalizeArgs(args);
	const entry = {
		timestamp: new Date().toISOString(),
		level,
		message,
		...(typeof data === "undefined" ? {} : { data }),
	};

	const line = JSON.stringify(entry);
	if (level === "error") {
		console.error(line);
		return;
	}
	if (level === "warn") {
		console.warn(line);
		return;
	}
	if (level === "debug") {
		console.debug(line);
		return;
	}
	console.log(line);
};

export const logger = {
	info: (...args: unknown[]) => writeLog("info", args),
	error: (...args: unknown[]) => writeLog("error", args),
	warn: (...args: unknown[]) => writeLog("warn", args),
	debug: (...args: unknown[]) => writeLog("debug", args),
};
