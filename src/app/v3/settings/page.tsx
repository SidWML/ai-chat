"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useV3Theme } from "@/providers/V3ThemeProvider";
import { V3Sidebar } from "@/components/v3/V3Sidebar";
import { MOCK_DATABASES, MOCK_COLLECTIONS } from "@/lib/mock-data";
import {
  MOCK_KNOWLEDGE_BASES,
  MOCK_KB_DOCUMENTS,
  MOCK_USERS,
  MOCK_SUGGESTIONS,
} from "@/lib/mock-features";
import type { Database, Collection } from "@/lib/types";
import { DatabaseFormModal } from "@/components/settings/DatabaseFormModal";
import { CollectionFormModal } from "@/components/settings/CollectionFormModal";
import { DeleteConfirmModal } from "@/components/settings/DeleteConfirmModal";
import { Toast } from "@/components/settings/Toast";
import { IntrospectionModal } from "@/components/settings/IntrospectionModal";
import {
  IconDatabase,
  IconPanelLeft,
  IconSettings,
  IconPlus,
  IconTrash,
  IconSparkles,
  IconSearch,
  IconCheck,
  IconX,
} from "@/components/v2/ui/Icons";

type Tab = "connections" | "knowledge" | "users" | "suggestions" | "appearance";

const DB_TYPE_COLORS: Record<string, string> = {
  postgresql: "#6366F1",
  mysql: "#F472B6",
  mongodb: "#34D399",
  sqlite: "#FBBF24",
};

function timeAgo(iso: string | undefined) {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function V3SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useV3Theme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("connections");

  // Database state
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingDb, setEditingDb] = useState<Database | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingDb, setDeletingDb] = useState<Database | null>(null);
  const [testingDbId, setTestingDbId] = useState<string | null>(null);

  // Collection state
  const [colFormOpen, setColFormOpen] = useState(false);
  const [colFormMode, setColFormMode] = useState<"create" | "edit">("create");
  const [editingCol, setEditingCol] = useState<Collection | null>(null);
  const [colDeleteOpen, setColDeleteOpen] = useState(false);
  const [deletingCol, setDeletingCol] = useState<Collection | null>(null);

  // Introspection
  const [introOpen, setIntroOpen] = useState(false);
  const [introDbId, setIntroDbId] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  // Users search
  const [userSearch, setUserSearch] = useState("");
  const filteredUsers = userSearch
    ? MOCK_USERS.filter((u) => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
    : MOCK_USERS;

  // Suggestions filter
  const [sugFilter, setSugFilter] = useState("all");
  const filteredSugs = sugFilter === "all" ? MOCK_SUGGESTIONS : MOCK_SUGGESTIONS.filter((s) => s.category === sugFilter);

  // Handlers
  const handleAddDb = () => { setFormMode("create"); setEditingDb(null); setFormOpen(true); };
  const handleEditDb = (db: Database) => { setFormMode("edit"); setEditingDb(db); setFormOpen(true); };
  const handleDeleteDb = (db: Database) => { setDeletingDb(db); setDeleteOpen(true); };
  const handleTestDb = (dbId: string) => {
    setTestingDbId(dbId);
    setTimeout(() => { setTestingDbId(null); setToast({ type: "success", title: "Connection OK", message: "Database is reachable." }); }, 1500);
  };
  const handleAddCol = () => { setColFormMode("create"); setEditingCol(null); setColFormOpen(true); };
  const handleEditCol = (col: Collection) => { setColFormMode("edit"); setEditingCol(col); setColFormOpen(true); };
  const handleDeleteCol = (col: Collection) => { setDeletingCol(col); setColDeleteOpen(true); };

  const tabs: { id: Tab; label: string }[] = [
    { id: "connections", label: "Data Sources" },
    { id: "knowledge", label: "Knowledge" },
    { id: "users", label: "Users" },
    { id: "suggestions", label: "Suggestions" },
    { id: "appearance", label: "Appearance" },
  ];

  const roleBadge = (role: string) => {
    const colors: Record<string, { bg: string; color: string }> = {
      admin: { bg: "rgba(99, 102, 241, 0.15)", color: "#818CF8" },
      editor: { bg: "rgba(59, 130, 246, 0.15)", color: "#60A5FA" },
      viewer: { bg: "rgba(255, 255, 255, 0.06)", color: "var(--v3-text-muted)" },
    };
    return colors[role] || colors.viewer;
  };

  const sugCatColors: Record<string, { bg: string; color: string }> = {
    table: { bg: "rgba(52, 211, 153, 0.15)", color: "#34D399" },
    chart: { bg: "rgba(251, 191, 36, 0.15)", color: "#FBBF24" },
    map: { bg: "rgba(96, 165, 250, 0.15)", color: "#60A5FA" },
    analysis: { bg: "rgba(167, 139, 250, 0.15)", color: "#A78BFA" },
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--v3-bg)" }}>
      <V3Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 24px", borderBottom: "1px solid var(--v3-border)", flexShrink: 0 }}>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} style={{ padding: 8, borderRadius: 8, border: "none", background: "transparent", color: "var(--v3-text-muted)", cursor: "pointer", display: "flex" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--v3-bg-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <IconPanelLeft className="h-4 w-4" />
            </button>
          )}
          <IconSettings className="h-4 w-4" style={{ color: "var(--v3-accent)" }} />
          <h1 style={{ fontSize: 16, fontWeight: 600, color: "var(--v3-text)", margin: 0, letterSpacing: "-0.02em" }}>Settings</h1>
        </div>

        <div className="v3-scroll" style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            {/* Tabs */}
            <div style={{ display: "flex", gap: 3, marginBottom: 24, padding: 4, borderRadius: 12, background: "var(--v3-bg-surface)", border: "1px solid var(--v3-border)", width: "fit-content", flexWrap: "wrap" }}>
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: activeTab === tab.id ? "var(--v3-accent)" : "transparent", color: activeTab === tab.id ? "#fff" : "var(--v3-text-muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Data Sources Tab ── */}
            {activeTab === "connections" && (
              <div className="v3-fade-up">
                {/* Databases */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--v3-text)", margin: 0 }}>Databases</h2>
                    <p style={{ fontSize: 12, color: "var(--v3-text-muted)", margin: "4px 0 0" }}>Manage your connected data sources</p>
                  </div>
                  <button onClick={handleAddDb} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "none", background: "var(--v3-accent)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    <IconPlus className="h-3.5 w-3.5" /> Add Database
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {MOCK_DATABASES.map((db, i) => (
                    <div key={db.id} className="v3-fade-up" style={{ animationDelay: `${i * 0.04}s`, display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 14, background: "var(--v3-bg-surface)", border: "1px solid var(--v3-border)", transition: "all 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--v3-border-hover)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--v3-border)"; }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${DB_TYPE_COLORS[db.type] || "var(--v3-accent)"}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <IconDatabase className="h-5 w-5" style={{ color: DB_TYPE_COLORS[db.type] || "var(--v3-accent)" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--v3-text)", margin: 0 }}>{db.name}</p>
                        <p style={{ fontSize: 11, color: "var(--v3-text-muted)", margin: "2px 0 0" }}>{db.type} &middot; {typeof db.tables === "number" ? db.tables : db.tables?.length || 0} tables</p>
                      </div>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: db.status === "connected" ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)", color: db.status === "connected" ? "#34D399" : "#F87171" }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
                        {db.status === "connected" ? "Connected" : "Offline"}
                      </span>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => router.push(`/v3/explorer?connection=${db.id}`)} style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid var(--v3-border)", background: "transparent", color: "var(--v3-accent)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--v3-accent-subtle)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                        >Explore</button>
                        <button onClick={() => { setIntroDbId(db.id); setIntroOpen(true); }} style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid var(--v3-border)", background: "transparent", color: "var(--v3-text-secondary)", fontSize: 11, cursor: "pointer" }}>Introspect</button>
                        <button onClick={() => handleTestDb(db.id)} style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid var(--v3-border)", background: "transparent", color: "var(--v3-text-secondary)", fontSize: 11, cursor: "pointer" }}>
                          {testingDbId === db.id ? <span style={{ display: "inline-block", width: 12, height: 12, borderRadius: "50%", border: "2px solid var(--v3-accent)", borderTopColor: "transparent", animation: "v3-spin 1s linear infinite" }} /> : "Test"}
                        </button>
                        <button onClick={() => handleEditDb(db)} style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid var(--v3-border)", background: "transparent", color: "var(--v3-text-secondary)", fontSize: 11, cursor: "pointer" }}>Edit</button>
                        <button onClick={() => handleDeleteDb(db)} style={{ padding: "5px 10px", borderRadius: 8, border: "none", background: "transparent", color: "var(--v3-text-muted)", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#F87171")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--v3-text-muted)")}
                        >
                          <IconTrash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Collections */}
                <div style={{ marginTop: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div>
                      <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--v3-text)", margin: 0 }}>Collections</h2>
                      <p style={{ fontSize: 12, color: "var(--v3-text-muted)", margin: "4px 0 0" }}>Group data sources together</p>
                    </div>
                    <button onClick={handleAddCol} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "1px solid var(--v3-border)", background: "transparent", color: "var(--v3-text-secondary)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      <IconPlus className="h-3.5 w-3.5" /> New Collection
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {MOCK_COLLECTIONS.map((col, i) => (
                      <div key={col.id} className="v3-fade-up" style={{ animationDelay: `${i * 0.04}s`, display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 14, background: "var(--v3-bg-surface)", border: "1px solid var(--v3-border)" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--v3-gradient-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <IconSparkles className="h-5 w-5" style={{ color: "var(--v3-accent)" }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--v3-text)", margin: 0 }}>{col.name}</p>
                          <p style={{ fontSize: 11, color: "var(--v3-text-muted)", margin: "2px 0 0" }}>{col.databaseIds.length} sources &middot; {col.description}</p>
                        </div>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button onClick={() => handleEditCol(col)} style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid var(--v3-border)", background: "transparent", color: "var(--v3-text-secondary)", fontSize: 11, cursor: "pointer" }}>Edit</button>
                          <button onClick={() => handleDeleteCol(col)} style={{ padding: "5px 10px", borderRadius: 8, border: "none", background: "transparent", color: "var(--v3-text-muted)", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#F87171")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--v3-text-muted)")}
                          >
                            <IconTrash className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Knowledge Base Tab ── */}
            {activeTab === "knowledge" && (
              <div className="v3-fade-up">
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--v3-text)", margin: "0 0 16px" }}>Knowledge Bases</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                  {MOCK_KNOWLEDGE_BASES.map((kb, i) => (
                    <div key={kb.id} className="v3-fade-up" style={{ animationDelay: `${i * 0.04}s`, padding: "18px 20px", borderRadius: 14, background: "var(--v3-bg-surface)", border: "1px solid var(--v3-border)", transition: "all 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--v3-border-hover)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--v3-border)"; e.currentTarget.style.transform = "translateY(0)"; }}
                    >
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--v3-text)", margin: "0 0 4px" }}>{kb.title}</h3>
                      <p style={{ fontSize: 12, color: "var(--v3-text-muted)", margin: "0 0 12px", lineHeight: 1.5 }}>{kb.description}</p>
                      <div style={{ display: "flex", gap: 8, fontSize: 11, color: "var(--v3-text-muted)" }}>
                        <span style={{ padding: "2px 8px", borderRadius: 10, background: "var(--v3-accent-subtle)", color: "var(--v3-accent)", fontWeight: 600 }}>{kb.fileCount} files</span>
                        <span>{kb.totalSize}</span>
                      </div>
                      <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {MOCK_KB_DOCUMENTS.filter((d) => d.knowledgeBaseId === kb.id).map((doc) => {
                          const typeColors: Record<string, string> = { PDF: "#6366F1", DOCX: "#F472B6", CSV: "#34D399", MD: "#A78BFA" };
                          return (
                            <span key={doc.id} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 8, background: "var(--v3-bg-elevated)", fontSize: 10, color: "var(--v3-text-secondary)" }}>
                              <span style={{ width: 6, height: 6, borderRadius: 2, background: typeColors[doc.type] || "var(--v3-text-muted)" }} />
                              {doc.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Users Tab ── */}
            {activeTab === "users" && (
              <div className="v3-fade-up">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--v3-text)", margin: 0 }}>Team Members</h2>
                  <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "none", background: "var(--v3-accent)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    <IconPlus className="h-3.5 w-3.5" /> Invite User
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "8px 14px", borderRadius: 12, background: "var(--v3-bg-input)", border: "1px solid var(--v3-border)" }}>
                  <IconSearch className="h-3.5 w-3.5" style={{ color: "var(--v3-text-muted)" }} />
                  <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search users..." style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: "var(--v3-text)" }} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {filteredUsers.map((user, i) => {
                    const rb = roleBadge(user.role);
                    return (
                      <div key={user.id} className="v3-fade-up" style={{ animationDelay: `${i * 0.03}s`, display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 14, background: "var(--v3-bg-surface)", border: "1px solid var(--v3-border)" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--v3-gradient)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                          {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--v3-text)", margin: 0 }}>{user.name}</p>
                          <p style={{ fontSize: 11, color: "var(--v3-text-muted)", margin: 0 }}>{user.email}</p>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: rb.bg, color: rb.color, textTransform: "capitalize" }}>{user.role}</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: user.status === "active" ? "#34D399" : "var(--v3-text-muted)" }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: user.status === "active" ? "#34D399" : "var(--v3-text-muted)" }} />
                          {user.status}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--v3-text-muted)", minWidth: 60, textAlign: "right" }}>{timeAgo(user.lastLogin)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Suggestions Tab ── */}
            {activeTab === "suggestions" && (
              <div className="v3-fade-up">
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--v3-text)", margin: "0 0 16px" }}>Query Suggestions</h2>

                <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
                  {["all", "table", "chart", "map", "analysis"].map((cat) => (
                    <button key={cat} onClick={() => setSugFilter(cat)} style={{ padding: "5px 12px", borderRadius: 20, border: "none", background: sugFilter === cat ? "var(--v3-accent)" : "var(--v3-bg-surface)", color: sugFilter === cat ? "#fff" : "var(--v3-text-muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", textTransform: "capitalize", transition: "all 0.12s" }}>
                      {cat}
                    </button>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                  {filteredSugs.map((sug, i) => {
                    const sc = sugCatColors[sug.category] || sugCatColors.analysis;
                    const dbName = MOCK_DATABASES.find((d) => d.id === sug.databaseId)?.name || sug.databaseId;
                    return (
                      <div key={sug.id} className="v3-fade-up" style={{ animationDelay: `${i * 0.04}s`, padding: "18px 20px", borderRadius: 14, background: "var(--v3-bg-surface)", border: "1px solid var(--v3-border)", transition: "all 0.15s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--v3-border-hover)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--v3-border)"; }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: sc.bg, color: sc.color, textTransform: "capitalize" }}>{sug.category}</span>
                          <span style={{ fontSize: 10, color: "var(--v3-text-muted)" }}>{dbName}</span>
                        </div>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--v3-text)", margin: "0 0 4px" }}>{sug.title}</h3>
                        <p style={{ fontSize: 12, color: "var(--v3-text-muted)", margin: "0 0 12px", lineHeight: 1.5 }}>{sug.description}</p>
                        <button onClick={() => router.push("/v3/chat")} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--v3-border)", background: "transparent", color: "var(--v3-accent)", fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.12s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--v3-accent-subtle)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                        >
                          Use Query
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Appearance Tab ── */}
            {activeTab === "appearance" && (
              <div className="v3-fade-up">
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--v3-text)", margin: "0 0 16px" }}>Appearance</h2>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ padding: "18px 20px", borderRadius: 14, background: "var(--v3-bg-surface)", border: "1px solid var(--v3-border)" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--v3-text)", margin: "0 0 4px" }}>Theme</p>
                    <p style={{ fontSize: 12, color: "var(--v3-text-muted)", margin: "0 0 12px" }}>Choose your preferred appearance.</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      {(["dark", "light"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          style={{
                            padding: "8px 18px",
                            borderRadius: 10,
                            border: theme === t ? "none" : "1px solid var(--v3-border)",
                            background: theme === t ? "var(--v3-accent)" : "transparent",
                            color: theme === t ? "#fff" : "var(--v3-text-secondary)",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            textTransform: "capitalize",
                            transition: "all 0.15s",
                          }}
                        >
                          {t === "dark" ? "Dark" : "Light"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding: "18px 20px", borderRadius: 14, background: "var(--v3-bg-surface)", border: "1px solid var(--v3-border)" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--v3-text)", margin: "0 0 4px" }}>AI Preferences</p>
                    <p style={{ fontSize: 12, color: "var(--v3-text-muted)", margin: "0 0 12px" }}>How the AI responds to queries.</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {[{ label: "Auto-generate charts", on: true }, { label: "Show SQL queries", on: false }, { label: "Concise responses", on: true }].map((item) => (
                        <label key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 13, color: "var(--v3-text-secondary)" }}>{item.label}</span>
                          <div style={{ width: 40, height: 22, borderRadius: 11, background: item.on ? "var(--v3-accent)" : "var(--v3-bg-active)", position: "relative", cursor: "pointer" }}>
                            <div style={{ width: 18, height: 18, borderRadius: 9, background: item.on ? "#fff" : "var(--v3-text-muted)", position: "absolute", top: 2, ...(item.on ? { right: 2 } : { left: 2 }) }} />
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding: "18px 20px", borderRadius: 14, background: "var(--v3-bg-surface)", border: "1px solid var(--v3-border)" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--v3-text)", margin: "0 0 4px" }}>Account</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--v3-gradient)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>AJ</div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--v3-text)", margin: 0 }}>Alex Johnson</p>
                        <p style={{ fontSize: 12, color: "var(--v3-text-muted)", margin: 0 }}>alex@company.com &middot; Pro Plan</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals (use shared components — they use --ci-* vars internally) */}
      <DatabaseFormModal
        open={formOpen}
        mode={formMode}
        editingDb={editingDb}
        onClose={() => setFormOpen(false)}
        onSave={() => { setFormOpen(false); setToast({ type: "success", title: formMode === "create" ? "Database Added" : "Database Updated", message: "Changes saved." }); }}
      />
      <CollectionFormModal
        open={colFormOpen}
        mode={colFormMode}
        editingCollection={editingCol}
        onClose={() => setColFormOpen(false)}
        onSave={() => { setColFormOpen(false); setToast({ type: "success", title: colFormMode === "create" ? "Collection Created" : "Collection Updated", message: "Changes saved." }); }}
      />
      <DeleteConfirmModal
        open={deleteOpen}
        dbName={deletingDb?.name || ""}
        onClose={() => { setDeleteOpen(false); setDeletingDb(null); }}
        onConfirm={() => { setDeleteOpen(false); setDeletingDb(null); setToast({ type: "success", title: "Deleted", message: `"${deletingDb?.name}" removed.` }); }}
      />
      <DeleteConfirmModal
        open={colDeleteOpen}
        dbName={deletingCol?.name || ""}
        onClose={() => { setColDeleteOpen(false); setDeletingCol(null); }}
        onConfirm={() => { setColDeleteOpen(false); setDeletingCol(null); setToast({ type: "success", title: "Deleted", message: `"${deletingCol?.name}" removed.` }); }}
      />
      <IntrospectionModal
        open={introOpen}
        databases={MOCK_DATABASES}
        preselectedDbId={introDbId}
        onClose={() => { setIntroOpen(false); setIntroDbId(null); }}
        onStart={() => { setIntroOpen(false); setIntroDbId(null); setToast({ type: "success", title: "Introspection Started", message: "Schema discovery is now running." }); }}
        animationPrefix="v3"
      />
      <Toast open={!!toast} type={toast?.type || "success"} title={toast?.title || ""} message={toast?.message || ""} onClose={() => setToast(null)} />
    </div>
  );
}
