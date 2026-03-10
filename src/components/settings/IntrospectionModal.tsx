"use client";

import { useState } from "react";
import { IconDatabase, IconX, IconCheck } from "@/components/v2/ui/Icons";

interface DatabaseOption {
  id: string;
  name: string;
  type: string;
  tables?: string[] | number;
}

interface IntrospectionModalProps {
  open: boolean;
  databases: DatabaseOption[];
  preselectedDbId?: string | null;
  onClose: () => void;
  onStart: (dbId: string) => void;
  animationPrefix?: string; // "ci" or "v2"
}

export function IntrospectionModal({
  open,
  databases,
  preselectedDbId,
  onClose,
  onStart,
  animationPrefix = "ci",
}: IntrospectionModalProps) {
  const [selectedDb, setSelectedDb] = useState<string | null>(preselectedDbId || null);
  const [starting, setStarting] = useState(false);
  const [started, setStarted] = useState(false);

  if (!open) return null;

  const handleStart = () => {
    if (!selectedDb) return;
    setStarting(true);
    setTimeout(() => {
      setStarting(false);
      setStarted(true);
      setTimeout(() => {
        onStart(selectedDb);
        setStarted(false);
        setSelectedDb(preselectedDbId || null);
      }, 1200);
    }, 1000);
  };

  const handleClose = () => {
    setStarted(false);
    setStarting(false);
    setSelectedDb(preselectedDbId || null);
    onClose();
  };

  const fadeClass = animationPrefix === "v2" ? "v2-fade-up" : "ci-fade-up";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        animation: "ciModalFadeIn 0.2s ease-out",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <style>{`
        @keyframes ciModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes ciModalSlideIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ciPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: "var(--ci-bg-surface)",
          border: "1px solid var(--ci-border)",
          animation: "ciModalSlideIn 0.25s ease-out",
        }}
      >
        {/* Accent bar */}
        <div
          className="h-1"
          style={{ background: "linear-gradient(90deg, var(--ci-navy), #5A6B8A)" }}
        />

        <div className="p-6">
          {/* Success state */}
          {started ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                style={{ background: "rgba(22, 163, 74, 0.1)" }}
              >
                <IconCheck className="h-7 w-7" style={{ color: "#16A34A" }} />
              </div>
              <h3 className="text-[16px] font-bold" style={{ color: "var(--ci-text)" }}>
                Introspection Started
              </h3>
              <p className="mt-1 text-[12px]" style={{ color: "var(--ci-text-muted)" }}>
                Schema discovery is now running. You can track the progress below.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: "linear-gradient(135deg, var(--ci-navy), #5A6B8A)" }}
                  >
                    <IconDatabase className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-[16px] font-bold" style={{ color: "var(--ci-text)" }}>
                      Start Introspection
                    </h2>
                    <p className="text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                      Discover and index the database schema
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                  style={{ color: "var(--ci-text-muted)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ci-bg-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <IconX className="h-4 w-4" />
                </button>
              </div>

              {/* Info box */}
              <div
                className="mb-4 rounded-xl p-3.5 text-[12px] leading-relaxed"
                style={{
                  background: "var(--ci-accent-subtle)",
                  border: "1px solid rgba(60,76,115,0.1)",
                  color: "var(--ci-text-secondary)",
                }}
              >
                Introspection will scan the database to discover tables, columns, relationships, and data types.
                This enables AI-powered querying and analysis.
              </div>

              {/* Database selector */}
              <label className="mb-2 block text-[12px] font-semibold" style={{ color: "var(--ci-text-muted)" }}>
                Select Database
              </label>
              <div className="max-h-48 space-y-1.5 overflow-y-auto">
                {databases.map((db) => {
                  const isSelected = selectedDb === db.id;
                  const tableCount = typeof db.tables === "number" ? db.tables : (db.tables?.length ?? 0);
                  return (
                    <button
                      key={db.id}
                      onClick={() => setSelectedDb(db.id)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all"
                      style={{
                        background: isSelected ? "var(--ci-accent-subtle)" : "transparent",
                        border: isSelected ? "1px solid rgba(60,76,115,0.2)" : "1px solid transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "var(--ci-bg-hover)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: isSelected ? "var(--ci-navy)" : "var(--ci-bg-wash)" }}
                      >
                        <IconDatabase className="h-4 w-4" style={{ color: isSelected ? "#fff" : "var(--ci-navy)" }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold" style={{ color: "var(--ci-text)" }}>
                          {db.name}
                        </p>
                        <p className="truncate text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                          {db.type} &middot; {tableCount} tables
                        </p>
                      </div>
                      {isSelected && (
                        <div
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                          style={{ background: "var(--ci-navy)" }}
                        >
                          <IconCheck className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="mt-5 flex items-center gap-3 border-t pt-4" style={{ borderColor: "var(--ci-border)" }}>
                <div className="flex-1" />
                <button
                  onClick={handleClose}
                  className="rounded-xl px-4 py-2.5 text-[12px] font-semibold transition-all"
                  style={{ color: "var(--ci-text-muted)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ci-bg-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  Cancel
                </button>
                <button
                  onClick={handleStart}
                  disabled={!selectedDb || starting}
                  className="rounded-xl px-5 py-2.5 text-[12px] font-semibold text-white transition-all hover:shadow-lg active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, var(--ci-navy), #5A6B8A)",
                    opacity: !selectedDb || starting ? 0.5 : 1,
                  }}
                >
                  {starting ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Starting...
                    </span>
                  ) : (
                    "Start Introspection"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
