"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { CanvasBlock } from "@/lib/canvas-types";
import {
  IconTable, IconMap, IconChart, IconCode, IconDocument,
  IconExpand, IconDownload, IconCheck, IconX, IconPin, IconPlus,
} from "@/components/v2/ui/Icons";
import { TextBlock } from "./blocks/TextBlock";
import { TableBlock } from "./blocks/TableBlock";
import { ChartBlock } from "./blocks/ChartBlock";
import { CodeBlock } from "./blocks/CodeBlock";
import { MapBlock } from "./blocks/MapBlock";
import { useDashboards, useAddWidget, useCreateDashboard } from "@/lib/v2/queries";

const TYPE_CONFIG: Record<string, { icon: typeof IconTable; label: string; color: string }> = {
  text: { icon: IconDocument, label: "Text", color: "var(--ci-text-secondary)" },
  table: { icon: IconTable, label: "Table", color: "#336791" },
  chart: { icon: IconChart, label: "Chart", color: "#16A34A" },
  code: { icon: IconCode, label: "Code", color: "#D97706" },
  map: { icon: IconMap, label: "Map", color: "#CF384D" },
};

function StatusIndicator({ status }: { status: CanvasBlock["status"] }) {
  if (status === "loading") {
    return <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full" style={{ border: "2px solid var(--ci-border)", borderTopColor: "var(--ci-accent)" }} />;
  }
  if (status === "error") {
    return <span className="inline-flex h-4 w-4 items-center justify-center rounded-full" style={{ background: "rgba(239,68,68,0.1)" }}><IconX className="h-2.5 w-2.5" style={{ color: "#EF4444" }} /></span>;
  }
  return null;
}

function BlockContent({ block }: { block: CanvasBlock }) {
  if (block.status === "loading") {
    return (
      <div className="px-4 py-8">
        <div className="flex flex-col items-center gap-2">
          <span className="inline-block h-5 w-5 animate-spin rounded-full" style={{ border: "2px solid var(--ci-border)", borderTopColor: "var(--ci-accent)" }} />
          <span className="text-[11px]" style={{ color: "var(--ci-text-muted)" }}>Loading...</span>
        </div>
      </div>
    );
  }
  if (block.status === "error") {
    return (
      <div className="px-4 py-6">
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-[12px]" style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.15)" }}>
          <IconX className="h-3.5 w-3.5 shrink-0" />
          {block.error ?? "An error occurred"}
        </div>
      </div>
    );
  }
  switch (block.type) {
    case "text": return <TextBlock block={block} />;
    case "table": return <TableBlock block={block} />;
    case "chart": return <ChartBlock block={block} />;
    case "code": return <CodeBlock block={block} />;
    case "map": return <MapBlock block={block} />;
    default: return <TextBlock block={block} />;
  }
}

/* ── Expand modal ────────────────────────────────────────────── */

function ExpandModal({ block, onClose }: { block: CanvasBlock; onClose: () => void }) {
  const config = TYPE_CONFIG[block.type] || TYPE_CONFIG.text;
  const TypeIcon = config.icon;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="v2-fade-up relative flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl"
        style={{
          background: "var(--ci-bg-surface)",
          border: "1px solid var(--ci-border)",
          boxShadow: "var(--ci-shadow-lg)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex shrink-0 items-center gap-2.5 px-5 py-3.5"
          style={{ borderBottom: "1px solid var(--ci-border)" }}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: `${config.color}15` }}>
            <TypeIcon className="h-3 w-3" style={{ color: config.color }} />
          </div>
          <span className="flex-1 text-[14px] font-semibold" style={{ color: "var(--ci-text)" }}>
            {block.title}
          </span>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors hover:bg-black/5"
            style={{ color: "var(--ci-text-muted)" }}
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto v2-scroll">
          <BlockContent block={block} />
        </div>
      </div>
    </div>
  );
}

/* ── Download handler ────────────────────────────────────────── */

function downloadBlock(block: CanvasBlock) {
  let content: string;
  let filename: string;
  let mimeType: string;

  const slug = block.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  if (block.type === "table" && block.data) {
    // Export as CSV
    const tableData = block.data as any;
    const columns: string[] = tableData.columns || (Array.isArray(tableData) && tableData.length > 0 ? Object.keys(tableData[0]) : []);
    const rows: Record<string, unknown>[] = tableData.rows || tableData.data || (Array.isArray(tableData) ? tableData : []);

    const csvRows = [columns.join(",")];
    for (const row of rows) {
      csvRows.push(columns.map((col) => {
        const val = row[col];
        const s = val == null ? "" : String(val);
        return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(","));
    }
    content = csvRows.join("\n");
    filename = `${slug}.csv`;
    mimeType = "text/csv";
  } else if (block.type === "code") {
    content = block.content || "";
    filename = `${slug}.txt`;
    mimeType = "text/plain";
  } else if (block.type === "chart" && block.data) {
    content = JSON.stringify(block.data, null, 2);
    filename = `${slug}-data.json`;
    mimeType = "application/json";
  } else {
    content = block.content || JSON.stringify(block.data, null, 2) || "";
    filename = `${slug}.md`;
    mimeType = "text/markdown";
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Pin to Dashboard popover ─────────────────────────────────── */

function PinToDashboard({ block }: { block: CanvasBlock }) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const { data: dashboards } = useDashboards();
  const addWidget = useAddWidget();
  const createDashboard = useCreateDashboard();

  // Close popover on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setCreating(false);
        setNewName("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Auto-hide "Pinned!" feedback
  useEffect(() => {
    if (!pinned) return;
    const t = setTimeout(() => setPinned(false), 1500);
    return () => clearTimeout(t);
  }, [pinned]);

  const buildWidgetData = useCallback(
    (dashboardId: string) => ({
      dashboardId,
      data: {
        block_type: block.type,
        title: block.title,
        block_data:
          block.type === "table"
            ? block.data
            : block.type === "chart"
              ? block.data
              : { content: block.content },
        position_x: 0,
        position_y: 0,
        grid_width: block.type === "table" ? 12 : 6,
        grid_height: 4,
      },
    }),
    [block],
  );

  const handlePin = useCallback(
    (dashboardId: string) => {
      addWidget.mutate(buildWidgetData(dashboardId), {
        onSuccess: () => {
          setOpen(false);
          setPinned(true);
          setCreating(false);
          setNewName("");
        },
      });
    },
    [addWidget, buildWidgetData],
  );

  const handleCreateAndPin = useCallback(() => {
    const name = newName.trim();
    if (!name) return;
    createDashboard.mutate(
      { title: name } as any,
      {
        onSuccess: (result: any) => {
          const id: string = result?.id ?? result?.data?.id ?? "";
          if (id) handlePin(id);
        },
      },
    );
  }, [newName, createDashboard, handlePin]);

  const dashboardList = Array.isArray(dashboards)
    ? dashboards
    : (dashboards as any)?.data ?? (dashboards as any)?.results ?? [];

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        ref={btnRef}
        className="rounded p-1 transition-colors hover:bg-black/5"
        style={{ color: "var(--ci-text-muted)" }}
        title="Pin to Dashboard"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
          setCreating(false);
          setNewName("");
        }}
      >
        <IconPin className="h-3 w-3" />
      </button>

      {/* Success toast */}
      {pinned && (
        <span
          className="v2-fade-up pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-medium"
          style={{
            background: "var(--ci-accent)",
            color: "#fff",
            animation: "v2-fade-up .2s ease-out, v2-fade-out 1s 0.5s ease-out forwards",
          }}
        >
          <IconCheck className="mr-0.5 inline h-2.5 w-2.5" /> Pinned!
        </span>
      )}

      {/* Popover */}
      {open && (
        <div
          ref={popoverRef}
          className="v2-fade-up absolute right-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-lg"
          style={{
            background: "var(--ci-bg-surface)",
            border: "1px solid var(--ci-border)",
            boxShadow: "var(--ci-shadow-md)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--ci-text-muted)", borderBottom: "1px solid var(--ci-border)" }}
          >
            Pin to Dashboard
          </div>

          <div className="max-h-44 overflow-y-auto py-1">
            {dashboardList.length === 0 && !creating && (
              <div className="px-3 py-2 text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                No dashboards yet
              </div>
            )}

            {dashboardList.map((d: any) => (
              <button
                key={d.id}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] transition-colors hover:bg-black/5"
                style={{ color: "var(--ci-text)" }}
                disabled={addWidget.isPending}
                onClick={() => handlePin(d.id)}
              >
                <IconGrid className="h-3 w-3 shrink-0" style={{ color: "var(--ci-text-muted)" }} />
                <span className="flex-1 truncate">{d.name ?? d.title ?? "Untitled"}</span>
              </button>
            ))}
          </div>

          <div style={{ borderTop: "1px solid var(--ci-border)" }}>
            {!creating ? (
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-[12px] transition-colors hover:bg-black/5"
                style={{ color: "var(--ci-accent)" }}
                onClick={() => setCreating(true)}
              >
                <IconPlus className="h-3 w-3 shrink-0" />
                Create New
              </button>
            ) : (
              <form
                className="flex items-center gap-1.5 px-2.5 py-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateAndPin();
                }}
              >
                <input
                  autoFocus
                  className="flex-1 rounded border px-2 py-1 text-[12px] outline-none"
                  style={{
                    borderColor: "var(--ci-border)",
                    background: "var(--ci-bg)",
                    color: "var(--ci-text)",
                  }}
                  placeholder="Dashboard name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <button
                  type="submit"
                  className="rounded p-1 transition-colors hover:bg-black/5"
                  style={{ color: "var(--ci-accent)" }}
                  disabled={!newName.trim() || createDashboard.isPending}
                >
                  <IconCheck className="h-3 w-3" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── IconGrid (local shortcut for dashboard list items) ───────── */

function IconGrid({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={style}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

/* ── Main BlockRenderer ───────────────────────────────────────── */

interface BlockRendererProps {
  block: CanvasBlock;
  isActive: boolean;
  onActivate: () => void;
}

export function BlockRenderer({ block, isActive, onActivate }: BlockRendererProps) {
  const [expanded, setExpanded] = useState(false);
  const config = TYPE_CONFIG[block.type] || TYPE_CONFIG.text;
  const TypeIcon = config.icon;

  return (
    <>
      <div
        className="v2-fade-up overflow-hidden rounded-xl transition-all"
        style={{
          background: "var(--ci-bg-surface)",
          border: isActive ? "1.5px solid var(--ci-accent)" : "1px solid var(--ci-border)",
          boxShadow: isActive ? "var(--ci-shadow-md)" : "var(--ci-shadow-sm)",
        }}
        onClick={onActivate}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 px-3.5 py-2"
          style={{ borderBottom: "1px solid var(--ci-border)" }}
        >
          <div
            className="flex h-5 w-5 items-center justify-center rounded"
            style={{ background: `${config.color}15` }}
          >
            <TypeIcon className="h-3 w-3" style={{ color: config.color }} />
          </div>
          <span
            className="flex-1 truncate text-[12px] font-semibold"
            style={{ color: "var(--ci-text)" }}
          >
            {block.title}
          </span>
          <StatusIndicator status={block.status} />
          <div className="flex items-center gap-0.5">
            <button
              className="rounded p-1 transition-colors hover:bg-black/5"
              style={{ color: "var(--ci-text-muted)" }}
              title="Expand"
              onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
            >
              <IconExpand className="h-3 w-3" />
            </button>
            <button
              className="rounded p-1 transition-colors hover:bg-black/5"
              style={{ color: "var(--ci-text-muted)" }}
              title="Download"
              onClick={(e) => { e.stopPropagation(); downloadBlock(block); }}
            >
              <IconDownload className="h-3 w-3" />
            </button>
            <PinToDashboard block={block} />
          </div>
        </div>

        {/* Body */}
        <BlockContent block={block} />
      </div>

      {/* Expand modal */}
      {expanded && <ExpandModal block={block} onClose={() => setExpanded(false)} />}
    </>
  );
}
