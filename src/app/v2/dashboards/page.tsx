"use client";

import { useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { IconChevron, IconChat, IconArrowLeft } from "@/components/v2/ui/Icons";
import { useDashboard } from "@/lib/v2/queries";
import { DashboardList } from "@/components/v2/dashboard/DashboardList";
import { DashboardGrid } from "@/components/v2/dashboard/DashboardGrid";

function DashboardBreadcrumbTitle({ dashboardId }: { dashboardId: string }) {
  const { data: dashboard } = useDashboard(dashboardId);
  return (
    <span className="text-[14px] font-semibold" style={{ color: "var(--ci-text)" }}>
      {dashboard?.title ?? "Dashboard"}
    </span>
  );
}

export default function DashboardsPage() {
  const [selectedDashboard, setSelectedDashboard] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--ci-bg)" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-8 py-5"
        style={{
          borderBottom: "1px solid var(--ci-border)",
          background: "var(--ci-bg-surface)",
        }}
      >
        <div className="flex items-center gap-3">
          {selectedDashboard ? (
            <button
              onClick={() => setSelectedDashboard(null)}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
              style={{ color: "var(--ci-text-muted)" }}
            >
              <IconArrowLeft className="h-4 w-4" />
            </button>
          ) : (
            <Link
              href={ROUTES.V2_CHAT}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
              style={{ color: "var(--ci-text-muted)" }}
            >
              <IconArrowLeft className="h-4 w-4" />
            </Link>
          )}

          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            <span
              className="text-[14px] font-semibold"
              style={{
                color: selectedDashboard ? "var(--ci-text-muted)" : "var(--ci-text)",
              }}
            >
              {selectedDashboard ? (
                <button
                  onClick={() => setSelectedDashboard(null)}
                  className="transition-colors hover:underline"
                  style={{ color: "var(--ci-text-muted)" }}
                >
                  Dashboards
                </button>
              ) : (
                "Dashboards"
              )}
            </span>
            {selectedDashboard && (
              <>
                <IconChevron className="h-3 w-3" style={{ color: "var(--ci-text-muted)" }} />
                <DashboardBreadcrumbTitle dashboardId={selectedDashboard} />
              </>
            )}
          </div>
        </div>

        {/* Chat link */}
        <Link
          href={ROUTES.V2_CHAT}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-black/5"
          style={{ color: "var(--ci-text-secondary)" }}
        >
          <IconChat className="h-4 w-4" />
          Back to Chat
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 py-8">
        <div className="mx-auto w-full max-w-6xl">
          {selectedDashboard ? (
            <DashboardGrid dashboardId={selectedDashboard} />
          ) : (
            <DashboardList onSelect={setSelectedDashboard} />
          )}
        </div>
      </div>
    </div>
  );
}
