"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { QueryResult } from "@/lib/types";
import { IconTable } from "@/components/v2/ui/Icons";

export function TablePart({ data }: { data: QueryResult }) {
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const handleSort = (c: string) => { if (sortCol === c) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortCol(c); setSortDir("asc"); } };
  const rows = [...data.rows].sort((a, b) => { if (!sortCol) return 0; const r = String(a[sortCol] ?? "").localeCompare(String(b[sortCol] ?? ""), undefined, { numeric: true }); return sortDir === "asc" ? r : -r; });

  return (
    <div className="my-3 overflow-hidden rounded-xl v2-fade-up" style={{ border: "1px solid var(--ci-border)", boxShadow: "var(--ci-shadow-sm)" }}>
      <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: "var(--ci-bg-wash)", borderBottom: "1px solid var(--ci-border)" }}>
        <IconTable className="h-3.5 w-3.5" style={{ color: "var(--ci-navy)" }} />
        <span className="text-[11px] font-semibold" style={{ color: "var(--ci-text-secondary)" }}>Query Results</span>
        <span className="ml-auto text-[10px] font-medium" style={{ color: "var(--ci-text-muted)" }}>{data.rowCount} rows</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead><tr>
            {data.columns.map(col => (
              <th key={col} onClick={() => handleSort(col)} className="cursor-pointer whitespace-nowrap px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide transition-colors hover:text-zinc-900" style={{ color: "var(--ci-text-tertiary)", background: "var(--ci-bg-surface)", borderBottom: "2px solid var(--ci-border)" }}>
                <span className="inline-flex items-center gap-1">{col}{sortCol === col && <svg className={cn("h-2.5 w-2.5", sortDir === "desc" && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>}</span>
              </th>
            ))}
          </tr></thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="transition-colors hover:bg-blue-50/30">
                {data.columns.map(col => <td key={col} className="whitespace-nowrap px-4 py-2" style={{ color: "var(--ci-text-secondary)", borderBottom: "1px solid var(--ci-border)" }}>{String(row[col] ?? "\u2014")}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
