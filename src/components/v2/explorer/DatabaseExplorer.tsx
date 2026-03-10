"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/constants";
import {
  useConnections,
  useTables,
  useTableSchema,
  useRelationships,
  useRefreshMetadata,
} from "@/lib/v2/queries";
import { useMetadataStore } from "@/stores/v2/metadataStore";
import {
  IconDatabase,
  IconSearch,
  IconTable,
  IconSettings,
  IconChevron,
} from "@/components/v2/ui/Icons";
import { TablePreview } from "@/components/v2/explorer/TablePreview";
import { ConnectionOverview } from "@/components/v2/explorer/ConnectionOverview";
import type {
  Connection,
  TableInfo,
  ColumnInfo,
  ColumnType,
  ForeignKeyInfo,
  TableRelationship,
} from "@/lib/v2/types";

/* ─── colour maps ─── */

const DB_COLORS: Record<string, string> = {
  postgresql: "#336791",
  mysql: "#00758F",
  mssql: "#CC2927",
};

const TYPE_COLORS: Record<ColumnType, { color: string; bg: string }> = {
  string: { color: "#2563EB", bg: "#EFF6FF" },
  integer: { color: "#16A34A", bg: "#F0FDF4" },
  float: { color: "#16A34A", bg: "#F0FDF4" },
  decimal: { color: "#16A34A", bg: "#F0FDF4" },
  boolean: { color: "#D97706", bg: "#FFFBEB" },
  date: { color: "#7C3AED", bg: "#F5F3FF" },
  datetime: { color: "#7C3AED", bg: "#F5F3FF" },
  time: { color: "#7C3AED", bg: "#F5F3FF" },
  json: { color: "#0891B2", bg: "#ECFEFF" },
  binary: { color: "#64748B", bg: "#F1F5F9" },
  uuid: { color: "#6366F1", bg: "#EEF2FF" },
  array: { color: "#0891B2", bg: "#ECFEFF" },
  unknown: { color: "#64748B", bg: "#F1F5F9" },
};

/* ─── helpers ─── */

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

/* ─── small icons for tabs ─── */

function IconColumns({ className, ...props }: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <rect x="2" y="2" width="12" height="12" rx="2" />
      <line x1="2" y1="6" x2="14" y2="6" />
      <line x1="6" y1="6" x2="6" y2="14" />
    </svg>
  );
}

function IconRows({ className, ...props }: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <rect x="2" y="2" width="12" height="12" rx="2" />
      <line x1="2" y1="6" x2="14" y2="6" />
      <line x1="2" y1="10" x2="14" y2="10" />
    </svg>
  );
}

function IconLink({ className, ...props }: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M6.5 9.5a3 3 0 004 .5l2-2a3 3 0 00-4.24-4.24l-1 1" strokeLinecap="round" />
      <path d="M9.5 6.5a3 3 0 00-4-.5l-2 2a3 3 0 004.24 4.24l1-1" strokeLinecap="round" />
    </svg>
  );
}

function IconRefresh({ className, ...props }: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <path d="M2.5 8a5.5 5.5 0 019.28-4" strokeLinecap="round" />
      <path d="M13.5 8a5.5 5.5 0 01-9.28 4" strokeLinecap="round" />
      <path d="M11.5 1.5v3h3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 14.5v-3h-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── skeletons ─── */

function SkeletonLine({ width = "w-full" }: { width?: string }) {
  return (
    <div
      className={cn("h-3 animate-pulse rounded", width)}
      style={{ background: "var(--ci-border)" }}
    />
  );
}

function SkeletonTableItem() {
  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
      <div className="h-4 w-4 animate-pulse rounded" style={{ background: "var(--ci-border)" }} />
      <div className="flex-1 space-y-1.5">
        <SkeletonLine width="w-28" />
        <SkeletonLine width="w-20" />
      </div>
    </div>
  );
}

function SkeletonSchemaRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-3">
      <SkeletonLine width="w-28" />
      <SkeletonLine width="w-16" />
      <SkeletonLine width="w-12" />
    </div>
  );
}

/* ─── tabs ─── */

type DetailTab = "schema" | "sample" | "relationships";

const TABS: { key: DetailTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { key: "schema", label: "Structure", icon: IconColumns },
  { key: "sample", label: "Data Preview", icon: IconRows },
  { key: "relationships", label: "Relations", icon: IconLink },
];

/* ─── Schema Tab ─── */

function SchemaTab({
  connectionId,
  tableName,
}: {
  connectionId: string;
  tableName: string;
}) {
  const { data: schema, isLoading, error } = useTableSchema(connectionId, tableName);

  if (isLoading) {
    return (
      <div className="p-5">
        <div className="space-y-0 overflow-hidden rounded-xl" style={{ border: "1px solid var(--ci-border)" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonSchemaRow key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !schema) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "var(--ci-coral)", opacity: 0.1 }}>
          <IconDatabase className="h-5 w-5" style={{ color: "var(--ci-coral)" }} />
        </div>
        <p className="text-[13px] font-semibold" style={{ color: "var(--ci-text)" }}>
          Failed to load schema
        </p>
        <p className="mt-1 text-[12px]" style={{ color: "var(--ci-text-muted)" }}>
          Please check the connection and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="v2-fade-up p-5 space-y-4">
      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Columns", value: schema.columns.length, color: "var(--ci-navy)" },
          { label: "Rows", value: formatCount(schema.row_count), color: "var(--ci-success)" },
          { label: "Primary Key", value: schema.primary_key.length > 0 ? schema.primary_key.join(", ") : "None", color: "#D97706" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl px-4 py-3"
            style={{ background: "var(--ci-bg-wash)", border: "1px solid var(--ci-border)" }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--ci-text-muted)" }}>
              {stat.label}
            </p>
            <p className="mt-0.5 truncate text-[14px] font-bold" style={{ color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Column table */}
      <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--ci-border)" }}>
        <table className="w-full text-left">
          <thead>
            <tr style={{ background: "var(--ci-bg-wash)" }}>
              <th className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ci-text-muted)", borderBottom: "1px solid var(--ci-border)" }}>
                #
              </th>
              <th className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ci-text-muted)", borderBottom: "1px solid var(--ci-border)" }}>
                Column
              </th>
              <th className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ci-text-muted)", borderBottom: "1px solid var(--ci-border)" }}>
                Type
              </th>
              <th className="px-5 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ci-text-muted)", borderBottom: "1px solid var(--ci-border)" }}>
                Nullable
              </th>
              <th className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ci-text-muted)", borderBottom: "1px solid var(--ci-border)" }}>
                Keys
              </th>
            </tr>
          </thead>
          <tbody>
            {schema.columns.map((col: ColumnInfo, idx: number) => {
              const typeStyle = TYPE_COLORS[col.normalized_type] ?? TYPE_COLORS.unknown;
              return (
                <tr
                  key={col.name}
                  className="group transition-colors hover:bg-black/[0.015]"
                  style={{
                    borderBottom: idx < schema.columns.length - 1 ? "1px solid var(--ci-border)" : undefined,
                  }}
                >
                  <td className="px-5 py-2.5">
                    <span className="text-[11px] tabular-nums" style={{ color: "var(--ci-text-muted)" }}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      {col.is_primary_key && (
                        <svg className="h-3 w-3 shrink-0" viewBox="0 0 16 16" fill="#D97706">
                          <path d="M8 1a4 4 0 00-1.5 7.71V14a.5.5 0 00.5.5h2a.5.5 0 00.5-.5v-1h1a.5.5 0 00.5-.5v-1.5a.5.5 0 00-.5-.5H9.5v-.79A4 4 0 008 1zm0 1.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5z" />
                        </svg>
                      )}
                      {col.is_foreign_key && !col.is_primary_key && (
                        <IconLink className="h-3 w-3 shrink-0" style={{ color: "#2563EB" }} />
                      )}
                      <span className="text-[12px] font-semibold" style={{ color: "var(--ci-text)" }}>
                        {col.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-2.5">
                    <span
                      className="inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: typeStyle.bg, color: typeStyle.color }}
                    >
                      {col.data_type}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-center">
                    {col.nullable ? (
                      <span className="text-[11px]" style={{ color: "var(--ci-text-muted)" }}>YES</span>
                    ) : (
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: "var(--ci-success)" }}>
                        !
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-1.5">
                      {col.is_primary_key && (
                        <span
                          className="rounded-md px-2 py-0.5 text-[9px] font-bold"
                          style={{ background: "#FEF3C7", color: "#92400E" }}
                        >
                          PK
                        </span>
                      )}
                      {col.is_foreign_key && (
                        <span
                          className="rounded-md px-2 py-0.5 text-[9px] font-bold"
                          style={{ background: "#DBEAFE", color: "#1E40AF" }}
                        >
                          FK
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Indexes section */}
      {schema.indexes && schema.indexes.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--ci-text-muted)" }}>
            Indexes
          </p>
          <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--ci-border)" }}>
            {schema.indexes.map((idx: any, i: number) => (
              <div
                key={idx.name}
                className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-black/[0.015]"
                style={{ borderBottom: i < schema.indexes.length - 1 ? "1px solid var(--ci-border)" : undefined }}
              >
                <span className="text-[12px] font-medium" style={{ color: "var(--ci-text)" }}>
                  {idx.name}
                </span>
                <span className="text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                  ({idx.columns.join(", ")})
                </span>
                {idx.is_unique && (
                  <span
                    className="rounded-md px-2 py-0.5 text-[9px] font-bold"
                    style={{ background: "#F0FDF4", color: "#16A34A" }}
                  >
                    UNIQUE
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sample Data Tab ─── */

function SampleDataTab({
  connectionId,
  tableName,
}: {
  connectionId: string;
  tableName: string;
}) {
  return (
    <div className="v2-fade-up p-5">
      <TablePreview connectionId={connectionId} tableName={tableName} />
    </div>
  );
}

/* ─── Relationships Tab ─── */

function RelationshipsTab({
  connectionId,
  tableName,
}: {
  connectionId: string;
  tableName: string;
}) {
  const { data: schema, isLoading: schemaLoading } = useTableSchema(connectionId, tableName);
  const { data: relationships, isLoading: relLoading } = useRelationships(connectionId);

  const isLoading = schemaLoading || relLoading;

  if (isLoading) {
    return (
      <div className="space-y-3 p-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl p-4" style={{ background: "var(--ci-bg-wash)" }}>
            <SkeletonLine width="w-32" />
            <SkeletonLine width="w-8" />
            <SkeletonLine width="w-32" />
          </div>
        ))}
      </div>
    );
  }

  const fks: ForeignKeyInfo[] = schema?.foreign_keys ?? [];
  const tableRelationships: TableRelationship[] = (relationships ?? []).filter(
    (r: TableRelationship) => r.from_table === tableName || r.to_table === tableName
  );

  if (fks.length === 0 && tableRelationships.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 v2-fade-up">
        <div
          className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ background: "var(--ci-bg-wash)" }}
        >
          <IconLink className="h-5 w-5" style={{ color: "var(--ci-text-muted)" }} />
        </div>
        <p className="text-[13px] font-semibold" style={{ color: "var(--ci-text)" }}>
          No relationships found
        </p>
        <p className="mt-1 text-[12px]" style={{ color: "var(--ci-text-muted)" }}>
          This table has no foreign keys or detected relationships.
        </p>
      </div>
    );
  }

  return (
    <div className="v2-fade-up p-5 space-y-5">
      {/* Foreign Keys from schema */}
      {fks.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: "#DBEAFE" }}>
              <IconLink className="h-3 w-3" style={{ color: "#1E40AF" }} />
            </div>
            <p className="text-[12px] font-bold" style={{ color: "var(--ci-text)" }}>
              Foreign Keys
            </p>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "var(--ci-bg-wash)", color: "var(--ci-text-muted)" }}>
              {fks.length}
            </span>
          </div>
          <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--ci-border)" }}>
            {fks.map((fk, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-black/[0.015]"
                style={{ borderBottom: i < fks.length - 1 ? "1px solid var(--ci-border)" : undefined }}
              >
                <span
                  className="rounded-md px-2 py-0.5 text-[9px] font-bold"
                  style={{ background: "#DBEAFE", color: "#1E40AF" }}
                >
                  FK
                </span>
                <span className="text-[12px] font-semibold" style={{ color: "var(--ci-text)" }}>
                  {tableName}.<span style={{ color: "var(--ci-navy)" }}>{fk.column}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="h-px w-4" style={{ background: "var(--ci-border)" }} />
                  <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "var(--ci-text-muted)" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                  <div className="h-px w-4" style={{ background: "var(--ci-border)" }} />
                </div>
                <span className="text-[12px] font-semibold" style={{ color: "var(--ci-text)" }}>
                  {fk.referenced_table}.<span style={{ color: "var(--ci-navy)" }}>{fk.referenced_column}</span>
                </span>
                {fk.constraint_name && (
                  <span className="ml-auto rounded-md px-2 py-0.5 text-[10px]" style={{ background: "var(--ci-bg-wash)", color: "var(--ci-text-muted)" }}>
                    {fk.constraint_name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detected relationships */}
      {tableRelationships.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: "#F0FDF4" }}>
              <IconLink className="h-3 w-3" style={{ color: "#16A34A" }} />
            </div>
            <p className="text-[12px] font-bold" style={{ color: "var(--ci-text)" }}>
              Detected Relationships
            </p>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "var(--ci-bg-wash)", color: "var(--ci-text-muted)" }}>
              {tableRelationships.length}
            </span>
          </div>
          <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--ci-border)" }}>
            {tableRelationships.map((rel, i) => {
              const confidenceColor =
                rel.confidence >= 0.8 ? "#16A34A" : rel.confidence >= 0.5 ? "#D97706" : "#64748B";
              const typeLabel: Record<string, string> = {
                explicit_fk: "Foreign Key",
                inferred: "Inferred",
                possible: "Possible",
              };
              const cardinalityLabel: Record<string, string> = {
                one_to_one: "1 : 1",
                one_to_many: "1 : N",
                many_to_many: "N : N",
              };
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-black/[0.015]"
                  style={{ borderBottom: i < tableRelationships.length - 1 ? "1px solid var(--ci-border)" : undefined }}
                >
                  <span className="text-[12px] font-semibold" style={{ color: "var(--ci-text)" }}>
                    {rel.from_table}.<span style={{ color: "var(--ci-navy)" }}>{rel.from_column}</span>
                  </span>
                  <span
                    className="rounded-lg px-2.5 py-1 text-[10px] font-bold tabular-nums"
                    style={{ background: "var(--ci-bg-wash)", color: "var(--ci-text-secondary)", border: "1px solid var(--ci-border)" }}
                  >
                    {cardinalityLabel[rel.cardinality] ?? rel.cardinality}
                  </span>
                  <span className="text-[12px] font-semibold" style={{ color: "var(--ci-text)" }}>
                    {rel.to_table}.<span style={{ color: "var(--ci-navy)" }}>{rel.to_column}</span>
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                      style={{ background: `${confidenceColor}12`, color: confidenceColor }}
                    >
                      {Math.round(rel.confidence * 100)}%
                    </span>
                    <span
                      className="rounded-md px-2 py-0.5 text-[10px] font-medium"
                      style={{ background: "var(--ci-bg-wash)", color: "var(--ci-text-muted)" }}
                    >
                      {typeLabel[rel.relationship_type] ?? rel.relationship_type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Right Panel: Table Detail ─── */

function TableDetail({
  connectionId,
  tableName,
  table,
  onRefresh,
  isRefreshing,
}: {
  connectionId: string;
  tableName: string;
  table: TableInfo | undefined;
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>("schema");

  return (
    <div className="flex h-full flex-col v2-fade-up">
      {/* Detail header */}
      <div
        className="flex shrink-0 items-center gap-4 px-6 py-5"
        style={{ borderBottom: "1px solid var(--ci-border)" }}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "linear-gradient(135deg, var(--ci-accent-subtle), var(--ci-bg-wash))" }}
        >
          <IconTable className="h-4.5 w-4.5" style={{ color: "var(--ci-navy)" }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-bold tracking-tight" style={{ color: "var(--ci-text)" }}>
            {tableName}
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            {table?.schema_name && (
              <span
                className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                style={{ background: "var(--ci-bg-wash)", color: "var(--ci-text-muted)", border: "1px solid var(--ci-border)" }}
              >
                {table.schema_name}
              </span>
            )}
            {table?.row_count_estimate != null && (
              <span className="text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                ~{formatCount(table.row_count_estimate)} rows
              </span>
            )}
            {table?.size_bytes != null && (
              <>
                <span className="text-[11px]" style={{ color: "var(--ci-border)" }}>&middot;</span>
                <span className="text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                  {formatBytes(table.size_bytes)}
                </span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all hover:bg-black/[0.04] active:scale-[0.97] disabled:opacity-50"
          style={{ color: "var(--ci-text-secondary)", border: "1px solid var(--ci-border)" }}
        >
          <IconRefresh className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Tabs */}
      <div
        className="flex shrink-0 items-center gap-1 px-5 pt-1"
        style={{ borderBottom: "1px solid var(--ci-border)" }}
      >
        {TABS.map((tab) => {
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
        {activeTab === "schema" && (
          <SchemaTab connectionId={connectionId} tableName={tableName} />
        )}
        {activeTab === "sample" && (
          <SampleDataTab connectionId={connectionId} tableName={tableName} />
        )}
        {activeTab === "relationships" && (
          <RelationshipsTab connectionId={connectionId} tableName={tableName} />
        )}
      </div>
    </div>
  );
}

/* ─── Main Component ─── */

export function DatabaseExplorer({ initialConnectionId }: { initialConnectionId?: string } = {}) {
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(initialConnectionId ?? null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const { searchQuery, setSearchQuery } = useMetadataStore();

  const {
    data: connectionsData,
    isLoading: connectionsLoading,
    error: connectionsError,
  } = useConnections();

  const {
    data: tables,
    isLoading: tablesLoading,
    error: tablesError,
  } = useTables(selectedConnectionId);

  const refreshMetadata = useRefreshMetadata();

  const connections: Connection[] = connectionsData?.items ?? [];
  const selectedConnection = connections.find((c) => c.id === selectedConnectionId) ?? null;
  const tableList: TableInfo[] = Array.isArray(tables) ? tables : (tables as any)?.data ?? [];

  const filteredTables = useMemo(() => {
    if (!tableList.length) return [];
    if (!searchQuery.trim()) return tableList;
    return tableList.filter((t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tableList, searchQuery]);

  const selectedTableInfo = tableList.find((t) => t.name === selectedTable);

  const handleSelectConnection = (conn: Connection) => {
    setSelectedConnectionId(conn.id);
    setSelectedTable(null);
    setSearchQuery("");
  };

  const handleSelectTable = (tableName: string) => {
    setSelectedTable(tableName);
  };

  const handleRefresh = () => {
    if (selectedConnectionId) {
      refreshMetadata.mutate({ connectionId: selectedConnectionId });
    }
  };

  /* ─── Empty / error state ─── */
  if (!connectionsLoading && (connectionsError || connections.length === 0)) {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center v2-fade-up"
        style={{ background: "var(--ci-bg)" }}
      >
        <div
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ background: "var(--ci-bg-wash)" }}
        >
          <IconDatabase className="h-6 w-6" style={{ color: "var(--ci-text-muted)" }} />
        </div>
        <p className="text-[14px] font-semibold" style={{ color: "var(--ci-text)" }}>
          No connections configured
        </p>
        <p className="mb-4 text-[12px]" style={{ color: "var(--ci-text-muted)" }}>
          {connectionsError
            ? "Failed to load connections. Please try again."
            : "Add a database connection in settings to get started."}
        </p>
        <Link
          href={ROUTES.V2_SETTINGS}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:shadow-lg active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, var(--ci-navy), #5A6B8A)" }}
        >
          <IconSettings className="h-4 w-4" />
          Go to Settings
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden" style={{ background: "var(--ci-bg)" }}>
      {/* ─── Left Sidebar (260px) ─── */}
      <div
        className="flex w-[260px] shrink-0 flex-col overflow-hidden"
        style={{ borderRight: "1px solid var(--ci-border)", background: "var(--ci-bg-sidebar)" }}
      >
        {/* Connection selector */}
        <div className="shrink-0 px-3 pt-4 pb-2">
          <label
            className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider"
            style={{ color: "var(--ci-text-muted)" }}
          >
            Connection
          </label>
          {connectionsLoading ? (
            <div
              className="h-9 animate-pulse rounded-lg"
              style={{ background: "var(--ci-border)" }}
            />
          ) : (
            <div className="relative">
              <select
                value={selectedConnectionId ?? ""}
                onChange={(e) => {
                  const conn = connections.find((c) => c.id === e.target.value);
                  if (conn) handleSelectConnection(conn);
                }}
                className="w-full appearance-none rounded-lg px-3 py-2 pr-8 text-[12px] font-semibold outline-none transition-all v2-input-glow"
                style={{
                  background: "var(--ci-bg-surface)",
                  border: "1px solid var(--ci-border)",
                  color: selectedConnectionId ? "var(--ci-text)" : "var(--ci-text-muted)",
                }}
              >
                <option value="">Select a database...</option>
                {connections.map((conn) => (
                  <option key={conn.id} value={conn.id}>
                    {conn.name} ({conn.type})
                  </option>
                ))}
              </select>
              <IconChevron
                className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 rotate-90"
                style={{ color: "var(--ci-text-muted)" }}
              />
            </div>
          )}

          {/* Connection status indicator */}
          {selectedConnection && (
            <div className="mt-2 flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background: selectedConnection.status === "active" ? "#22C55E" : "#EF4444",
                  boxShadow: selectedConnection.status === "active" ? "0 0 6px #22C55E50" : "0 0 6px #EF444450",
                }}
              />
              <span className="text-[10px] font-medium" style={{ color: "var(--ci-text-muted)" }}>
                {selectedConnection.status === "active" ? "Connected" : "Error"}
              </span>
              <span
                className="ml-auto rounded-md px-1.5 py-0.5 text-[9px] font-bold text-white"
                style={{ background: DB_COLORS[selectedConnection.type] ?? "var(--ci-navy)" }}
              >
                {selectedConnection.type.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-3 my-1" style={{ borderBottom: "1px solid var(--ci-border)" }} />

        {/* Search tables */}
        {selectedConnectionId && (
          <div className="shrink-0 px-3 py-2">
            <div
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 v2-input-glow"
              style={{
                background: "var(--ci-bg-surface)",
                border: "1px solid var(--ci-border)",
              }}
            >
              <IconSearch className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--ci-text-muted)" }} />
              <input
                type="text"
                placeholder="Search tables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-[var(--ci-text-muted)]"
                style={{ color: "var(--ci-text)" }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] transition-colors hover:bg-black/10"
                  style={{ color: "var(--ci-text-muted)" }}
                >
                  &times;
                </button>
              )}
            </div>
          </div>
        )}

        {/* Dashboard button */}
        {selectedConnectionId && (
          <div className="shrink-0 px-2 pb-1">
            <button
              onClick={() => setSelectedTable(null)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-all",
                !selectedTable ? "v2-sidebar-active shadow-sm" : "hover:bg-black/[0.04]"
              )}
              style={!selectedTable ? { background: "var(--ci-accent-subtle)" } : undefined}
            >
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                style={{ background: !selectedTable ? "var(--ci-navy)" : "var(--ci-bg-wash)" }}
              >
                <IconDatabase
                  className="h-3 w-3"
                  style={{ color: !selectedTable ? "white" : "var(--ci-text-muted)" }}
                />
              </div>
              <span
                className="text-[12px] font-semibold"
                style={{ color: !selectedTable ? "var(--ci-navy)" : "var(--ci-text)" }}
              >
                Dashboard
              </span>
            </button>
          </div>
        )}

        {/* Table list */}
        <div className="flex-1 overflow-y-auto px-2 pb-3 v2-scroll">
          {!selectedConnectionId ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--ci-bg-wash)" }}>
                <IconDatabase className="h-4.5 w-4.5" style={{ color: "var(--ci-text-muted)" }} />
              </div>
              <p className="text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                Select a connection to browse tables
              </p>
            </div>
          ) : tablesLoading ? (
            <div className="space-y-1 pt-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonTableItem key={i} />
              ))}
            </div>
          ) : tablesError ? (
            <div className="py-8 px-3 text-center">
              <p className="text-[11px]" style={{ color: "var(--ci-coral)" }}>
                Failed to load tables
              </p>
            </div>
          ) : filteredTables.length === 0 ? (
            <div className="py-8 px-3 text-center">
              <p className="text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                {searchQuery ? "No tables match your search" : "No tables found"}
              </p>
            </div>
          ) : (
            <div className="space-y-0.5 pt-1">
              {filteredTables.map((table: TableInfo) => {
                const isSelected = selectedTable === table.name;
                return (
                  <button
                    key={table.name}
                    onClick={() => handleSelectTable(table.name)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-all",
                      isSelected ? "v2-sidebar-active shadow-sm" : "hover:bg-black/[0.04]"
                    )}
                    style={isSelected ? { background: "var(--ci-accent-subtle)", border: "1px solid var(--ci-navy)20" } : undefined}
                  >
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: isSelected ? "var(--ci-navy)" : "var(--ci-bg-wash)",
                      }}
                    >
                      <IconTable
                        className="h-3 w-3"
                        style={{ color: isSelected ? "white" : "var(--ci-text-muted)" }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-[12px] font-semibold"
                        style={{ color: isSelected ? "var(--ci-navy)" : "var(--ci-text)" }}
                      >
                        {table.name}
                      </p>
                      <div className="flex items-center gap-1.5">
                        {table.row_count_estimate != null && (
                          <span className="text-[10px]" style={{ color: "var(--ci-text-muted)" }}>
                            {formatCount(table.row_count_estimate)} rows
                          </span>
                        )}
                        {table.size_bytes != null && (
                          <>
                            <span className="text-[8px]" style={{ color: "var(--ci-border)" }}>&bull;</span>
                            <span className="text-[10px]" style={{ color: "var(--ci-text-muted)" }}>
                              {formatBytes(table.size_bytes)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Table count footer */}
        {selectedConnectionId && !tablesLoading && !tablesError && tableList.length > 0 && (
          <div
            className="shrink-0 px-3 py-2 text-center"
            style={{ borderTop: "1px solid var(--ci-border)" }}
          >
            <span className="text-[10px] font-medium" style={{ color: "var(--ci-text-muted)" }}>
              {filteredTables.length === tableList.length
                ? `${tableList.length} tables`
                : `${filteredTables.length} of ${tableList.length} tables`}
            </span>
          </div>
        )}
      </div>

      {/* ─── Right Area: Table Details or Connection Overview ─── */}
      <div className="flex flex-1 flex-col overflow-hidden" style={{ background: "var(--ci-bg-surface)" }}>
        {selectedTable && selectedConnectionId ? (
          <TableDetail
            key={`${selectedConnectionId}-${selectedTable}`}
            connectionId={selectedConnectionId}
            tableName={selectedTable}
            table={selectedTableInfo}
            onRefresh={handleRefresh}
            isRefreshing={refreshMetadata.isPending}
          />
        ) : selectedConnectionId && selectedConnection ? (
          <ConnectionOverview
            key={selectedConnectionId}
            connection={selectedConnection}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center v2-fade-up">
            <div
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: "var(--ci-bg-wash)" }}
            >
              <IconDatabase className="h-7 w-7" style={{ color: "var(--ci-text-muted)" }} />
            </div>
            <p className="text-[15px] font-semibold" style={{ color: "var(--ci-text)" }}>
              Select a connection
            </p>
            <p className="mt-1 text-[12px]" style={{ color: "var(--ci-text-muted)" }}>
              Choose a database connection from the dropdown to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
