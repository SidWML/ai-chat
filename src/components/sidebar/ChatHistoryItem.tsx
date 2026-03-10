"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { ChatSummary } from "@/lib/types";

interface ChatHistoryItemProps {
  chat: ChatSummary;
  isActive?: boolean;
}

export function ChatHistoryItem({ chat, isActive }: ChatHistoryItemProps) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div
      className={cn(
        "group relative flex cursor-pointer items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900",
        isActive && "bg-zinc-100 dark:bg-zinc-900"
      )}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <svg className="h-3.5 w-3.5 shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
      <span className="truncate text-zinc-700 dark:text-zinc-300">{chat.title}</span>

      {showDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="absolute right-2 rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-red-500 dark:hover:bg-zinc-800"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}
