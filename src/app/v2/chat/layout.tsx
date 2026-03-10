"use client";

import { Sidebar } from "@/components/v2/layout/Sidebar";
import { TopBar } from "@/components/v2/layout/TopBar";
import { CanvasProvider } from "@/components/v2/canvas/CanvasProvider";
import { CanvasPanel } from "@/components/v2/canvas/CanvasPanel";

export default function V2ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <CanvasProvider>
      <div className="flex h-screen" style={{ background: "var(--ci-bg)" }}>
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-hidden">{children}</div>
            <CanvasPanel />
          </div>
        </div>
      </div>
    </CanvasProvider>
  );
}
