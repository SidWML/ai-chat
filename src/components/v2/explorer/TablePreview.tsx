"use client";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table";
import { useSampleData, useTableSchema } from "@/lib/v2/queries";
import type { ColumnType } from "@/lib/v2/types";

interface TablePreviewProps {
  connectionId: string;
  tableName: string;
}

const TYPE_INDICATOR_COLORS: Record<ColumnType, { color: string; label: string; bg: string }> = {
  string: { color: "#2563EB", label: "text", bg: "#EFF6FF" },
  integer: { color: "#16A34A", label: "int", bg: "#F0FDF4" },
  float: { color: "#16A34A", label: "float", bg: "#F0FDF4" },
  decimal: { color: "#16A34A", label: "dec", bg: "#F0FDF4" },
  boolean: { color: "#D97706", label: "bool", bg: "#FFFBEB" },
  date: { color: "#7C3AED", label: "date", bg: "#F5F3FF" },
  datetime: { color: "#7C3AED", label: "datetime", bg: "#F5F3FF" },
  time: { color: "#7C3AED", label: "time", bg: "#F5F3FF" },
  json: { color: "#0891B2", label: "json", bg: "#ECFEFF" },
  binary: { color: "#64748B", label: "binary", bg: "#F1F5F9" },
  uuid: { color: "#6366F1", label: "uuid", bg: "#EEF2FF" },
  array: { color: "#0891B2", label: "array", bg: "#ECFEFF" },
  unknown: { color: "#64748B", label: "other", bg: "#F1F5F9" },
};

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-2.5">
          <div
            className="h-3 animate-pulse rounded"
            style={{
              background: "var(--ci-border)",
              width: `${60 + (i % 3) * 20}px`,
            }}
          />
        </td>
      ))}
    </tr>
  );
}

function CellValue({
  value,
  normalizedType,
}: {
  value: unknown;
  normalizedType: ColumnType;
}) {
  if (value === null || value === undefined) {
    return (
      <span
        className="rounded px-1.5 py-0.5 text-[10px] font-medium italic"
        style={{ background: "var(--ci-bg-wash)", color: "var(--ci-text-muted)" }}
      >
        NULL
      </span>
    );
  }

  if (normalizedType === "boolean") {
    const isTrue = String(value) === "true";
    return (
      <span
        className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold"
        style={{
          background: isTrue ? "#F0FDF4" : "#FFF1F2",
          color: isTrue ? "#16A34A" : "#EF4444",
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: isTrue ? "#16A34A" : "#EF4444" }} />
        {String(value)}
      </span>
    );
  }

  if (normalizedType === "integer" || normalizedType === "float" || normalizedType === "decimal") {
    return (
      <span className="tabular-nums" style={{ color: "var(--ci-text)" }}>
        {typeof value === "number" ? value.toLocaleString() : String(value)}
      </span>
    );
  }

  if (normalizedType === "datetime" || normalizedType === "date") {
    return (
      <span style={{ color: "#7C3AED" }}>
        {String(value)}
      </span>
    );
  }

  return <span style={{ color: "var(--ci-text)" }}>{String(value)}</span>;
}

export function TablePreview({ connectionId, tableName }: TablePreviewProps) {
  const {
    data: sampleData,
    isLoading: sampleLoading,
    error: sampleError,
  } = useSampleData(connectionId, tableName, 10);

  const {
    data: schema,
    isLoading: schemaLoading,
  } = useTableSchema(connectionId, tableName);

  const isLoading = sampleLoading || schemaLoading;

  // Build a map of column name -> normalized type from schema
  const columnTypeMap: Record<string, ColumnType> = useMemo(() => {
    const map: Record<string, ColumnType> = {};
    if (schema?.columns) {
      for (const col of schema.columns) {
        map[col.name] = col.normalized_type;
      }
    }
    return map;
  }, [schema]);

  // Build tanstack columns
  const columns: ColumnDef<Record<string, unknown>, unknown>[] = useMemo(() => {
    if (!sampleData?.columns) return [];
    const helper = createColumnHelper<Record<string, unknown>>();
    return sampleData.columns.map((colName: string) => {
      const normalizedType = columnTypeMap[colName] ?? "unknown";
      const indicator = TYPE_INDICATOR_COLORS[normalizedType];
      return helper.accessor((row) => row[colName], {
        id: colName,
        header: () => (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold" style={{ color: "var(--ci-text-secondary)" }}>
              {colName}
            </span>
            <span
              className="rounded px-1.5 py-0.5 text-[8px] font-bold uppercase"
              style={{ background: indicator.bg, color: indicator.color }}
            >
              {indicator.label}
            </span>
          </div>
        ),
        cell: (info) => (
          <CellValue value={info.getValue()} normalizedType={normalizedType} />
        ),
      });
    });
  }, [sampleData?.columns, columnTypeMap]);

  const data = useMemo(() => sampleData?.data ?? [], [sampleData?.data]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  /* ─── Loading state ─── */
  if (isLoading) {
    return (
      <div className="v2-fade-up">
        <div className="overflow-hidden rounded-xl" style={{ border: "1px solid var(--ci-border)" }}>
          <table className="w-full text-left">
            <thead>
              <tr style={{ background: "var(--ci-bg-wash)" }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <th key={i} className="px-4 py-3" style={{ borderBottom: "1px solid var(--ci-border)" }}>
                    <div className="h-3 w-16 animate-pulse rounded" style={{ background: "var(--ci-border)" }} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} cols={5} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  /* ─── Error state ─── */
  if (sampleError || !sampleData) {
    return (
      <div className="v2-fade-up">
        <div
          className="flex flex-col items-center justify-center rounded-xl py-16"
          style={{ border: "1px solid var(--ci-border)", background: "var(--ci-bg-surface)" }}
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#FFF1F2" }}>
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="#EF4444">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM7.25 5a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zM8 10a.75.75 0 100 1.5.75.75 0 000-1.5z" />
            </svg>
          </div>
          <p className="text-[13px] font-semibold" style={{ color: "var(--ci-text)" }}>
            Failed to load sample data
          </p>
          <p className="mt-1 text-[12px]" style={{ color: "var(--ci-text-muted)" }}>
            The query may have failed or the table may be empty.
          </p>
        </div>
      </div>
    );
  }

  /* ─── Data state ─── */
  return (
    <div className="v2-fade-up space-y-3">
      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-semibold" style={{ color: "var(--ci-text)" }}>
            {sampleData.columns.length} columns
          </span>
          <span className="text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
            Showing {data.length} of {sampleData.total_rows.toLocaleString()} rows
          </span>
        </div>
      </div>

      {/* Data grid */}
      <div
        className="overflow-x-auto rounded-xl"
        style={{ border: "1px solid var(--ci-border)" }}
      >
        <table className="w-full text-left">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                style={{ background: "var(--ci-bg-wash)" }}
              >
                {/* Row number header */}
                <th
                  className="whitespace-nowrap px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: "var(--ci-text-muted)", borderBottom: "1px solid var(--ci-border)", width: "40px" }}
                >
                  #
                </th>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="whitespace-nowrap px-4 py-3"
                    style={{ borderBottom: "1px solid var(--ci-border)" }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-10 text-center text-[12px]"
                  style={{ color: "var(--ci-text-muted)" }}
                >
                  No data available
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, ri) => (
                <tr
                  key={row.id}
                  className="group transition-colors hover:bg-[var(--ci-accent-subtle)]"
                  style={
                    ri < table.getRowModel().rows.length - 1
                      ? { borderBottom: "1px solid var(--ci-border)" }
                      : {}
                  }
                >
                  {/* Row number */}
                  <td
                    className="px-3 py-2.5 text-center text-[10px] tabular-nums"
                    style={{ color: "var(--ci-text-muted)", background: "var(--ci-bg-wash)" }}
                  >
                    {ri + 1}
                  </td>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="whitespace-nowrap px-4 py-2.5 text-[12px]"
                      style={{ color: "var(--ci-text)", background: "var(--ci-bg-surface)" }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
