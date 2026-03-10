"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";

interface SessionUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
}

interface Session {
  user: SessionUser;
  accessToken: string;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("cinsights_session");
    if (stored) {
      try {
        setSession(JSON.parse(stored));
      } catch {
        localStorage.removeItem("cinsights_session");
      }
    }
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("cinsights_session");
    setSession(null);
    router.push(ROUTES.V2_LOGIN);
  }, [router]);

  return { session, user: session?.user ?? null, isLoading, logout };
}

export function getStoredSession(): Session | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("cinsights_session");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}
