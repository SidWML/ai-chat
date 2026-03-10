"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_SUGGESTIONS, QuerySuggestion } from "@/lib/mock-features";
import { MOCK_DATABASES } from "@/lib/mock-data";
import { ROUTES } from "@/lib/constants";
import { IconArrowLeft, IconChat } from "@/components/v2/ui/Icons";

type CategoryFilter = "all" | "table" | "chart" | "map" | "analysis";

const CATEGORY_TABS: { key: CategoryFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "table", label: "Table" },
  { key: "chart", label: "Chart" },
  { key: "map", label: "Map" },
  { key: "analysis", label: "Analysis" },
];

const CATEGORY_STYLES: Record<string, { color: string; bg: string }> = {
  table: { color: "#2563EB", bg: "rgba(37, 99, 235, 0.1)" },
  chart: { color: "#7C3AED", bg: "rgba(124, 58, 237, 0.1)" },
  map: { color: "#059669", bg: "rgba(5, 150, 105, 0.1)" },
  analysis: { color: "#D97706", bg: "rgba(217, 119, 6, 0.1)" },
};

function CategoryIcon({ category, size = 18 }: { category: string; size?: number }) {
  const color = CATEGORY_STYLES[category]?.color ?? "var(--ci-text-muted)";

  switch (category) {
    case "table":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="3" y1="15" x2="21" y2="15" />
          <line x1="9" y1="3" x2="9" y2="21" />
        </svg>
      );
    case "chart":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="12" width="4" height="9" rx="1" />
          <rect x="10" y="7" width="4" height="14" rx="1" />
          <rect x="17" y="3" width="4" height="18" rx="1" />
        </svg>
      );
    case "map":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
      );
    case "analysis":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          <path d="M18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456L18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.456-2.456L14.25 6l1.035-.259a3.375 3.375 0 0 0 2.456-2.456L18 2.25Z" />
        </svg>
      );
    default:
      return null;
  }
}

function getDatabaseName(databaseId: string): string {
  const db = MOCK_DATABASES.find((d) => d.id === databaseId);
  return db?.name ?? databaseId;
}

export default function V2SuggestionsPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");

  const filteredSuggestions =
    activeCategory === "all"
      ? MOCK_SUGGESTIONS
      : MOCK_SUGGESTIONS.filter((s) => s.category === activeCategory);

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--ci-bg)" }}>
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between px-8 py-4"
        style={{
          borderBottom: "1px solid var(--ci-border)",
          background: "var(--ci-bg-surface)",
        }}
      >
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.V2_CHAT}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
            style={{ color: "var(--ci-text-muted)" }}
          >
            <IconArrowLeft className="h-4 w-4" />
          </Link>
          <h1
            className="text-[16px] font-bold"
            style={{ color: "var(--ci-text)" }}
          >
            Query Suggestions
          </h1>
        </div>
        <Link
          href={ROUTES.V2_CHAT}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-black/5"
          style={{ color: "var(--ci-text-secondary)" }}
        >
          <IconChat className="h-4 w-4" />
          Back to Chat
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 py-8">
        <div className="mx-auto w-full max-w-5xl">
          {/* Page intro */}
          <div className="v2-fade-up mb-6">
            <p
              className="text-[15px] font-bold"
              style={{ color: "var(--ci-text)" }}
            >
              Explore Suggestions
            </p>
            <p
              className="mt-0.5 text-[12px]"
              style={{ color: "var(--ci-text-muted)" }}
            >
              Pre-built queries to help you get started. Click any suggestion to
              open it in chat.
            </p>
          </div>

          {/* Category filter tabs */}
          <div
            className="v2-fade-up mb-6 flex gap-1 rounded-xl p-1"
            style={{ background: "var(--ci-bg-wash)", animationDelay: "60ms" }}
          >
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key)}
                className="flex-1 rounded-lg py-2 text-[12px] font-semibold transition-all"
                style={
                  activeCategory === tab.key
                    ? {
                        background: "var(--ci-bg-surface)",
                        color: "var(--ci-navy)",
                        boxShadow: "var(--ci-shadow-sm)",
                      }
                    : { color: "var(--ci-text-muted)" }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Suggestion cards grid */}
          {filteredSuggestions.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSuggestions.map((suggestion, i) => {
                const style = CATEGORY_STYLES[suggestion.category] ?? CATEGORY_STYLES.table;

                return (
                  <div
                    key={suggestion.id}
                    className="v2-fade-up flex flex-col rounded-2xl p-5 transition-all hover:shadow-md"
                    style={{
                      background: "var(--ci-bg-surface)",
                      border: "1px solid var(--ci-border)",
                      animationDelay: `${(i + 2) * 60}ms`,
                    }}
                  >
                    {/* Category icon */}
                    <div className="mb-3 flex items-start justify-between">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ background: style.bg }}
                      >
                        <CategoryIcon category={suggestion.category} size={20} />
                      </div>
                      <span
                        className="rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                        style={{ background: style.bg, color: style.color }}
                      >
                        {suggestion.category}
                      </span>
                    </div>

                    {/* Title */}
                    <p
                      className="text-[13px] font-bold leading-snug"
                      style={{ color: "var(--ci-text)" }}
                    >
                      {suggestion.title}
                    </p>

                    {/* Description */}
                    <p
                      className="mt-1 flex-1 text-[12px] leading-relaxed"
                      style={{ color: "var(--ci-text-muted)" }}
                    >
                      {suggestion.description}
                    </p>

                    {/* Database name */}
                    <div
                      className="mt-3 flex items-center gap-1.5 text-[11px]"
                      style={{ color: "var(--ci-text-muted)" }}
                    >
                      <svg
                        width={12}
                        height={12}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <ellipse cx="12" cy="5" rx="9" ry="3" />
                        <path d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5" />
                        <path d="M3 12c0 1.657 4.03 3 9 3s9-1.343 9-3" />
                      </svg>
                      <span>{getDatabaseName(suggestion.databaseId)}</span>
                    </div>

                    {/* Use Query button */}
                    <Link
                      href={ROUTES.V2_CHAT}
                      className="mt-4 flex items-center justify-center gap-2 rounded-xl py-2.5 text-[12px] font-semibold transition-all hover:shadow-sm active:scale-[0.98]"
                      style={{
                        background: "var(--ci-bg-wash)",
                        border: "1px solid var(--ci-border)",
                        color: "var(--ci-navy)",
                      }}
                    >
                      <IconChat className="h-3.5 w-3.5" />
                      Use Query
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty state */
            <div
              className="v2-fade-in rounded-2xl p-10 text-center"
              style={{
                background: "var(--ci-bg-surface)",
                border: "2px dashed var(--ci-border)",
              }}
            >
              <div
                className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ background: "var(--ci-bg-wash)" }}
              >
                <svg
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--ci-text-muted)"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <p
                className="text-[14px] font-semibold"
                style={{ color: "var(--ci-text)" }}
              >
                No suggestions found
              </p>
              <p
                className="mt-1 text-[12px]"
                style={{ color: "var(--ci-text-muted)" }}
              >
                Try selecting a different category filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
