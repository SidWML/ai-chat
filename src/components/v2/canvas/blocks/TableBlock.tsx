"use client";

import { useState, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { cn } from "@/lib/cn";

/* ── Inline types ─────────────────────────────────────────────── */

interface TableData {
  columns: string[];
  rows: Record<string, unknown>[];
}

interface TableBlockProps {
  title: string;
  data?: unknown;
}

/* ── Column-type detection ────────────────────────────────────── */

type ColType = "number" | "date" | "percentage" | "text";

function detectColType(rows: Record<string, unknown>[], key: string): ColType {
  // Sample up to 20 non-null values
  const samples: string[] = [];
  for (const row of rows) {
    if (samples.length >= 20) break;
    const v = row[key];
    if (v != null && String(v).trim() !== "") samples.push(String(v).trim());
  }
  if (samples.length === 0) return "text";

  const pctRe = /^-?\d[\d,.]*\s*%$/;
  const numRe = /^-?\d[\d,.]*$/;
  const dateRe =
    /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$|^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$|^\w+ \d{1,2},?\s*\d{4}$/;

  let pct = 0;
  let num = 0;
  let date = 0;
  for (const s of samples) {
    if (pctRe.test(s)) pct++;
    else if (numRe.test(s)) num++;
    else if (dateRe.test(s) || (!isNaN(Date.parse(s)) && /\d{4}/.test(s)))
      date++;
  }

  const threshold = samples.length * 0.6;
  if (pct >= threshold) return "percentage";
  if (num >= threshold) return "number";
  if (date >= threshold) return "date";
  return "text";
}

const TYPE_BADGE: Record<ColType, { label: string; bg: string; fg: string }> = {
  number: { label: "#", bg: "rgba(60,76,115,0.10)", fg: "var(--ci-accent)" },
  date: { label: "DATE", bg: "rgba(207,56,77,0.10)", fg: "var(--ci-coral)" },
  percentage: { label: "%", bg: "rgba(60,76,115,0.10)", fg: "var(--ci-accent)" },
  text: { label: "Abc", bg: "rgba(0,0,0,0.05)", fg: "var(--ci-text-muted)" },
};

/* ── CSV export ───────────────────────────────────────────────── */

function escapeCsvField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function exportToCsv(
  columns: string[],
  rows: Record<string, unknown>[],
  filename: string
) {
  const header = columns.map(escapeCsvField).join(",");
  const body = rows
    .map((row) =>
      columns.map((col) => escapeCsvField(String(row[col] ?? ""))).join(",")
    )
    .join("\n");
  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Sort chevron icon ────────────────────────────────────────── */

function SortIcon({ direction }: { direction: "asc" | "desc" | false }) {
  if (!direction) {
    return (
      <svg
        className="h-2.5 w-2.5 opacity-30"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4" />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 15l4 4 4-4"
        />
      </svg>
    );
  }

  return (
    <svg
      className={cn("h-2.5 w-2.5", direction === "desc" && "rotate-180")}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  );
}

/* ── Main component ───────────────────────────────────────────── */

const ROWS_PER_PAGE = 10;

export function TableBlock({ block }: { block: TableBlockProps }) {
  const raw = (block.data as any) ?? { columns: [], rows: [] };
  // Normalize columns: accept string[] or {key, label}[]
  const normalizedColumns: string[] = Array.isArray(raw.columns)
    ? raw.columns.map((c: any) => (typeof c === "string" ? c : c.key || c.label || String(c)))
    : [];
  const tableData: TableData = { columns: normalizedColumns, rows: raw.rows ?? [] };
  const { columns: colKeys, rows: rawRows } = tableData;

  /* State */
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  /* Detect column types once */
  const colTypes = useMemo<Record<string, ColType>>(() => {
    const map: Record<string, ColType> = {};
    for (const key of colKeys) {
      map[key] = detectColType(rawRows, key);
    }
    return map;
  }, [colKeys, rawRows]);

  /* Build column definitions */
  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(
    () =>
      colKeys.map((key) => ({
        id: key,
        accessorFn: (row: Record<string, unknown>) => row[key],
        header: key,
        cell: (info) => {
          const val = info.getValue();
          return val != null ? String(val) : "\u2014";
        },
        sortingFn:
          colTypes[key] === "number" || colTypes[key] === "percentage"
            ? "alphanumeric"
            : "auto",
      })),
    [colKeys, colTypes]
  );

  /* React-Table instance */
  const table = useReactTable({
    data: rawRows,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: ROWS_PER_PAGE },
    },
  });

  const handleExport = useCallback(() => {
    const filteredRows = table.getFilteredRowModel().rows.map((r) => r.original);
    const filename = (block.title || "table-export").replace(/\s+/g, "_");
    exportToCsv(colKeys, filteredRows, filename);
  }, [table, colKeys, block.title]);

  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const totalFiltered = table.getFilteredRowModel().rows.length;

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        background: "var(--ci-bg-surface)",
        boxShadow: "var(--ci-shadow-sm)",
        border: "1px solid var(--ci-border)",
      }}
    >
      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5"
        style={{
          background: "var(--ci-bg-wash)",
          borderBottom: "1px solid var(--ci-border)",
        }}
      >
        {/* Search input */}
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
            style={{ color: "var(--ci-text-muted)" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search all columns..."
            className="rounded-md py-1.5 pl-8 pr-3 text-[11px] outline-none transition-colors focus:ring-1"
            style={{
              color: "var(--ci-text)",
              background: "var(--ci-bg-surface)",
              border: "1px solid var(--ci-border)",
              width: 200,
            }}
          />
        </div>

        {/* Export button */}
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium transition-opacity hover:opacity-80"
          style={{
            color: "#fff",
            background: "var(--ci-accent)",
          }}
        >
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
            />
          </svg>
          Export CSV
        </button>
      </div>

      {/* ── Table ────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  const colType = colTypes[header.id] ?? "text";
                  const badge = TYPE_BADGE[colType];

                  return (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="cursor-pointer select-none whitespace-nowrap px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide transition-colors"
                      style={{
                        color: "var(--ci-text-tertiary)",
                        background: "var(--ci-bg-wash)",
                        borderBottom: "2px solid var(--ci-border)",
                      }}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {/* Type badge */}
                        <span
                          className="rounded px-1 py-px text-[9px] font-semibold leading-none"
                          style={{
                            background: badge.bg,
                            color: badge.fg,
                          }}
                        >
                          {badge.label}
                        </span>
                        {/* Sort indicator */}
                        <SortIcon direction={sorted} />
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row, i) => (
              <tr
                key={row.id}
                className="transition-colors"
                style={{
                  background:
                    i % 2 === 1
                      ? "var(--ci-bg-wash)"
                      : "var(--ci-bg-surface)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(60,76,115,0.06)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    i % 2 === 1
                      ? "var(--ci-bg-wash)"
                      : "var(--ci-bg-surface)")
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="whitespace-nowrap px-4 py-2"
                    style={{
                      color: "var(--ci-text-secondary)",
                      borderBottom: "1px solid var(--ci-border)",
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}

            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td
                  colSpan={colKeys.length}
                  className="px-4 py-8 text-center text-[12px]"
                  style={{ color: "var(--ci-text-muted)" }}
                >
                  No matching rows
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          background: "var(--ci-bg-wash)",
          borderTop: "1px solid var(--ci-border)",
        }}
      >
        {/* Row count */}
        <span
          className="text-[10px] font-medium"
          style={{ color: "var(--ci-text-muted)" }}
        >
          {totalFiltered}
          {totalFiltered !== rawRows.length
            ? ` of ${rawRows.length}`
            : ""}{" "}
          rows
        </span>

        {/* Pagination */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded px-2 py-1 text-[11px] font-medium transition-colors disabled:opacity-40"
            style={{
              color: "var(--ci-accent)",
              background: !table.getCanPreviousPage()
                ? "transparent"
                : "var(--ci-bg-surface)",
              border: "1px solid var(--ci-border)",
            }}
          >
            Previous
          </button>
          <span
            className="text-[11px]"
            style={{ color: "var(--ci-text-secondary)" }}
          >
            Page {pageIndex + 1} of {pageCount}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded px-2 py-1 text-[11px] font-medium transition-colors disabled:opacity-40"
            style={{
              color: "var(--ci-accent)",
              background: !table.getCanNextPage()
                ? "transparent"
                : "var(--ci-bg-surface)",
              border: "1px solid var(--ci-border)",
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
