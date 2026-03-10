"use client";

import { useState } from "react";
import { MOCK_KNOWLEDGE_BASES, MOCK_KB_DOCUMENTS, KnowledgeBase } from "@/lib/mock-features";
import { IconArrowLeft, IconPlus } from "@/components/v2/ui/Icons";

const DOC_TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  PDF: { bg: "rgba(59, 130, 246, 0.1)", color: "rgb(59, 130, 246)" },
  DOCX: { bg: "rgba(34, 197, 94, 0.1)", color: "rgb(34, 197, 94)" },
  CSV: { bg: "rgba(249, 115, 22, 0.1)", color: "rgb(249, 115, 22)" },
  MD: { bg: "rgba(168, 85, 247, 0.1)", color: "rgb(168, 85, 247)" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function KnowledgeBasePage() {
  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null);

  const documents = selectedKB
    ? MOCK_KB_DOCUMENTS.filter((doc) => doc.knowledgeBaseId === selectedKB.id)
    : [];

  return (
    <div className="min-h-screen" style={{ background: "var(--ci-bg)" }}>
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between ci-fade-in">
          <div className="flex items-center gap-4">
            <a
              href="/chat"
              className="flex h-9 w-9 items-center justify-center rounded-xl transition-all"
              style={{
                background: "var(--ci-bg-surface)",
                border: "1px solid var(--ci-border)",
                color: "var(--ci-text-secondary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--ci-border-hover)";
                e.currentTarget.style.boxShadow = "var(--ci-shadow-sm)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--ci-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <IconArrowLeft className="h-4 w-4" />
            </a>
            <div>
              <h1
                className="text-[22px] font-bold"
                style={{ color: "var(--ci-text)" }}
              >
                Knowledge Base
              </h1>
              <p className="text-[13px]" style={{ color: "var(--ci-text-tertiary)" }}>
                Manage your document collections for AI-powered retrieval
              </p>
            </div>
          </div>
          <button
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-medium text-white transition-all hover:shadow-lg active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, var(--ci-navy), var(--ci-navy-light))",
              boxShadow: "var(--ci-shadow-sm)",
            }}
          >
            <IconPlus className="h-3.5 w-3.5" />
            Add Knowledge Base
          </button>
        </div>

        {/* Selected KB detail view */}
        {selectedKB ? (
          <div className="ci-fade-in">
            {/* Back to list */}
            <button
              onClick={() => setSelectedKB(null)}
              className="mb-6 flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors"
              style={{ color: "var(--ci-text-secondary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ci-bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <IconArrowLeft className="h-3.5 w-3.5" />
              Back to all knowledge bases
            </button>

            {/* KB info card */}
            <div
              className="mb-6 rounded-xl p-5"
              style={{
                background: "var(--ci-bg-surface)",
                border: "1px solid var(--ci-border)",
                boxShadow: "var(--ci-shadow-sm)",
              }}
            >
              <h2
                className="text-[18px] font-bold"
                style={{ color: "var(--ci-text)" }}
              >
                {selectedKB.title}
              </h2>
              <p className="mt-1 text-[13px]" style={{ color: "var(--ci-text-tertiary)" }}>
                {selectedKB.description}
              </p>
              <div className="mt-4 flex gap-6">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--ci-text-muted)" }}>
                    Files
                  </p>
                  <p className="text-[14px] font-semibold" style={{ color: "var(--ci-navy)" }}>
                    {selectedKB.fileCount}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--ci-text-muted)" }}>
                    Total Size
                  </p>
                  <p className="text-[14px] font-semibold" style={{ color: "var(--ci-navy)" }}>
                    {selectedKB.totalSize}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--ci-text-muted)" }}>
                    Created
                  </p>
                  <p className="text-[14px] font-semibold" style={{ color: "var(--ci-navy)" }}>
                    {formatDate(selectedKB.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--ci-text-muted)" }}>
                    Updated
                  </p>
                  <p className="text-[14px] font-semibold" style={{ color: "var(--ci-navy)" }}>
                    {formatDate(selectedKB.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Documents list */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px]" style={{ color: "var(--ci-text-tertiary)" }}>
                {documents.length} document{documents.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="space-y-3">
              {documents.map((doc, i) => {
                const typeStyle = DOC_TYPE_COLORS[doc.type] || { bg: "var(--ci-accent-subtle)", color: "var(--ci-navy)" };
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 rounded-xl p-4 transition-all ci-fade-up"
                    style={{
                      background: "var(--ci-bg-surface)",
                      border: "1px solid var(--ci-border)",
                      boxShadow: "var(--ci-shadow-xs)",
                      animationDelay: `${i * 50}ms`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "var(--ci-shadow-sm)";
                      e.currentTarget.style.borderColor = "var(--ci-border-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "var(--ci-shadow-xs)";
                      e.currentTarget.style.borderColor = "var(--ci-border)";
                    }}
                  >
                    <span
                      className="inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                      style={{ background: typeStyle.bg, color: typeStyle.color, minWidth: "44px" }}
                    >
                      {doc.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[14px] font-medium truncate"
                        style={{ color: "var(--ci-text)" }}
                      >
                        {doc.name}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: "var(--ci-text-muted)" }}>
                        Uploaded {formatDate(doc.uploadedAt)}
                      </p>
                    </div>
                    <span
                      className="text-[12px] font-medium"
                      style={{ color: "var(--ci-text-tertiary)" }}
                    >
                      {doc.size}
                    </span>
                  </div>
                );
              })}

              {documents.length === 0 && (
                <div
                  className="rounded-xl p-8 text-center"
                  style={{
                    background: "var(--ci-bg-surface)",
                    border: "1px solid var(--ci-border)",
                  }}
                >
                  <p className="text-[13px]" style={{ color: "var(--ci-text-tertiary)" }}>
                    No documents in this knowledge base yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Knowledge base cards grid */
          <div className="ci-fade-in">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px]" style={{ color: "var(--ci-text-tertiary)" }}>
                {MOCK_KNOWLEDGE_BASES.length} knowledge base{MOCK_KNOWLEDGE_BASES.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MOCK_KNOWLEDGE_BASES.map((kb, i) => (
                <button
                  key={kb.id}
                  onClick={() => setSelectedKB(kb)}
                  className="rounded-xl p-5 text-left transition-all ci-fade-up"
                  style={{
                    background: "var(--ci-bg-surface)",
                    border: "1px solid var(--ci-border)",
                    boxShadow: "var(--ci-shadow-xs)",
                    animationDelay: `${i * 80}ms`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "var(--ci-shadow-md)";
                    e.currentTarget.style.borderColor = "var(--ci-border-hover)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "var(--ci-shadow-xs)";
                    e.currentTarget.style.borderColor = "var(--ci-border)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-[13px] font-bold"
                    style={{
                      background: "var(--ci-accent-subtle)",
                      color: "var(--ci-navy)",
                    }}
                  >
                    {kb.fileCount}
                  </div>
                  <h3
                    className="text-[15px] font-semibold"
                    style={{ color: "var(--ci-text)" }}
                  >
                    {kb.title}
                  </h3>
                  <p
                    className="mt-1 text-[12px] line-clamp-2"
                    style={{ color: "var(--ci-text-tertiary)" }}
                  >
                    {kb.description}
                  </p>

                  <div
                    className="mt-4 flex items-center justify-between border-t pt-3"
                    style={{ borderColor: "var(--ci-border)" }}
                  >
                    <span className="text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                      {kb.fileCount} files &middot; {kb.totalSize}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                      Created {formatDate(kb.createdAt)}
                    </span>
                    <span className="text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                      Updated {formatDate(kb.updatedAt)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
