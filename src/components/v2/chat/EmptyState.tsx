"use client";

import { APP_NAME } from "@/lib/constants";
import { IconDatabase, IconTable, IconMap, IconCollection } from "@/components/v2/ui/Icons";

const suggestions = [
  { icon: IconDatabase, color: "var(--ci-navy)", bg: "#EEF2FF", label: "Query a database", text: "Show me the top 10 customers by revenue" },
  { icon: IconTable, color: "#16A34A", bg: "#F0FDF4", label: "Analyze data", text: "Compare monthly sales across all regions" },
  { icon: IconMap, color: "#D97706", bg: "#FFFBEB", label: "Visualize locations", text: "Map all warehouse locations with inventory levels" },
  { icon: IconCollection, color: "var(--ci-coral)", bg: "#FFF1F2", label: "Cross-database", text: "Join customer data with order history" },
];

interface EmptyStateProps {
  onSuggestion?: (text: string) => void;
}

export function EmptyState({ onSuggestion }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 v2-fade-up pt-20">
      {/* Logo */}
      <div className="mb-6">
        <img src="/logo.svg" alt={APP_NAME} className="h-10" style={{ objectFit: "contain" }} />
      </div>

      <h1 className="mb-2 text-2xl font-bold v2-gradient-text">Welcome to {APP_NAME}</h1>
      <p className="mb-8 max-w-md text-center text-[13px] leading-relaxed" style={{ color: "var(--ci-text-muted)" }}>
        Ask anything about your databases in natural language. I&apos;ll find the right data source and get you answers instantly.
      </p>

      {/* Suggestion cards */}
      <div className="grid w-full max-w-lg grid-cols-2 gap-3">
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => onSuggestion?.(s.text)}
            className="group flex flex-col items-start gap-2 rounded-xl p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
            style={{ background: "var(--ci-bg-surface)", border: "1px solid var(--ci-border)", boxShadow: "var(--ci-shadow-sm)" }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg transition-transform group-hover:scale-110" style={{ background: s.bg }}>
              <s.icon className="h-4 w-4" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[12px] font-semibold" style={{ color: "var(--ci-text)" }}>{s.label}</p>
              <p className="text-[11px] leading-snug" style={{ color: "var(--ci-text-muted)" }}>{s.text}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
