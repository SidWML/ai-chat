"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SidebarSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  action?: ReactNode;
}

export function SidebarSection({ title, children, defaultOpen = true, action }: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="py-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
      >
        <span>{title}</span>
        <div className="flex items-center gap-1">
          {action && (
            <span
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {action}
            </span>
          )}
          <svg
            className={cn("h-3 w-3 transition-transform", isOpen && "rotate-90")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
      {isOpen && <div className="mt-0.5">{children}</div>}
    </div>
  );
}
