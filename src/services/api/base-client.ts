type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions<TBody> = {
	method?: HttpMethod;
	body?: TBody;
	headers?: Record<string, string>;
	cache?: RequestCache;
	next?: RequestInit["next"];
};

type ApiError = {
	status: number;
	message: string;
	details?: unknown;
};

const defaultHeaders = {
	"Content-Type": "application/json",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

const getErrorMessageFromDetails = (details: unknown) => {
	if (!isRecord(details)) {
		return null;
	}

	if (typeof details.error === "string" && details.error.trim()) {
		return details.error;
	}

	if (typeof details.message === "string" && details.message.trim()) {
		return details.message;
	}

	return null;
};

async function readResponseDetails(response: Response): Promise<unknown> {
	const contentType = response.headers.get("content-type") || "";

	if (contentType.includes("application/json")) {
		try {
			return await response.json();
		} catch {
			// fall through and try text
		}
	}

	try {
		const text = (await response.text()).trim();
		return text ? { error: text } : undefined;
	} catch {
		return undefined;
	}
}

const buildApiError = (
	response: Response,
	details: unknown,
	fallbackMessage?: string
): ApiError => ({
	status: response.status,
	message:
		getErrorMessageFromDetails(details) ||
		response.statusText ||
		fallbackMessage ||
		"Request failed",
	details,
});

export async function apiFetch<TResponse, TBody = unknown>(
	url: string,
	options: RequestOptions<TBody> = {}
): Promise<TResponse> {
	const { method = "GET", body, headers, cache, next } = options;
	let response: Response;
	try {
		response = await fetch(url, {
			method,
			headers: { ...defaultHeaders, ...headers },
			body: body ? JSON.stringify(body) : undefined,
			cache,
			next,
		});
	} catch (error) {
		throw {
			status: 0,
			message: "Network request failed",
			details: {
				url,
				method,
				cause: error,
			},
		} satisfies ApiError;
	}

	if (!response.ok) {
		const details = await readResponseDetails(response);
		throw buildApiError(response, details);
	}

	// Some endpoints may return no content
	if (response.status === 204) {
		return undefined as TResponse;
	}

	const contentType = response.headers.get("content-type") || "";

	if (contentType.includes("application/json")) {
		const fallbackResponse = response.clone();
		try {
			return (await response.json()) as TResponse;
		} catch {
			const details = await readResponseDetails(fallbackResponse);
			throw buildApiError(response, details, "Invalid JSON response");
		}
	}

	const details = await readResponseDetails(response);
	throw buildApiError(response, details, "Expected JSON response");
}
