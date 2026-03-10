"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/cn";
import {
  useDashboards,
  useCreateDashboard,
  useDeleteDashboard,
  useConnections,
} from "@/lib/v2/queries";
import {
  IconPlus,
  IconUser,
  IconTrash,
  IconDatabase,
  IconGrid,
  IconX,
} from "@/components/v2/ui/Icons";
import type { Dashboard } from "@/lib/v2/types";

interface DashboardListProps {
  onSelect?: (id: string) => void;
}

/* ── Create Dashboard Modal ─────────────────────────────────── */

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
}

function CreateDashboardModal({ open, onClose }: CreateModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [connectionId, setConnectionId] = useState("");

  const createDashboard = useCreateDashboard();
  const { data: connectionsData } = useConnections();
  const connections = connectionsData?.items ?? connectionsData ?? [];

  const handleSubmit = useCallback(() => {
    if (!title.trim()) return;
    createDashboard.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        connection_id: connectionId || undefined,
      },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
          setConnectionId("");
          onClose();
        },
      }
    );
  }, [title, description, connectionId, createDashboard, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="v2-fade-up relative w-full max-w-md rounded-2xl p-6"
        style={{
          background: "var(--ci-bg-surface)",
          border: "1px solid var(--ci-border)",
          boxShadow: "var(--ci-shadow-lg)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
          style={{ color: "var(--ci-text-muted)" }}
        >
          <IconX className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <h2 className="text-[16px] font-semibold" style={{ color: "var(--ci-text)" }}>
            Create Dashboard
          </h2>
          <p className="mt-1 text-[13px]" style={{ color: "var(--ci-text-muted)" }}>
            Set up a new dashboard to organize your widgets
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label
              className="mb-1.5 block text-[12px] font-semibold"
              style={{ color: "var(--ci-text-secondary)" }}
            >
              Title <span style={{ color: "var(--ci-coral)" }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Sales Overview"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
              className="w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-all focus:ring-2 focus:ring-[#3C4C73]"
              style={{
                background: "var(--ci-bg-wash)",
                border: "1px solid var(--ci-border)",
                color: "var(--ci-text)",
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label
              className="mb-1.5 block text-[12px] font-semibold"
              style={{ color: "var(--ci-text-secondary)" }}
            >
              Description
            </label>
            <textarea
              placeholder="What is this dashboard about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-all focus:ring-2"
              style={{
                background: "var(--ci-bg-wash)",
                border: "1px solid var(--ci-border)",
                color: "var(--ci-text)",
              }}
            />
          </div>

          {/* Connection (optional) */}
          <div>
            <label
              className="mb-1.5 block text-[12px] font-semibold"
              style={{ color: "var(--ci-text-secondary)" }}
            >
              Connection{" "}
              <span className="font-normal" style={{ color: "var(--ci-text-muted)" }}>
                (optional)
              </span>
            </label>
            <select
              value={connectionId}
              onChange={(e) => setConnectionId(e.target.value)}
              className="w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-all"
              style={{
                background: "var(--ci-bg-wash)",
                border: "1px solid var(--ci-border)",
                color: connectionId ? "var(--ci-text)" : "var(--ci-text-muted)",
              }}
            >
              <option value="">No connection</option>
              {(Array.isArray(connections) ? connections : []).map(
                (conn: { id: string; name: string }) => (
                  <option key={conn.id} value={conn.id}>
                    {conn.name}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-black/5"
            style={{ color: "var(--ci-text-muted)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || createDashboard.isPending}
            className="rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--ci-navy), #5A6B8A)" }}
          >
            {createDashboard.isPending ? "Creating..." : "Create Dashboard"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton Card ──────────────────────────────────────────── */

function SkeletonCard({ delay }: { delay: number }) {
  return (
    <div
      className="v2-fade-up flex flex-col rounded-xl p-5"
      style={{
        background: "var(--ci-bg-surface)",
        border: "1px solid var(--ci-border)",
        boxShadow: "var(--ci-shadow-sm)",
        animationDelay: `${delay}ms`,
      }}
    >
      <div
        className="mb-4 h-28 w-full animate-pulse rounded-lg"
        style={{ background: "var(--ci-bg-wash)" }}
      />
      <div className="mb-2 h-4 w-32 animate-pulse rounded" style={{ background: "var(--ci-border)" }} />
      <div className="mb-3 h-3 w-48 animate-pulse rounded" style={{ background: "var(--ci-border)" }} />
      <div className="mt-auto flex items-center justify-between">
        <div className="h-3 w-16 animate-pulse rounded" style={{ background: "var(--ci-border)" }} />
        <div className="h-3 w-20 animate-pulse rounded" style={{ background: "var(--ci-border)" }} />
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────── */

export function DashboardList({ onSelect }: DashboardListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data: dashboards, isLoading, error } = useDashboards();
  const deleteDashboard = useDeleteDashboard();

  const handleSelect = (id: string) => {
    onSelect?.(id);
  };

  const handleDelete = (id: string) => {
    deleteDashboard.mutate(id, {
      onSuccess: () => setDeleteConfirmId(null),
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div className="h-4 w-24 animate-pulse rounded" style={{ background: "var(--ci-border)" }} />
          <div className="h-10 w-44 animate-pulse rounded-xl" style={{ background: "var(--ci-border)" }} />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard delay={0} />
          <SkeletonCard delay={60} />
          <SkeletonCard delay={120} />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 v2-fade-up">
        <div
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: "#FEF2F2" }}
        >
          <IconPlus className="h-6 w-6 rotate-45" style={{ color: "#EF4444" }} />
        </div>
        <p className="mb-2 text-[15px] font-semibold" style={{ color: "var(--ci-text)" }}>
          Failed to load dashboards
        </p>
        <p className="mb-6 text-[13px]" style={{ color: "var(--ci-text-muted)" }}>
          Something went wrong. Please try again later.
        </p>
      </div>
    );
  }

  const items: Dashboard[] = dashboards ?? [];

  // Empty state
  if (items.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-20 v2-fade-up">
          <div
            className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl"
            style={{ background: "var(--ci-bg-wash)" }}
          >
            <IconGrid className="h-8 w-8" style={{ color: "var(--ci-text-muted)" }} />
          </div>
          <p className="mb-2 text-[16px] font-semibold" style={{ color: "var(--ci-text)" }}>
            No dashboards yet
          </p>
          <p className="mb-6 max-w-xs text-center text-[13px] leading-relaxed" style={{ color: "var(--ci-text-muted)" }}>
            Create your first dashboard to organize charts, tables, and insights from your conversations.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-[13px] font-semibold text-white transition-all hover:shadow-lg active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, var(--ci-navy), #5A6B8A)" }}
          >
            <IconPlus className="h-4 w-4" />
            Create Dashboard
          </button>
        </div>

        <CreateDashboardModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[13px] font-medium" style={{ color: "var(--ci-text-muted)" }}>
            {items.length} dashboard{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:shadow-lg active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, var(--ci-navy), #5A6B8A)" }}
        >
          <IconPlus className="h-4 w-4" />
          Create Dashboard
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((dash, i) => {
          const widgetCount = dash.widgets?.length ?? 0;
          const createdDate = new Date(dash.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <div
              key={dash.id}
              className="v2-fade-up group relative"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <button
                onClick={() => handleSelect(dash.id)}
                className={cn(
                  "flex w-full flex-col items-start rounded-xl p-5 text-left transition-all duration-200",
                  "hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]"
                )}
                style={{
                  background: "var(--ci-bg-surface)",
                  border: "1px solid var(--ci-border)",
                  boxShadow: "var(--ci-shadow-sm)",
                }}
              >
                {/* Preview area */}
                <div
                  className="mb-4 flex h-28 w-full items-center justify-center rounded-lg"
                  style={{ background: "var(--ci-bg-wash)" }}
                >
                  <div className="flex gap-1.5">
                    {widgetCount > 0 ? (
                      Array.from({ length: Math.min(widgetCount, 5) }).map((_, j) => (
                        <div
                          key={j}
                          className="rounded"
                          style={{
                            width: 18 + (j % 2) * 6,
                            height: 14 + (j % 3) * 8,
                            background:
                              j % 2 === 0 ? "var(--ci-navy)" : "var(--ci-border)",
                            opacity: 0.45,
                          }}
                        />
                      ))
                    ) : (
                      <div className="flex flex-col items-center gap-1.5">
                        <IconGrid className="h-5 w-5" style={{ color: "var(--ci-text-muted)", opacity: 0.4 }} />
                        <p className="text-[10px]" style={{ color: "var(--ci-text-muted)", opacity: 0.6 }}>
                          No widgets
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <p
                  className="mb-1 truncate text-[14px] font-semibold"
                  style={{ color: "var(--ci-text)", maxWidth: "100%" }}
                >
                  {dash.title || (dash as any).name || "Untitled"}
                </p>

                {/* Description */}
                <p
                  className="mb-3 line-clamp-2 text-[12px] leading-relaxed"
                  style={{ color: "var(--ci-text-muted)" }}
                >
                  {dash.description || "No description"}
                </p>

                {/* Connection badge */}
                {dash.connection_id && (
                  <div
                    className="mb-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium"
                    style={{
                      background: "rgba(60,76,115,0.08)",
                      color: "var(--ci-navy)",
                    }}
                  >
                    <IconDatabase className="h-3 w-3" />
                    Connected
                  </div>
                )}

                {/* Footer */}
                <div className="mt-auto flex w-full items-center justify-between pt-1">
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: "var(--ci-text-tertiary)" }}
                  >
                    {widgetCount} widget{widgetCount !== 1 ? "s" : ""}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                      {createdDate}
                    </span>
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full"
                      style={{ background: "var(--ci-bg-wash)" }}
                    >
                      <IconUser className="h-3 w-3" style={{ color: "var(--ci-text-muted)" }} />
                    </div>
                  </div>
                </div>
              </button>

              {/* Delete button */}
              {deleteConfirmId === dash.id ? (
                <div
                  className="absolute right-2 top-2 z-10 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
                  style={{
                    background: "var(--ci-bg-surface)",
                    border: "1px solid var(--ci-border)",
                    boxShadow: "var(--ci-shadow-md)",
                  }}
                >
                  <span className="text-[11px] font-medium" style={{ color: "var(--ci-text)" }}>
                    Delete?
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(dash.id);
                    }}
                    disabled={deleteDashboard.isPending}
                    className="rounded px-2 py-0.5 text-[11px] font-semibold text-white transition-colors disabled:opacity-50"
                    style={{ background: "#EF4444" }}
                  >
                    {deleteDashboard.isPending ? "..." : "Yes"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(null);
                    }}
                    className="rounded px-2 py-0.5 text-[11px] font-medium transition-colors hover:bg-black/5"
                    style={{ color: "var(--ci-text-muted)" }}
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmId(dash.id);
                  }}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-red-50"
                  style={{ color: "var(--ci-text-muted)" }}
                  title="Delete dashboard"
                >
                  <IconTrash className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      <CreateDashboardModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
