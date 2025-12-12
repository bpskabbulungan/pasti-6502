import { NextResponse } from "next/server";
import { getStaticUuid } from "@api/modules/qr";

export async function GET() {
	try {
		const result = await getStaticUuid();
		return NextResponse.json(result);
	} catch (error) {
		console.error("Failed to resolve static UUID", error);
		return NextResponse.json(
			{ error: "Tidak dapat menyiapkan static UUID" },
			{ status: 500 }
		);
	}
}
