import { NextResponse } from "next/server";
import { listQueueDisplayAdmins } from "@api/modules/users";

export async function GET() {
  try {
    const result = await listQueueDisplayAdmins();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching admins:", error);
    return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 });
  }
}
