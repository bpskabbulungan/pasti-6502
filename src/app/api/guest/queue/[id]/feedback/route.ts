import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { submitGuestQueueFeedback } from "@api/modules/guest";

const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000, "Uraian maksimal 1000 karakter").optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const limiter = await rateLimit(req, "guest-feedback", {
      limit: 10,
      windowMs: 60_000,
    });
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan, coba lagi nanti." },
        { status: 429 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Queue ID is required" }, { status: 400 });
    }

    const parsed = feedbackSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await submitGuestQueueFeedback(id, parsed.data);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      success: true,
      message: "Feedback berhasil disimpan",
      data: result.data,
    });
  } catch (error) {
    console.error("Error submitting guest queue feedback:", error);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}
