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

export async function apiFetch<TResponse, TBody = unknown>(
	url: string,
	options: RequestOptions<TBody> = {}
): Promise<TResponse> {
	const { method = "GET", body, headers, cache, next } = options;

	const response = await fetch(url, {
		method,
		headers: { ...defaultHeaders, ...headers },
		body: body ? JSON.stringify(body) : undefined,
		cache,
		next,
	});

	if (!response.ok) {
		let details: unknown;
		try {
			details = await response.json();
		} catch {
			// ignore parse errors
		}

		const error: ApiError = {
			status: response.status,
			message: response.statusText || "Request failed",
			details,
		};
		throw error;
	}

	// Some endpoints may return no content
	if (response.status === 204) {
		return undefined as TResponse;
	}

	return (await response.json()) as TResponse;
}
