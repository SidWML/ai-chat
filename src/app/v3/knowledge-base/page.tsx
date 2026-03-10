"use client";

import { useState } from "react";
import { V3Sidebar } from "@/components/v3/V3Sidebar";
import { MOCK_KNOWLEDGE_BASES, MOCK_KB_DOCUMENTS, KnowledgeBase } from "@/lib/mock-features";
import { IconDatabase, IconArrowLeft, IconSearch, IconPanelLeft } from "@/components/v2/ui/Icons";

const DOC_TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  PDF: { bg: "rgba(99, 102, 241, 0.12)", color: "#818CF8" },
  DOCX: { bg: "rgba(244, 114, 182, 0.12)", color: "#F472B6" },
  CSV: { bg: "rgba(52, 211, 153, 0.12)", color: "#34D399" },
  MD: { bg: "rgba(168, 85, 247, 0.12)", color: "#A855F7" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function V3KnowledgeBasePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null);

  const documents = selectedKB
    ? MOCK_KB_DOCUMENTS.filter((doc) => doc.knowledgeBaseId === selectedKB.id)
    : [];

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
          <IconDatabase className="h-4.5 w-4.5" style={{ color: "var(--v3-accent)" }} />
          <h1 style={{ fontSize: 16, fontWeight: 600, color: "var(--v3-text)", margin: 0, letterSpacing: "-0.02em" }}>
            Knowledge Base
          </h1>
          <span style={{ fontSize: 12, color: "var(--v3-text-muted)", marginLeft: 4 }}>
            Manage your document collections for AI-powered retrieval
          </span>
        </div>

        <div className="v3-scroll" style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            {selectedKB ? (
              /* ── Detail View ── */
              <div className="v3-fade-in">
                {/* Back button */}
                <button
                  onClick={() => setSelectedKB(null)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: 8, border: "none",
                    background: "transparent", color: "var(--v3-text-secondary)",
                    fontSize: 13, fontWeight: 500, cursor: "pointer",
                    transition: "background 0.15s", marginBottom: 20,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--v3-bg-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <IconArrowLeft className="h-3.5 w-3.5" />
                  Back to all knowledge bases
                </button>

                {/* KB info card */}
                <div
                  style={{
                    padding: 24, borderRadius: 16,
                    background: "var(--v3-bg-surface)",
                    border: "1px solid var(--v3-border)",
                    boxShadow: "var(--v3-shadow-sm)",
                    marginBottom: 24,
                  }}
                >
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--v3-text)", margin: 0, letterSpacing: "-0.02em" }}>
                    {selectedKB.title}
                  </h2>
                  <p style={{ fontSize: 13, color: "var(--v3-text-secondary)", margin: "6px 0 0" }}>
                    {selectedKB.description}
                  </p>
                  <div style={{ display: "flex", gap: 32, marginTop: 20 }}>
                    {[
                      { label: "Files", value: String(selectedKB.fileCount) },
                      { label: "Total Size", value: selectedKB.totalSize },
                      { label: "Created", value: formatDate(selectedKB.createdAt) },
                      { label: "Updated", value: formatDate(selectedKB.updatedAt) },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--v3-text-muted)", margin: 0 }}>
                          {stat.label}
                        </p>
                        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--v3-accent)", margin: "4px 0 0" }}>
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Document count */}
                <p style={{ fontSize: 12, color: "var(--v3-text-muted)", marginBottom: 12 }}>
                  {documents.length} document{documents.length !== 1 ? "s" : ""}
                </p>

                {/* Document list */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {documents.map((doc, i) => {
                    const typeStyle = DOC_TYPE_COLORS[doc.type] || { bg: "var(--v3-accent-subtle)", color: "var(--v3-accent)" };
                    return (
                      <div
                        key={doc.id}
                        className="v3-fade-up"
                        style={{
                          display: "flex", alignItems: "center", gap: 14,
                          padding: "14px 18px", borderRadius: 12,
                          background: "var(--v3-bg-surface)",
                          border: "1px solid var(--v3-border)",
                          transition: "border-color 0.15s, box-shadow 0.15s",
                          animationDelay: `${i * 50}ms`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "var(--v3-border-hover)";
                          e.currentTarget.style.boxShadow = "var(--v3-shadow-sm)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "var(--v3-border)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            padding: "4px 10px", borderRadius: 6,
                            fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
                            background: typeStyle.bg, color: typeStyle.color, minWidth: 42,
                          }}
                        >
                          {doc.type}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 500, color: "var(--v3-text)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {doc.name}
                          </p>
                          <p style={{ fontSize: 11, color: "var(--v3-text-muted)", margin: "2px 0 0" }}>
                            Uploaded {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--v3-text-secondary)", flexShrink: 0 }}>
                          {doc.size}
                        </span>
                      </div>
                    );
                  })}

                  {documents.length === 0 && (
                    <div
                      style={{
                        padding: "48px 20px", textAlign: "center", borderRadius: 12,
                        background: "var(--v3-bg-surface)", border: "1px solid var(--v3-border)",
                      }}
                    >
                      <p style={{ fontSize: 13, color: "var(--v3-text-muted)", margin: 0 }}>
                        No documents in this knowledge base yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ── List View ── */
              <div className="v3-fade-in">
                <p style={{ fontSize: 12, color: "var(--v3-text-muted)", marginBottom: 16 }}>
                  {MOCK_KNOWLEDGE_BASES.length} knowledge base{MOCK_KNOWLEDGE_BASES.length !== 1 ? "s" : ""}
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                  {MOCK_KNOWLEDGE_BASES.map((kb, i) => (
                    <button
                      key={kb.id}
                      onClick={() => setSelectedKB(kb)}
                      className="v3-fade-up"
                      style={{
                        padding: 22, borderRadius: 16, textAlign: "left",
                        background: "var(--v3-bg-surface)",
                        border: "1px solid var(--v3-border)",
                        boxShadow: "var(--v3-shadow-sm)",
                        cursor: "pointer", transition: "all 0.2s",
                        animationDelay: `${i * 80}ms`,
                        color: "inherit",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--v3-border-hover)";
                        e.currentTarget.style.boxShadow = "var(--v3-shadow-md)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--v3-border)";
                        e.currentTarget.style.boxShadow = "var(--v3-shadow-sm)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      {/* File count icon */}
                      <div
                        style={{
                          width: 40, height: 40, borderRadius: 12,
                          background: "var(--v3-accent-subtle)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, fontWeight: 700, color: "var(--v3-accent)",
                          marginBottom: 14,
                        }}
                      >
                        {kb.fileCount}
                      </div>

                      <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--v3-text)", margin: 0, letterSpacing: "-0.01em" }}>
                        {kb.title}
                      </h3>
                      <p style={{ fontSize: 12, color: "var(--v3-text-secondary)", margin: "6px 0 0", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {kb.description}
                      </p>

                      <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--v3-border)" }}>
                        <span style={{ fontSize: 11, color: "var(--v3-text-muted)" }}>
                          {kb.fileCount} files &middot; {kb.totalSize}
                        </span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                        <span style={{ fontSize: 11, color: "var(--v3-text-muted)" }}>
                          Created {formatDate(kb.createdAt)}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--v3-text-muted)" }}>
                          Updated {formatDate(kb.updatedAt)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {MOCK_KNOWLEDGE_BASES.length === 0 && (
                  <div
                    style={{
                      padding: "60px 20px", textAlign: "center", borderRadius: 16,
                      background: "var(--v3-bg-surface)", border: "1px solid var(--v3-border)",
                    }}
                  >
                    <IconDatabase className="h-8 w-8" style={{ color: "var(--v3-text-dimmed)", margin: "0 auto 12px" }} />
                    <p style={{ fontSize: 14, fontWeight: 500, color: "var(--v3-text-secondary)", margin: 0 }}>
                      No knowledge bases yet
                    </p>
                    <p style={{ fontSize: 12, color: "var(--v3-text-muted)", margin: "4px 0 0" }}>
                      Create your first knowledge base to get started.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
