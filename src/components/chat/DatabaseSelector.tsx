"use client";

import { useState, useRef, useEffect } from "react";
import { MOCK_DATABASES, MOCK_COLLECTIONS } from "@/lib/mock-data";
import { cn } from "@/lib/cn";

interface DatabaseSelectorProps {
  value: string;
  onChange: (id: string) => void;
}

export function DatabaseSelector({ value, onChange }: DatabaseSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected =
    value === "auto"
      ? { label: "Auto", sub: "AI picks the best source" }
      : MOCK_DATABASES.find((db) => db.id === value)
        ? { label: MOCK_DATABASES.find((db) => db.id === value)!.name, sub: "Database" }
        : { label: MOCK_COLLECTIONS.find((c) => c.id === value)?.name ?? "Auto", sub: "Collection" };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
          value === "auto"
            ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            : "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
        )}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
        {selected.label}
        <svg className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-1 w-64 rounded-xl border border-zinc-200 bg-white py-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
          <button
            onClick={() => { onChange("auto"); setIsOpen(false); }}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800",
              value === "auto" && "bg-zinc-50 dark:bg-zinc-800"
            )}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-blue-500 to-violet-500 text-[9px] font-bold text-white">AI</span>
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">Auto</p>
              <p className="text-[11px] text-zinc-400">AI picks the best data source</p>
            </div>
          </button>

          <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
          <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Databases</p>
          {MOCK_DATABASES.filter((db) => db.status === "connected").map((db) => (
            <button
              key={db.id}
              onClick={() => { onChange(db.id); setIsOpen(false); }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800",
                value === db.id && "bg-zinc-50 dark:bg-zinc-800"
              )}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold text-zinc-500 ring-1 ring-zinc-200 dark:ring-zinc-700">
                {db.type.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{db.name}</p>
                <p className="text-[11px] text-zinc-400">{db.type}</p>
              </div>
            </button>
          ))}

          {MOCK_COLLECTIONS.length > 0 && (
            <>
              <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Collections</p>
              {MOCK_COLLECTIONS.map((col) => (
                <button
                  key={col.id}
                  onClick={() => { onChange(col.id); setIsOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800",
                    value === col.id && "bg-zinc-50 dark:bg-zinc-800"
                  )}
                >
                  <svg className="h-5 w-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{col.name}</p>
                    <p className="text-[11px] text-zinc-400">{col.databaseIds.length} databases</p>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
