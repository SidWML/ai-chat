"use client";

import { useSidebar } from "@/providers/SidebarProvider";
import { IconButton } from "@/components/ui/IconButton";
import { Badge } from "@/components/ui/Badge";

interface TopBarProps {
  title?: string;
  databaseName?: string;
}

export function TopBar({ title = "New Chat", databaseName }: TopBarProps) {
  const { isOpen, toggle } = useSidebar();

  return (
    <div className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      {!isOpen && (
        <IconButton label="Open sidebar" size="sm" onClick={toggle}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </IconButton>
      )}
      <h1 className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {title}
      </h1>
      {databaseName && (
        <Badge variant="info" dot>
          {databaseName}
        </Badge>
      )}
      <div className="ml-auto flex items-center gap-1">
        <IconButton label="New chat" size="sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </IconButton>
      </div>
    </div>
  );
}
