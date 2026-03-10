"use client";

import { useState } from "react";
import { IconDatabase } from "@/components/v2/ui/Icons";

interface MessageMetadataProps { databaseName?: string; agentName?: string; queryExecuted?: string; executionTimeMs?: number; }

export function MessageMetadata({ databaseName, agentName, queryExecuted, executionTimeMs }: MessageMetadataProps) {
  const [showQuery, setShowQuery] = useState(false);
  if (!databaseName && !agentName) return null;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {databaseName && <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: "var(--ci-accent-subtle)", color: "var(--ci-navy)" }}><IconDatabase className="h-2.5 w-2.5" />{databaseName}</span>}
      {agentName && <span className="rounded-md px-1.5 py-0.5 text-[10px] font-medium" style={{ background: "var(--ci-bg-wash)", color: "var(--ci-text-tertiary)" }}>{agentName}</span>}
      {executionTimeMs && <span className="text-[10px]" style={{ color: "var(--ci-text-muted)" }}>{executionTimeMs}ms</span>}
      {queryExecuted && <button onClick={() => setShowQuery(!showQuery)} className="text-[10px] underline decoration-dotted underline-offset-2" style={{ color: "var(--ci-text-muted)" }}>{showQuery ? "Hide SQL" : "View SQL"}</button>}
      {showQuery && queryExecuted && <pre className="mt-1 w-full overflow-x-auto rounded-lg p-3 text-[11px] v2-fade-in" style={{ background: "var(--ci-navy)", color: "#E2E8F0" }}><code>{queryExecuted}</code></pre>}
    </div>
  );
}
