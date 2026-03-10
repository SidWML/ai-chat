"use client";

import { MOCK_DATABASES, MOCK_COLLECTIONS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/Badge";
import type { DatabaseStatus } from "@/lib/types";

const statusVariant: Record<DatabaseStatus, "success" | "error" | "warning"> = {
  connected: "success",
  disconnected: "error",
  error: "warning",
};

const dbTypeIcons: Record<string, string> = {
  postgresql: "PG",
  mysql: "My",
  mongodb: "Mo",
  sqlite: "SL",
  other: "DB",
};

export function DatabaseBrowser() {
  return (
    <div className="space-y-1">
      {MOCK_DATABASES.map((db) => (
        <div
          key={db.id}
          className="group flex cursor-pointer items-center gap-2 px-4 py-1.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold text-zinc-500 ring-1 ring-zinc-200 dark:ring-zinc-700">
            {dbTypeIcons[db.type]}
          </span>
          <span className="flex-1 truncate text-sm text-zinc-700 dark:text-zinc-300">
            {db.name}
          </span>
          <Badge variant={statusVariant[db.status]} dot className="text-[9px]">
            {db.status === "connected" ? "on" : "off"}
          </Badge>
        </div>
      ))}

      {MOCK_COLLECTIONS.length > 0 && (
        <div className="mt-2 border-t border-zinc-100 pt-2 dark:border-zinc-800">
          <p className="px-4 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
            Collections
          </p>
          {MOCK_COLLECTIONS.map((col) => (
            <div
              key={col.id}
              className="group flex cursor-pointer items-center gap-2 px-4 py-1.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <svg className="h-4 w-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="flex-1 truncate text-sm text-zinc-700 dark:text-zinc-300">
                {col.name}
              </span>
              <span className="text-[10px] text-zinc-400">{col.databaseIds.length} DBs</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
