"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { MOCK_INTROSPECTIONS } from "@/lib/mock-features";
import { MOCK_DATABASES } from "@/lib/mock-data";
import {
  IconArrowLeft,
  IconChat,
  IconDatabase,
  IconPlus,
  IconCheck,
  IconX,
} from "@/components/v2/ui/Icons";
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

export default function V2IngestionPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center" style={{ background: "var(--ci-bg)" }} />}>
      <V2IngestionContent />
    </Suspense>
  );
}

function V2IngestionContent() {
  const searchParams = useSearchParams();
  const dbParam = searchParams.get("db") || searchParams.get("connection") || null;
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  // Filter jobs and databases to specific connection if param provided
  const filteredJobs = dbParam
    ? MOCK_INTROSPECTIONS.filter((job) => job.connectionId === dbParam)
    : MOCK_INTROSPECTIONS;

  const selectorDatabases = dbParam
    ? MOCK_DATABASES.filter((db) => db.id === dbParam)
    : MOCK_DATABASES;

  const currentDb = dbParam ? MOCK_DATABASES.find((db) => db.id === dbParam) : null;

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--ci-bg)" }}>
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between px-8 py-4"
        style={{
          borderBottom: "1px solid var(--ci-border)",
          background: "var(--ci-bg-surface)",
        }}
      >
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.V2_SETTINGS}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
            style={{ color: "var(--ci-text-muted)" }}
          >
            <IconArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-[16px] font-bold" style={{ color: "var(--ci-text)" }}>
            Data Ingestion
          </h1>
          {currentDb && (
            <>
              <span style={{ color: "var(--ci-text-muted)", fontSize: 14 }}>/</span>
              <span className="text-[14px] font-semibold" style={{ color: "var(--ci-navy)" }}>
                {currentDb.name}
              </span>
            </>
          )}
        </div>
        <Link
          href={ROUTES.V2_CHAT}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-black/5"
          style={{ color: "var(--ci-text-secondary)" }}
        >
          <IconChat className="h-4 w-4" />
          Back to Chat
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 py-8">
        <div className="mx-auto w-full max-w-4xl">
          {/* Section header */}
          <div className="v2-fade-up mb-6 flex items-center justify-between">
            <div>
              <p className="text-[15px] font-bold" style={{ color: "var(--ci-text)" }}>
                Introspection Jobs
              </p>
              <p className="mt-0.5 text-[12px]" style={{ color: "var(--ci-text-muted)" }}>
                {dbParam
                  ? `Schema discovery jobs for ${currentDb?.name || "this database"}.`
                  : "Discover and index database schemas for AI-powered querying."}
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-semibold text-white transition-all hover:shadow-lg active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, var(--ci-navy), #5A6B8A)",
              }}
            >
              <IconPlus className="h-3.5 w-3.5" />
              Start Introspection
            </button>
          </div>

          {/* Jobs list */}
          {filteredJobs.length === 0 && (
            <div
              className="v2-fade-up rounded-2xl p-12 text-center"
              style={{ background: "var(--ci-bg-surface)", border: "2px dashed var(--ci-border)" }}
            >
              <IconDatabase className="h-10 w-10" style={{ color: "var(--ci-text-muted)", margin: "0 auto 12px" }} />
              <p className="text-[14px] font-semibold" style={{ color: "var(--ci-text)" }}>
                No introspection jobs yet
              </p>
              <p className="mt-1 text-[12px]" style={{ color: "var(--ci-text-muted)" }}>
                Start an introspection to discover and index the database schema.
              </p>
            </div>
          )}
          <div className="space-y-4">
            {filteredJobs.map((job, i) => {
              const status = STATUS_CONFIG[job.status] || STATUS_CONFIG.pending;
              return (
                <div
                  key={job.id}
                  className="v2-fade-up rounded-2xl p-5 transition-all hover:shadow-md"
                  style={{
                    background: "var(--ci-bg-surface)",
                    border: "1px solid var(--ci-border)",
                    animationDelay: `${i * 60}ms`,
                  }}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: "var(--ci-bg-wash)" }}
                      >
                        <IconDatabase className="h-5 w-5" style={{ color: "var(--ci-navy)" }} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold" style={{ color: "var(--ci-text)" }}>
                          {job.connectionName}
                        </p>
                        <p className="mt-0.5 text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                          Started {formatDate(job.startedAt)}
                          {job.completedAt && ` \u00B7 Duration ${formatDuration(job.startedAt, job.completedAt)}`}
                        </p>
                      </div>
                    </div>

                    {/* Status badge */}
                    <span
                      className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                      style={{ background: status.bg, color: status.color }}
                    >
                      {job.status === "completed" && <IconCheck className="h-3 w-3" />}
                      {job.status === "failed" && <IconX className="h-3 w-3" />}
                      {job.status === "running" && (
                        <span
                          className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-t-transparent"
                          style={{ borderColor: status.color, borderTopColor: "transparent" }}
                        />
                      )}
                      {status.label}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[11px] font-medium" style={{ color: "var(--ci-text-muted)" }}>
                        {job.stage}
                      </span>
                      <span className="text-[11px] font-bold" style={{ color: "var(--ci-text)" }}>
                        {job.progress}%
                      </span>
                    </div>
                    <div
                      className="h-2 overflow-hidden rounded-full"
                      style={{ background: "var(--ci-bg-wash)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${job.progress}%`,
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
                  <div className="mt-3 flex items-center gap-4">
                    <span className="text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                      Tables discovered: <strong style={{ color: "var(--ci-text)" }}>{job.tablesDiscovered}</strong>
                    </span>
                    <span className="text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                      Connection: <strong style={{ color: "var(--ci-text)" }}>{job.connectionId}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

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
        animationPrefix="v2"
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
