"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { V3Sidebar } from "@/components/v3/V3Sidebar";
import { MOCK_SUGGESTIONS, QuerySuggestion } from "@/lib/mock-features";
import { MOCK_DATABASES } from "@/lib/mock-data";
import { IconSearch, IconTable, IconChart, IconSparkles, IconPanelLeft } from "@/components/v2/ui/Icons";

type Category = "all" | "table" | "chart" | "map" | "analysis";

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "all", label: "All" },
  { key: "table", label: "Table" },
  { key: "chart", label: "Chart" },
  { key: "map", label: "Map" },
  { key: "analysis", label: "Analysis" },
];

const CATEGORY_BADGE: Record<QuerySuggestion["category"], { bg: string; color: string }> = {
  table: { bg: "rgba(52, 211, 153, 0.12)", color: "#34D399" },
  chart: { bg: "rgba(251, 191, 36, 0.12)", color: "#FBBF24" },
  map: { bg: "rgba(59, 130, 246, 0.12)", color: "#60A5FA" },
  analysis: { bg: "rgba(168, 85, 247, 0.12)", color: "#A855F7" },
};

function getDatabaseName(databaseId: string): string {
  const db = MOCK_DATABASES.find((d) => d.id === databaseId);
  return db?.name ?? "Unknown";
}

export default function V3SuggestionsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const filtered =
    activeCategory === "all"
      ? MOCK_SUGGESTIONS
      : MOCK_SUGGESTIONS.filter((s) => s.category === activeCategory);

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--v3-bg)" }}>
      <V3Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 24px", borderBottom: "1px solid var(--v3-border)", flexShrink: 0 }}>
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ padding: 8, borderRadius: 8, border: "none", background: "transparent", color: "var(--v3-text-muted)", cursor: "pointer", display: "flex" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--v3-bg-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <IconPanelLeft className="h-4 w-4" />
            </button>
          )}
          <IconSparkles className="h-4.5 w-4.5" style={{ color: "var(--v3-accent)" }} />
          <h1 style={{ fontSize: 16, fontWeight: 600, color: "var(--v3-text)", margin: 0, letterSpacing: "-0.02em" }}>
            Query Suggestions
          </h1>
          <span style={{ fontSize: 12, color: "var(--v3-text-muted)", marginLeft: 4 }}>
            Pre-built queries to explore your data
          </span>
        </div>

        <div className="v3-scroll" style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            {/* Category filter pills */}
            <div
              className="v3-fade-up"
              style={{
                display: "flex", gap: 6, marginBottom: 24,
                padding: 4, borderRadius: 12,
                background: "var(--v3-bg-surface)",
                border: "1px solid var(--v3-border)",
                width: "fit-content",
              }}
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  style={{
                    padding: "8px 16px", borderRadius: 8, border: "none",
                    background: activeCategory === cat.key ? "var(--v3-accent)" : "transparent",
                    color: activeCategory === cat.key ? "#fff" : "var(--v3-text-muted)",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (activeCategory !== cat.key) {
                      e.currentTarget.style.background = "var(--v3-bg-hover)";
                      e.currentTarget.style.color = "var(--v3-text-secondary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeCategory !== cat.key) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--v3-text-muted)";
                    }
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Suggestions grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {filtered.map((suggestion, i) => {
                const badge = CATEGORY_BADGE[suggestion.category];
                return (
                  <div
                    key={suggestion.id}
                    className="v3-fade-up"
                    style={{
                      animationDelay: `${i * 0.05}s`,
                      background: "var(--v3-bg-surface)",
                      border: "1px solid var(--v3-border)",
                      borderRadius: 16, padding: 22,
                      boxShadow: "var(--v3-shadow-sm)",
                      display: "flex", flexDirection: "column",
                      transition: "border-color 0.15s, box-shadow 0.15s, transform 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--v3-border-hover)";
                      e.currentTarget.style.boxShadow = "var(--v3-shadow-md)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--v3-border)";
                      e.currentTarget.style.boxShadow = "var(--v3-shadow-sm)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Category badge */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <span
                        style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          padding: "4px 10px", borderRadius: 6,
                          fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
                          background: badge.bg, color: badge.color,
                        }}
                      >
                        {suggestion.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--v3-text)", margin: "0 0 6px", lineHeight: 1.4, letterSpacing: "-0.01em" }}>
                      {suggestion.title}
                    </h3>

                    {/* Description */}
                    <p style={{ fontSize: 13, color: "var(--v3-text-secondary)", margin: "0 0 18px", lineHeight: 1.5, flex: 1 }}>
                      {suggestion.description}
                    </p>

                    {/* Footer */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 14, borderTop: "1px solid var(--v3-border)" }}>
                      <span style={{ fontSize: 11, color: "var(--v3-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {getDatabaseName(suggestion.databaseId)}
                      </span>
                      <button
                        onClick={() => router.push("/v3/chat")}
                        style={{
                          padding: "7px 14px", borderRadius: 8, border: "none",
                          background: "var(--v3-accent)", color: "#fff",
                          fontSize: 12, fontWeight: 600, cursor: "pointer",
                          whiteSpace: "nowrap", transition: "opacity 0.15s, transform 0.1s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                        onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.97)"; }}
                        onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                      >
                        Use Query
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {filtered.length === 0 && (
              <div
                className="v3-fade-in"
                style={{
                  textAlign: "center", padding: "60px 20px", borderRadius: 16,
                  background: "var(--v3-bg-surface)", border: "1px solid var(--v3-border)",
                  marginTop: 8,
                }}
              >
                <IconSearch className="h-8 w-8" style={{ color: "var(--v3-text-dimmed)", margin: "0 auto 12px", display: "block" }} />
                <p style={{ fontSize: 14, fontWeight: 500, color: "var(--v3-text-secondary)", margin: 0 }}>
                  No suggestions found
                </p>
                <p style={{ fontSize: 12, color: "var(--v3-text-muted)", margin: "4px 0 0" }}>
                  No suggestions found for this category.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
