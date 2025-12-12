import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
	const path = request.nextUrl.pathname;

	// Define public paths that don't require authentication
	// TODO: If /queue-display should be restricted (e.g., auth/IP allowlist), update public paths and add protections.
	const publicPaths = ["/", "/login", "/visitor-form", "/guest", "/queue-display"];
	const isPublicPath = publicPaths.some(
		(publicPath) => path === publicPath || path.startsWith(`${publicPath}/`)
	);

	// Check for visitor form preload redirection
	const visitorFormRegex = /^\/visitor-form\/([^\/]+)$/;
	const match = path.match(visitorFormRegex);
	if (match && !path.includes("/preload")) {
		const uuid = match[1];

		// Don't redirect if this is an API call, asset, or internal Next.js route
		if (
			request.headers.get("accept")?.includes("text/html") &&
			!request.headers.get("x-next-data") &&
			!request.nextUrl.searchParams.has("_rsc") &&
			!request.nextUrl.searchParams.has("_next")
		) {
			return NextResponse.redirect(
				new URL(`/visitor-form/preload?uuid=${uuid}`, request.url)
			);
		}
	}

	// Get session token
	const token = await getToken({
		req: request,
		secret: process.env.NEXTAUTH_SECRET,
	});

	// Redirect logic
	if (!token && !isPublicPath) {
		// If not logged in and trying to access a protected route, redirect to login
		return NextResponse.redirect(new URL("/", request.url));
	}

	if (token && path === "/") {
		// If logged in and trying to access login page, redirect to dashboard
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	return NextResponse.next();
}

// Only run middleware on specific paths
export const config = {
	matcher: [
		/*
		 * Match all paths except:
		 * 1. /api routes
		 * 2. /_next (Next.js system files)
		 * 3. /qrcodes (Static files)
		 * 4.  /sitemap.xml, /robots.txt (static files)
		 */
		"/((?!api|_next|qrcodes|sitemap.xml|robots.txt).*)",
	],
};
