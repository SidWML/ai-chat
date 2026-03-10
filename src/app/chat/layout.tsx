"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { CanvasPanel } from "@/components/v2/canvas/CanvasPanel";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--ci-bg)" }}>
      <Sidebar />
      <main
        className="flex flex-1 flex-col overflow-hidden transition-all duration-200"
        style={{ minWidth: 0 }}
      >
        {children}
      </main>
      <CanvasPanel />
    </div>
  );
}
