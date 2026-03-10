"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { V3Sidebar } from "@/components/v3/V3Sidebar";
import { V3ChatView } from "@/components/v3/V3ChatView";
import { CanvasPanel } from "@/components/v2/canvas/CanvasPanel";
import { IconPanelLeft } from "@/components/v2/ui/Icons";

export default function V3ChatIdPage() {
  const params = useParams();
  const chatId = params?.chatId as string;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--v3-bg)" }}>
      <V3Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onClose={() => setSidebarOpen(false)}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {!sidebarOpen && (
          <div
            className="v3-fade-in"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 16px",
              borderBottom: "1px solid var(--v3-border)",
            }}
          >
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                padding: 8, borderRadius: 8, border: "none",
                background: "transparent", color: "var(--v3-text-muted)",
                cursor: "pointer", display: "flex",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--v3-bg-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <IconPanelLeft className="h-4 w-4" />
            </button>
          </div>
        )}

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <V3ChatView chatId={chatId} />
          </div>
          <CanvasPanel />
        </div>
      </div>
    </div>
  );
}
