"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { IconArrowLeft, IconChat } from "@/components/v2/ui/Icons";
import { DatabaseExplorer } from "@/components/v2/explorer/DatabaseExplorer";

export default function ExplorerPage() {
  const searchParams = useSearchParams();
  const dbId = searchParams.get("db") || searchParams.get("connection") || undefined;

  return (
    <div className="flex h-screen flex-col" style={{ background: "var(--ci-bg)" }}>
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between px-8 py-4"
        style={{ borderBottom: "1px solid var(--ci-border)" }}
      >
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.V2_CHAT}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
            style={{ color: "var(--ci-text-muted)" }}
          >
            <IconArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-[16px] font-bold" style={{ color: "var(--ci-text)" }}>
            Database Explorer
          </h1>
        </div>

        <Link
          href={ROUTES.V2_CHAT}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-black/5"
          style={{ color: "var(--ci-text-secondary)" }}
        >
          <IconChat className="h-4 w-4" />
          Back to Chat
        </Link>
      </div>

      {/* Content - fills remaining space */}
      <div className="flex min-h-0 flex-1">
        <DatabaseExplorer initialConnectionId={dbId} />
      </div>
    </div>
  );
}
