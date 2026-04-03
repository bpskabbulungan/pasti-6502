import { NextResponse } from "next/server";

const defaultSkdBaseUrl = "https://skd.bps.go.id/SKD2025/web/entri/responden/blok1";
const defaultSkdPublicLink = "https://s.bps.go.id/skd2025_bpsbusel";

const normalizeSkdUrl = (value: string) => {
	const trimmed = value.trim();
	return trimmed.startsWith("http://") || trimmed.startsWith("https://")
		? trimmed
		: `https://${trimmed}`;
};

const buildSkdUrl = () => {
	const configuredUrl = process.env.SKD_FORM_URL?.trim();
	if (configuredUrl) {
		try {
			return new URL(normalizeSkdUrl(configuredUrl)).toString();
		} catch {
			return null;
		}
	}

	const baseUrl = process.env.SKD_FORM_BASE_URL?.trim() || defaultSkdBaseUrl;
	const token = process.env.SKD_FORM_TOKEN?.trim();

	if (token) {
		try {
			const url = new URL(baseUrl);
			url.searchParams.set("token", token);
			return url.toString();
		} catch {
			return null;
		}
	}

	const publicLink =
		process.env.SKD_PUBLIC_LINK?.trim() ||
		process.env.NEXT_PUBLIC_SKD_LINK?.trim() ||
		defaultSkdPublicLink;

	try {
		return new URL(normalizeSkdUrl(publicLink)).toString();
	} catch {
		return null;
	}
};

export async function GET() {
	const skdUrl = buildSkdUrl();

	if (!skdUrl) {
		return NextResponse.json({ error: "SKD URL is not configured" }, { status: 500 });
	}

	return NextResponse.redirect(skdUrl, 307);
}
