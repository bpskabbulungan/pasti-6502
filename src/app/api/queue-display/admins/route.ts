import { NextResponse } from "next/server";
import { requireApiGuard } from "@/lib/api-guard";
import { listQueueDisplayAdmins } from "@api/modules/users";

export async function GET(req: Request) {
  try {
    const guard = await requireApiGuard({ request: req });
    if (!guard.ok) {
      return guard.response;
    }

    const result = await listQueueDisplayAdmins();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching admins:", error);
    return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 });
  }
}
