"use client";

import { useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/cn";
import {
  IconDatabase,
  IconChevron,
  IconTrash,
  IconCheck,
  IconX,
  IconTable,
  IconSearch,
} from "@/components/v2/ui/Icons";
import {
  useConnections,
  useTestExistingConnection,
  useDeleteConnection,
} from "@/lib/v2/queries";
import { useConnectionStore } from "@/stores/v2/connectionStore";
import type { Connection, TestConnectionResult } from "@/lib/v2/types";
import ConnectionForm from "@/components/v2/settings/ConnectionForm";

const DB_COLORS: Record<string, string> = {
  postgresql: "#336791",
  mysql: "#00758F",
  mssql: "#4F5D8A",
};

const DB_BADGES: Record<string, { label: string; bg: string }> = {
  postgresql: { label: "PG", bg: "#336791" },
  mysql: { label: "MY", bg: "#00758F" },
  mssql: { label: "MS", bg: "#4F5D8A" },
};

const DB_LABELS: Record<string, string> = {
  postgresql: "PostgreSQL",
  mysql: "MySQL",
  mssql: "SQL Server",
};

type Tab = "connections" | "appearance";

// === Skeleton ===

function ConnectionCardSkeleton() {
  return (
    <div
      className="animate-pulse rounded-2xl p-5"
      style={{
        background: "var(--ci-bg-surface)",
        border: "1px solid var(--ci-border)",
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="h-11 w-11 shrink-0 rounded-xl"
          style={{ background: "var(--ci-bg-wash)" }}
        />
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="h-4 w-32 rounded-md" style={{ background: "var(--ci-bg-wash)" }} />
            <div className="h-5 w-10 rounded-full" style={{ background: "var(--ci-bg-wash)" }} />
          </div>
          <div className="h-3 w-48 rounded" style={{ background: "var(--ci-bg-wash)" }} />
          <div className="flex gap-4">
            <div className="h-3 w-20 rounded" style={{ background: "var(--ci-bg-wash)" }} />
            <div className="h-3 w-24 rounded" style={{ background: "var(--ci-bg-wash)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// === Toast notification ===

function Toast({
  result,
  connectionName,
  onClose,
}: {
  result: TestConnectionResult;
  connectionName: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg"
      style={{
        background: result.success ? "#16A34A" : "#EF4444",
        color: "#fff",
        animation: "slideUp 0.3s ease-out",
      }}
    >
      {result.success ? (
        <IconCheck className="h-4 w-4 shrink-0" />
      ) : (
        <IconX className="h-4 w-4 shrink-0" />
      )}
      <div>
        <p className="text-[13px] font-semibold">
          {result.success ? "Connection Successful" : "Connection Failed"}
        </p>
        <p className="text-[11px] opacity-90">
          {result.success
            ? `${connectionName} is reachable${result.latency_ms != null ? ` (${result.latency_ms}ms)` : ""}`
            : result.error || `Could not reach ${connectionName}`}
        </p>
      </div>
      <button onClick={onClose} className="ml-2 shrink-0 opacity-70 hover:opacity-100">
        <IconX className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// === Connection Card ===

function ConnectionCard({
  connection,
  onEdit,
  onDelete,
  onToast,
}: {
  connection: Connection;
  onEdit: () => void;
  onDelete: () => void;
  onToast: (result: TestConnectionResult, name: string) => void;
}) {
  const testExisting = useTestExistingConnection();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const badge = DB_BADGES[connection.type] || { label: connection.type.slice(0, 2).toUpperCase(), bg: "var(--ci-navy)" };
  const isActive = connection.status === "active";

  const handleTest = async () => {
    try {
      const result = await testExisting.mutateAsync(connection.id);
      onToast(result, connection.name);
    } catch (err) {
      onToast(
        {
          success: false,
          error: err instanceof Error ? err.message : "Test failed",
          suggestions: ["Verify the server is running and accessible"],
        },
        connection.name
      );
    }
  };

  return (
    <div
      className="group rounded-2xl transition-all hover:shadow-md"
      style={{
        background: "var(--ci-bg-surface)",
        border: "1px solid var(--ci-border)",
      }}
    >
      <div className="p-5">
        {/* Top row: badge, name, type, status */}
        <div className="flex items-start gap-4">
          {/* DB icon badge */}
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[11px] font-black tracking-wide text-white"
            style={{ background: badge.bg }}
          >
            {badge.label}
          </div>

          {/* Info block */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <h3
                className="truncate text-[14px] font-bold"
                style={{ color: "var(--ci-text)" }}
              >
                {connection.name}
              </h3>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                style={{ background: badge.bg }}
              >
                {badge.label}
              </span>
              {/* Status dot */}
              <span className="flex shrink-0 items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: isActive ? "#22C55E" : "#EF4444",
                    boxShadow: isActive
                      ? "0 0 6px rgba(34, 197, 94, 0.4)"
                      : "0 0 6px rgba(239, 68, 68, 0.4)",
                  }}
                />
                <span
                  className="text-[11px] font-medium capitalize"
                  style={{ color: isActive ? "#22C55E" : "#EF4444" }}
                >
                  {isActive ? "Connected" : connection.status}
                </span>
              </span>
            </div>

            {/* Description */}
            <p
              className="mt-1 truncate text-[12px] leading-relaxed"
              style={{ color: "var(--ci-text-muted)" }}
            >
              {connection.description || DB_LABELS[connection.type] || connection.type}
            </p>

            {/* Meta row */}
            <div className="mt-2.5 flex items-center gap-4">
              <span
                className="flex items-center gap-1 text-[11px]"
                style={{ color: "var(--ci-text-muted)" }}
              >
                <IconTable className="h-3 w-3" />
                {DB_LABELS[connection.type] || connection.type}
              </span>
              {connection.last_tested_at && (
                <span
                  className="text-[11px]"
                  style={{ color: "var(--ci-text-muted)" }}
                >
                  Tested {formatRelativeTime(connection.last_tested_at)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div
          className="mt-4 flex items-center gap-2 border-t pt-4"
          style={{ borderColor: "var(--ci-border)" }}
        >
          <button
            onClick={handleTest}
            disabled={testExisting.isPending}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all hover:shadow-sm active:scale-[0.97] disabled:opacity-50"
            style={{
              background: "var(--ci-bg-wash)",
              border: "1px solid var(--ci-border)",
              color: "var(--ci-text)",
            }}
          >
            {testExisting.isPending ? (
              <>
                <span
                  className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-t-transparent"
                  style={{
                    borderColor: "var(--ci-text-muted)",
                    borderTopColor: "transparent",
                  }}
                />
                Testing...
              </>
            ) : (
              "Test"
            )}
          </button>

          <button
            onClick={onEdit}
            className="rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all hover:shadow-sm active:scale-[0.97]"
            style={{
              background: "var(--ci-bg-wash)",
              border: "1px solid var(--ci-border)",
              color: "var(--ci-text)",
            }}
          >
            Edit
          </button>

          <div className="mx-0.5 h-4 w-px" style={{ background: "var(--ci-border)" }} />

          <Link
            href={`${ROUTES.V2_EXPLORER}?db=${connection.id}`}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition-all hover:shadow-sm active:scale-[0.97]"
            style={{
              color: "var(--ci-navy)",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ci-accent-subtle)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <IconTable className="h-3 w-3" />
            Explorer
          </Link>
          <Link
            href={`${ROUTES.V2_INGESTION}?db=${connection.id}`}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition-all hover:shadow-sm active:scale-[0.97]"
            style={{
              color: "var(--ci-navy)",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ci-accent-subtle)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <IconSearch className="h-3 w-3" />
            Ingestion
          </Link>

          <div className="flex-1" />

          {confirmDelete ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-red-500">Delete?</span>
              <button
                onClick={() => {
                  onDelete();
                  setConfirmDelete(false);
                }}
                className="rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-white transition-all hover:shadow-sm active:scale-[0.97]"
                style={{ background: "#EF4444" }}
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition-all hover:bg-black/5"
                style={{ color: "var(--ci-text-muted)" }}
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="rounded-lg p-1.5 transition-all hover:bg-red-50"
              style={{ color: "var(--ci-text-muted)" }}
              title="Delete connection"
            >
              <IconTrash className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// === Helper ===

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } catch {
    return "";
  }
}

// === Main Page ===

export default function V2SettingsPage() {
  const [tab, setTab] = useState<Tab>("connections");
  const [toast, setToast] = useState<{
    result: TestConnectionResult;
    name: string;
  } | null>(null);

  const { openCreateForm, openEditForm } = useConnectionStore();

  // Connections data
  const {
    data: connectionsData,
    isLoading: connectionsLoading,
    isError: connectionsError,
    refetch: refetchConnections,
  } = useConnections();
  const deleteConnection = useDeleteConnection();

  const connections = connectionsData?.items ?? [];

  const handleToast = (result: TestConnectionResult, name: string) => {
    setToast({ result, name });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "var(--ci-bg)" }}
    >
      {/* Inline animation keyframes */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div
        className="flex items-center gap-3 px-8 py-6"
        style={{ borderBottom: "1px solid var(--ci-border)" }}
      >
        <Link
          href={ROUTES.V2_CHAT}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
          style={{ color: "var(--ci-text-muted)" }}
        >
          <IconChevron className="h-4 w-4 rotate-90" />
        </Link>
        <h1
          className="text-xl font-bold"
          style={{ color: "var(--ci-text)" }}
        >
          Settings
        </h1>
      </div>

      <div className="mx-auto w-full max-w-4xl px-8 py-6">
        {/* Tabs */}
        <div
          className="mb-6 flex gap-1 rounded-xl p-1"
          style={{ background: "var(--ci-bg-wash)" }}
        >
          {(["connections", "appearance"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-lg py-2 text-[12px] font-semibold capitalize transition-all",
                tab === t ? "shadow-sm" : ""
              )}
              style={
                tab === t
                  ? {
                      background: "var(--ci-bg-surface)",
                      color: "var(--ci-navy)",
                      boxShadow: "var(--ci-shadow-sm)",
                    }
                  : { color: "var(--ci-text-muted)" }
              }
            >
              {t}
            </button>
          ))}
        </div>

        {/* ========== Connections Tab ========== */}
        {tab === "connections" && (
          <div className="space-y-4">
            {/* Section header */}
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-[15px] font-bold"
                  style={{ color: "var(--ci-text)" }}
                >
                  Database Connections
                </p>
                <p
                  className="mt-0.5 text-[12px]"
                  style={{ color: "var(--ci-text-muted)" }}
                >
                  Manage your database connections for querying and analysis.
                </p>
              </div>
              <button
                onClick={() => openCreateForm()}
                className="rounded-xl px-4 py-2.5 text-[12px] font-semibold text-white transition-all hover:shadow-lg active:scale-[0.98]"
                style={{
                  background:
                    "linear-gradient(135deg, var(--ci-navy), #5A6B8A)",
                }}
              >
                + Add Connection
              </button>
            </div>

            {/* Loading */}
            {connectionsLoading && (
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                <ConnectionCardSkeleton />
                <ConnectionCardSkeleton />
                <ConnectionCardSkeleton />
              </div>
            )}

            {/* Error */}
            {connectionsError && !connectionsLoading && (
              <div
                className="rounded-2xl p-8 text-center"
                style={{
                  background: "var(--ci-bg-surface)",
                  border: "1px solid var(--ci-border)",
                }}
              >
                <div
                  className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ background: "rgba(239, 68, 68, 0.1)" }}
                >
                  <IconX className="h-5 w-5" style={{ color: "#EF4444" }} />
                </div>
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: "var(--ci-text)" }}
                >
                  Could not load connections
                </p>
                <p
                  className="mt-1 text-[12px]"
                  style={{ color: "var(--ci-text-muted)" }}
                >
                  Please check that the API server is running and try again.
                </p>
                <button
                  onClick={() => refetchConnections()}
                  className="mt-4 rounded-xl px-5 py-2.5 text-[12px] font-semibold transition-all hover:shadow-sm active:scale-[0.98]"
                  style={{
                    background: "var(--ci-bg-wash)",
                    border: "1px solid var(--ci-border)",
                    color: "var(--ci-text)",
                  }}
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty state */}
            {!connectionsLoading &&
              !connectionsError &&
              connections.length === 0 && (
                <div
                  className="rounded-2xl p-10 text-center"
                  style={{
                    background: "var(--ci-bg-surface)",
                    border: "2px dashed var(--ci-border)",
                  }}
                >
                  <div
                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ background: "var(--ci-bg-wash)" }}
                  >
                    <IconDatabase
                      className="h-7 w-7"
                      style={{ color: "var(--ci-text-muted)" }}
                    />
                  </div>
                  <p
                    className="text-[15px] font-bold"
                    style={{ color: "var(--ci-text)" }}
                  >
                    No connections yet
                  </p>
                  <p
                    className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed"
                    style={{ color: "var(--ci-text-muted)" }}
                  >
                    Add your first database connection to start querying your data with natural language.
                  </p>
                  <button
                    onClick={() => openCreateForm()}
                    className="mt-5 rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:shadow-lg active:scale-[0.98]"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--ci-navy), #5A6B8A)",
                    }}
                  >
                    + Add Your First Connection
                  </button>
                </div>
              )}

            {/* Connection cards grid */}
            {!connectionsLoading && !connectionsError && connections.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                {connections.map((conn: any) => (
                  <ConnectionCard
                    key={conn.id}
                    connection={conn}
                    onEdit={() => openEditForm(conn.id)}
                    onDelete={() => deleteConnection.mutate(conn.id)}
                    onToast={handleToast}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== Appearance Tab ========== */}
        {tab === "appearance" && (
          <div className="space-y-4">
            <div>
              <p
                className="text-[15px] font-bold"
                style={{ color: "var(--ci-text)" }}
              >
                Appearance
              </p>
              <p
                className="mt-0.5 text-[12px]"
                style={{ color: "var(--ci-text-muted)" }}
              >
                Customize how CInsights looks and feels.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div
                className="cursor-pointer rounded-2xl p-5 ring-2"
                style={{
                  background: "var(--ci-bg-surface)",
                  border: "1px solid var(--ci-border)",
                  boxShadow: "0 0 0 2px var(--ci-navy)",
                }}
              >
                <div className="mb-3 flex gap-2">
                  <div
                    className="h-8 w-full rounded-lg"
                    style={{ background: "var(--ci-bg-wash)" }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <IconCheck className="h-4 w-4" style={{ color: "var(--ci-navy)" }} />
                  <p
                    className="text-[13px] font-bold"
                    style={{ color: "var(--ci-text)" }}
                  >
                    Light
                  </p>
                </div>
                <p
                  className="mt-0.5 text-[11px]"
                  style={{ color: "var(--ci-text-muted)" }}
                >
                  Clean and professional
                </p>
              </div>
              <div
                className="cursor-not-allowed rounded-2xl p-5 opacity-50"
                style={{
                  background: "var(--ci-bg-surface)",
                  border: "1px solid var(--ci-border)",
                }}
              >
                <div className="mb-3 flex gap-2">
                  <div className="h-8 w-full rounded-lg bg-zinc-800" />
                </div>
                <p
                  className="text-[13px] font-bold"
                  style={{ color: "var(--ci-text)" }}
                >
                  Dark
                </p>
                <p
                  className="mt-0.5 text-[11px]"
                  style={{ color: "var(--ci-text-muted)" }}
                >
                  Coming soon
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Connection Form Modal */}
      <ConnectionForm />

      {/* Toast notification */}
      {toast && (
        <Toast
          result={toast.result}
          connectionName={toast.name}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
