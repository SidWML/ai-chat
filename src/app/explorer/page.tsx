"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MOCK_DATABASES } from "@/lib/mock-data";
import { MOCK_TABLES, MOCK_SUGGESTIONS, TableInfo } from "@/lib/mock-features";
import {
  IconArrowLeft,
  IconDatabase,
  IconTable,
  IconChevron,
  IconChat,
} from "@/components/v2/ui/Icons";

export default function ExplorerPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center" style={{ background: "var(--ci-bg)" }} />}>
      <ExplorerContent />
    </Suspense>
  );
}

function ExplorerContent() {
  const searchParams = useSearchParams();
  const dbParam = searchParams.get("db");

  // If a specific DB is passed, scope to that DB only
  const scopedDatabases = dbParam
    ? MOCK_DATABASES.filter((db) => db.id === dbParam)
    : MOCK_DATABASES;

  const initialDbId = dbParam || "db-1";
  const initialTables = MOCK_TABLES[initialDbId] || [];

  const [selectedDbId, setSelectedDbId] = useState<string>(initialDbId);
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(
    initialTables[0] ?? null
  );
  const [activeTab, setActiveTab] = useState<"structure" | "sample" | "relationships">("structure");
  const [expandedDbs, setExpandedDbs] = useState<Set<string>>(new Set([initialDbId]));

  const toggleDb = (dbId: string) => {
    setExpandedDbs((prev) => {
      const next = new Set(prev);
      if (next.has(dbId)) next.delete(dbId);
      else next.add(dbId);
      return next;
    });
  };

  const selectTable = (dbId: string, table: TableInfo) => {
    setSelectedDbId(dbId);
    setSelectedTable(table);
    setActiveTab("structure");
  };

  const tabs = [
    { key: "structure" as const, label: "Structure" },
    { key: "sample" as const, label: "Sample Data" },
    { key: "relationships" as const, label: "Relationships" },
  ];

  const currentDb = MOCK_DATABASES.find((db) => db.id === selectedDbId);

  return (
    <div
      className="ci-fade-in"
      style={{
        minHeight: "100vh",
        background: "var(--ci-bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        className="flex shrink-0 items-center justify-between"
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--ci-border)",
          background: "var(--ci-bg-surface)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/settings"
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            style={{ color: "var(--ci-text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ci-bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <IconArrowLeft className="h-4 w-4" />
          </Link>
          <div style={{ width: 1, height: 20, background: "var(--ci-border)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IconDatabase className="h-5 w-5" style={{ color: "var(--ci-navy)" }} />
            <h1 style={{ fontSize: 16, fontWeight: 700, color: "var(--ci-text)", margin: 0 }}>
              Database Explorer
            </h1>
            {dbParam && currentDb && (
              <>
                <span style={{ color: "var(--ci-text-muted)", fontSize: 14 }}>/</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ci-navy)" }}>
                  {currentDb.name}
                </span>
              </>
            )}
          </div>
        </div>
        <Link
          href="/chat"
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors"
          style={{ color: "var(--ci-text-secondary)", textDecoration: "none" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ci-bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <IconChat className="h-4 w-4" />
          Back to Chat
        </Link>
      </header>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <aside
          className="ci-scrollbar"
          style={{
            width: 260,
            borderRight: "1px solid var(--ci-border)",
            background: "var(--ci-bg-sidebar)",
            overflowY: "auto",
            padding: "12px 0",
          }}
        >
          <div style={{ padding: "0 16px 12px", fontSize: 10, fontWeight: 600, color: "var(--ci-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {dbParam ? "Database" : "Databases"}
          </div>
          {scopedDatabases.map((db) => {
            const tables = MOCK_TABLES[db.id] || [];
            const isExpanded = expandedDbs.has(db.id);
            return (
              <div key={db.id} className="ci-fade-up" style={{ animationDelay: "0.05s" }}>
                <button
                  onClick={() => toggleDb(db.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 16px",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--ci-text)",
                    textAlign: "left",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ci-bg-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <IconChevron
                    className="h-3 w-3"
                    style={{
                      color: "var(--ci-text-tertiary)",
                      transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  />
                  <IconDatabase className="h-4 w-4" style={{ color: "var(--ci-navy)" }} />
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {db.name}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      padding: "1px 6px",
                      borderRadius: 10,
                      background: db.status === "connected" ? "var(--ci-success-bg)" : "var(--ci-error-bg)",
                      color: db.status === "connected" ? "var(--ci-success)" : "var(--ci-error)",
                      fontWeight: 500,
                    }}
                  >
                    {db.status === "connected" ? "on" : "off"}
                  </span>
                </button>
                {isExpanded && tables.length > 0 && (
                  <div style={{ paddingLeft: 24 }}>
                    {tables.map((table) => {
                      const isSelected = selectedTable?.name === table.name && selectedDbId === db.id;
                      return (
                        <button
                          key={table.name}
                          onClick={() => selectTable(db.id, table)}
                          className={isSelected ? "ci-sidebar-active" : ""}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "6px 16px",
                            border: "none",
                            background: isSelected ? "var(--ci-accent-subtle)" : "transparent",
                            cursor: "pointer",
                            fontSize: 12,
                            color: isSelected ? "var(--ci-navy)" : "var(--ci-text-secondary)",
                            fontWeight: isSelected ? 600 : 400,
                            textAlign: "left",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.background = "var(--ci-bg-hover)";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <IconTable className="h-3.5 w-3.5" />
                          <span>{table.name}</span>
                          <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--ci-text-muted)" }}>
                            {table.rowCount.toLocaleString()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {isExpanded && tables.length === 0 && (
                  <div style={{ padding: "6px 16px 6px 48px", fontSize: 12, color: "var(--ci-text-muted)", fontStyle: "italic" }}>
                    No tables introspected
                  </div>
                )}
              </div>
            );
          })}
        </aside>

        {/* Main content */}
        <main className="ci-scrollbar" style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {selectedTable ? (
            <div className="ci-fade-up">
              {/* Table header */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <IconTable className="h-5 w-5" style={{ color: "var(--ci-navy)" }} />
                  <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--ci-text)", margin: 0 }}>
                    {selectedTable.schema}.{selectedTable.name}
                  </h2>
                </div>
                <p style={{ fontSize: 13, color: "var(--ci-text-tertiary)", margin: 0 }}>
                  {selectedTable.rowCount.toLocaleString()} rows &middot; {selectedTable.columns.length} columns
                </p>
              </div>

              {/* Tabs */}
              <div
                style={{
                  display: "flex",
                  gap: 0,
                  borderBottom: "1px solid var(--ci-border)",
                  marginBottom: 20,
                }}
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      padding: "10px 20px",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: activeTab === tab.key ? 600 : 400,
                      color: activeTab === tab.key ? "var(--ci-navy)" : "var(--ci-text-secondary)",
                      borderBottom: activeTab === tab.key ? "2px solid var(--ci-navy)" : "2px solid transparent",
                      transition: "all 0.15s",
                      marginBottom: -1,
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {activeTab === "structure" && (
                <div
                  className="ci-fade-in"
                  style={{
                    background: "var(--ci-bg-surface)",
                    borderRadius: "var(--ci-radius-md)",
                    border: "1px solid var(--ci-border)",
                    overflow: "hidden",
                    boxShadow: "var(--ci-shadow-sm)",
                  }}
                >
                  {/* Stats row */}
                  <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--ci-border)" }}>
                    {[
                      { label: "Columns", value: selectedTable.columns.length, color: "var(--ci-navy)" },
                      { label: "Rows", value: selectedTable.rowCount.toLocaleString(), color: "var(--ci-success)" },
                      { label: "Primary Keys", value: selectedTable.columns.filter((c) => c.isPrimaryKey).length || "None", color: "#D97706" },
                    ].map((stat) => (
                      <div key={stat.label} style={{ flex: 1, padding: "12px 16px", borderRight: "1px solid var(--ci-border)" }}>
                        <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ci-text-muted)", margin: 0 }}>{stat.label}</p>
                        <p style={{ fontSize: 16, fontWeight: 700, color: stat.color, margin: "4px 0 0" }}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "var(--ci-bg-wash)" }}>
                        <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "var(--ci-text-secondary)", borderBottom: "1px solid var(--ci-border)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>#</th>
                        <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "var(--ci-text-secondary)", borderBottom: "1px solid var(--ci-border)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Column</th>
                        <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "var(--ci-text-secondary)", borderBottom: "1px solid var(--ci-border)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Type</th>
                        <th style={{ padding: "10px 16px", textAlign: "center", fontWeight: 600, color: "var(--ci-text-secondary)", borderBottom: "1px solid var(--ci-border)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Nullable</th>
                        <th style={{ padding: "10px 16px", textAlign: "center", fontWeight: 600, color: "var(--ci-text-secondary)", borderBottom: "1px solid var(--ci-border)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Keys</th>
                        <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "var(--ci-text-secondary)", borderBottom: "1px solid var(--ci-border)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Default</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTable.columns.map((col, i) => (
                        <tr
                          key={col.name}
                          style={{
                            borderBottom: i < selectedTable.columns.length - 1 ? "1px solid var(--ci-border)" : "none",
                            transition: "background 0.1s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ci-bg-hover)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <td style={{ padding: "10px 16px", color: "var(--ci-text-muted)", fontSize: 11 }}>{i + 1}</td>
                          <td style={{ padding: "10px 16px", fontWeight: 500, color: "var(--ci-text)" }}>{col.name}</td>
                          <td style={{ padding: "10px 16px" }}>
                            <code
                              style={{
                                fontSize: 11,
                                padding: "2px 8px",
                                borderRadius: "var(--ci-radius-sm)",
                                background: "var(--ci-accent-subtle)",
                                color: "var(--ci-accent-vivid)",
                                fontFamily: "var(--font-geist-mono), monospace",
                              }}
                            >
                              {col.type}
                            </code>
                          </td>
                          <td style={{ padding: "10px 16px", textAlign: "center", color: col.nullable ? "var(--ci-warning)" : "var(--ci-text-muted)" }}>
                            {col.nullable ? "YES" : "--"}
                          </td>
                          <td style={{ padding: "10px 16px", textAlign: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                              {col.isPrimaryKey && (
                                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: "var(--ci-coral-subtle)", color: "var(--ci-coral)" }}>
                                  PK
                                </span>
                              )}
                              {col.isForeignKey && (
                                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: "rgba(79, 93, 138, 0.1)", color: "var(--ci-accent-vivid)" }}>
                                  FK
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: "10px 16px", color: "var(--ci-text-tertiary)", fontSize: 12, fontFamily: "var(--font-geist-mono), monospace" }}>
                            {col.defaultValue || "--"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "sample" && (
                <div
                  className="ci-fade-in"
                  style={{
                    background: "var(--ci-bg-surface)",
                    borderRadius: "var(--ci-radius-md)",
                    border: "1px solid var(--ci-border)",
                    padding: 40,
                    textAlign: "center",
                    boxShadow: "var(--ci-shadow-sm)",
                  }}
                >
                  <IconTable className="h-10 w-10" style={{ color: "var(--ci-text-muted)", margin: "0 auto 12px" }} />
                  <p style={{ fontSize: 14, color: "var(--ci-text-secondary)", margin: 0 }}>
                    Sample data preview coming soon.
                  </p>
                  <p style={{ fontSize: 12, color: "var(--ci-text-muted)", marginTop: 4 }}>
                    Run a query in the chat to explore data from this table.
                  </p>
                </div>
              )}

              {activeTab === "relationships" && (
                <div
                  className="ci-fade-in"
                  style={{
                    background: "var(--ci-bg-surface)",
                    borderRadius: "var(--ci-radius-md)",
                    border: "1px solid var(--ci-border)",
                    padding: 40,
                    textAlign: "center",
                    boxShadow: "var(--ci-shadow-sm)",
                  }}
                >
                  <IconDatabase className="h-10 w-10" style={{ color: "var(--ci-text-muted)", margin: "0 auto 12px" }} />
                  <p style={{ fontSize: 14, color: "var(--ci-text-secondary)", margin: 0 }}>
                    Relationship diagram coming soon.
                  </p>
                  <p style={{ fontSize: 12, color: "var(--ci-text-muted)", marginTop: 4 }}>
                    Foreign key relationships will be visualized here.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* ── Database Overview Dashboard ── */
            (() => {
              const db = MOCK_DATABASES.find((d) => d.id === selectedDbId);
              const tables = MOCK_TABLES[selectedDbId] || [];
              const totalColumns = tables.reduce((sum, t) => sum + t.columns.length, 0);
              const totalRows = tables.reduce((sum, t) => sum + t.rowCount, 0);
              const pkCount = tables.reduce((sum, t) => sum + t.columns.filter((c) => c.isPrimaryKey).length, 0);
              const fkCount = tables.reduce((sum, t) => sum + t.columns.filter((c) => c.isForeignKey).length, 0);
              const dbSuggestions = MOCK_SUGGESTIONS.filter((s) => s.databaseId === selectedDbId);

              // Column type distribution
              const typeDist: Record<string, number> = {};
              for (const t of tables) {
                for (const c of t.columns) {
                  const base = c.type.toLowerCase().replace(/\(.*\)/, "").trim();
                  typeDist[base] = (typeDist[base] || 0) + 1;
                }
              }
              const typeEntries = Object.entries(typeDist).sort(([, a], [, b]) => b - a);
              const maxTypeCount = typeEntries.length > 0 ? typeEntries[0][1] : 1;

              const TYPE_COLORS: Record<string, string> = {
                uuid: "#6366F1", varchar: "#2563EB", text: "#2563EB", integer: "#16A34A",
                int: "#16A34A", bigint: "#16A34A", serial: "#16A34A", decimal: "#D97706",
                numeric: "#D97706", boolean: "#EA580C", timestamp: "#7C3AED", date: "#7C3AED",
                jsonb: "#0891B2", json: "#0891B2",
              };

              return (
                <div className="ci-fade-up">
                  {/* DB Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--ci-accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <IconDatabase className="h-5 w-5" style={{ color: "var(--ci-navy)" }} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--ci-text)", margin: 0 }}>
                        {db?.name || "Database"}
                      </h2>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "var(--ci-accent-subtle)", color: "var(--ci-navy)", fontWeight: 600, textTransform: "uppercase" }}>
                          {db?.type || "DB"}
                        </span>
                        {db && (
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: db.status === "connected" ? "var(--ci-success)" : "var(--ci-error)" }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: db.status === "connected" ? "var(--ci-success)" : "var(--ci-error)" }} />
                            {db.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stat Cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
                    {[
                      { label: "Tables", value: tables.length, color: "#2563EB", bg: "#EFF6FF" },
                      { label: "Columns", value: totalColumns, color: "#059669", bg: "#ECFDF5" },
                      { label: "Total Rows", value: totalRows >= 1000 ? `${(totalRows / 1000).toFixed(1)}K` : totalRows, color: "#7C3AED", bg: "#F5F3FF" },
                      { label: "Keys", value: `${pkCount} PK / ${fkCount} FK`, color: "#D97706", bg: "#FFFBEB" },
                    ].map((stat) => (
                      <div key={stat.label} style={{ padding: "14px 16px", borderRadius: 12, background: "var(--ci-bg-surface)", border: "1px solid var(--ci-border)" }}>
                        <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ci-text-muted)", margin: 0 }}>{stat.label}</p>
                        <p style={{ fontSize: 20, fontWeight: 700, color: stat.color, margin: "6px 0 0" }}>{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                    {/* Column Type Distribution */}
                    <div style={{ padding: 20, borderRadius: 12, background: "var(--ci-bg-surface)", border: "1px solid var(--ci-border)" }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ci-text)", margin: "0 0 16px" }}>Column Type Distribution</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {typeEntries.map(([type, count]) => {
                          const color = TYPE_COLORS[type] || "#64748B";
                          const pct = totalColumns > 0 ? Math.round((count / totalColumns) * 100) : 0;
                          return (
                            <div key={type}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ci-text)", textTransform: "capitalize" }}>{type}</span>
                                <span style={{ fontSize: 11, color: "var(--ci-text-muted)" }}>{count} ({pct}%)</span>
                              </div>
                              <div style={{ height: 6, borderRadius: 9999, background: "var(--ci-bg-wash)", overflow: "hidden" }}>
                                <div style={{ height: "100%", borderRadius: 9999, width: `${(count / maxTypeCount) * 100}%`, background: color, opacity: 0.7 }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tables Overview */}
                    <div style={{ padding: 20, borderRadius: 12, background: "var(--ci-bg-surface)", border: "1px solid var(--ci-border)" }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ci-text)", margin: "0 0 16px" }}>Tables by Size</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {[...tables].sort((a, b) => b.rowCount - a.rowCount).map((t, i) => (
                          <button
                            key={t.name}
                            onClick={() => selectTable(selectedDbId, t)}
                            style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", background: "transparent", border: "none", cursor: "pointer", width: "100%", textAlign: "left" }}
                          >
                            <span style={{ width: 20, height: 20, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, background: i === 0 ? "#EFF6FF" : "var(--ci-bg-wash)", color: i === 0 ? "#2563EB" : "var(--ci-text-muted)" }}>{i + 1}</span>
                            <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: "var(--ci-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</span>
                            <span style={{ fontSize: 11, color: "var(--ci-text-muted)" }}>{t.rowCount.toLocaleString()} rows</span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ci-navy)" }}>{t.columns.length} cols</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Query Suggestions */}
                  {dbSuggestions.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ci-text)", margin: "0 0 12px" }}>Query Suggestions</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {dbSuggestions.slice(0, 4).map((s) => (
                          <div key={s.id} style={{ padding: "14px 16px", borderRadius: 12, background: "var(--ci-bg-surface)", border: "1px solid var(--ci-border)", cursor: "default" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                              <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 10, background: "var(--ci-accent-subtle)", color: "var(--ci-navy)", textTransform: "capitalize" }}>{s.category}</span>
                            </div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ci-text)", margin: 0 }}>{s.title}</p>
                            <p style={{ fontSize: 11, color: "var(--ci-text-muted)", margin: "4px 0 0" }}>{s.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </main>
      </div>
    </div>
  );
}
