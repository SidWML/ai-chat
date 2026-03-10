"use client";

import Image from "next/image";
import { useSidebar } from "@/providers/SidebarProvider";
import { IconButton } from "@/components/ui/IconButton";

export function SidebarHeader() {
  const { toggle } = useSidebar();

  return (
    <div className="flex h-14 items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Image
          src="/logo.svg"
          alt="CInsights"
          width={120}
          height={33}
          className="dark:brightness-0 dark:invert"
          priority
        />
      </div>
      <IconButton label="Toggle sidebar" size="sm" onClick={toggle}>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </IconButton>
    </div>
  );
}
