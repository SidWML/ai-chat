"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { IconDatabase } from "@/components/v2/ui/Icons";

export default function V2LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v2/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid credentials. Please try again.");
        return;
      }
      localStorage.setItem("cinsights_session", JSON.stringify({
        user: data.user,
        accessToken: data.access_token,
      }));
      router.push(ROUTES.V2_CHAT);
    } catch {
      setError("Cannot connect to server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: "var(--ci-bg)" }}>
      {/* Left — Brand hero */}
      <div className="hidden flex-1 flex-col items-center justify-center p-12 lg:flex" style={{ background: "linear-gradient(135deg, var(--ci-navy) 0%, #5A6B8A 100%)" }}>
        <div className="max-w-md text-center">
          <div className="mx-auto mb-8 flex items-center justify-center rounded-2xl bg-white/10 px-6 py-4 backdrop-blur-sm" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            <img src="/logo.svg" alt={APP_NAME} className="h-12" style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }} />
          </div>
          <p className="text-lg leading-relaxed text-white/70">
            Your AI-powered database assistant. Query multiple databases using natural language — no SQL required.
          </p>
          <div className="mt-10 flex justify-center gap-6">
            {["PostgreSQL", "MySQL", "MSSQL"].map(db => (
              <div key={db} className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[12px] font-medium text-white/80 backdrop-blur-sm">
                <IconDatabase className="h-3.5 w-3.5" />
                {db}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <img src="/logo.svg" alt={APP_NAME} className="h-9 mb-2" style={{ objectFit: "contain" }} />
          </div>

          <h2 className="mb-1 text-xl font-bold" style={{ color: "var(--ci-text)" }}>Welcome back</h2>
          <p className="mb-6 text-[13px]" style={{ color: "var(--ci-text-muted)" }}>Sign in to continue to {APP_NAME}</p>

          {error && (
            <div className="mb-4 rounded-xl px-4 py-2.5 text-[12px] font-medium" style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold" style={{ color: "var(--ci-text-secondary)" }}>Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" required
                className="w-full rounded-xl px-4 py-2.5 text-[13px] outline-none transition-all focus:ring-2"
                style={{ background: "var(--ci-bg-surface)", border: "1px solid var(--ci-border)", color: "var(--ci-text)", "--tw-ring-color": "var(--ci-accent-subtle)" } as React.CSSProperties} />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold" style={{ color: "var(--ci-text-secondary)" }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="admin123" required
                className="w-full rounded-xl px-4 py-2.5 text-[13px] outline-none transition-all focus:ring-2"
                style={{ background: "var(--ci-bg-surface)", border: "1px solid var(--ci-border)", color: "var(--ci-text)", "--tw-ring-color": "var(--ci-accent-subtle)" } as React.CSSProperties} />
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full rounded-xl py-3 text-[13px] font-semibold text-white transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, var(--ci-navy), #5A6B8A)" }}>
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
            Use <strong>admin / admin123</strong> or <strong>demo / demo123</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
