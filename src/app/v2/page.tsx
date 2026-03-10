"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/v2/auth";
import { ROUTES } from "@/lib/constants";

export default function V2HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    router.replace(user ? ROUTES.V2_CHAT : ROUTES.V2_LOGIN);
  }, [user, isLoading, router]);

  return null;
}
