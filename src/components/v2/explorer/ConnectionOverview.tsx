"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/cn";
import {
  useIntrospectionMetadata,
  useValidatedExamples,
  usePrompts,
  useUpdatePrompt,
} from "@/lib/v2/queries";
import type { Connection } from "@/lib/v2/types";

/* ─── Tab Icons ─── */

function IconBarChart({ className, ...props }: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" {...props}>
      <rect x="2" y="8" width="3" height="6" rx="0.5" />
      <rect x="6.5" y="4" width="3" height="10" rx="0.5" />
      <rect x="11" y="2" width="3" height="12" rx="0.5" />
    </svg>
  );
}

function IconCheckCircle({ className, ...props }: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <circle cx="8" cy="8" r="6.5" />
      <path d="M5.5 8l2 2 3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTerminal({ className, ...props }: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 5l3 3-3 3" />
      <path d="M9 11h3" />
    </svg>
  );
}

function IconDatabase({ className, ...props }: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <ellipse cx="8" cy="4" rx="5.5" ry="2" />
      <path d="M2.5 4v8c0 1.1 2.46 2 5.5 2s5.5-.9 5.5-2V4" />
      <path d="M2.5 8c0 1.1 2.46 2 5.5 2s5.5-.9 5.5-2" />
    </svg>
  );
}

function IconChevronDown({ className, ...props }: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

function IconEdit({ className, ...props }: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.5 3.5l3 3L5 14H2v-3L9.5 3.5z" />
    </svg>
  );
}

function IconCode({ className, ...props }: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 4L1.5 8 5 12" />
      <path d="M11 4l3.5 4L11 12" />
      <path d="M9 2l-2 12" />
    </svg>
  );
}

/* ─── Helpers ─── */

function formatBytes(bytes?: number): string {
  if (bytes == null) return "--";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatCount(n?: number): string {
  if (n == null) return "--";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

const TYPE_DIST_COLORS: Record<string, { color: string; bg: string }> = {
  text: { color: "#2563EB", bg: "#EFF6FF" },
  string: { color: "#2563EB", bg: "#EFF6FF" },
  integer: { color: "#16A34A", bg: "#F0FDF4" },
  decimal: { color: "#D97706", bg: "#FFFBEB" },
  float: { color: "#D97706", bg: "#FFFBEB" },
  boolean: { color: "#EA580C", bg: "#FFF7ED" },
  datetime: { color: "#7C3AED", bg: "#F5F3FF" },
  date: { color: "#7C3AED", bg: "#F5F3FF" },
  time: { color: "#7C3AED", bg: "#F5F3FF" },
  json: { color: "#0891B2", bg: "#ECFEFF" },
  uuid: { color: "#6366F1", bg: "#EEF2FF" },
  binary: { color: "#64748B", bg: "#F1F5F9" },
  array: { color: "#0891B2", bg: "#ECFEFF" },
  unknown: { color: "#64748B", bg: "#F1F5F9" },
};

/* ─── Skeleton ─── */

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-lg", className)} style={{ background: "var(--ci-border)" }} />
  );
}

/* ═══════════════════════════════════════════════
   Statistics Tab
   ═══════════════════════════════════════════════ */

function StatisticsTab({ connectionId }: { connectionId: string }) {
  const { data: meta, isLoading, error } = useIntrospectionMetadata(connectionId);

  if (isLoading) {
    return (
      <div className="space-y-5 p-6">
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-20" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <SkeletonBlock className="h-56" />
          <SkeletonBlock className="h-56" />
        </div>
      </div>
    );
  }

  if (error || !meta) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-[13px] font-semibold" style={{ color: "var(--ci-text)" }}>Failed to load statistics</p>
        <p className="mt-1 text-[12px]" style={{ color: "var(--ci-text-muted)" }}>Please try again later.</p>
      </div>
    );
  }

  const typeEntries = Object.entries(meta.column_type_distribution || {}).sort(
    ([, a], [, b]) => (b as number) - (a as number)
  ) as [string, number][];
  const maxTypeCount = typeEntries.length > 0 ? typeEntries[0][1] : 1;

  const statCards = [
    { label: "Tables", value: meta.table_count, icon: "grid", color: "#2563EB", bg: "#EFF6FF" },
    { label: "Columns", value: meta.total_columns, icon: "cols", color: "#059669", bg: "#ECFDF5" },
    { label: "Total Rows", value: formatCount(meta.total_rows), icon: "rows", color: "#7C3AED", bg: "#F5F3FF" },
    { label: "Total Size", value: formatBytes(meta.total_size_bytes), icon: "size", color: "#D97706", bg: "#FFFBEB" },
  ];

  return (
    <div className="v2-fade-up space-y-5 p-6">
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl px-4 py-3.5"
            style={{ background: "var(--ci-bg-surface)", border: "1px solid var(--ci-border)" }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: stat.bg }}
              >
                {stat.icon === "grid" && (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill={stat.color}>
                    <rect x="1" y="1" width="6" height="6" rx="1" />
                    <rect x="9" y="1" width="6" height="6" rx="1" />
                    <rect x="1" y="9" width="6" height="6" rx="1" />
                    <rect x="9" y="9" width="6" height="6" rx="1" />
                  </svg>
                )}
                {stat.icon === "cols" && <IconBarChart className="h-3.5 w-3.5" style={{ color: stat.color }} />}
                {stat.icon === "rows" && <IconDatabase className="h-3.5 w-3.5" style={{ color: stat.color }} />}
                {stat.icon === "size" && (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke={stat.color} strokeWidth={1.5}>
                    <rect x="2" y="2" width="12" height="12" rx="2" />
                    <path d="M5.5 8h5M8 5.5v5" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--ci-text-muted)" }}>
                  {stat.label}
                </p>
                <p className="text-[18px] font-bold tabular-nums" style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two columns: Type distribution + Top tables & Quality */}
      <div className="grid grid-cols-2 gap-4">
        {/* Column Type Distribution */}
        <div
          className="rounded-xl p-5"
          style={{ background: "var(--ci-bg-surface)", border: "1px solid var(--ci-border)" }}
        >
          <p className="mb-4 text-[12px] font-bold" style={{ color: "var(--ci-text)" }}>
            Column Type Distribution
          </p>
          <div className="space-y-2.5">
            {typeEntries.map(([type, count]) => {
              const tc = TYPE_DIST_COLORS[type] || TYPE_DIST_COLORS.unknown;
              const pct = meta.total_columns > 0 ? Math.round((count / meta.total_columns) * 100) : 0;
              return (
                <div key={type}>
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded px-1.5 py-0.5 text-[9px] font-bold capitalize" style={{ background: tc.bg, color: tc.color }}>
                        {type}
                      </span>
                    </div>
                    <span className="text-[11px] tabular-nums font-medium" style={{ color: "var(--ci-text-muted)" }}>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "var(--ci-bg-wash)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(count / maxTypeCount) * 100}%`, background: tc.color, opacity: 0.7 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Top tables + Data quality */}
        <div className="space-y-4">
          {/* Top Tables by Size */}
          <div
            className="rounded-xl p-5"
            style={{ background: "var(--ci-bg-surface)", border: "1px solid var(--ci-border)" }}
          >
            <p className="mb-3 text-[12px] font-bold" style={{ color: "var(--ci-text)" }}>
              Top Tables by Size
            </p>
            <div className="space-y-2">
              {(meta.top_tables_by_size || []).map((t: any, i: number) => (
                <div key={t.name} className="flex items-center gap-3">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold"
                    style={{ background: i === 0 ? "#EFF6FF" : "var(--ci-bg-wash)", color: i === 0 ? "#2563EB" : "var(--ci-text-muted)" }}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate text-[12px] font-semibold" style={{ color: "var(--ci-text)" }}>
                    {t.name}
                  </span>
                  <span className="text-[11px] tabular-nums" style={{ color: "var(--ci-text-muted)" }}>
                    {formatCount(t.row_count)} rows
                  </span>
                  <span className="text-[11px] tabular-nums font-medium" style={{ color: "var(--ci-navy)" }}>
                    {formatBytes(t.size_bytes)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Data Quality Insights */}
          <div
            className="rounded-xl p-5"
            style={{ background: "var(--ci-bg-surface)", border: "1px solid var(--ci-border)" }}
          >
            <p className="mb-3 text-[12px] font-bold" style={{ color: "var(--ci-text)" }}>
              Data Quality Insights
            </p>
            {(meta.nullable_columns || []).length > 0 ? (
              <div className="space-y-2">
                {(meta.nullable_columns || []).slice(0, 5).map((col: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "#D97706" }} />
                    <span className="text-[11px]" style={{ color: "var(--ci-text)" }}>
                      <span className="font-semibold">{col.table}.{col.column}</span>
                      <span style={{ color: "var(--ci-text-muted)" }}> allows NULL</span>
                    </span>
                  </div>
                ))}
                {meta.nullable_columns.length > 5 && (
                  <p className="text-[10px]" style={{ color: "var(--ci-text-muted)" }}>
                    +{meta.nullable_columns.length - 5} more nullable columns
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#16A34A" }} />
                <span className="text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                  All columns have NOT NULL constraints
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-[10px]" style={{ color: "var(--ci-text-muted)" }}>
        Generated {meta.generated_at ? new Date(meta.generated_at).toLocaleString() : "just now"}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Validated Examples Tab
   ═══════════════════════════════════════════════ */

function ValidatedExamplesTab({ connectionId }: { connectionId: string }) {
  const { data: examples, isLoading, error } = useValidatedExamples(connectionId);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3 p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-20" />
        ))}
      </div>
    );
  }

  if (error || !examples) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-[13px] font-semibold" style={{ color: "var(--ci-text)" }}>Failed to load examples</p>
        <p className="mt-1 text-[12px]" style={{ color: "var(--ci-text-muted)" }}>Please try again later.</p>
      </div>
    );
  }

  if (examples.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "var(--ci-bg-wash)" }}>
          <IconCheckCircle className="h-5 w-5" style={{ color: "var(--ci-text-muted)" }} />
        </div>
        <p className="text-[13px] font-semibold" style={{ color: "var(--ci-text)" }}>No validated examples yet</p>
        <p className="mt-1 text-[12px]" style={{ color: "var(--ci-text-muted)" }}>
          Examples will appear after introspection completes.
        </p>
      </div>
    );
  }

  const BLOCK_BADGES: Record<string, { color: string; bg: string }> = {
    table: { color: "#2563EB", bg: "#EFF6FF" },
    python: { color: "#16A34A", bg: "#F0FDF4" },
    image: { color: "#7C3AED", bg: "#F5F3FF" },
    text: { color: "#64748B", bg: "#F1F5F9" },
  };

  return (
    <div className="v2-fade-up space-y-3 p-6">
      <p className="text-[12px]" style={{ color: "var(--ci-text-muted)" }}>
        Pre-validated queries with live data verification
      </p>

      {examples.map((ex: any) => {
        const isExpanded = expandedId === ex.id;
        const badge = BLOCK_BADGES[ex.block_type] || BLOCK_BADGES.text;
        return (
          <div
            key={ex.id}
            className="overflow-hidden rounded-xl transition-all"
            style={{ background: "var(--ci-bg-surface)", border: "1px solid var(--ci-border)" }}
          >
            {/* Header */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : ex.id)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-black/[0.02]"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-bold" style={{ color: "var(--ci-text)" }}>
                    {ex.title}
                  </p>
                  <span
                    className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
                    style={{ background: badge.bg, color: badge.color }}
                  >
                    {ex.block_type}
                  </span>
                </div>
                {ex.description && (
                  <p className="mt-0.5 text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                    {ex.description}
                  </p>
                )}
              </div>
              <IconChevronDown
                className={cn("h-4 w-4 shrink-0 transition-transform", isExpanded && "rotate-180")}
                style={{ color: "var(--ci-text-muted)" }}
              />
            </button>

            {/* Expanded content */}
            {isExpanded && (
              <div className="border-t px-5 pb-5 pt-4 v2-fade-up" style={{ borderColor: "var(--ci-border)" }}>
                {/* User intent */}
                <div className="mb-3 flex items-start gap-2">
                  <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ci-text-muted)" }}>
                    Intent
                  </span>
                  <p className="text-[12px] italic" style={{ color: "var(--ci-text-secondary)" }}>
                    &ldquo;{ex.user_intent}&rdquo;
                  </p>
                </div>

                {/* SQL Query */}
                {ex.sql_query && (
                  <div className="mb-3">
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ci-text-muted)" }}>
                      SQL Query
                    </p>
                    <pre
                      className="overflow-x-auto rounded-lg p-3 text-[11px] leading-relaxed"
                      style={{ background: "var(--ci-bg-wash)", color: "var(--ci-text)", border: "1px solid var(--ci-border)", fontFamily: "monospace" }}
                    >
                      {ex.sql_query}
                    </pre>
                  </div>
                )}

                {/* Code (for python) */}
                {ex.code && (
                  <div className="mb-3">
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ci-text-muted)" }}>
                      Code
                    </p>
                    <pre
                      className="overflow-x-auto rounded-lg p-3 text-[11px] leading-relaxed"
                      style={{ background: "#1a1a2e", color: "#e0e0e0", fontFamily: "monospace" }}
                    >
                      {ex.code}
                    </pre>
                  </div>
                )}

                {/* Output table */}
                {ex.output?.data && (
                  <div>
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ci-text-muted)" }}>
                      Live Output
                    </p>
                    <div className="overflow-x-auto rounded-lg" style={{ border: "1px solid var(--ci-border)" }}>
                      <table className="w-full text-left">
                        <thead>
                          <tr style={{ background: "var(--ci-bg-wash)" }}>
                            {(ex.output.columns || []).map((col: string) => (
                              <th
                                key={col}
                                className="whitespace-nowrap px-3 py-2 text-[10px] font-bold uppercase tracking-wider"
                                style={{ color: "var(--ci-text-muted)", borderBottom: "1px solid var(--ci-border)" }}
                              >
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {ex.output.data.map((row: any, ri: number) => (
                            <tr
                              key={ri}
                              className="transition-colors hover:bg-black/[0.015]"
                              style={{ borderBottom: ri < ex.output.data.length - 1 ? "1px solid var(--ci-border)" : undefined }}
                            >
                              {(ex.output.columns || []).map((col: string) => (
                                <td
                                  key={col}
                                  className="whitespace-nowrap px-3 py-2 text-[11px] tabular-nums"
                                  style={{ color: "var(--ci-text)" }}
                                >
                                  {typeof row[col] === "number" ? row[col].toLocaleString() : String(row[col] ?? "")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Prompts Tab
   ═══════════════════════════════════════════════ */

function PromptsTab({ connectionId }: { connectionId: string }) {
  const { data: prompts, isLoading, error } = usePrompts(connectionId);
  const updatePrompt = useUpdatePrompt();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-3 p-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-28" />
        ))}
      </div>
    );
  }

  if (error || !prompts) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-[13px] font-semibold" style={{ color: "var(--ci-text)" }}>Failed to load prompts</p>
        <p className="mt-1 text-[12px]" style={{ color: "var(--ci-text-muted)" }}>Please try again later.</p>
      </div>
    );
  }

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setEditText(p.text);
  };

  const handleSave = () => {
    if (!editingId) return;
    updatePrompt.mutate({ connectionId, promptId: editingId, text: editText });
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditText("");
  };

  // Format key like CANVAS_GENERATION_PROMPT → Canvas Generation Prompt
  const formatKey = (key: string) =>
    key
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="v2-fade-up p-6">
      <p className="mb-4 text-[12px]" style={{ color: "var(--ci-text-muted)" }}>
        Customize system prompts and AI behavior for this connection.
      </p>

      <div className="space-y-3">
        {prompts.map((p: any) => {
          const isEditing = editingId === p.id;
          return (
            <div
              key={p.id}
              className="group rounded-xl transition-all"
              style={{ background: "var(--ci-bg-surface)", border: "1px solid var(--ci-border)" }}
            >
              {isEditing ? (
                /* ─── Editing mode ─── */
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
                      style={{
                        background: p.type === "system" ? "#EFF6FF" : "#F0FDF4",
                        color: p.type === "system" ? "#2563EB" : "#16A34A",
                      }}
                    >
                      {p.type}
                    </span>
                    <span className="text-[12px] font-bold" style={{ color: "var(--ci-text)" }}>
                      {formatKey(p.key)}
                    </span>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ci-text-muted)" }}>
                      Prompt Key
                    </p>
                    <code
                      className="block rounded-lg px-3 py-2 text-[11px]"
                      style={{ background: "var(--ci-bg-wash)", color: "var(--ci-text-muted)", border: "1px solid var(--ci-border)", fontFamily: "monospace" }}
                    >
                      {p.key}
                    </code>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ci-text-muted)" }}>
                      Template Content
                    </p>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={5}
                      className="w-full resize-y rounded-lg px-3 py-2 text-[12px] outline-none v2-input-glow"
                      style={{
                        background: "var(--ci-bg-surface)",
                        color: "var(--ci-text)",
                        border: "1px solid var(--ci-border)",
                        fontFamily: "monospace",
                        lineHeight: 1.6,
                      }}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleCancel}
                      className="rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors hover:bg-black/5"
                      style={{ color: "var(--ci-text-muted)", border: "1px solid var(--ci-border)" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={updatePrompt.isPending}
                      className="rounded-lg px-4 py-1.5 text-[11px] font-bold text-white transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50"
                      style={{ background: "var(--ci-navy)" }}
                    >
                      {updatePrompt.isPending ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                /* ─── View mode ─── */
                <div className="flex items-start gap-3 p-5">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span
                        className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase"
                        style={{
                          background: p.type === "system" ? "#EFF6FF" : "#F0FDF4",
                          color: p.type === "system" ? "#2563EB" : "#16A34A",
                        }}
                      >
                        {p.type}
                      </span>
                      <span className="text-[12px] font-bold" style={{ color: "var(--ci-text)" }}>
                        {formatKey(p.key)}
                      </span>
                    </div>
                    <p
                      className="line-clamp-2 text-[12px] leading-relaxed"
                      style={{ color: "var(--ci-text-muted)" }}
                    >
                      {p.text}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEdit(p)}
                    className="shrink-0 rounded-lg p-2 opacity-0 transition-all group-hover:opacity-100 hover:bg-black/5"
                    style={{ color: "var(--ci-text-muted)" }}
                    title="Edit prompt"
                  >
                    <IconEdit className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Connection Overview (main export)
   ═══════════════════════════════════════════════ */

type OverviewTab = "statistics" | "validated_examples" | "prompt";

const OVERVIEW_TABS: { key: OverviewTab; label: string; icon: React.FC<{ className?: string; style?: React.CSSProperties }> }[] = [
  { key: "statistics", label: "Statistics", icon: IconBarChart },
  { key: "validated_examples", label: "Validated Examples", icon: IconCheckCircle },
  { key: "prompt", label: "Prompt", icon: IconTerminal },
];

export function ConnectionOverview({
  connection,
}: {
  connection: Connection;
}) {
  const [activeTab, setActiveTab] = useState<OverviewTab>("statistics");

  return (
    <div className="flex h-full flex-col v2-fade-up">
      {/* Header */}
      <div
        className="flex shrink-0 items-center gap-4 px-6 py-5"
        style={{ borderBottom: "1px solid var(--ci-border)" }}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "linear-gradient(135deg, #EFF6FF, #F5F3FF)" }}
        >
          <IconDatabase className="h-4.5 w-4.5" style={{ color: "var(--ci-navy)" }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-bold tracking-tight" style={{ color: "var(--ci-text)" }}>
            {connection.name}
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <span
              className="rounded-md px-1.5 py-0.5 text-[9px] font-bold text-white"
              style={{ background: connection.type === "postgresql" ? "#336791" : connection.type === "mysql" ? "#00758F" : "var(--ci-navy)" }}
            >
              {connection.type.toUpperCase()}
            </span>
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: connection.status === "active" ? "#22C55E" : "#EF4444",
                boxShadow: connection.status === "active" ? "0 0 6px #22C55E50" : undefined,
              }}
            />
            <span className="text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
              {connection.status === "active" ? "Connected" : "Error"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex shrink-0 items-center gap-1 px-5 pt-1"
        style={{ borderBottom: "1px solid var(--ci-border)" }}
      >
        {OVERVIEW_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "relative flex items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-[12px] font-semibold transition-all",
                isActive ? "" : "hover:bg-black/[0.03]"
              )}
              style={{
                color: isActive ? "var(--ci-navy)" : "var(--ci-text-muted)",
              }}
            >
              <TabIcon className="h-3.5 w-3.5" />
              {tab.label}
              {isActive && (
                <span
                  className="absolute bottom-0 left-2 right-2 h-[2px] rounded-t-full"
                  style={{ background: "var(--ci-navy)" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto v2-scroll" style={{ background: "var(--ci-bg)" }}>
        {activeTab === "statistics" && <StatisticsTab connectionId={connection.id} />}
        {activeTab === "validated_examples" && <ValidatedExamplesTab connectionId={connection.id} />}
        {activeTab === "prompt" && <PromptsTab connectionId={connection.id} />}
      </div>
    </div>
  );
}
