import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
	// Extract path from the URL
	const path = request.nextUrl.pathname;

	// Define regex to match visitor form routes
	const visitorFormRegex = /^\/visitor-form\/([^\/]+)$/;

	// Check if the path matches the visitor form pattern and isn't already a preload path
	const match = path.match(visitorFormRegex);
	if (match && !path.includes("/preload")) {
		const uuid = match[1];

		// Only redirect if this is an initial page load (not an API call or asset)
		if (request.headers.get("accept")?.includes("text/html")) {
			// Check if the URL has a _rsc parameter (React Server Component request)
			// Don't redirect those as they're internal Next.js requests
			const url = new URL(request.url);
			if (!url.searchParams.has("_rsc")) {
				return NextResponse.redirect(
					new URL(`/visitor-form/preload?uuid=${uuid}`, request.url)
				);
			}
		}
	}

	return NextResponse.next();
}

// This regex makes the middleware run only on visitor form pages
export const config = {
	matcher: ["/visitor-form/:path*"],
};
