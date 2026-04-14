const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const serializeErrorForLog = (error: unknown) => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    };
  }

  if (typeof error === "string") {
    return { message: error };
  }

  if (isRecord(error)) {
    return {
      status: typeof error.status === "number" ? error.status : undefined,
      message: typeof error.message === "string" ? error.message : undefined,
      details: "details" in error ? error.details : undefined,
      raw: error,
    };
  }

  return { raw: error };
};