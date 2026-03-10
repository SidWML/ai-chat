"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MOCK_DATABASES, MOCK_COLLECTIONS } from "@/lib/mock-data";
import {
  MOCK_KNOWLEDGE_BASES,
  MOCK_KB_DOCUMENTS,
  MOCK_USERS,
  MOCK_SUGGESTIONS,
} from "@/lib/mock-features";
import {
  IconDatabase,
  IconCollection,
  IconArrowLeft,
  IconPlus,
  IconTable,
  IconGrid,
  IconDocument,
  IconUser,
  IconStar,
  IconSearch,
} from "@/components/v2/ui/Icons";
import type { Database, Collection, DatabaseStatus } from "@/lib/types";
import { ROUTES } from "@/lib/constants";
import { DatabaseFormModal } from "@/components/settings/DatabaseFormModal";
import { DeleteConfirmModal } from "@/components/settings/DeleteConfirmModal";
import { CollectionFormModal } from "@/components/settings/CollectionFormModal";
import { Toast } from "@/components/settings/Toast";

/* ─── Section definitions ─── */

const sections = [
  { key: "databases", label: "Databases", icon: <IconDatabase className="h-4 w-4" /> },
  { key: "collections", label: "Collections", icon: <IconCollection className="h-4 w-4" /> },
  { key: "knowledge", label: "Knowledge Base", icon: <IconDocument className="h-4 w-4" /> },
  { key: "users", label: "Users", icon: <IconUser className="h-4 w-4" /> },
  { key: "suggestions", label: "Suggestions", icon: <IconStar className="h-4 w-4" /> },
  { key: "appearance", label: "Appearance", icon: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
    </svg>
  )},
] as const;

type Section = (typeof sections)[number]["key"];

const STATUS_STYLES: Record<DatabaseStatus, { bg: string; color: string; dot: string }> = {
  connected: { bg: "var(--ci-success-bg)", color: "var(--ci-success)", dot: "var(--ci-success)" },
  disconnected: { bg: "var(--ci-error-bg)", color: "var(--ci-error)", dot: "var(--ci-error)" },
  error: { bg: "var(--ci-warning-bg)", color: "var(--ci-warning)", dot: "var(--ci-warning)" },
};

const DB_TYPE_LABELS: Record<string, string> = {
  postgresql: "PG", mysql: "My", mongodb: "Mo", sqlite: "SL", other: "DB",
};

const DOC_TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  PDF: { color: "#2563EB", bg: "rgba(37,99,235,0.1)" },
  DOCX: { color: "#16A34A", bg: "rgba(22,163,74,0.1)" },
  CSV: { color: "#D97706", bg: "rgba(217,119,6,0.1)" },
  MD: { color: "#7C3AED", bg: "rgba(124,58,237,0.1)" },
};

const ROLE_COLORS: Record<string, { color: string; bg: string }> = {
  admin: { color: "var(--ci-navy)", bg: "var(--ci-accent-subtle)" },
  editor: { color: "#2563EB", bg: "rgba(37,99,235,0.1)" },
  viewer: { color: "var(--ci-text-tertiary)", bg: "var(--ci-bg-wash)" },
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch { return ""; }
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("databases");
  const [selectedKB, setSelectedKB] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [suggestionFilter, setSuggestionFilter] = useState<string>("all");
  const router = useRouter();

  // Database CRUD modal state
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingDb, setEditingDb] = useState<Database | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingDb, setDeletingDb] = useState<Database | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; title: string; message: string } | null>(null);
  const [testingDbId, setTestingDbId] = useState<string | null>(null);

  const handleAddDb = useCallback(() => {
    setFormMode("create");
    setEditingDb(null);
    setFormOpen(true);
  }, []);

  const handleEditDb = useCallback((db: Database) => {
    setFormMode("edit");
    setEditingDb(db);
    setFormOpen(true);
  }, []);

  const handleDeleteDb = useCallback((db: Database) => {
    setDeletingDb(db);
    setDeleteOpen(true);
  }, []);

  const handleTestDb = useCallback((db: Database) => {
    setTestingDbId(db.id);
    // Simulate test connection
    setTimeout(() => {
      const success = Math.random() > 0.2;
      setToast({
        type: success ? "success" : "error",
        title: success ? "Connection Successful" : "Connection Failed",
        message: success
          ? `${db.name} is reachable (42ms)`
          : `Could not reach ${db.name}. Check your settings.`,
      });
      setTestingDbId(null);
    }, 1500);
  }, []);

  // Collection CRUD modal state
  const [colFormOpen, setColFormOpen] = useState(false);
  const [colFormMode, setColFormMode] = useState<"create" | "edit">("create");
  const [editingCol, setEditingCol] = useState<Collection | null>(null);
  const [colDeleteOpen, setColDeleteOpen] = useState(false);
  const [deletingCol, setDeletingCol] = useState<Collection | null>(null);

  const handleAddCol = useCallback(() => {
    setColFormMode("create");
    setEditingCol(null);
    setColFormOpen(true);
  }, []);

  const handleEditCol = useCallback((col: Collection) => {
    setColFormMode("edit");
    setEditingCol(col);
    setColFormOpen(true);
  }, []);

  const handleDeleteCol = useCallback((col: Collection) => {
    setDeletingCol(col);
    setColDeleteOpen(true);
  }, []);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--ci-bg)" }}>
      {/* ── Left Sidebar ── */}
      <aside
        className="w-[240px] shrink-0 overflow-y-auto ci-scrollbar"
        style={{
          background: "var(--ci-bg-sidebar)",
          borderRight: "1px solid var(--ci-border)",
        }}
      >
        {/* Back button */}
        <div className="px-4 py-4">
          <button
            onClick={() => router.push("/chat")}
            className="flex items-center gap-2 text-[13px] transition-colors"
            style={{ color: "var(--ci-text-secondary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ci-navy)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ci-text-secondary)")}
          >
            <IconArrowLeft className="h-4 w-4" />
            Back to Chat
          </button>
          <h1
            className="mt-3 text-[18px] font-bold"
            style={{ color: "var(--ci-text)" }}
          >
            Settings
          </h1>
        </div>

        {/* Nav items */}
        <nav className="px-2 pb-4">
          {sections.map((section) => {
            const isActive = activeSection === section.key;
            return (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-all"
                style={{
                  background: isActive ? "var(--ci-accent-subtle)" : "transparent",
                  color: isActive ? "var(--ci-navy)" : "var(--ci-text-secondary)",
                  fontWeight: isActive ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "var(--ci-bg-hover)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = isActive ? "var(--ci-accent-subtle)" : "transparent";
                }}
              >
                {section.icon}
                {section.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-y-auto ci-scrollbar">
        <div className="mx-auto max-w-4xl px-8 py-8">

          {/* ═══ Databases ═══ */}
          {activeSection === "databases" && (
            <div className="ci-fade-in">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-[20px] font-bold" style={{ color: "var(--ci-text)" }}>Databases</h2>
                  <p className="text-[13px]" style={{ color: "var(--ci-text-tertiary)" }}>{MOCK_DATABASES.length} databases configured</p>
                </div>
                <button onClick={handleAddDb} className="flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium text-white transition-all hover:shadow-lg active:scale-[0.98]" style={{ background: "linear-gradient(135deg, var(--ci-navy), var(--ci-navy-light))", boxShadow: "var(--ci-shadow-sm)" }}>
                  <IconPlus className="h-3.5 w-3.5" /> Add Database
                </button>
              </div>

              {/* Database list */}
              <div className="space-y-3">
                {MOCK_DATABASES.map((db) => {
                  const status = STATUS_STYLES[db.status];
                  return (
                    <div key={db.id} className="flex items-center gap-4 rounded-xl p-4 transition-all" style={{ background: "var(--ci-bg-surface)", border: "1px solid var(--ci-border)", boxShadow: "var(--ci-shadow-xs)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--ci-shadow-sm)"; e.currentTarget.style.borderColor = "var(--ci-border-hover)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--ci-shadow-xs)"; e.currentTarget.style.borderColor = "var(--ci-border)"; }}>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl text-[12px] font-bold" style={{ background: "var(--ci-accent-subtle)", color: "var(--ci-navy)" }}>{DB_TYPE_LABELS[db.type] || "DB"}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-[14px] font-semibold" style={{ color: "var(--ci-text)" }}>{db.name}</h3>
                          <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: status.bg, color: status.color }}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.dot }} />{db.status}
                          </span>
                        </div>
                        {db.description && <p className="mt-0.5 text-[12px]" style={{ color: "var(--ci-text-tertiary)" }}>{db.description}</p>}
                        {db.tables && <p className="mt-1 text-[11px]" style={{ color: "var(--ci-text-muted)" }}>{db.tables.length} tables</p>}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Link href={`${ROUTES.EXPLORER}?db=${db.id}`} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors" style={{ color: "var(--ci-navy)", textDecoration: "none" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ci-accent-subtle)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                          <IconTable className="h-3 w-3" />Explorer
                        </Link>
                        <Link href={`${ROUTES.INGESTION}?db=${db.id}`} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors" style={{ color: "var(--ci-navy)", textDecoration: "none" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ci-accent-subtle)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                          <IconDatabase className="h-3 w-3" />Ingestion
                        </Link>
                        <div className="mx-1 h-4 w-px" style={{ background: "var(--ci-border)" }} />
                        <button onClick={() => handleTestDb(db)} disabled={testingDbId === db.id} className="rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors" style={{ color: "var(--ci-text-secondary)", opacity: testingDbId === db.id ? 0.6 : 1 }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ci-bg-hover)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                          {testingDbId === db.id ? (
                            <span className="flex items-center gap-1.5">
                              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--ci-text-muted)", borderTopColor: "transparent" }} />
                              Testing...
                            </span>
                          ) : "Test"}
                        </button>
                        <button onClick={() => handleEditDb(db)} className="rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors" style={{ color: "var(--ci-text-secondary)" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ci-bg-hover)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>Edit</button>
                        <button onClick={() => handleDeleteDb(db)} className="rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors" style={{ color: "var(--ci-error)" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ci-error-bg)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>Remove</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ Collections ═══ */}
          {activeSection === "collections" && (
            <div className="ci-fade-in">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-[20px] font-bold" style={{ color: "var(--ci-text)" }}>Collections</h2>
                  <p className="text-[13px]" style={{ color: "var(--ci-text-tertiary)" }}>{MOCK_COLLECTIONS.length} collections</p>
                </div>
                <button onClick={handleAddCol} className="flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium text-white transition-all hover:shadow-lg active:scale-[0.98]" style={{ background: "linear-gradient(135deg, var(--ci-navy), var(--ci-navy-light))", boxShadow: "var(--ci-shadow-sm)" }}>
                  <IconPlus className="h-3.5 w-3.5" /> Create Collection
                </button>
              </div>
              <div className="space-y-3">
                {MOCK_COLLECTIONS.map((col) => (
                  <div key={col.id} className="rounded-xl p-4 transition-all" style={{ background: "var(--ci-bg-surface)", border: "1px solid var(--ci-border)", boxShadow: "var(--ci-shadow-xs)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--ci-shadow-sm)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--ci-shadow-xs)"; }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-[14px] font-semibold" style={{ color: "var(--ci-text)" }}>{col.name}</h3>
                        {col.description && <p className="mt-0.5 text-[12px]" style={{ color: "var(--ci-text-tertiary)" }}>{col.description}</p>}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleEditCol(col)} className="rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors" style={{ color: "var(--ci-text-secondary)" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ci-bg-hover)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>Edit</button>
                        <button onClick={() => handleDeleteCol(col)} className="rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors" style={{ color: "var(--ci-error)" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ci-error-bg)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>Delete</button>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {col.databaseIds.map((dbId) => {
                        const db = MOCK_DATABASES.find((d) => d.id === dbId);
                        return db ? (
                          <span key={dbId} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium" style={{ background: "var(--ci-accent-subtle)", color: "var(--ci-navy)", border: "1px solid rgba(60,76,115,0.1)" }}>
                            <IconDatabase className="h-3 w-3" />{db.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ Knowledge Base ═══ */}
          {activeSection === "knowledge" && (
            <div className="ci-fade-in">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-[20px] font-bold" style={{ color: "var(--ci-text)" }}>Knowledge Base</h2>
                  <p className="text-[13px]" style={{ color: "var(--ci-text-tertiary)" }}>{MOCK_KNOWLEDGE_BASES.length} knowledge bases</p>
                </div>
                <button className="flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium text-white transition-all hover:shadow-lg active:scale-[0.98]" style={{ background: "linear-gradient(135deg, var(--ci-navy), var(--ci-navy-light))", boxShadow: "var(--ci-shadow-sm)" }}>
                  <IconPlus className="h-3.5 w-3.5" /> Add Knowledge Base
                </button>
              </div>
              {!selectedKB ? (
                <div className="space-y-3">
                  {MOCK_KNOWLEDGE_BASES.map((kb) => (
                    <button key={kb.id} onClick={() => setSelectedKB(kb.id)} className="w-full rounded-xl p-4 text-left transition-all" style={{ background: "var(--ci-bg-surface)", border: "1px solid var(--ci-border)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--ci-shadow-sm)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}>
                      <h3 className="text-[14px] font-semibold" style={{ color: "var(--ci-text)" }}>{kb.title}</h3>
                      <p className="mt-0.5 text-[12px]" style={{ color: "var(--ci-text-tertiary)" }}>{kb.description}</p>
                      <div className="mt-2 flex gap-4 text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                        <span>{kb.fileCount} files</span><span>{kb.totalSize}</span><span>Updated {formatDate(kb.updatedAt)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <button onClick={() => setSelectedKB(null)} className="mb-4 flex items-center gap-1.5 text-[12px] transition-colors" style={{ color: "var(--ci-text-secondary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ci-navy)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ci-text-secondary)")}>
                    <IconArrowLeft className="h-3.5 w-3.5" /> All Knowledge Bases
                  </button>
                  <div className="space-y-2">
                    {MOCK_KB_DOCUMENTS.filter((d) => d.knowledgeBaseId === selectedKB).map((doc) => {
                      const tc = DOC_TYPE_COLORS[doc.type] || { color: "var(--ci-text-muted)", bg: "var(--ci-bg-wash)" };
                      return (
                        <div key={doc.id} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "var(--ci-bg-surface)", border: "1px solid var(--ci-border)" }}>
                          <span className="rounded-lg px-2 py-1 text-[10px] font-bold" style={{ background: tc.bg, color: tc.color }}>{doc.type}</span>
                          <span className="flex-1 text-[13px] font-medium" style={{ color: "var(--ci-text)" }}>{doc.name}</span>
                          <span className="text-[11px]" style={{ color: "var(--ci-text-muted)" }}>{doc.size}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ Users ═══ */}
          {activeSection === "users" && (
            <div className="ci-fade-in">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-[20px] font-bold" style={{ color: "var(--ci-text)" }}>Users</h2>
                  <p className="text-[13px]" style={{ color: "var(--ci-text-tertiary)" }}>{MOCK_USERS.length} team members</p>
                </div>
                <button className="flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium text-white transition-all hover:shadow-lg active:scale-[0.98]" style={{ background: "linear-gradient(135deg, var(--ci-navy), var(--ci-navy-light))", boxShadow: "var(--ci-shadow-sm)" }}>
                  <IconPlus className="h-3.5 w-3.5" /> Invite User
                </button>
              </div>
              <div className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "var(--ci-bg-surface)", border: "1px solid var(--ci-border)" }}>
                <IconSearch className="h-3.5 w-3.5" style={{ color: "var(--ci-text-muted)" }} />
                <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search users..." className="flex-1 bg-transparent text-[12px] outline-none" style={{ color: "var(--ci-text)" }} />
              </div>
              <div className="space-y-2">
                {MOCK_USERS.filter((u) => !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())).map((u) => {
                  const rc = ROLE_COLORS[u.role] || ROLE_COLORS.viewer;
                  return (
                    <div key={u.id} className="flex items-center gap-4 rounded-xl px-4 py-3 transition-all" style={{ background: "var(--ci-bg-surface)", border: "1px solid var(--ci-border)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--ci-shadow-sm)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-semibold text-white" style={{ background: "linear-gradient(135deg, var(--ci-navy), var(--ci-accent-vivid))" }}>
                        {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold" style={{ color: "var(--ci-text)" }}>{u.name}</p>
                        <p className="text-[11px]" style={{ color: "var(--ci-text-muted)" }}>{u.email}</p>
                      </div>
                      <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold" style={{ background: rc.bg, color: rc.color }}>{u.role}</span>
                      <span className="flex items-center gap-1.5 text-[11px]" style={{ color: u.status === "active" ? "var(--ci-success)" : "var(--ci-error)" }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: u.status === "active" ? "var(--ci-success)" : "var(--ci-error)" }} />{u.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ Suggestions ═══ */}
          {activeSection === "suggestions" && (
            <div className="ci-fade-in">
              <h2 className="mb-2 text-[20px] font-bold" style={{ color: "var(--ci-text)" }}>Query Suggestions</h2>
              <p className="mb-5 text-[13px]" style={{ color: "var(--ci-text-tertiary)" }}>Pre-built queries your team can use in chat</p>
              <div className="mb-5 flex gap-1 rounded-lg p-1" style={{ background: "var(--ci-bg-wash)", border: "1px solid var(--ci-border)" }}>
                {["all", "table", "chart", "map", "analysis"].map((cat) => (
                  <button key={cat} onClick={() => setSuggestionFilter(cat)}
                    className="flex-1 rounded-md px-3 py-1.5 text-[12px] font-medium capitalize transition-all"
                    style={{ background: suggestionFilter === cat ? "var(--ci-bg-surface)" : "transparent", color: suggestionFilter === cat ? "var(--ci-navy)" : "var(--ci-text-muted)", boxShadow: suggestionFilter === cat ? "var(--ci-shadow-sm)" : "none" }}>
                    {cat}
                  </button>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {MOCK_SUGGESTIONS.filter((s) => suggestionFilter === "all" || s.category === suggestionFilter).map((s) => {
                  const dbName = MOCK_DATABASES.find((d) => d.id === s.databaseId)?.name || s.databaseId;
                  return (
                    <div key={s.id} className="rounded-xl p-4 transition-all" style={{ background: "var(--ci-bg-surface)", border: "1px solid var(--ci-border)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--ci-shadow-sm)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-medium capitalize" style={{ background: "var(--ci-accent-subtle)", color: "var(--ci-navy)" }}>{s.category}</span>
                        <span className="text-[10px]" style={{ color: "var(--ci-text-muted)" }}>{dbName}</span>
                      </div>
                      <h3 className="text-[13px] font-semibold" style={{ color: "var(--ci-text)" }}>{s.title}</h3>
                      <p className="mt-1 text-[12px]" style={{ color: "var(--ci-text-tertiary)" }}>{s.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ Appearance ═══ */}
          {activeSection === "appearance" && (
            <div className="ci-fade-in">
              <h2 className="mb-6 text-[20px] font-bold" style={{ color: "var(--ci-text)" }}>Appearance</h2>
              <div className="rounded-xl p-6" style={{ background: "var(--ci-bg-surface)", border: "1px solid var(--ci-border)", boxShadow: "var(--ci-shadow-xs)" }}>
                <h3 className="text-[14px] font-semibold" style={{ color: "var(--ci-text)" }}>Theme</h3>
                <p className="mt-1 text-[12px]" style={{ color: "var(--ci-text-tertiary)" }}>Choose how CInsights looks for you</p>
                <div className="mt-5 flex gap-4">
                  {[
                    { label: "Light", bg: "#FFFFFF", active: true },
                    { label: "Dark", bg: "#1A1A2E", active: false },
                    { label: "System", bg: "split", active: false },
                  ].map((theme) => (
                    <button key={theme.label} className="flex flex-col items-center gap-2.5 rounded-xl p-3 transition-all" style={{ border: theme.active ? "2px solid var(--ci-navy)" : "2px solid var(--ci-border)", background: theme.active ? "var(--ci-accent-subtle)" : "transparent" }}>
                      {theme.bg === "split" ? (
                        <div className="flex h-16 w-24 overflow-hidden rounded-lg" style={{ border: "1px solid var(--ci-border)" }}>
                          <div className="w-1/2" style={{ background: "#FFFFFF" }} />
                          <div className="w-1/2" style={{ background: "#1A1A2E" }} />
                        </div>
                      ) : (
                        <div className="h-16 w-24 rounded-lg" style={{ background: theme.bg, border: "1px solid var(--ci-border)" }} />
                      )}
                      <span className="text-[12px] font-medium" style={{ color: theme.active ? "var(--ci-navy)" : "var(--ci-text-secondary)" }}>{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Database Form Modal (Add/Edit) */}
      <DatabaseFormModal
        open={formOpen}
        mode={formMode}
        editingDb={editingDb}
        onClose={() => setFormOpen(false)}
        onSave={(data) => {
          setToast({
            type: "success",
            title: formMode === "edit" ? "Database Updated" : "Database Added",
            message: formMode === "edit"
              ? `${data.name} has been updated successfully.`
              : `${data.name} has been added successfully.`,
          });
        }}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        open={deleteOpen}
        dbName={deletingDb?.name || ""}
        onClose={() => { setDeleteOpen(false); setDeletingDb(null); }}
        onConfirm={() => {
          setToast({
            type: "success",
            title: "Database Removed",
            message: `${deletingDb?.name} has been removed.`,
          });
          setDeleteOpen(false);
          setDeletingDb(null);
        }}
      />

      {/* Collection Form Modal (Create/Edit) */}
      <CollectionFormModal
        open={colFormOpen}
        mode={colFormMode}
        editingCollection={editingCol}
        onClose={() => setColFormOpen(false)}
        onSave={(data) => {
          setToast({
            type: "success",
            title: colFormMode === "edit" ? "Collection Updated" : "Collection Created",
            message: colFormMode === "edit"
              ? `${data.name} has been updated successfully.`
              : `${data.name} has been created with ${data.databaseIds.length} database${data.databaseIds.length !== 1 ? "s" : ""}.`,
          });
        }}
      />

      {/* Collection Delete Confirm Modal */}
      <DeleteConfirmModal
        open={colDeleteOpen}
        dbName={deletingCol?.name || ""}
        onClose={() => { setColDeleteOpen(false); setDeletingCol(null); }}
        onConfirm={() => {
          setToast({
            type: "success",
            title: "Collection Deleted",
            message: `${deletingCol?.name} has been deleted.`,
          });
          setColDeleteOpen(false);
          setDeletingCol(null);
        }}
      />

      {/* Toast */}
      <Toast
        open={!!toast}
        type={toast?.type || "success"}
        title={toast?.title || ""}
        message={toast?.message || ""}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
