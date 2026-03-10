"use client";

import { useState, useRef, useEffect } from "react";
import { useSidebar } from "@/providers/SidebarProvider";
import { useCanvas } from "@/components/v2/canvas/CanvasProvider";
import { useConnectionStore } from "@/stores/v2/connectionStore";
import { useConnections } from "@/lib/v2/queries";
import { IconMenu, IconPanelLeft, IconDatabase } from "@/components/v2/ui/Icons";

interface TopBarProps {
  title?: string;
}

export function TopBar({ title = "New Conversation" }: TopBarProps) {
  const { isOpen, toggle } = useSidebar();
  const { isOpen: canvasOpen, toggleCanvas, blocks } = useCanvas();
  const { activeConnectionId, activeConnectionName, setActiveConnection } = useConnectionStore();
  const { data: connectionsData } = useConnections();
  const connections = connectionsData?.items ?? (Array.isArray(connectionsData) ? connectionsData : []);

  const [showDbPicker, setShowDbPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showDbPicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowDbPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDbPicker]);

  return (
    <div
      className="flex h-13 shrink-0 items-center gap-3 px-4"
      style={{
        background: "var(--ci-bg-surface)",
        borderBottom: "1px solid var(--ci-border)",
      }}
    >
      {!isOpen && (
        <button
          onClick={toggle}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:bg-black/5"
          style={{ color: "var(--ci-text-tertiary)" }}
        >
          <IconMenu className="h-4 w-4" />
        </button>
      )}

      <h1
        className="flex-1 truncate text-[14px] font-semibold"
        style={{ color: "var(--ci-text)" }}
      >
        {title}
      </h1>

      {/* Database selector */}
      <div className="relative" ref={pickerRef}>
        <button
          onClick={() => setShowDbPicker(!showDbPicker)}
          className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-medium transition-all hover:shadow-sm"
          style={{
            color: activeConnectionId ? "var(--ci-navy)" : "var(--ci-text-muted)",
            background: activeConnectionId ? "var(--ci-accent-subtle)" : "transparent",
            border: "1px solid var(--ci-border)",
          }}
        >
          <IconDatabase className="h-3 w-3" />
          <span className="hidden sm:inline max-w-[120px] truncate">
            {activeConnectionName || "Auto"}
          </span>
          <svg className="h-2.5 w-2.5 shrink-0" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M1 1l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {showDbPicker && (
          <div
            className="absolute right-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-xl v2-fade-up"
            style={{
              background: "var(--ci-bg-surface)",
              border: "1px solid var(--ci-border)",
              boxShadow: "var(--ci-shadow-lg)",
            }}
          >
            <div className="p-1.5">
              {/* Auto option */}
              <button
                onClick={() => { setActiveConnection(null, null); setShowDbPicker(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] transition-colors hover:bg-black/5"
                style={{
                  color: !activeConnectionId ? "var(--ci-navy)" : "var(--ci-text-secondary)",
                  fontWeight: !activeConnectionId ? 600 : 400,
                }}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded text-[9px]" style={{ background: "linear-gradient(135deg, var(--ci-navy), var(--ci-coral))" }}>
                  <span className="text-white font-bold">A</span>
                </span>
                Auto Select
                {!activeConnectionId && (
                  <svg className="ml-auto h-3 w-3" style={{ color: "var(--ci-navy)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>

              {/* Divider */}
              <div className="my-1 h-px" style={{ background: "var(--ci-border)" }} />

              {/* Connections */}
              <div className="max-h-48 overflow-y-auto">
                {(connections as any[]).map((conn: any) => (
                  <button
                    key={conn.id}
                    onClick={() => { setActiveConnection(conn.id, conn.name); setShowDbPicker(false); }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] transition-colors hover:bg-black/5"
                    style={{
                      color: activeConnectionId === conn.id ? "var(--ci-navy)" : "var(--ci-text-secondary)",
                      fontWeight: activeConnectionId === conn.id ? 600 : 400,
                    }}
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-[8px] font-bold text-white"
                      style={{ background: conn.type === "postgresql" ? "#336791" : conn.type === "mysql" ? "#00758F" : "var(--ci-navy)" }}
                    >
                      {conn.type?.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="truncate">{conn.name}</span>
                    {activeConnectionId === conn.id && (
                      <svg className="ml-auto h-3 w-3 shrink-0" style={{ color: "var(--ci-navy)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Canvas toggle */}
      <button
        onClick={toggleCanvas}
        className="flex h-8 items-center gap-2 rounded-lg px-3 text-[12px] font-medium transition-all hover:shadow-sm active:scale-[0.98]"
        style={{
          color: canvasOpen ? "#fff" : "var(--ci-text-secondary)",
          background: canvasOpen ? "var(--ci-navy)" : "var(--ci-bg-wash)",
          border: canvasOpen ? "1px solid var(--ci-navy)" : "1px solid var(--ci-border)",
        }}
      >
        <IconPanelLeft
          className="h-3.5 w-3.5"
          style={{ transform: "scaleX(-1)" }}
        />
        <span className="hidden sm:inline">Canvas</span>
        {blocks.length > 0 && !canvasOpen && (
          <span
            className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
            style={{ background: "var(--ci-coral)" }}
          >
            {blocks.length}
          </span>
        )}
      </button>
    </div>
  );
}
