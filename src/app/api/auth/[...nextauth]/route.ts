import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

type AuthRouteContext = {
  params: Promise<{
    nextauth?: string[];
  }>;
};

const jsonAuthActions = new Set(["session", "csrf", "providers"]);
const nextAuthHandler = NextAuth(authOptions);

const getAuthAction = async (context: AuthRouteContext) => {
  try {
    const params = await context.params;
    return params.nextauth?.[0] ?? null;
  } catch {
    return null;
  }
};

async function handler(request: Request, context: AuthRouteContext) {
  try {
    return await nextAuthHandler(request, context);
  } catch (error) {
    console.error("Unhandled auth route error:", error);

    const action = await getAuthAction(context);
    if (action && jsonAuthActions.has(action)) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    return new Response("Internal Server Error", { status: 500 });
  }
}

export { handler as GET, handler as POST };
