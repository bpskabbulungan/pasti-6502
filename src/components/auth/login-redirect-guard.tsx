"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { markNavigationPending } from "@/lib/navigation-pending";

export default function LoginRedirectGuard() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      markNavigationPending();
      router.replace("/dashboard");
    }
  }, [router, status]);

  return null;
}
