"use client";

import { useState } from "react";
import { IconDatabase, IconX } from "@/components/v2/ui/Icons";

interface DeleteConfirmModalProps {
  open: boolean;
  dbName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({ open, dbName, onClose, onConfirm }: DeleteConfirmModalProps) {
  const [deleting, setDeleting] = useState(false);

  if (!open) return null;

  const handleDelete = () => {
    setDeleting(true);
    setTimeout(() => {
      onConfirm();
      setDeleting(false);
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        animation: "ciModalFadeIn 0.2s ease-out",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
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
      `}</style>

      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: "var(--ci-bg-surface)",
          border: "1px solid var(--ci-border)",
          animation: "ciModalSlideIn 0.25s ease-out",
        }}
      >
        {/* Red accent bar */}
        <div className="h-1" style={{ background: "#EF4444" }} />

        <div className="p-6">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "rgba(239, 68, 68, 0.1)" }}
              >
                <IconDatabase className="h-5 w-5" style={{ color: "#EF4444" }} />
              </div>
              <h2 className="text-[16px] font-bold" style={{ color: "var(--ci-text)" }}>
                Remove Database
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
              style={{ color: "var(--ci-text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ci-bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <IconX className="h-4 w-4" />
            </button>
          </div>

          <p className="text-[13px] leading-relaxed" style={{ color: "var(--ci-text-secondary)" }}>
            Are you sure you want to remove <strong style={{ color: "var(--ci-text)" }}>{dbName}</strong>? This will
            disconnect the database and remove all associated metadata. This action cannot be undone.
          </p>

          {/* Actions */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1" />
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-[12px] font-semibold transition-all"
              style={{ color: "var(--ci-text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ci-bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl px-5 py-2.5 text-[12px] font-semibold text-white transition-all hover:shadow-lg active:scale-[0.98]"
              style={{ background: "#EF4444", opacity: deleting ? 0.6 : 1 }}
            >
              {deleting ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Removing...
                </span>
              ) : (
                "Remove Database"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
