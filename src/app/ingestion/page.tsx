"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MOCK_INTROSPECTIONS } from "@/lib/mock-features";
import { MOCK_DATABASES } from "@/lib/mock-data";
import { IconArrowLeft, IconDatabase, IconPlus, IconCheck, IconX, IconChat } from "@/components/v2/ui/Icons";
import { IntrospectionModal } from "@/components/settings/IntrospectionModal";
import { Toast } from "@/components/settings/Toast";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  completed: { label: "Completed", color: "#16A34A", bg: "rgba(22, 163, 74, 0.1)" },
  running: { label: "Running", color: "#2563EB", bg: "rgba(37, 99, 235, 0.1)" },
  pending: { label: "Pending", color: "#D97706", bg: "rgba(217, 119, 6, 0.1)" },
  failed: { label: "Failed", color: "#EF4444", bg: "rgba(239, 68, 68, 0.1)" },
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function formatDuration(start: string, end?: string) {
  try {
    const s = new Date(start).getTime();
    const e = end ? new Date(end).getTime() : Date.now();
    const diff = Math.round((e - s) / 1000);
    if (diff < 60) return `${diff}s`;
    return `${Math.floor(diff / 60)}m ${diff % 60}s`;
  } catch {
    return "";
  }
}

export default function IngestionPage() {
  const searchParams = useSearchParams();
  const dbParam = searchParams.get("db");
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  // Filter jobs to specific database if param provided
  const filteredJobs = dbParam
    ? MOCK_INTROSPECTIONS.filter((job) => job.connectionId === dbParam)
    : MOCK_INTROSPECTIONS;

  // Filter database list in selector to only the scoped DB
  const selectorDatabases = dbParam
    ? MOCK_DATABASES.filter((db) => db.id === dbParam)
    : MOCK_DATABASES;

  const currentDb = dbParam ? MOCK_DATABASES.find((db) => db.id === dbParam) : null;

  return (
    <div className="ci-fade-in" style={{ minHeight: "100vh", background: "var(--ci-bg)" }}>
      {/* Header */}
      <header
        className="flex shrink-0 items-center justify-between"
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--ci-border)",
          background: "var(--ci-bg-surface)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/settings"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            style={{ color: "var(--ci-text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ci-bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <IconArrowLeft className="h-4 w-4" />
          </Link>
          <div style={{ width: 1, height: 20, background: "var(--ci-border)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IconDatabase className="h-5 w-5" style={{ color: "var(--ci-navy)" }} />
            <h1 style={{ fontSize: 16, fontWeight: 700, color: "var(--ci-text)", margin: 0 }}>
              Data Ingestion
            </h1>
            {currentDb && (
              <>
                <span style={{ color: "var(--ci-text-muted)", fontSize: 14 }}>/</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ci-navy)" }}>
                  {currentDb.name}
                </span>
              </>
            )}
          </div>
        </div>
        <Link
          href="/chat"
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors"
          style={{ color: "var(--ci-text-secondary)", textDecoration: "none" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ci-bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <IconChat className="h-4 w-4" />
          Back to Chat
        </Link>
      </header>

      {/* Content */}
      <div style={{ padding: "32px 32px", flex: 1 }}>
        <div style={{ maxWidth: 896, margin: "0 auto", width: "100%" }}>
          {/* Section header */}
          <div
            className="ci-fade-up"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "var(--ci-text)", margin: 0 }}>
                Introspection Jobs
              </p>
              <p style={{ fontSize: 12, color: "var(--ci-text-muted)", margin: "4px 0 0 0" }}>
                {dbParam
                  ? `Schema discovery jobs for ${currentDb?.name || "this database"}.`
                  : "Discover and index database schemas for AI-powered querying."}
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 12,
                padding: "10px 16px",
                fontSize: 12,
                fontWeight: 600,
                color: "#fff",
                border: "none",
                cursor: "pointer",
                background: "linear-gradient(135deg, var(--ci-navy), #5A6B8A)",
                transition: "all 0.2s",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.18)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)")}
            >
              <IconPlus className="h-3.5 w-3.5" />
              Start Introspection
            </button>
          </div>

          {/* Jobs list */}
          {filteredJobs.length === 0 ? (
            <div
              className="ci-fade-up"
              style={{
                background: "var(--ci-bg-surface)",
                border: "2px dashed var(--ci-border)",
                borderRadius: 16,
                padding: 48,
                textAlign: "center",
              }}
            >
              <IconDatabase className="h-10 w-10" style={{ color: "var(--ci-text-muted)", margin: "0 auto 12px" }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ci-text)", margin: 0 }}>
                No introspection jobs yet
              </p>
              <p style={{ fontSize: 12, color: "var(--ci-text-muted)", marginTop: 4 }}>
                Start an introspection to discover and index the database schema.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {filteredJobs.map((job, i) => {
                const status = STATUS_CONFIG[job.status] || STATUS_CONFIG.pending;
                return (
                  <div
                    key={job.id}
                    className="ci-fade-up"
                    style={{
                      background: "var(--ci-bg-surface)",
                      border: "1px solid var(--ci-border)",
                      borderRadius: 16,
                      padding: 20,
                      transition: "all 0.2s",
                      animationDelay: `${i * 60}ms`,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)")}
                  >
                    {/* Top row */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            background: "var(--ci-bg-wash)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <IconDatabase className="h-5 w-5" style={{ color: "var(--ci-navy)" }} />
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ci-text)", margin: 0 }}>
                            {job.connectionName}
                          </p>
                          <p style={{ fontSize: 11, color: "var(--ci-text-muted)", margin: "4px 0 0 0" }}>
                            Started {formatDate(job.startedAt)}
                            {job.completedAt && ` \u00B7 Duration ${formatDuration(job.startedAt, job.completedAt)}`}
                          </p>
                        </div>
                      </div>

                      {/* Status badge */}
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          borderRadius: 9999,
                          padding: "4px 10px",
                          fontSize: 11,
                          fontWeight: 600,
                          background: status.bg,
                          color: status.color,
                          flexShrink: 0,
                        }}
                      >
                        {job.status === "completed" && <IconCheck className="h-3 w-3" />}
                        {job.status === "failed" && <IconX className="h-3 w-3" />}
                        {job.status === "running" && (
                          <span
                            style={{
                              display: "inline-block",
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              border: `2px solid ${status.color}`,
                              borderTopColor: "transparent",
                              animation: "spin 1s linear infinite",
                            }}
                          />
                        )}
                        {status.label}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div style={{ marginTop: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 500, color: "var(--ci-text-muted)" }}>
                          {job.stage}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ci-text)" }}>
                          {job.progress}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: 8,
                          borderRadius: 9999,
                          background: "var(--ci-bg-wash)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            borderRadius: 9999,
                            width: `${job.progress}%`,
                            transition: "width 0.5s ease",
                            background:
                              job.status === "failed"
                                ? "#EF4444"
                                : job.status === "running"
                                ? "linear-gradient(90deg, #2563EB, #3B82F6)"
                                : "linear-gradient(90deg, #16A34A, #22C55E)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Meta row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12 }}>
                      <span style={{ fontSize: 11, color: "var(--ci-text-muted)" }}>
                        Tables discovered:{" "}
                        <strong style={{ color: "var(--ci-text)" }}>{job.tablesDiscovered}</strong>
                      </span>
                      <span style={{ fontSize: 11, color: "var(--ci-text-muted)" }}>
                        Connection:{" "}
                        <strong style={{ color: "var(--ci-text)" }}>{job.connectionId}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Spinner keyframes */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Introspection Modal */}
      <IntrospectionModal
        open={showModal}
        databases={selectorDatabases}
        preselectedDbId={dbParam}
        onClose={() => setShowModal(false)}
        onStart={(dbId) => {
          const dbName = MOCK_DATABASES.find((d) => d.id === dbId)?.name || dbId;
          setToast({
            type: "success",
            title: "Introspection Started",
            message: `Schema discovery for ${dbName} is now running.`,
          });
          setShowModal(false);
        }}
      />

      {/* Toast */}
      <Toast
        open={!!toast}
        type={toast?.type || "success"}
        title={toast?.title || ""}
        message={toast?.message || ""}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
