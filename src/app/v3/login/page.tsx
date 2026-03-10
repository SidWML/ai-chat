"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";

export default function V3LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.push("/v3/chat");
    }
  }, [user, router]);

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
      router.push("/v3/chat");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--v3-bg)",
        position: "relative",
        overflow: "hidden",
        padding: "24px",
      }}
    >
      {/* Background gradient orbs */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(79, 110, 247, 0.08) 0%, transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          right: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "40%",
          right: "20%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(217, 70, 239, 0.05) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Login card */}
      <div
        className="v3-fade-up"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "420px",
        }}
      >
        {/* Logo + Heading */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          {/* Gradient logo square with "C" */}
          <div
            className="v3-scale-in"
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "var(--v3-radius-md)",
              background: "var(--v3-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
              boxShadow:
                "0 8px 24px rgba(99, 102, 241, 0.3), 0 0 48px rgba(99, 102, 241, 0.1)",
            }}
          >
            <span
              style={{
                color: "#fff",
                fontSize: "22px",
                fontWeight: 700,
                lineHeight: 1,
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              C
            </span>
          </div>

          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--v3-text)",
              margin: 0,
              marginBottom: "8px",
              letterSpacing: "-0.02em",
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "var(--v3-text-secondary)",
              margin: 0,
            }}
          >
            Sign in to your CInsights account
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="v3-slide-up"
          style={{
            background: "var(--v3-bg-surface)",
            border: "1px solid var(--v3-border)",
            borderRadius: "var(--v3-radius-lg)",
            padding: "28px",
            boxShadow:
              "var(--v3-shadow-xl), 0 0 0 1px rgba(255, 255, 255, 0.03) inset, 0 0 80px rgba(99, 102, 241, 0.04)",
            animationDelay: "0.1s",
          }}
        >
          {/* Error message */}
          {error && (
            <div
              style={{
                background: "var(--v3-error-bg)",
                border: "1px solid rgba(248, 113, 113, 0.2)",
                borderRadius: "var(--v3-radius-sm)",
                padding: "10px 14px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                animation: "v3-fade-in 0.2s ease-out",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{ flexShrink: 0 }}
              >
                <circle cx="8" cy="8" r="7" stroke="var(--v3-error)" strokeWidth="1.5" />
                <path d="M8 4.5V9" stroke="var(--v3-error)" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="8" cy="11.5" r="0.75" fill="var(--v3-error)" />
              </svg>
              <span
                style={{
                  fontSize: "13px",
                  color: "var(--v3-error)",
                  lineHeight: 1.4,
                }}
              >
                {error}
              </span>
            </div>
          )}

          {/* Email field */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--v3-text-secondary)",
                marginBottom: "8px",
              }}
            >
              Email
            </label>
            <div
              style={{
                position: "relative",
                borderRadius: "var(--v3-radius-sm)",
                border: `1px solid ${
                  focused === "email"
                    ? "var(--v3-border-focus)"
                    : "var(--v3-border)"
                }`,
                background: "var(--v3-bg-input)",
                transition: "all 0.2s ease",
                boxShadow:
                  focused === "email"
                    ? "0 0 0 3px rgba(99, 102, 241, 0.1), 0 0 20px rgba(99, 102, 241, 0.05)"
                    : "none",
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                placeholder="you@company.com"
                autoComplete="email"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  fontSize: "14px",
                  color: "var(--v3-text)",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  lineHeight: 1.4,
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Password field */}
          <div style={{ marginBottom: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--v3-text-secondary)",
                }}
              >
                Password
              </label>
              <button
                type="button"
                style={{
                  fontSize: "12px",
                  color: "var(--v3-accent)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  opacity: 0.8,
                  transition: "opacity 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.opacity = "0.8";
                }}
              >
                Forgot password?
              </button>
            </div>
            <div
              style={{
                position: "relative",
                borderRadius: "var(--v3-radius-sm)",
                border: `1px solid ${
                  focused === "password"
                    ? "var(--v3-border-focus)"
                    : "var(--v3-border)"
                }`,
                background: "var(--v3-bg-input)",
                transition: "all 0.2s ease",
                boxShadow:
                  focused === "password"
                    ? "0 0 0 3px rgba(99, 102, 241, 0.1), 0 0 20px rgba(99, 102, 241, 0.05)"
                    : "none",
              }}
            >
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                placeholder="Enter your password"
                autoComplete="current-password"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  fontSize: "14px",
                  color: "var(--v3-text)",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  lineHeight: 1.4,
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 20px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#fff",
              background: "var(--v3-gradient)",
              backgroundSize: "200% 200%",
              border: "none",
              borderRadius: "var(--v3-radius-sm)",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.25s ease",
              boxShadow:
                "0 4px 16px rgba(99, 102, 241, 0.25), 0 1px 3px rgba(0, 0, 0, 0.3)",
              opacity: loading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              letterSpacing: "-0.01em",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 6px 24px rgba(99, 102, 241, 0.35), 0 2px 6px rgba(0, 0, 0, 0.4)";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 4px 16px rgba(99, 102, 241, 0.25), 0 1px 3px rgba(0, 0, 0, 0.3)";
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(0)";
            }}
            onMouseDown={(e) => {
              if (!loading) {
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(0) scale(0.98)";
              }
            }}
            onMouseUp={(e) => {
              if (!loading) {
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-1px) scale(1)";
              }
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "v3-spin 0.6s linear infinite",
                    display: "inline-block",
                  }}
                />
                <span>Signing in...</span>
              </>
            ) : (
              "Sign in"
            )}
          </button>

          {/* Demo hint */}
          <p
            style={{
              fontSize: "12px",
              color: "var(--v3-text-muted)",
              textAlign: "center",
              margin: 0,
              marginTop: "16px",
              lineHeight: 1.5,
            }}
          >
            Demo mode — enter any email and password
          </p>
        </form>

        {/* Footer */}
        <p
          className="v3-fade-in"
          style={{
            fontSize: "12px",
            color: "var(--v3-text-dimmed)",
            textAlign: "center",
            marginTop: "24px",
            animationDelay: "0.3s",
          }}
        >
          By signing in, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
