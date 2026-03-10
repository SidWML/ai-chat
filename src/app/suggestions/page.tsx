"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MOCK_SUGGESTIONS, QuerySuggestion } from "@/lib/mock-features";
import { MOCK_DATABASES } from "@/lib/mock-data";
import { IconArrowLeft } from "@/components/v2/ui/Icons";

type Category = "all" | "table" | "chart" | "map" | "analysis";

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "all", label: "All" },
  { key: "table", label: "Table" },
  { key: "chart", label: "Chart" },
  { key: "map", label: "Map" },
  { key: "analysis", label: "Analysis" },
];

function CategoryIcon({ category, size = 20 }: { category: QuerySuggestion["category"]; size?: number }) {
  const s = size;
  switch (category) {
    case "table":
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="16" height="14" rx="2" />
          <line x1="2" y1="7" x2="18" y2="7" />
          <line x1="2" y1="11" x2="18" y2="11" />
          <line x1="7" y1="7" x2="7" y2="17" />
          <line x1="13" y1="7" x2="13" y2="17" />
        </svg>
      );
    case "chart":
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="10" width="3" height="7" rx="0.5" />
          <rect x="7" y="6" width="3" height="11" rx="0.5" />
          <rect x="12" y="3" width="3" height="14" rx="0.5" />
          <line x1="1" y1="18" x2="19" y2="18" />
        </svg>
      );
    case "map":
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 11a3 3 0 100-6 3 3 0 000 6z" />
          <path d="M10 18s-6-4.35-6-10a6 6 0 1112 0c0 5.65-6 10-6 10z" />
        </svg>
      );
    case "analysis":
      return (
        <svg width={s} height={s} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="2,14 6,9 10,12 14,5 18,8" />
          <line x1="1" y1="18" x2="19" y2="18" />
        </svg>
      );
  }
}

function getDatabaseName(databaseId: string): string {
  const db = MOCK_DATABASES.find((d) => d.id === databaseId);
  return db?.name ?? "Unknown";
}

export default function SuggestionsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const router = useRouter();

  const filtered =
    activeCategory === "all"
      ? MOCK_SUGGESTIONS
      : MOCK_SUGGESTIONS.filter((s) => s.category === activeCategory);

  return (
    <div
      className="ci-fade-in"
      style={{ minHeight: "100vh", background: "var(--ci-bg)" }}
    >
      {/* Header */}
      <header
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--ci-border)",
          background: "var(--ci-bg-surface)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Link
          href="/chat"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "var(--ci-text-secondary)",
            textDecoration: "none",
            fontSize: 14,
            borderRadius: "var(--ci-radius-sm)",
            padding: "6px 10px",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ci-bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <IconArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div style={{ width: 1, height: 20, background: "var(--ci-border)" }} />
        <h1
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "var(--ci-text)",
            margin: 0,
          }}
        >
          Query Suggestions
        </h1>
      </header>

      {/* Content */}
      <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
        {/* Category filter tabs */}
        <div
          className="ci-fade-up"
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 24,
            padding: 4,
            background: "var(--ci-bg-surface)",
            borderRadius: "var(--ci-radius-md)",
            border: "1px solid var(--ci-border)",
            width: "fit-content",
          }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              style={{
                padding: "7px 16px",
                border: "none",
                borderRadius: "var(--ci-radius-sm)",
                background:
                  activeCategory === cat.key
                    ? "var(--ci-navy)"
                    : "transparent",
                color:
                  activeCategory === cat.key
                    ? "#fff"
                    : "var(--ci-text-secondary)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (activeCategory !== cat.key) {
                  e.currentTarget.style.background = "var(--ci-bg-hover)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== cat.key) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Suggestions grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {filtered.map((suggestion, i) => (
            <div
              key={suggestion.id}
              className="ci-fade-up"
              style={{
                animationDelay: `${i * 0.05}s`,
                background: "var(--ci-bg-surface)",
                border: "1px solid var(--ci-border)",
                borderRadius: "var(--ci-radius-md)",
                padding: 20,
                boxShadow: "var(--ci-shadow-sm)",
                display: "flex",
                flexDirection: "column",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--ci-border-hover)";
                e.currentTarget.style.boxShadow = "var(--ci-shadow-md)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--ci-border)";
                e.currentTarget.style.boxShadow = "var(--ci-shadow-sm)";
              }}
            >
              {/* Icon + category badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "var(--ci-radius-sm)",
                    background: "var(--ci-accent-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--ci-navy)",
                    flexShrink: 0,
                  }}
                >
                  <CategoryIcon category={suggestion.category} />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--ci-text-tertiary)",
                  }}
                >
                  {suggestion.category}
                </span>
              </div>

              {/* Title */}
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--ci-text)",
                  margin: "0 0 6px",
                  lineHeight: 1.4,
                }}
              >
                {suggestion.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontSize: 13,
                  color: "var(--ci-text-secondary)",
                  margin: "0 0 16px",
                  lineHeight: 1.5,
                  flex: 1,
                }}
              >
                {suggestion.description}
              </p>

              {/* Footer: database + action */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--ci-text-tertiary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {getDatabaseName(suggestion.databaseId)}
                </span>
                <button
                  onClick={() => router.push("/chat")}
                  style={{
                    padding: "6px 14px",
                    border: "none",
                    borderRadius: "var(--ci-radius-sm)",
                    background: "var(--ci-coral)",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Use this query
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div
            className="ci-fade-in"
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "var(--ci-text-muted)",
              fontSize: 14,
            }}
          >
            No suggestions found for this category.
          </div>
        )}
      </div>
    </div>
  );
}
