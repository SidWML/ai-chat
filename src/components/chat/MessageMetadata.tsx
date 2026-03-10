"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";

interface MessageMetadataProps {
  databaseName?: string;
  agentName?: string;
  queryExecuted?: string;
  executionTimeMs?: number;
}

export function MessageMetadata({ databaseName, agentName, queryExecuted, executionTimeMs }: MessageMetadataProps) {
  const [showQuery, setShowQuery] = useState(false);

  if (!databaseName && !agentName) return null;

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
      {databaseName && (
        <Badge variant="info" dot className="text-[10px]">
          {databaseName}
        </Badge>
      )}
      {agentName && (
        <Badge variant="default" className="text-[10px]">
          {agentName}
        </Badge>
      )}
      {executionTimeMs && (
        <span className="text-[10px] text-zinc-400">{executionTimeMs}ms</span>
      )}
      {queryExecuted && (
        <button
          onClick={() => setShowQuery(!showQuery)}
          className="text-[10px] text-zinc-400 underline decoration-dotted hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          {showQuery ? "Hide query" : "View query"}
        </button>
      )}
      {showQuery && queryExecuted && (
        <pre className="mt-1 w-full overflow-x-auto rounded-lg bg-zinc-900 p-2.5 text-[11px] text-zinc-300 dark:bg-zinc-800">
          <code>{queryExecuted}</code>
        </pre>
      )}
    </div>
  );
}
