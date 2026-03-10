"use client";

import { useState } from "react";
import type { QueryResult } from "@/lib/types";
import { cn } from "@/lib/cn";

interface TablePartProps {
  data: QueryResult;
}

export function TablePart({ data }: TablePartProps) {
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const sortedRows = [...data.rows].sort((a, b) => {
    if (!sortCol) return 0;
    const aVal = String(a[sortCol] ?? "");
    const bVal = String(b[sortCol] ?? "");
    const cmp = aVal.localeCompare(bVal, undefined, { numeric: true });
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <div className="my-2 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
              {data.columns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="cursor-pointer whitespace-nowrap px-4 py-2.5 font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  <span className="inline-flex items-center gap-1">
                    {col}
                    {sortCol === col && (
                      <svg className={cn("h-3 w-3", sortDir === "desc" && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, i) => (
              <tr key={i} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                {data.columns.map((col) => (
                  <td key={col} className="whitespace-nowrap px-4 py-2 text-zinc-700 dark:text-zinc-300">
                    {String(row[col] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-2 text-xs text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/50">
        {data.rowCount} rows
      </div>
    </div>
  );
}
