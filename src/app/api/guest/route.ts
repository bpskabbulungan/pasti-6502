import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { listActiveGuestServices, processGuestSubmission } from "@api/modules/guest";
import type { GuestServicesResponse, GuestSubmissionResponse } from "@shared/types/guest";

export async function GET(req: NextRequest) {
  try {
    const limiter = await rateLimit(req, "guest-services-get", {
      limit: 20,
      windowMs: 60_000,
    });
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan, coba lagi nanti." },
        { status: 429 }
      );
    }

    const result = await listActiveGuestServices();
    return NextResponse.json<GuestServicesResponse>({
      services: result.services,
    });
  } catch (error) {
    console.error("Error fetching guest services:", error);
    return NextResponse.json({ error: "Gagal mengambil data layanan aktif." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
	try {
		const limiter = await rateLimit(req, "guest-post", {
			limit: 5,
			windowMs: 60_000,
		});
		if (!limiter.allowed) {
			return NextResponse.json(
				{ error: "Terlalu banyak permintaan, coba lagi nanti." },
				{ status: 429 }
			);
		}

		const body = await req.json();
		const result = await processGuestSubmission(body);

		if (!result.ok) {
			return NextResponse.json(
				{ error: result.error, details: result.details },
				{ status: result.status }
			);
		}

		return NextResponse.json<GuestSubmissionResponse>({
			success: true,
			message: "Data buku tamu berhasil disimpan",
			data: result.data,
		});
	} catch (error) {
		if ((error as { code?: string }).code === "P2002") {
			return NextResponse.json(
				{ error: "Nomor antrean duplikat, silakan coba lagi." },
				{ status: 409 }
			);
		}

		console.error("Error processing guest submission:", error);
		return NextResponse.json(
			{ error: "Gagal memproses buku tamu" },
			{ status: 500 }
		);
	}
}
