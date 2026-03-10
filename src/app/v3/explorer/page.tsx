"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MOCK_DATABASES } from "@/lib/mock-data";
import { MOCK_TABLES, TableInfo } from "@/lib/mock-features";
import { V3Sidebar } from "@/components/v3/V3Sidebar";
import {
  IconArrowLeft,
  IconDatabase,
  IconTable,
  IconSearch,
  IconChevron,
  IconCheck,
  IconX,
  IconPanelLeft,
} from "@/components/v2/ui/Icons";

function ExplorerContent() {
  const searchParams = useSearchParams();
  const connectionParam = searchParams.get("connection");
  const scopedDatabases = connectionParam
    ? MOCK_DATABASES.filter((db) => db.id === connectionParam)
    : MOCK_DATABASES;
  const currentDb = connectionParam ? MOCK_DATABASES.find((db) => db.id === connectionParam) : null;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedDbId, setSelectedDbId] = useState<string>(connectionParam || "db-1");
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);
  const [expandedDbs, setExpandedDbs] = useState<Set<string>>(
    new Set([connectionParam || "db-1"])
  );
  const [searchQuery, setSearchQuery] = useState("");

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
  };

  const filteredDatabases = scopedDatabases.filter((db) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (db.name.toLowerCase().includes(q)) return true;
    const tables = MOCK_TABLES[db.id] || [];
    return tables.some((t) => t.name.toLowerCase().includes(q));
  });

  return (
    <div
      className="v3-root"
      style={{
        display: "flex",
        height: "100vh",
        background: "var(--v3-bg)",
        color: "var(--v3-text)",
        overflow: "hidden",
      }}
    >
      <V3Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onClose={() => setSidebarOpen(false)}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 24px",
            borderBottom: "1px solid var(--v3-border)",
            background: "var(--v3-bg-surface)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "1px solid var(--v3-border)",
                  background: "transparent",
                  cursor: "pointer",
                  color: "var(--v3-text-secondary)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--v3-bg-hover)";
                  e.currentTarget.style.borderColor = "var(--v3-border-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "var(--v3-border)";
                }}
              >
                <IconPanelLeft className="h-4 w-4" />
              </button>
            )}
            {connectionParam && (
              <>
                <Link
                  href="/v3/settings"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    color: "var(--v3-text-muted)",
                    textDecoration: "none",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--v3-bg-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <IconArrowLeft className="h-4 w-4" />
                </Link>
                <div style={{ width: 1, height: 20, background: "var(--v3-border)" }} />
              </>
            )}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "var(--v3-accent-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconDatabase
                className="h-4.5 w-4.5"
                style={{ color: "var(--v3-accent)" }}
              />
            </div>
            <div>
              <h1
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--v3-text)",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                Database Explorer
                {currentDb && (
                  <span style={{ color: "var(--v3-text-muted)", fontWeight: 400 }}> / <span style={{ color: "var(--v3-accent)", fontWeight: 600 }}>{currentDb.name}</span></span>
                )}
              </h1>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--v3-text-muted)",
                  margin: 0,
                }}
              >
                {currentDb ? `Inspect tables and columns for ${currentDb.name}` : "Browse and inspect your database structures"}
              </p>
            </div>
          </div>
        </header>

        {/* Body: Two panel layout */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left Panel - Database Tree */}
          <aside
            style={{
              width: 280,
              borderRight: "1px solid var(--v3-border)",
              background: "var(--v3-bg-surface)",
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {/* Search */}
            <div style={{ padding: "16px 16px 12px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--v3-border)",
                  background: "var(--v3-bg-input)",
                  transition: "border-color 0.2s ease",
                }}
              >
                <IconSearch
                  className="h-3.5 w-3.5"
                  style={{ color: "var(--v3-text-muted)", flexShrink: 0 }}
                />
                <input
                  type="text"
                  placeholder="Search tables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    fontSize: 12,
                    color: "var(--v3-text)",
                    fontFamily: "inherit",
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--v3-text-muted)",
                      padding: 0,
                      display: "flex",
                    }}
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Database label */}
            <div
              style={{
                padding: "0 16px 8px",
                fontSize: 10,
                fontWeight: 600,
                color: "var(--v3-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Databases
            </div>

            {/* Tree */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                paddingBottom: 16,
              }}
            >
              {filteredDatabases.map((db) => {
                const tables = MOCK_TABLES[db.id] || [];
                const isExpanded = expandedDbs.has(db.id);
                const filteredTables = searchQuery
                  ? tables.filter((t) =>
                      t.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                  : tables;

                return (
                  <div key={db.id} className="v3-fade-up">
                    {/* Database row */}
                    <button
                      onClick={() => toggleDb(db.id)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "9px 16px",
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--v3-text)",
                        textAlign: "left",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "var(--v3-bg-hover)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <IconChevron
                        className="h-3 w-3"
                        style={{
                          color: "var(--v3-text-muted)",
                          transform: isExpanded
                            ? "rotate(90deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                          flexShrink: 0,
                        }}
                      />
                      <IconDatabase
                        className="h-4 w-4"
                        style={{
                          color: "var(--v3-accent)",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {db.name}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          padding: "2px 7px",
                          borderRadius: 10,
                          background:
                            db.status === "connected"
                              ? "rgba(52, 211, 153, 0.1)"
                              : "rgba(248, 113, 113, 0.1)",
                          color:
                            db.status === "connected"
                              ? "var(--v3-success)"
                              : "var(--v3-error)",
                          fontWeight: 600,
                        }}
                      >
                        {db.status === "connected" ? "ON" : "OFF"}
                      </span>
                    </button>

                    {/* Tables list */}
                    {isExpanded && filteredTables.length > 0 && (
                      <div style={{ paddingLeft: 20 }}>
                        {filteredTables.map((table) => {
                          const isSelected =
                            selectedTable?.name === table.name &&
                            selectedDbId === db.id;
                          return (
                            <button
                              key={table.name}
                              onClick={() => selectTable(db.id, table)}
                              style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "7px 16px",
                                border: "none",
                                borderLeft: isSelected
                                  ? "2px solid var(--v3-accent)"
                                  : "2px solid transparent",
                                background: isSelected
                                  ? "var(--v3-accent-subtle)"
                                  : "transparent",
                                cursor: "pointer",
                                fontSize: 12,
                                color: isSelected
                                  ? "var(--v3-accent)"
                                  : "var(--v3-text-secondary)",
                                fontWeight: isSelected ? 600 : 400,
                                textAlign: "left",
                                transition: "all 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
                                if (!isSelected)
                                  e.currentTarget.style.background =
                                    "var(--v3-bg-hover)";
                              }}
                              onMouseLeave={(e) => {
                                if (!isSelected)
                                  e.currentTarget.style.background =
                                    "transparent";
                              }}
                            >
                              <IconTable
                                className="h-3.5 w-3.5"
                                style={{ flexShrink: 0 }}
                              />
                              <span
                                style={{
                                  flex: 1,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {table.name}
                              </span>
                              <span
                                style={{
                                  fontSize: 10,
                                  color: "var(--v3-text-dimmed)",
                                  fontVariantNumeric: "tabular-nums",
                                }}
                              >
                                {table.rowCount.toLocaleString()}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {isExpanded && filteredTables.length === 0 && (
                      <div
                        style={{
                          padding: "8px 16px 8px 52px",
                          fontSize: 12,
                          color: "var(--v3-text-dimmed)",
                          fontStyle: "italic",
                        }}
                      >
                        {searchQuery
                          ? "No matching tables"
                          : "No tables introspected"}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredDatabases.length === 0 && (
                <div
                  style={{
                    padding: "24px 16px",
                    textAlign: "center",
                    color: "var(--v3-text-dimmed)",
                    fontSize: 12,
                  }}
                >
                  No databases match your search
                </div>
              )}
            </div>
          </aside>

          {/* Right Panel - Table Details */}
          <main
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 28,
              background: "var(--v3-bg)",
            }}
          >
            {selectedTable ? (
              <div className="v3-fade-up">
                {/* Table header */}
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background:
                          "linear-gradient(135deg, rgba(79, 110, 247, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IconTable
                        className="h-5 w-5"
                        style={{ color: "var(--v3-accent)" }}
                      />
                    </div>
                    <div>
                      <h2
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: "var(--v3-text)",
                          margin: 0,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {selectedTable.schema}.{selectedTable.name}
                      </h2>
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--v3-text-muted)",
                          margin: 0,
                        }}
                      >
                        {selectedTable.rowCount.toLocaleString()} rows
                        &middot; {selectedTable.columns.length} columns
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 12,
                    marginBottom: 24,
                  }}
                >
                  {[
                    {
                      label: "Columns",
                      value: selectedTable.columns.length,
                      color: "var(--v3-accent)",
                    },
                    {
                      label: "Rows",
                      value: selectedTable.rowCount.toLocaleString(),
                      color: "var(--v3-success)",
                    },
                    {
                      label: "Primary Keys",
                      value:
                        selectedTable.columns.filter((c) => c.isPrimaryKey)
                          .length || 0,
                      color: "var(--v3-warning)",
                    },
                    {
                      label: "Foreign Keys",
                      value:
                        selectedTable.columns.filter((c) => c.isForeignKey)
                          .length || 0,
                      color: "#D946EF",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      style={{
                        padding: "16px 18px",
                        borderRadius: 12,
                        background: "var(--v3-bg-surface)",
                        border: "1px solid var(--v3-border)",
                        transition: "border-color 0.2s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor =
                          "var(--v3-border-hover)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor = "var(--v3-border)")
                      }
                    >
                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "var(--v3-text-muted)",
                          margin: 0,
                        }}
                      >
                        {stat.label}
                      </p>
                      <p
                        style={{
                          fontSize: 22,
                          fontWeight: 700,
                          color: stat.color,
                          margin: "6px 0 0",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Structure Tab Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0,
                    borderBottom: "1px solid var(--v3-border)",
                    marginBottom: 0,
                  }}
                >
                  <div
                    style={{
                      padding: "10px 20px",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--v3-accent)",
                      borderBottom: "2px solid var(--v3-accent)",
                      marginBottom: -1,
                    }}
                  >
                    Structure
                  </div>
                </div>

                {/* Columns Table */}
                <div
                  className="v3-fade-in"
                  style={{
                    background: "var(--v3-bg-surface)",
                    borderRadius: "0 0 12px 12px",
                    border: "1px solid var(--v3-border)",
                    borderTop: "none",
                    overflow: "hidden",
                    boxShadow: "var(--v3-shadow-sm)",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 13,
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "var(--v3-bg-wash)",
                        }}
                      >
                        {[
                          { label: "#", align: "left" as const },
                          { label: "Column", align: "left" as const },
                          { label: "Type", align: "left" as const },
                          { label: "Nullable", align: "center" as const },
                          { label: "PK", align: "center" as const },
                          { label: "FK", align: "center" as const },
                          { label: "Default", align: "left" as const },
                        ].map((col) => (
                          <th
                            key={col.label}
                            style={{
                              padding: "11px 16px",
                              textAlign: col.align,
                              fontWeight: 600,
                              color: "var(--v3-text-muted)",
                              borderBottom: "1px solid var(--v3-border)",
                              fontSize: 10,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                            }}
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTable.columns.map((col, i) => (
                        <tr
                          key={col.name}
                          style={{
                            borderBottom:
                              i < selectedTable.columns.length - 1
                                ? "1px solid var(--v3-border)"
                                : "none",
                            transition: "background 0.12s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "var(--v3-bg-hover)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <td
                            style={{
                              padding: "11px 16px",
                              color: "var(--v3-text-dimmed)",
                              fontSize: 11,
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {i + 1}
                          </td>
                          <td
                            style={{
                              padding: "11px 16px",
                              fontWeight: 500,
                              color: "var(--v3-text)",
                            }}
                          >
                            {col.name}
                          </td>
                          <td style={{ padding: "11px 16px" }}>
                            <code
                              style={{
                                fontSize: 11,
                                padding: "3px 9px",
                                borderRadius: 6,
                                background: "var(--v3-accent-subtle)",
                                color: "var(--v3-accent)",
                                fontFamily:
                                  "var(--font-geist-mono), monospace",
                                fontWeight: 500,
                              }}
                            >
                              {col.type}
                            </code>
                          </td>
                          <td
                            style={{
                              padding: "11px 16px",
                              textAlign: "center",
                            }}
                          >
                            {col.nullable ? (
                              <IconCheck
                                className="h-3.5 w-3.5"
                                style={{
                                  color: "var(--v3-warning)",
                                  display: "inline-block",
                                }}
                              />
                            ) : (
                              <span
                                style={{
                                  color: "var(--v3-text-dimmed)",
                                  fontSize: 12,
                                }}
                              >
                                --
                              </span>
                            )}
                          </td>
                          <td
                            style={{
                              padding: "11px 16px",
                              textAlign: "center",
                            }}
                          >
                            {col.isPrimaryKey ? (
                              <span
                                style={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  padding: "3px 8px",
                                  borderRadius: 10,
                                  background: "rgba(251, 191, 36, 0.1)",
                                  color: "var(--v3-warning)",
                                  letterSpacing: "0.03em",
                                }}
                              >
                                PK
                              </span>
                            ) : (
                              <span
                                style={{
                                  color: "var(--v3-text-dimmed)",
                                  fontSize: 12,
                                }}
                              >
                                --
                              </span>
                            )}
                          </td>
                          <td
                            style={{
                              padding: "11px 16px",
                              textAlign: "center",
                            }}
                          >
                            {col.isForeignKey ? (
                              <span
                                style={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  padding: "3px 8px",
                                  borderRadius: 10,
                                  background: "rgba(217, 70, 239, 0.1)",
                                  color: "#D946EF",
                                  letterSpacing: "0.03em",
                                }}
                              >
                                FK
                              </span>
                            ) : (
                              <span
                                style={{
                                  color: "var(--v3-text-dimmed)",
                                  fontSize: 12,
                                }}
                              >
                                --
                              </span>
                            )}
                          </td>
                          <td
                            style={{
                              padding: "11px 16px",
                              color: "var(--v3-text-muted)",
                              fontSize: 12,
                              fontFamily:
                                "var(--font-geist-mono), monospace",
                            }}
                          >
                            {col.defaultValue || "--"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Empty state - no table selected */
              <div
                className="v3-fade-in"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  textAlign: "center",
                  padding: 40,
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 20,
                    background:
                      "linear-gradient(135deg, rgba(79, 110, 247, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(217, 70, 239, 0.1) 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <IconDatabase
                    className="h-8 w-8"
                    style={{ color: "var(--v3-accent)" }}
                  />
                </div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--v3-text)",
                    margin: "0 0 8px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Select a Table
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--v3-text-muted)",
                    margin: 0,
                    maxWidth: 320,
                    lineHeight: 1.5,
                  }}
                >
                  Choose a table from the database tree on the left to view its
                  structure, columns, and key information.
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 24,
                    padding: "8px 16px",
                    borderRadius: 8,
                    background: "var(--v3-bg-surface)",
                    border: "1px solid var(--v3-border)",
                    fontSize: 12,
                    color: "var(--v3-text-secondary)",
                  }}
                >
                  <IconArrowLeft
                    className="h-3.5 w-3.5"
                    style={{ color: "var(--v3-text-muted)" }}
                  />
                  Expand a database and click on a table
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function V3ExplorerPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: "flex", height: "100vh", background: "var(--v3-bg)", alignItems: "center", justifyContent: "center" }}>
          <div style={{ color: "var(--v3-text-muted)", fontSize: 13 }}>Loading...</div>
        </div>
      }
    >
      <ExplorerContent />
    </Suspense>
  );
}
