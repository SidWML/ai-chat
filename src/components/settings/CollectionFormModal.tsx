"use client";

import { useState, useEffect, useCallback } from "react";
import { MOCK_DATABASES } from "@/lib/mock-data";
import type { Collection } from "@/lib/types";
import { IconCollection, IconDatabase, IconX, IconCheck } from "@/components/v2/ui/Icons";

interface CollectionFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  editingCollection?: Collection | null;
  onClose: () => void;
  onSave: (data: { name: string; description: string; databaseIds: string[] }) => void;
}

export function CollectionFormModal({
  open,
  mode,
  editingCollection,
  onClose,
  onSave,
}: CollectionFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDbIds, setSelectedDbIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ name?: string; databases?: string }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode === "edit" && editingCollection) {
      setName(editingCollection.name);
      setDescription(editingCollection.description || "");
      setSelectedDbIds([...editingCollection.databaseIds]);
    } else if (mode === "create") {
      setName("");
      setDescription("");
      setSelectedDbIds([]);
    }
  }, [mode, editingCollection]);

  useEffect(() => {
    if (!open) {
      setErrors({});
      setSaving(false);
    }
  }, [open]);

  const validate = useCallback((): boolean => {
    const newErrors: { name?: string; databases?: string } = {};
    if (!name.trim()) newErrors.name = "Collection name is required";
    if (selectedDbIds.length === 0) newErrors.databases = "Select at least one database";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, selectedDbIds]);

  const toggleDb = (dbId: string) => {
    setSelectedDbIds((prev) =>
      prev.includes(dbId) ? prev.filter((id) => id !== dbId) : [...prev, dbId]
    );
    if (errors.databases) setErrors((p) => ({ ...p, databases: undefined }));
  };

  const handleSave = () => {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      onSave({ name, description, databaseIds: selectedDbIds });
      setSaving(false);
      onClose();
    }, 800);
  };

  if (!open) return null;

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
        className="relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: "var(--ci-bg-surface)",
          border: "1px solid var(--ci-border)",
          animation: "ciModalSlideIn 0.25s ease-out",
        }}
      >
        {/* Accent bar */}
        <div className="h-1" style={{ background: "linear-gradient(90deg, var(--ci-navy), var(--ci-accent-vivid))" }} />

        <div className="p-6">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "var(--ci-accent-subtle)" }}
              >
                <IconCollection className="h-5 w-5" style={{ color: "var(--ci-navy)" }} />
              </div>
              <div>
                <h2 className="text-[16px] font-bold" style={{ color: "var(--ci-text)" }}>
                  {mode === "edit" ? "Edit Collection" : "Create Collection"}
                </h2>
                <p className="text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                  {mode === "edit"
                    ? "Update your collection settings"
                    : "Group databases for combined analysis"}
                </p>
              </div>
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

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold" style={{ color: "var(--ci-text-muted)" }}>
                Collection Name <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                }}
                placeholder="e.g. Sales Overview, Supply Chain"
                className="w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-all"
                style={{
                  background: "var(--ci-bg-wash)",
                  border: errors.name ? "2px solid #EF4444" : "1px solid var(--ci-border)",
                  color: "var(--ci-text)",
                }}
              />
              {errors.name && <p className="mt-1 text-[11px]" style={{ color: "#EF4444" }}>{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold" style={{ color: "var(--ci-text-muted)" }}>
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description for this collection"
                className="w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-all"
                style={{ background: "var(--ci-bg-wash)", border: "1px solid var(--ci-border)", color: "var(--ci-text)" }}
              />
            </div>

            {/* Database selector */}
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold" style={{ color: "var(--ci-text-muted)" }}>
                Databases <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <div
                className="max-h-48 space-y-1 overflow-y-auto rounded-xl p-2"
                style={{
                  background: "var(--ci-bg-wash)",
                  border: errors.databases ? "2px solid #EF4444" : "1px solid var(--ci-border)",
                }}
              >
                {MOCK_DATABASES.map((db) => {
                  const isSelected = selectedDbIds.includes(db.id);
                  return (
                    <button
                      key={db.id}
                      type="button"
                      onClick={() => toggleDb(db.id)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all"
                      style={{
                        background: isSelected ? "var(--ci-accent-subtle)" : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "var(--ci-bg-hover)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {/* Checkbox */}
                      <div
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-all"
                        style={{
                          background: isSelected ? "var(--ci-navy)" : "transparent",
                          border: isSelected ? "none" : "2px solid var(--ci-border)",
                        }}
                      >
                        {isSelected && <IconCheck className="h-3 w-3 text-white" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <IconDatabase className="h-3.5 w-3.5" style={{ color: "var(--ci-navy)" }} />
                        <span className="text-[13px] font-medium" style={{ color: "var(--ci-text)" }}>
                          {db.name}
                        </span>
                        <span className="text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                          {db.type}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {errors.databases && <p className="mt-1 text-[11px]" style={{ color: "#EF4444" }}>{errors.databases}</p>}
              {selectedDbIds.length > 0 && (
                <p className="mt-1.5 text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                  {selectedDbIds.length} database{selectedDbIds.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 border-t pt-4" style={{ borderColor: "var(--ci-border)" }}>
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
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl px-5 py-2.5 text-[12px] font-semibold text-white transition-all hover:shadow-lg active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, var(--ci-navy), var(--ci-navy-light))",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </span>
                ) : mode === "edit" ? (
                  "Update Collection"
                ) : (
                  "Create Collection"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
