import QRCode from "qrcode";
import { getStaticUuid } from "@/api/modules/qr/qr.service";

const QR_COLOR = { dark: "#13254e", light: "#FFFFFF" };
const QR_SIZE = 300;
const QR_MARGIN = 1;

export async function GET(request: Request) {
	try {
		const { searchParams, origin } = new URL(request.url);
		let staticUuid = searchParams.get("uuid");

		if (!staticUuid) {
			const resolved = await getStaticUuid();
			if (!resolved.ok) {
				return Response.json(
					{ error: "Static UUID belum dikonfigurasi." },
					{ status: 500 }
				);
			}
			staticUuid = resolved.staticUuid;
		}

		const baseUrl = process.env.NEXT_PUBLIC_QR_BASE_URL || origin;
		if (!baseUrl) {
			return Response.json(
				{
					error:
						"Base URL QR tidak ditemukan. Tambahkan NEXT_PUBLIC_QR_BASE_URL.",
				},
				{ status: 400 }
			);
		}

		const normalizedBase = baseUrl.endsWith("/")
			? baseUrl.slice(0, -1)
			: baseUrl;
		const targetUrl = `${normalizedBase}/visitor-form/${staticUuid}`;

		const buffer = await QRCode.toBuffer(targetUrl, {
			color: QR_COLOR,
			width: QR_SIZE,
			margin: QR_MARGIN,
		});

		return new Response(buffer, {
			headers: {
				"Content-Type": "image/png",
				"Cache-Control": "public, max-age=3600",
			},
		});
	} catch (error) {
		console.error("Failed to generate QR code image", error);
		return Response.json(
			{ error: "Gagal membuat QR code." },
			{ status: 500 }
		);
	}
}
