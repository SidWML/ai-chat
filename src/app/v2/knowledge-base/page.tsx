"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_KNOWLEDGE_BASES, MOCK_KB_DOCUMENTS, KnowledgeBase } from "@/lib/mock-features";
import { ROUTES } from "@/lib/constants";
import { IconArrowLeft, IconPlus, IconChat } from "@/components/v2/ui/Icons";

/* ── helpers ── */

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function formatSize(size: string) {
  return size;
}

const DOC_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  PDF:  { bg: "rgba(239, 68, 68, 0.10)", text: "#EF4444" },
  DOCX: { bg: "rgba(37, 99, 235, 0.10)", text: "#2563EB" },
  CSV:  { bg: "rgba(22, 163, 74, 0.10)", text: "#16A34A" },
  MD:   { bg: "rgba(139, 92, 246, 0.10)", text: "#8B5CF6" },
  TXT:  { bg: "rgba(107, 114, 128, 0.10)", text: "#6B7280" },
  JSON: { bg: "rgba(245, 158, 11, 0.10)", text: "#F59E0B" },
  XLSX: { bg: "rgba(16, 185, 129, 0.10)", text: "#10B981" },
};

function getTypeColor(type: string) {
  return DOC_TYPE_COLORS[type] || { bg: "rgba(107, 114, 128, 0.10)", text: "#6B7280" };
}

/* ── main page ── */

export default function V2KnowledgeBasePage() {
  const [selectedKbId, setSelectedKbId] = useState<string | null>(null);

  const selectedKb: KnowledgeBase | undefined = MOCK_KNOWLEDGE_BASES.find(
    (kb) => kb.id === selectedKbId,
  );

  const selectedDocs = selectedKbId
    ? MOCK_KB_DOCUMENTS.filter((d) => d.knowledgeBaseId === selectedKbId)
    : [];

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "var(--ci-bg)" }}
    >
      {/* ═══ Header ═══ */}
      <header
        className="flex shrink-0 items-center justify-between px-8 py-5"
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
            className="text-[17px] font-bold tracking-tight"
            style={{ color: "var(--ci-text)" }}
          >
            Knowledge Base
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
      </header>

      {/* ═══ Content ═══ */}
      <div className="flex-1 px-8 py-8">
        <div className="mx-auto w-full max-w-5xl">
          {/* Section title + Add button */}
          <div className="v2-fade-up mb-6 flex items-center justify-between">
            <div>
              <p
                className="text-[15px] font-bold"
                style={{ color: "var(--ci-text)" }}
              >
                Your Knowledge Bases
              </p>
              <p
                className="mt-0.5 text-[12px]"
                style={{ color: "var(--ci-text-muted)" }}
              >
                Manage document collections that enhance AI context and accuracy.
              </p>
            </div>
            <button
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-semibold text-white transition-all hover:shadow-lg active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, var(--ci-navy), #5A6B8A)",
              }}
            >
              <IconPlus className="h-3.5 w-3.5" />
              Add Knowledge Base
            </button>
          </div>

          {/* Two-panel layout: list + detail */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* ── Left column: KB cards ── */}
            <div className="space-y-4 lg:col-span-2">
              {MOCK_KNOWLEDGE_BASES.map((kb, i) => {
                const isSelected = selectedKbId === kb.id;
                return (
                  <button
                    key={kb.id}
                    onClick={() =>
                      setSelectedKbId(isSelected ? null : kb.id)
                    }
                    className="v2-fade-up group w-full rounded-2xl p-5 text-left transition-all hover:shadow-md"
                    style={{
                      background: "var(--ci-bg-surface)",
                      border: isSelected
                        ? "2px solid var(--ci-navy)"
                        : "1px solid var(--ci-border)",
                      animationDelay: `${i * 60}ms`,
                    }}
                  >
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p
                          className="truncate text-[14px] font-bold"
                          style={{ color: "var(--ci-text)" }}
                        >
                          {kb.title}
                        </p>
                        <p
                          className="mt-1 line-clamp-2 text-[12px] leading-relaxed"
                          style={{ color: "var(--ci-text-muted)" }}
                        >
                          {kb.description}
                        </p>
                      </div>
                      {isSelected && (
                        <span
                          className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{
                            background: "var(--ci-navy)",
                            boxShadow: "0 0 8px rgba(45, 55, 72, 0.35)",
                          }}
                        />
                      )}
                    </div>

                    {/* Meta row */}
                    <div
                      className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-3"
                      style={{ borderColor: "var(--ci-border)" }}
                    >
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{
                          background: "var(--ci-bg-wash)",
                          color: "var(--ci-text-muted)",
                        }}
                      >
                        {kb.fileCount} {kb.fileCount === 1 ? "file" : "files"}
                      </span>
                      <span
                        className="text-[11px]"
                        style={{ color: "var(--ci-text-muted)" }}
                      >
                        {formatSize(kb.totalSize)}
                      </span>
                      <span
                        className="text-[11px]"
                        style={{ color: "var(--ci-text-muted)" }}
                      >
                        Created {formatDate(kb.createdAt)}
                      </span>
                      <span
                        className="text-[11px]"
                        style={{ color: "var(--ci-text-muted)" }}
                      >
                        Updated {formatDate(kb.updatedAt)}
                      </span>
                    </div>
                  </button>
                );
              })}

              {/* Empty state */}
              {MOCK_KNOWLEDGE_BASES.length === 0 && (
                <div
                  className="v2-fade-up rounded-2xl p-10 text-center"
                  style={{
                    background: "var(--ci-bg-surface)",
                    border: "2px dashed var(--ci-border)",
                  }}
                >
                  <p
                    className="text-[14px] font-semibold"
                    style={{ color: "var(--ci-text)" }}
                  >
                    No knowledge bases yet
                  </p>
                  <p
                    className="mt-1.5 text-[12px]"
                    style={{ color: "var(--ci-text-muted)" }}
                  >
                    Create your first knowledge base to give the AI additional
                    context from your documents.
                  </p>
                  <button
                    className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[12px] font-semibold text-white transition-all hover:shadow-lg active:scale-[0.98]"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--ci-navy), #5A6B8A)",
                    }}
                  >
                    <IconPlus className="h-3.5 w-3.5" />
                    Add Knowledge Base
                  </button>
                </div>
              )}
            </div>

            {/* ── Right column: Document detail ── */}
            <div className="lg:col-span-3">
              {selectedKb ? (
                <div
                  className="v2-fade-in rounded-2xl"
                  style={{
                    background: "var(--ci-bg-surface)",
                    border: "1px solid var(--ci-border)",
                  }}
                >
                  {/* Detail header */}
                  <div
                    className="flex items-center justify-between px-6 py-5"
                    style={{ borderBottom: "1px solid var(--ci-border)" }}
                  >
                    <div>
                      <h2
                        className="text-[15px] font-bold"
                        style={{ color: "var(--ci-text)" }}
                      >
                        {selectedKb.title}
                      </h2>
                      <p
                        className="mt-0.5 text-[12px]"
                        style={{ color: "var(--ci-text-muted)" }}
                      >
                        {selectedKb.description}
                      </p>
                    </div>
                    <button
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all hover:shadow-sm active:scale-[0.98]"
                      style={{
                        background: "var(--ci-bg-wash)",
                        border: "1px solid var(--ci-border)",
                        color: "var(--ci-text)",
                      }}
                    >
                      <IconPlus className="h-3 w-3" />
                      Upload
                    </button>
                  </div>

                  {/* Documents list */}
                  <div className="px-6 py-4">
                    <p
                      className="mb-3 text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--ci-text-muted)" }}
                    >
                      Documents ({selectedDocs.length})
                    </p>

                    {selectedDocs.length === 0 ? (
                      <div
                        className="rounded-xl py-8 text-center"
                        style={{ background: "var(--ci-bg-wash)" }}
                      >
                        <p
                          className="text-[13px] font-medium"
                          style={{ color: "var(--ci-text-muted)" }}
                        >
                          No documents yet. Upload files to get started.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedDocs.map((doc, j) => {
                          const color = getTypeColor(doc.type);
                          return (
                            <div
                              key={doc.id}
                              className="v2-fade-up flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-black/[0.02]"
                              style={{
                                border: "1px solid var(--ci-border)",
                                animationDelay: `${j * 40}ms`,
                              }}
                            >
                              {/* File icon placeholder */}
                              <div
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-black"
                                style={{
                                  background: color.bg,
                                  color: color.text,
                                }}
                              >
                                {doc.type}
                              </div>

                              {/* Name + meta */}
                              <div className="min-w-0 flex-1">
                                <p
                                  className="truncate text-[13px] font-semibold"
                                  style={{ color: "var(--ci-text)" }}
                                >
                                  {doc.name}
                                </p>
                                <p
                                  className="mt-0.5 text-[11px]"
                                  style={{ color: "var(--ci-text-muted)" }}
                                >
                                  {doc.size} &middot; Uploaded{" "}
                                  {formatDate(doc.uploadedAt)}
                                </p>
                              </div>

                              {/* Type badge */}
                              <span
                                className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide"
                                style={{
                                  background: color.bg,
                                  color: color.text,
                                }}
                              >
                                {doc.type}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Detail footer */}
                  <div
                    className="flex items-center justify-between px-6 py-4"
                    style={{ borderTop: "1px solid var(--ci-border)" }}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="text-[11px]"
                        style={{ color: "var(--ci-text-muted)" }}
                      >
                        {selectedKb.fileCount}{" "}
                        {selectedKb.fileCount === 1 ? "file" : "files"} &middot;{" "}
                        {selectedKb.totalSize}
                      </span>
                    </div>
                    <span
                      className="text-[11px]"
                      style={{ color: "var(--ci-text-muted)" }}
                    >
                      Last updated {formatDate(selectedKb.updatedAt)}
                    </span>
                  </div>
                </div>
              ) : (
                /* Placeholder when nothing is selected */
                <div
                  className="v2-fade-in flex h-full min-h-[300px] items-center justify-center rounded-2xl"
                  style={{
                    background: "var(--ci-bg-surface)",
                    border: "2px dashed var(--ci-border)",
                  }}
                >
                  <div className="text-center">
                    <div
                      className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{ background: "var(--ci-bg-wash)" }}
                    >
                      <IconChat
                        className="h-5 w-5"
                        style={{ color: "var(--ci-text-muted)" }}
                      />
                    </div>
                    <p
                      className="text-[13px] font-semibold"
                      style={{ color: "var(--ci-text)" }}
                    >
                      Select a knowledge base
                    </p>
                    <p
                      className="mt-1 text-[12px]"
                      style={{ color: "var(--ci-text-muted)" }}
                    >
                      Choose a collection to view its documents.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
