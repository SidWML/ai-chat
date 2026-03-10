"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { V3Sidebar } from "@/components/v3/V3Sidebar";
import { MOCK_INTROSPECTIONS } from "@/lib/mock-features";
import { MOCK_DATABASES } from "@/lib/mock-data";
import {
  IconDatabase,
  IconPlus,
  IconCheck,
  IconX,
  IconArrowLeft,
  IconChat,
  IconPanelLeft,
} from "@/components/v2/ui/Icons";
import { IntrospectionModal } from "@/components/settings/IntrospectionModal";
import { Toast } from "@/components/settings/Toast";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  completed: { label: "Completed", color: "var(--v3-success)", bg: "var(--v3-success-bg)" },
  running: { label: "Running", color: "#818CF8", bg: "rgba(129, 140, 248, 0.1)" },
  pending: { label: "Pending", color: "var(--v3-warning)", bg: "rgba(251, 191, 36, 0.1)" },
  failed: { label: "Failed", color: "var(--v3-error)", bg: "var(--v3-error-bg)" },
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

function IngestionContent() {
  const searchParams = useSearchParams();
  const dbParam = searchParams.get("db") || searchParams.get("connection");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  const filteredJobs = dbParam
    ? MOCK_INTROSPECTIONS.filter((job) => job.connectionId === dbParam)
    : MOCK_INTROSPECTIONS;

  const selectorDatabases = dbParam
    ? MOCK_DATABASES.filter((db) => db.id === dbParam)
    : MOCK_DATABASES;

  const currentDb = dbParam ? MOCK_DATABASES.find((db) => db.id === dbParam) : null;

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--v3-bg)" }}>
      <V3Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onClose={() => setSidebarOpen(false)}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 24px",
            borderBottom: "1px solid var(--v3-border)",
            background: "var(--v3-bg-surface)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  padding: 8,
                  borderRadius: 8,
                  border: "none",
                  background: "transparent",
                  color: "var(--v3-text-muted)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--v3-bg-hover)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <IconPanelLeft className="h-4 w-4" />
              </button>
            )}
            <Link
              href="/v3/settings"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: 8,
                color: "var(--v3-text-muted)",
                textDecoration: "none",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--v3-bg-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <IconArrowLeft className="h-4 w-4" />
            </Link>
            <div style={{ width: 1, height: 20, background: "var(--v3-border)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <IconDatabase className="h-[18px] w-[18px]" style={{ color: "var(--v3-accent)" }} />
              <h1 style={{ fontSize: 16, fontWeight: 600, color: "var(--v3-text)", margin: 0, letterSpacing: "-0.02em" }}>
                Data Ingestion
              </h1>
              {currentDb && (
                <>
                  <span style={{ color: "var(--v3-text-muted)", fontSize: 14 }}>/</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--v3-accent)" }}>
                    {currentDb.name}
                  </span>
                </>
              )}
            </div>
          </div>
          <Link
            href="/v3/chat"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 500,
              color: "var(--v3-text-secondary)",
              textDecoration: "none",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--v3-bg-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            <IconChat className="h-4 w-4" />
            Back to Chat
          </Link>
        </header>

        {/* Content */}
        <div className="v3-scroll" style={{ flex: 1, overflowY: "auto", padding: 32 }}>
          <div style={{ maxWidth: 896, margin: "0 auto", width: "100%" }}>
            {/* Section header */}
            <div
              className="v3-fade-up"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "var(--v3-text)", margin: 0, letterSpacing: "-0.01em" }}>
                  Introspection Jobs
                </p>
                <p style={{ fontSize: 12, color: "var(--v3-text-muted)", margin: "4px 0 0 0" }}>
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
                  borderRadius: 10,
                  padding: "10px 18px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  background: "var(--v3-gradient)",
                  transition: "all 0.2s",
                  boxShadow: "var(--v3-shadow-md)",
                  letterSpacing: "-0.01em",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "var(--v3-shadow-lg)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "var(--v3-shadow-md)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <IconPlus className="h-3.5 w-3.5" />
                Start Introspection
              </button>
            </div>

            {/* Jobs list */}
            {filteredJobs.length === 0 ? (
              <div
                className="v3-fade-up"
                style={{
                  background: "var(--v3-bg-surface)",
                  border: "2px dashed var(--v3-border)",
                  borderRadius: 16,
                  padding: 56,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: "var(--v3-accent-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <IconDatabase className="h-7 w-7" style={{ color: "var(--v3-accent)" }} />
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--v3-text)", margin: 0, letterSpacing: "-0.01em" }}>
                  No introspection jobs yet
                </p>
                <p style={{ fontSize: 12, color: "var(--v3-text-muted)", marginTop: 6, maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>
                  Start an introspection to discover and index your database schema for AI-powered querying.
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    marginTop: 20,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    borderRadius: 10,
                    padding: "10px 18px",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    background: "var(--v3-gradient)",
                    boxShadow: "var(--v3-shadow-md)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "var(--v3-shadow-lg)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "var(--v3-shadow-md)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <IconPlus className="h-3.5 w-3.5" />
                  Start Introspection
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {filteredJobs.map((job, i) => {
                  const status = STATUS_CONFIG[job.status] || STATUS_CONFIG.pending;
                  return (
                    <div
                      key={job.id}
                      className="v3-fade-up"
                      style={{
                        background: "var(--v3-bg-surface)",
                        border: "1px solid var(--v3-border)",
                        borderRadius: 14,
                        padding: 20,
                        transition: "all 0.2s",
                        animationDelay: `${i * 60}ms`,
                        boxShadow: "var(--v3-shadow-sm)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--v3-border-hover)";
                        e.currentTarget.style.boxShadow = "var(--v3-shadow-md)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--v3-border)";
                        e.currentTarget.style.boxShadow = "var(--v3-shadow-sm)";
                      }}
                    >
                      {/* Top row */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 12,
                              background: "var(--v3-accent-subtle)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <IconDatabase className="h-5 w-5" style={{ color: "var(--v3-accent)" }} />
                          </div>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--v3-text)", margin: 0, letterSpacing: "-0.01em" }}>
                              {job.connectionName}
                            </p>
                            <p style={{ fontSize: 11, color: "var(--v3-text-muted)", margin: "4px 0 0 0" }}>
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
                                animation: "v3Spin 1s linear infinite",
                              }}
                            />
                          )}
                          {status.label}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div style={{ marginTop: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 500, color: "var(--v3-text-muted)" }}>
                            {job.stage}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--v3-text)" }}>
                            {job.progress}%
                          </span>
                        </div>
                        <div
                          style={{
                            height: 6,
                            borderRadius: 9999,
                            background: "var(--v3-bg-elevated)",
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
                                  ? "var(--v3-error)"
                                  : job.status === "running"
                                  ? "linear-gradient(90deg, #6366F1, #818CF8)"
                                  : job.status === "completed"
                                  ? "linear-gradient(90deg, #34D399, #6EE7B7)"
                                  : "var(--v3-warning)",
                            }}
                          />
                        </div>
                      </div>

                      {/* Meta row */}
                      <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 12 }}>
                        <span style={{ fontSize: 11, color: "var(--v3-text-muted)" }}>
                          Tables discovered:{" "}
                          <strong style={{ color: "var(--v3-text)", fontWeight: 600 }}>{job.tablesDiscovered}</strong>
                        </span>
                        <span style={{ fontSize: 11, color: "var(--v3-text-muted)" }}>
                          Connection:{" "}
                          <strong style={{ color: "var(--v3-text)", fontWeight: 600 }}>{job.connectionId}</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spinner keyframes */}
      <style>{`
        @keyframes v3Spin {
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
        animationPrefix="v3"
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

export default function V3IngestionPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: "flex", height: "100vh", background: "var(--v3-bg)", alignItems: "center", justifyContent: "center" }}>
          <div style={{ color: "var(--v3-text-muted)", fontSize: 13 }}>Loading...</div>
        </div>
      }
    >
      <IngestionContent />
    </Suspense>
  );
}
