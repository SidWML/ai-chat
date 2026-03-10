"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/cn";
import { useConnections, useCollections } from "@/lib/v2/queries";
import { useConnectionStore } from "@/stores/v2/connectionStore";
import { IconX, IconDatabase, IconCollection, IconSparkles } from "@/components/v2/ui/Icons";

const DB_COLORS: Record<string, string> = {
  postgresql: "#336791",
  postgres: "#336791",
  mysql: "#00758F",
  mongodb: "#47A248",
  redis: "#DC382D",
  sqlite: "#003B57",
};

interface DatabaseSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (selection: { type: "database" | "collection" | "auto"; id?: string; name?: string }) => void;
}

export function DatabaseSelectorModal({ open, onClose, onSelect }: DatabaseSelectorModalProps) {
  const [selectedType, setSelectedType] = useState<"database" | "collection" | "auto">("auto");
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [selectedName, setSelectedName] = useState<string | undefined>(undefined);

  const { data: connectionsData, isLoading: isLoadingConnections } = useConnections();
  const { data: collectionsData, isLoading: isLoadingCollections } = useCollections();

  const setActiveConnection = useConnectionStore((s) => s.setActiveConnection);

  const connections: any[] = Array.isArray(connectionsData)
    ? connectionsData
    : (connectionsData as any)?.items ?? (connectionsData as any)?.connections ?? [];

  const collections: any[] = Array.isArray(collectionsData) ? collectionsData : [];

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open, handleEscape]);

  useEffect(() => {
    if (open) {
      setSelectedType("auto");
      setSelectedId(undefined);
      setSelectedName(undefined);
    }
  }, [open]);

  if (!open) return null;

  const handleSelect = (type: "database" | "collection", id: string, name: string) => {
    setSelectedType(type);
    setSelectedId(id);
    setSelectedName(name);
  };

  const handleAutoSelect = () => {
    setSelectedType("auto");
    setSelectedId(undefined);
    setSelectedName(undefined);
  };

  const handleStart = () => {
    if (selectedType === "database" && selectedId && selectedName) {
      setActiveConnection(selectedId, selectedName);
    } else if (selectedType === "auto") {
      setActiveConnection(null, null);
    }
    onSelect({ type: selectedType, id: selectedId, name: selectedName });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(4px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl"
        style={{
          background: "var(--ci-bg-surface)",
          boxShadow: "var(--ci-shadow-lg)",
          animation: "v2-modal-scale-in 0.2s cubic-bezier(0.22, 1, 0.36, 1) both",
        }}
      >
        <style>{`
          @keyframes v2-modal-scale-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div>
            <h2 className="text-[16px] font-bold" style={{ color: "var(--ci-text)" }}>
              Choose a Data Source
            </h2>
            <p className="text-[12px]" style={{ color: "var(--ci-text-muted)" }}>
              Select a database or collection to query
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
            style={{ color: "var(--ci-text-muted)" }}
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          {/* Auto Select */}
          <button
            onClick={handleAutoSelect}
            className={cn("mb-4 flex w-full items-center gap-3 rounded-xl p-4 text-left transition-all")}
            style={{
              border: selectedType === "auto" ? "2px solid var(--ci-navy)" : "1px solid var(--ci-border)",
              background: selectedType === "auto" ? "var(--ci-accent-subtle)" : "var(--ci-bg-surface)",
            }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg, var(--ci-navy), var(--ci-coral))" }}
            >
              <IconSparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold" style={{ color: "var(--ci-text)" }}>
                Auto Select
              </p>
              <p className="text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                Let AI choose the best database for your query
              </p>
            </div>
            {selectedType === "auto" && (
              <div
                className="flex h-5 w-5 items-center justify-center rounded-full"
                style={{ background: "var(--ci-navy)" }}
              >
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
            )}
          </button>

          {/* Databases */}
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--ci-text-muted)" }}>
            Databases
          </p>
          <div className="mb-4 space-y-2">
            {isLoadingConnections ? (
              <div className="flex items-center justify-center py-4">
                <p className="text-[12px]" style={{ color: "var(--ci-text-muted)" }}>Loading connections...</p>
              </div>
            ) : connections.length === 0 ? (
              <div className="flex items-center justify-center py-4">
                <p className="text-[12px]" style={{ color: "var(--ci-text-muted)" }}>No connections found</p>
              </div>
            ) : (
              connections.map((db: any) => {
                const dbId = db.id || db.connection_id;
                const dbName = db.name || db.connection_name || "Unnamed";
                const dbType = (db.type || db.db_type || db.database_type || "").toLowerCase();
                const dbDescription = db.description || db.database || dbType || "";
                const dbStatus = db.status || "connected";
                const tableCount = db.tables?.length ?? db.table_count ?? 0;
                const isSelected = selectedType === "database" && selectedId === dbId;
                const dbColor = DB_COLORS[dbType] || "var(--ci-navy)";
                return (
                  <button
                    key={dbId}
                    onClick={() => handleSelect("database", dbId, dbName)}
                    className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all hover:shadow-sm"
                    style={{
                      border: isSelected ? `2px solid ${dbColor}` : "1px solid var(--ci-border)",
                      background: isSelected ? `${dbColor}08` : "var(--ci-bg-surface)",
                    }}
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: dbColor }}
                    >
                      <IconDatabase className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold" style={{ color: "var(--ci-text)" }}>
                        {dbName}
                      </p>
                      <p className="truncate text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                        {dbDescription}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      {tableCount > 0 && (
                        <p className="text-[11px] font-medium" style={{ color: "var(--ci-text-secondary)" }}>
                          {tableCount} tables
                        </p>
                      )}
                      <span
                        className="inline-flex items-center gap-1 text-[10px]"
                        style={{ color: dbStatus === "connected" ? "#16A34A" : "#EF4444" }}
                      >
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full"
                          style={{ background: dbStatus === "connected" ? "#22C55E" : "#EF4444" }}
                        />
                        {dbStatus}
                      </span>
                    </div>
                    {isSelected && (
                      <div
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                        style={{ background: dbColor }}
                      >
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Collections */}
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--ci-text-muted)" }}>
            Collections
          </p>
          <div className="space-y-2">
            {isLoadingCollections ? (
              <div className="flex items-center justify-center py-4">
                <p className="text-[12px]" style={{ color: "var(--ci-text-muted)" }}>Loading collections...</p>
              </div>
            ) : collections.length === 0 ? (
              <div className="flex items-center justify-center py-4">
                <p className="text-[12px]" style={{ color: "var(--ci-text-muted)" }}>No collections found</p>
              </div>
            ) : (
              collections.map((col: any) => {
                const colId = col.id || col.collection_id;
                const colName = col.name || "Unnamed";
                const colDescription = col.description || "";
                const colDbCount = col.databaseIds?.length ?? col.database_ids?.length ?? col.connection_ids?.length ?? 0;
                const isSelected = selectedType === "collection" && selectedId === colId;
                return (
                  <button
                    key={colId}
                    onClick={() => handleSelect("collection", colId, colName)}
                    className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all hover:shadow-sm"
                    style={{
                      border: isSelected ? "2px solid var(--ci-coral)" : "1px solid var(--ci-border)",
                      background: isSelected ? "rgba(207,56,77,0.04)" : "var(--ci-bg-surface)",
                    }}
                  >
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: "linear-gradient(135deg, var(--ci-coral), #E06070)" }}
                    >
                      <IconCollection className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold" style={{ color: "var(--ci-text)" }}>
                        {colName}
                      </p>
                      <p className="truncate text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                        {colDescription}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {colDbCount > 0 && (
                        <p className="text-[11px] font-medium" style={{ color: "var(--ci-text-secondary)" }}>
                          {colDbCount} databases
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <div
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                        style={{ background: "var(--ci-coral)" }}
                      >
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: "1px solid var(--ci-border)" }}
        >
          <button
            onClick={onClose}
            className="text-[13px] font-medium transition-colors hover:underline"
            style={{ color: "var(--ci-text-muted)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            className="rounded-xl px-6 py-2.5 text-[13px] font-semibold text-white transition-all hover:shadow-lg active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, var(--ci-navy), #5A6B8A)" }}
          >
            Start Chat
          </button>
        </div>
      </div>
    </div>
  );
}
