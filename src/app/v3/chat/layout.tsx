"use client";

import { CanvasProvider } from "@/components/v2/canvas/CanvasProvider";

export default function V3ChatLayout({ children }: { children: React.ReactNode }) {
  return <CanvasProvider>{children}</CanvasProvider>;
}
