"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.push("/chat");
    } catch {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: "var(--ci-bg)" }}
    >
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center">
          <Image
            src="/logo.svg"
            alt="CInsights"
            width={160}
            height={44}
            className="mb-3"
            priority
          />
          <p className="text-[13px]" style={{ color: "var(--ci-text-tertiary)" }}>
            Chat with your databases
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl p-6"
          style={{
            background: "var(--ci-bg-surface)",
            border: "1px solid var(--ci-border)",
            boxShadow: "var(--ci-shadow-lg)",
          }}
        >
          {error && (
            <div
              className="rounded-lg px-3 py-2 text-[13px]"
              style={{
                background: "var(--ci-error-bg)",
                color: "var(--ci-error)",
                border: "1px solid rgba(220, 38, 38, 0.15)",
              }}
            >
              {error}
            </div>
          )}

          <div>
            <label
              className="mb-1.5 block text-[13px] font-medium"
              style={{ color: "var(--ci-text-secondary)" }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-all ci-input-glow"
              style={{
                background: "var(--ci-bg)",
                border: "1px solid var(--ci-border)",
                color: "var(--ci-text)",
              }}
            />
          </div>

          <div>
            <label
              className="mb-1.5 block text-[13px] font-medium"
              style={{ color: "var(--ci-text-secondary)" }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-all ci-input-glow"
              style={{
                background: "var(--ci-bg)",
                border: "1px solid var(--ci-border)",
                color: "var(--ci-text)",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl py-2.5 text-[14px] font-semibold text-white transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, var(--ci-navy), var(--ci-navy-light))",
              boxShadow: "var(--ci-shadow-sm)",
            }}
          >
            {loading ? (
              <span
                className="inline-block h-4 w-4 animate-spin rounded-full"
                style={{ border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff" }}
              />
            ) : (
              "Sign in"
            )}
          </button>

          <p className="text-center text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
            Demo: enter any email and password
          </p>
        </form>
      </div>
    </div>
  );
}
