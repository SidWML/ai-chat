"use client";

import { useState } from "react";
import { TextPart } from "@/components/v2/messages/TextPart";
import { IconCopy, IconCheck, IconSparkles } from "@/components/v2/ui/Icons";

export interface ChatMessageMeta {
  databaseName?: string;
  executionTimeMs?: number;
  queryExecuted?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: ChatMessageMeta;
}

/* ─── Small inline icons ─── */

function IconRefresh({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
      <path d="M2.5 8a5.5 5.5 0 019.28-4" />
      <path d="M13.5 8a5.5 5.5 0 01-9.28 4" />
      <path d="M11.5 1.5v3h3" strokeLinejoin="round" />
      <path d="M4.5 14.5v-3h-3" strokeLinejoin="round" />
    </svg>
  );
}

function IconDownload({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v9" />
      <path d="M5 8l3 3 3-3" />
      <path d="M3 13h10" />
    </svg>
  );
}

export function AssistantMessage({
  message,
  onRegenerate,
}: {
  message: ChatMessage;
  onRegenerate?: (messageId: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const meta = message.metadata;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([message.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `response-${message.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-start gap-3 v2-fade-up group">
      {/* Avatar */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: "linear-gradient(135deg, var(--ci-coral), var(--ci-coral-light))",
        }}
      >
        <IconSparkles className="h-3.5 w-3.5 text-white" />
      </div>

      {/* Content */}
      <div className="min-w-0 max-w-[85%]">
        <div
          className="rounded-2xl rounded-tl-lg px-4 py-3"
          style={{
            background: "var(--ci-bg-surface)",
            border: "1px solid var(--ci-border)",
            boxShadow: "var(--ci-shadow-sm)",
          }}
        >
          <TextPart text={message.content} />

          {/* Metadata bar */}
          {meta && (meta.databaseName || meta.executionTimeMs || meta.queryExecuted) && (
            <div
              className="mt-2.5 flex flex-wrap items-center gap-2 border-t pt-2"
              style={{ borderColor: "var(--ci-border)" }}
            >
              {meta.databaseName && (
                <span
                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                  style={{ background: "var(--ci-accent-subtle)", color: "var(--ci-navy)" }}
                >
                  <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3" />
                    <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
                  </svg>
                  {meta.databaseName}
                </span>
              )}
              {meta.executionTimeMs && (
                <span className="text-[10px]" style={{ color: "var(--ci-text-muted)" }}>
                  {meta.executionTimeMs}ms
                </span>
              )}
              {meta.queryExecuted && (
                <button
                  onClick={() => setShowSql(!showSql)}
                  className="text-[10px] underline decoration-dotted underline-offset-2 transition-colors hover:opacity-80"
                  style={{ color: "var(--ci-navy)" }}
                >
                  {showSql ? "Hide SQL" : "View SQL"}
                </button>
              )}
            </div>
          )}

          {/* SQL block */}
          {showSql && meta?.queryExecuted && (
            <pre
              className="mt-2 overflow-x-auto rounded-lg p-3 text-[11px] v2-fade-in"
              style={{ background: "#1E293B", color: "#E2E8F0", border: "1px solid #334155" }}
            >
              <code>{meta.queryExecuted}</code>
            </pre>
          )}
        </div>

        {/* Action buttons — appear on hover */}
        <div className="mt-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-all hover:bg-black/5"
            style={{ color: "var(--ci-text-muted)" }}
          >
            {copied ? (
              <>
                <IconCheck className="h-3 w-3" style={{ color: "var(--ci-success)" }} />
                <span style={{ color: "var(--ci-success)" }}>Copied</span>
              </>
            ) : (
              <>
                <IconCopy className="h-3 w-3" />
                Copy
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-all hover:bg-black/5"
            style={{ color: "var(--ci-text-muted)" }}
            title="Download as Markdown"
          >
            <IconDownload className="h-3 w-3" />
            Download
          </button>

          {onRegenerate && (
            <button
              onClick={() => onRegenerate(message.id)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-all hover:bg-black/5"
              style={{ color: "var(--ci-text-muted)" }}
              title="Regenerate response"
            >
              <IconRefresh className="h-3 w-3" />
              Regenerate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
