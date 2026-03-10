"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useCanvas } from "./CanvasProvider";
import { BlockRenderer } from "./BlockRenderer";
import { IconX, IconCollection } from "@/components/v2/ui/Icons";

const MIN_WIDTH = 320;
const MAX_WIDTH = 700;
const DEFAULT_WIDTH = 460;

/* ─── History navigation icons ─── */

function IconChevronLeft({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 4l-4 4 4 4" />
    </svg>
  );
}

function IconChevronRight({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

export function CanvasPanel() {
  const {
    isOpen,
    blocks,
    activeBlockId,
    history,
    historyIndex,
    closeCanvas,
    setActiveBlockId,
    goToVersion,
  } = useCanvas();

  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(DEFAULT_WIDTH);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      startX.current = e.clientX;
      startWidth.current = width;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [width]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const delta = startX.current - e.clientX;
      const newWidth = Math.min(
        MAX_WIDTH,
        Math.max(MIN_WIDTH, startWidth.current + delta)
      );
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (dragging.current) {
        dragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  if (!isOpen) return null;

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  return (
    <div
      className="relative flex h-full shrink-0 flex-col v2-fade-in"
      style={{
        width,
        minWidth: MIN_WIDTH,
        maxWidth: MAX_WIDTH,
        borderLeft: "1px solid var(--ci-border)",
        background: "var(--ci-bg)",
        overflow: "hidden",
      }}
    >
      {/* Drag handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute left-0 top-0 z-10 h-full w-1 cursor-col-resize transition-colors hover:bg-blue-200"
        style={{ background: "transparent" }}
      />

      {/* Header */}
      <div
        className="flex shrink-0 items-center gap-3 px-4 py-3"
        style={{
          borderBottom: "1px solid var(--ci-border)",
          background: "var(--ci-bg-surface)",
        }}
      >
        <IconCollection
          className="h-4 w-4"
          style={{ color: "var(--ci-accent)" }}
        />
        <span
          className="text-[13px] font-semibold"
          style={{ color: "var(--ci-text)" }}
        >
          Results
        </span>

        {/* History navigation */}
        {history.length > 1 && (
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => canGoBack && goToVersion(historyIndex - 1)}
              disabled={!canGoBack}
              className="rounded-md p-1 transition-colors hover:bg-black/5 disabled:opacity-30"
              style={{ color: "var(--ci-text-muted)" }}
              title="Previous version"
            >
              <IconChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-[10px] tabular-nums font-medium" style={{ color: "var(--ci-text-muted)" }}>
              {historyIndex + 1} / {history.length}
            </span>
            <button
              onClick={() => canGoForward && goToVersion(historyIndex + 1)}
              disabled={!canGoForward}
              className="rounded-md p-1 transition-colors hover:bg-black/5 disabled:opacity-30"
              style={{ color: "var(--ci-text-muted)" }}
              title="Next version"
            >
              <IconChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Close */}
        <button
          onClick={closeCanvas}
          className={`${history.length > 1 ? "" : "ml-auto"} rounded-lg p-1.5 transition-colors`}
          style={{ color: "var(--ci-text-muted)" }}
          title="Close panel"
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--ci-bg-hover)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <IconX className="h-4 w-4" />
        </button>
      </div>

      {/* Block count + type summary */}
      {blocks.length > 0 && (
        <div
          className="flex shrink-0 items-center gap-2 px-4 py-2"
          style={{ borderBottom: "1px solid var(--ci-border)", background: "var(--ci-bg-surface)" }}
        >
          <span className="text-[10px] font-medium" style={{ color: "var(--ci-text-muted)" }}>
            {blocks.length} block{blocks.length !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-1">
            {Array.from(new Set(blocks.map(b => b.type))).map(type => {
              const count = blocks.filter(b => b.type === type).length;
              return (
                <span
                  key={type}
                  className="rounded px-1.5 py-0.5 text-[9px] font-semibold capitalize"
                  style={{ background: "var(--ci-bg-wash)", color: "var(--ci-text-muted)" }}
                >
                  {count} {type}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Body */}
      <div
        className="v2-scroll flex-1 overflow-y-auto p-4"
        style={{ background: "var(--ci-bg)" }}
      >
        {blocks.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6">
            {/* Empty illustration */}
            <div
              className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl"
              style={{
                background:
                  "linear-gradient(135deg, var(--ci-accent-subtle), rgba(207,56,77,0.04))",
                border: "1px solid var(--ci-border)",
              }}
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 36 36"
                fill="none"
              >
                <rect
                  x="4"
                  y="6"
                  width="28"
                  height="24"
                  rx="3"
                  stroke="var(--ci-text-muted)"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                />
                <line
                  x1="4"
                  y1="12"
                  x2="32"
                  y2="12"
                  stroke="var(--ci-text-muted)"
                  strokeWidth="1.5"
                  opacity="0.4"
                />
                <rect
                  x="8"
                  y="16"
                  width="8"
                  height="3"
                  rx="1"
                  fill="var(--ci-text-muted)"
                  opacity="0.2"
                />
                <rect
                  x="8"
                  y="22"
                  width="12"
                  height="3"
                  rx="1"
                  fill="var(--ci-text-muted)"
                  opacity="0.15"
                />
              </svg>
            </div>
            <p
              className="text-center text-[13px] font-medium"
              style={{ color: "var(--ci-text-secondary)" }}
            >
              Results will appear here
            </p>
            <p
              className="mt-1 text-center text-[11px]"
              style={{ color: "var(--ci-text-muted)" }}
            >
              Ask a question to see tables, charts, and more
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {blocks.map((block) => (
              <BlockRenderer
                key={block.id}
                block={block}
                isActive={activeBlockId === block.id}
                onActivate={() => setActiveBlockId(block.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
