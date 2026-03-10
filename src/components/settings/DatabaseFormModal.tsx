"use client";

import { useState, useEffect, useCallback } from "react";
import type { Database, DatabaseType } from "@/lib/types";
import { IconDatabase, IconX, IconCheck } from "@/components/v2/ui/Icons";

const DB_COLORS: Record<string, string> = {
  postgresql: "#336791",
  mysql: "#00758F",
  mongodb: "#47A248",
  sqlite: "#003B57",
  other: "#64748B",
};

const DEFAULT_PORTS: Record<string, number> = {
  postgresql: 5432,
  mysql: 3306,
  mongodb: 27017,
  sqlite: 0,
  other: 5432,
};

const DB_LABELS: Record<string, string> = {
  postgresql: "PostgreSQL",
  mysql: "MySQL",
  mongodb: "MongoDB",
  sqlite: "SQLite",
};

interface FormData {
  name: string;
  description: string;
  type: DatabaseType;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
}

const initialFormData: FormData = {
  name: "",
  description: "",
  type: "postgresql",
  host: "",
  port: 5432,
  database: "",
  username: "",
  password: "",
  ssl: false,
};

interface ValidationErrors {
  name?: string;
  host?: string;
  database?: string;
  username?: string;
}

interface DatabaseFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  editingDb?: Database | null;
  onClose: () => void;
  onSave: (data: FormData) => void;
}

export function DatabaseFormModal({
  open,
  mode,
  editingDb,
  onClose,
  onSave,
}: DatabaseFormModalProps) {
  const [form, setForm] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [testState, setTestState] = useState<"idle" | "testing" | "success" | "failed">("idle");
  const [saving, setSaving] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (mode === "edit" && editingDb) {
      setForm({
        name: editingDb.name,
        description: editingDb.description || "",
        type: editingDb.type,
        host: "localhost",
        port: DEFAULT_PORTS[editingDb.type] || 5432,
        database: editingDb.name.toLowerCase().replace(/\s+/g, "_"),
        username: "admin",
        password: "",
        ssl: false,
      });
    } else if (mode === "create") {
      setForm(initialFormData);
    }
  }, [mode, editingDb]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setErrors({});
      setTestState("idle");
      setSaving(false);
      setForm(initialFormData);
    }
  }, [open]);

  const validate = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (form.type !== "sqlite" && !form.host.trim()) newErrors.host = "Host is required";
    if (!form.database.trim()) newErrors.database = "Database name is required";
    if (form.type !== "sqlite" && !form.username.trim()) newErrors.username = "Username is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleTypeChange = (type: DatabaseType) => {
    setForm((prev) => ({
      ...prev,
      type,
      port: DEFAULT_PORTS[type] || 5432,
    }));
    setTestState("idle");
  };

  const handleTest = () => {
    if (!validate()) return;
    setTestState("testing");
    // Simulate test connection
    setTimeout(() => {
      setTestState(Math.random() > 0.2 ? "success" : "failed");
    }, 1500);
  };

  const handleSave = () => {
    if (!validate()) return;
    setSaving(true);
    // Simulate save
    setTimeout(() => {
      onSave(form);
      setSaving(false);
      onClose();
    }, 800);
  };

  if (!open) return null;

  const accentColor = DB_COLORS[form.type] || DB_COLORS.other;

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
        className="relative w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: "var(--ci-bg-surface)",
          border: "1px solid var(--ci-border)",
          animation: "ciModalSlideIn 0.25s ease-out",
        }}
      >
        {/* Colored top accent bar */}
        <div className="h-1" style={{ background: accentColor }} />

        <div className="p-6">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: accentColor }}
              >
                <IconDatabase className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-[16px] font-bold" style={{ color: "var(--ci-text)" }}>
                  {mode === "edit" ? "Edit Database" : "Add Database"}
                </h2>
                <p className="text-[11px]" style={{ color: "var(--ci-text-muted)" }}>
                  {mode === "edit"
                    ? "Update your database connection settings"
                    : "Configure a new database connection"}
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

          <div className="max-h-[calc(100vh-200px)] space-y-4 overflow-y-auto ci-scrollbar">
            {/* Database Type selector */}
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold" style={{ color: "var(--ci-text-muted)" }}>
                Database Type
              </label>
              <div className="flex gap-2">
                {(Object.keys(DB_LABELS) as DatabaseType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleTypeChange(t)}
                    disabled={mode === "edit"}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[12px] font-semibold transition-all"
                    style={
                      form.type === t
                        ? { background: DB_COLORS[t], color: "#fff", boxShadow: `0 2px 8px ${DB_COLORS[t]}40` }
                        : { background: "var(--ci-bg-wash)", border: "1px solid var(--ci-border)", color: "var(--ci-text-muted)", opacity: mode === "edit" && form.type !== t ? 0.3 : 1 }
                    }
                  >
                    {form.type === t && <IconCheck className="h-3 w-3" />}
                    {DB_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold" style={{ color: "var(--ci-text-muted)" }}>
                Connection Name <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => {
                  setForm((p) => ({ ...p, name: e.target.value }));
                  if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                }}
                placeholder="e.g. Production DB, Analytics Warehouse"
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
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Optional description for this connection"
                className="w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-all"
                style={{ background: "var(--ci-bg-wash)", border: "1px solid var(--ci-border)", color: "var(--ci-text)" }}
              />
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px solid var(--ci-border)" }} />

            {/* Host & Port */}
            {form.type !== "sqlite" && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1.5 block text-[12px] font-semibold" style={{ color: "var(--ci-text-muted)" }}>
                    Host <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={form.host}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, host: e.target.value }));
                      if (errors.host) setErrors((p) => ({ ...p, host: undefined }));
                    }}
                    placeholder="localhost or db.example.com"
                    className="w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-all"
                    style={{
                      background: "var(--ci-bg-wash)",
                      border: errors.host ? "2px solid #EF4444" : "1px solid var(--ci-border)",
                      color: "var(--ci-text)",
                    }}
                  />
                  {errors.host && <p className="mt-1 text-[11px]" style={{ color: "#EF4444" }}>{errors.host}</p>}
                </div>
                <div className="w-24">
                  <label className="mb-1.5 block text-[12px] font-semibold" style={{ color: "var(--ci-text-muted)" }}>
                    Port
                  </label>
                  <input
                    type="number"
                    value={form.port}
                    onChange={(e) => setForm((p) => ({ ...p, port: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-all"
                    style={{ background: "var(--ci-bg-wash)", border: "1px solid var(--ci-border)", color: "var(--ci-text)" }}
                  />
                </div>
              </div>
            )}

            {/* Database */}
            <div>
              <label className="mb-1.5 block text-[12px] font-semibold" style={{ color: "var(--ci-text-muted)" }}>
                {form.type === "sqlite" ? "File Path" : "Database"} <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                type="text"
                value={form.database}
                onChange={(e) => {
                  setForm((p) => ({ ...p, database: e.target.value }));
                  if (errors.database) setErrors((p) => ({ ...p, database: undefined }));
                }}
                placeholder={form.type === "sqlite" ? "/path/to/database.db" : "my_database"}
                className="w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-all"
                style={{
                  background: "var(--ci-bg-wash)",
                  border: errors.database ? "2px solid #EF4444" : "1px solid var(--ci-border)",
                  color: "var(--ci-text)",
                }}
              />
              {errors.database && <p className="mt-1 text-[11px]" style={{ color: "#EF4444" }}>{errors.database}</p>}
            </div>

            {/* Username & Password */}
            {form.type !== "sqlite" && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="mb-1.5 block text-[12px] font-semibold" style={{ color: "var(--ci-text-muted)" }}>
                    Username <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, username: e.target.value }));
                      if (errors.username) setErrors((p) => ({ ...p, username: undefined }));
                    }}
                    placeholder="postgres"
                    className="w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-all"
                    style={{
                      background: "var(--ci-bg-wash)",
                      border: errors.username ? "2px solid #EF4444" : "1px solid var(--ci-border)",
                      color: "var(--ci-text)",
                    }}
                  />
                  {errors.username && <p className="mt-1 text-[11px]" style={{ color: "#EF4444" }}>{errors.username}</p>}
                </div>
                <div className="flex-1">
                  <label className="mb-1.5 block text-[12px] font-semibold" style={{ color: "var(--ci-text-muted)" }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="********"
                    className="w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-all"
                    style={{ background: "var(--ci-bg-wash)", border: "1px solid var(--ci-border)", color: "var(--ci-text)" }}
                  />
                </div>
              </div>
            )}

            {/* SSL Toggle */}
            {form.type !== "sqlite" && (
              <label
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 transition-colors"
                style={{ background: "var(--ci-bg-wash)", border: "1px solid var(--ci-border)" }}
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.ssl}
                    onChange={(e) => setForm((p) => ({ ...p, ssl: e.target.checked }))}
                    className="peer sr-only"
                  />
                  <div
                    className="h-5 w-9 rounded-full transition-colors"
                    style={{ background: form.ssl ? "#22C55E" : "var(--ci-border)" }}
                  />
                  <div
                    className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
                    style={{ transform: form.ssl ? "translateX(16px)" : "translateX(0)" }}
                  />
                </div>
                <div>
                  <span className="text-[13px] font-medium" style={{ color: "var(--ci-text)" }}>SSL / TLS</span>
                  <p className="text-[11px]" style={{ color: "var(--ci-text-muted)" }}>Encrypt the connection to the database</p>
                </div>
              </label>
            )}

            {/* Test result */}
            {testState !== "idle" && testState !== "testing" && (
              <div
                className="rounded-xl p-3.5"
                style={{
                  background: testState === "success" ? "rgba(22, 163, 74, 0.08)" : "rgba(239, 68, 68, 0.08)",
                  border: `1px solid ${testState === "success" ? "rgba(22, 163, 74, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
                }}
              >
                <div className="flex items-center gap-2">
                  {testState === "success" ? (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: "#16A34A" }}>
                      <IconCheck className="h-3 w-3 text-white" />
                    </div>
                  ) : (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: "#EF4444" }}>
                      <IconX className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <span className="text-[13px] font-semibold" style={{ color: testState === "success" ? "#16A34A" : "#EF4444" }}>
                    {testState === "success" ? "Connection successful" : "Connection failed"}
                  </span>
                  <button onClick={() => setTestState("idle")} className="ml-auto shrink-0" style={{ color: "var(--ci-text-muted)" }}>
                    <IconX className="h-3 w-3" />
                  </button>
                </div>
                {testState === "success" && (
                  <div className="mt-2 flex flex-wrap gap-3">
                    <span className="rounded-md px-2 py-0.5 text-[11px] font-medium" style={{ background: "rgba(22, 163, 74, 0.1)", color: "#16A34A" }}>
                      42ms latency
                    </span>
                    <span className="rounded-md px-2 py-0.5 text-[11px] font-medium" style={{ background: "rgba(22, 163, 74, 0.1)", color: "#16A34A" }}>
                      v15.4
                    </span>
                  </div>
                )}
                {testState === "failed" && (
                  <p className="mt-1.5 text-[11px]" style={{ color: "#EF4444" }}>
                    Could not connect. Check your host, port, and credentials.
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 border-t pt-4" style={{ borderColor: "var(--ci-border)" }}>
              <button
                onClick={handleTest}
                disabled={testState === "testing"}
                className="rounded-xl px-4 py-2.5 text-[12px] font-semibold transition-all active:scale-[0.98]"
                style={{ background: "var(--ci-bg-wash)", border: "1px solid var(--ci-border)", color: "var(--ci-text)", opacity: testState === "testing" ? 0.6 : 1 }}
              >
                {testState === "testing" ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: "var(--ci-text-muted)", borderTopColor: "transparent" }} />
                    Testing...
                  </span>
                ) : (
                  "Test Connection"
                )}
              </button>
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
                style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, opacity: saving ? 0.6 : 1 }}
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </span>
                ) : mode === "edit" ? (
                  "Update Database"
                ) : (
                  "Save Database"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
