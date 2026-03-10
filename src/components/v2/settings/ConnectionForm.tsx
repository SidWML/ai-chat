"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnectionStore } from "@/stores/v2/connectionStore";
import {
  useConnection,
  useCreateConnection,
  useUpdateConnection,
  useTestConnection,
} from "@/lib/v2/queries";
import type {
  DatabaseType,
  ConnectionConfig,
  CreateConnectionRequest,
  TestConnectionResult,
} from "@/lib/v2/types";
import { IconX, IconDatabase, IconCheck } from "@/components/v2/ui/Icons";
import { cn } from "@/lib/cn";

const DB_COLORS: Record<string, string> = {
  postgresql: "#336791",
  mysql: "#00758F",
  mssql: "#4F5D8A",
};

const DEFAULT_PORTS: Record<DatabaseType, number> = {
  postgresql: 5432,
  mysql: 3306,
  mssql: 1433,
};

const DB_LABELS: Record<DatabaseType, string> = {
  postgresql: "PostgreSQL",
  mysql: "MySQL",
  mssql: "SQL Server",
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

export default function ConnectionForm() {
  const {
    isFormOpen,
    formMode,
    editingConnectionId,
    closeForm,
  } = useConnectionStore();

  const [form, setForm] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [testResult, setTestResult] = useState<TestConnectionResult | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: editConnection, isLoading: isLoadingConnection } = useConnection(
    formMode === "edit" ? editingConnectionId : null,
    true
  );

  const createMutation = useCreateConnection();
  const updateMutation = useUpdateConnection();
  const testMutation = useTestConnection();

  // Pre-fill form when editing
  useEffect(() => {
    if (formMode === "edit" && editConnection) {
      setForm({
        name: editConnection.name,
        description: editConnection.description || "",
        type: editConnection.type,
        host: editConnection.config?.host || "",
        port: editConnection.config?.port || DEFAULT_PORTS[editConnection.type as DatabaseType] || 5432,
        database: editConnection.config?.database || "",
        username: editConnection.config?.username || "",
        password: editConnection.config?.password || "",
        ssl: editConnection.config?.ssl || false,
      });
    } else if (formMode === "create") {
      setForm(initialFormData);
    }
  }, [formMode, editConnection]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isFormOpen) {
      setErrors({});
      setTestResult(null);
      setSaveError(null);
      setForm(initialFormData);
    }
  }, [isFormOpen]);

  const validate = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    if (!form.name.trim()) newErrors.name = "Connection name is required";
    if (!form.host.trim()) newErrors.host = "Host is required";
    if (!form.database.trim()) newErrors.database = "Database name is required";
    if (!form.username.trim()) newErrors.username = "Username is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleTypeChange = (type: DatabaseType) => {
    setForm((prev) => ({
      ...prev,
      type,
      port: DEFAULT_PORTS[type],
    }));
    setTestResult(null);
  };

  const buildConfig = (): ConnectionConfig => ({
    host: form.host,
    port: form.port,
    database: form.database,
    username: form.username,
    password: form.password,
    ssl: form.ssl,
  });

  const handleTest = async () => {
    if (!validate()) return;
    setTestResult(null);
    setSaveError(null);
    try {
      const result = await testMutation.mutateAsync({
        type: form.type,
        config: buildConfig(),
      });
      setTestResult(result);
    } catch (err) {
      setTestResult({
        success: false,
        error: err instanceof Error ? err.message : "Connection test failed",
        suggestions: ["Check your connection details and try again"],
      });
    }
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaveError(null);
    try {
      if (formMode === "edit" && editingConnectionId) {
        await updateMutation.mutateAsync({
          id: editingConnectionId,
          data: {
            name: form.name,
            description: form.description || undefined,
            config: buildConfig(),
          },
        });
      } else {
        const req: CreateConnectionRequest = {
          name: form.name,
          description: form.description || undefined,
          type: form.type,
          config: buildConfig(),
        };
        await createMutation.mutateAsync(req);
      }
      closeForm();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save connection"
      );
    }
  };

  if (!isFormOpen) return null;

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isTesting = testMutation.isPending;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeForm();
      }}
    >
      {/* Inline animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: "var(--ci-bg-surface)",
          border: "1px solid var(--ci-border)",
          animation: "slideIn 0.25s ease-out",
        }}
      >
        {/* Colored top accent bar */}
        <div
          className="h-1"
          style={{ background: DB_COLORS[form.type] }}
        />

        <div className="p-6">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
                style={{ background: DB_COLORS[form.type] }}
              >
                <IconDatabase className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2
                  className="text-[16px] font-bold"
                  style={{ color: "var(--ci-text)" }}
                >
                  {formMode === "edit" ? "Edit Connection" : "New Connection"}
                </h2>
                <p
                  className="text-[11px]"
                  style={{ color: "var(--ci-text-muted)" }}
                >
                  {formMode === "edit"
                    ? "Update your database connection settings"
                    : "Configure a new database connection"}
                </p>
              </div>
            </div>
            <button
              onClick={closeForm}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-black/5"
              style={{ color: "var(--ci-text-muted)" }}
            >
              <IconX className="h-4 w-4" />
            </button>
          </div>

          {/* Loading state for edit mode */}
          {formMode === "edit" && isLoadingConnection ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3">
              <div
                className="h-7 w-7 animate-spin rounded-full border-2 border-t-transparent"
                style={{
                  borderColor: "var(--ci-border)",
                  borderTopColor: "transparent",
                }}
              />
              <p className="text-[12px]" style={{ color: "var(--ci-text-muted)" }}>
                Loading connection details...
              </p>
            </div>
          ) : (
            <div className="max-h-[calc(100vh-200px)] space-y-4 overflow-y-auto">
              {/* Database Type selector */}
              <div>
                <label
                  className="mb-1.5 block text-[12px] font-semibold"
                  style={{ color: "var(--ci-text-muted)" }}
                >
                  Database Type
                </label>
                <div className="flex gap-2">
                  {(Object.keys(DB_LABELS) as DatabaseType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => handleTypeChange(t)}
                      disabled={formMode === "edit"}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[12px] font-semibold transition-all",
                        formMode === "edit" && form.type !== t && "opacity-30"
                      )}
                      style={
                        form.type === t
                          ? {
                              background: DB_COLORS[t],
                              color: "#fff",
                              boxShadow: `0 2px 8px ${DB_COLORS[t]}40`,
                            }
                          : {
                              background: "var(--ci-bg-wash)",
                              border: "1px solid var(--ci-border)",
                              color: "var(--ci-text-muted)",
                            }
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
                <label
                  className="mb-1.5 block text-[12px] font-semibold"
                  style={{ color: "var(--ci-text-muted)" }}
                >
                  Connection Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, name: e.target.value }));
                    if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                  }}
                  placeholder="e.g. Production DB, Analytics Warehouse"
                  className={cn(
                    "w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-all focus:ring-2",
                    errors.name ? "ring-2 ring-red-400" : "focus:ring-blue-300"
                  )}
                  style={{
                    background: "var(--ci-bg-wash)",
                    border: "1px solid var(--ci-border)",
                    color: "var(--ci-text)",
                  }}
                />
                {errors.name && (
                  <p className="mt-1 text-[11px] text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  className="mb-1.5 block text-[12px] font-semibold"
                  style={{ color: "var(--ci-text-muted)" }}
                >
                  Description
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Optional description for this connection"
                  className="w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-all focus:ring-2 focus:ring-blue-300"
                  style={{
                    background: "var(--ci-bg-wash)",
                    border: "1px solid var(--ci-border)",
                    color: "var(--ci-text)",
                  }}
                />
              </div>

              {/* Divider */}
              <div
                className="my-1 border-t"
                style={{ borderColor: "var(--ci-border)" }}
              />

              {/* Host & Port */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label
                    className="mb-1.5 block text-[12px] font-semibold"
                    style={{ color: "var(--ci-text-muted)" }}
                  >
                    Host <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.host}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, host: e.target.value }));
                      if (errors.host) setErrors((p) => ({ ...p, host: undefined }));
                    }}
                    placeholder="localhost or db.example.com"
                    className={cn(
                      "w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-all focus:ring-2",
                      errors.host ? "ring-2 ring-red-400" : "focus:ring-blue-300"
                    )}
                    style={{
                      background: "var(--ci-bg-wash)",
                      border: "1px solid var(--ci-border)",
                      color: "var(--ci-text)",
                    }}
                  />
                  {errors.host && (
                    <p className="mt-1 text-[11px] text-red-500">{errors.host}</p>
                  )}
                </div>
                <div className="w-24">
                  <label
                    className="mb-1.5 block text-[12px] font-semibold"
                    style={{ color: "var(--ci-text-muted)" }}
                  >
                    Port
                  </label>
                  <input
                    type="number"
                    value={form.port}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        port: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-all focus:ring-2 focus:ring-blue-300"
                    style={{
                      background: "var(--ci-bg-wash)",
                      border: "1px solid var(--ci-border)",
                      color: "var(--ci-text)",
                    }}
                  />
                </div>
              </div>

              {/* Database */}
              <div>
                <label
                  className="mb-1.5 block text-[12px] font-semibold"
                  style={{ color: "var(--ci-text-muted)" }}
                >
                  Database <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.database}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, database: e.target.value }));
                    if (errors.database) setErrors((p) => ({ ...p, database: undefined }));
                  }}
                  placeholder="my_database"
                  className={cn(
                    "w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-all focus:ring-2",
                    errors.database ? "ring-2 ring-red-400" : "focus:ring-blue-300"
                  )}
                  style={{
                    background: "var(--ci-bg-wash)",
                    border: "1px solid var(--ci-border)",
                    color: "var(--ci-text)",
                  }}
                />
                {errors.database && (
                  <p className="mt-1 text-[11px] text-red-500">
                    {errors.database}
                  </p>
                )}
              </div>

              {/* Username & Password */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label
                    className="mb-1.5 block text-[12px] font-semibold"
                    style={{ color: "var(--ci-text-muted)" }}
                  >
                    Username <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, username: e.target.value }));
                      if (errors.username) setErrors((p) => ({ ...p, username: undefined }));
                    }}
                    placeholder="postgres"
                    className={cn(
                      "w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-all focus:ring-2",
                      errors.username ? "ring-2 ring-red-400" : "focus:ring-blue-300"
                    )}
                    style={{
                      background: "var(--ci-bg-wash)",
                      border: "1px solid var(--ci-border)",
                      color: "var(--ci-text)",
                    }}
                  />
                  {errors.username && (
                    <p className="mt-1 text-[11px] text-red-500">
                      {errors.username}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <label
                    className="mb-1.5 block text-[12px] font-semibold"
                    style={{ color: "var(--ci-text-muted)" }}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, password: e.target.value }))
                    }
                    placeholder="********"
                    className="w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-all focus:ring-2 focus:ring-blue-300"
                    style={{
                      background: "var(--ci-bg-wash)",
                      border: "1px solid var(--ci-border)",
                      color: "var(--ci-text)",
                    }}
                  />
                </div>
              </div>

              {/* SSL Toggle */}
              <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 transition-colors hover:bg-black/[0.02]"
                style={{
                  background: "var(--ci-bg-wash)",
                  border: "1px solid var(--ci-border)",
                }}
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.ssl}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, ssl: e.target.checked }))
                    }
                    className="peer sr-only"
                  />
                  <div
                    className="h-5 w-9 rounded-full transition-colors peer-checked:bg-green-500"
                    style={{ background: form.ssl ? "#22C55E" : "var(--ci-border)" }}
                  />
                  <div
                    className={cn(
                      "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                      form.ssl && "translate-x-4"
                    )}
                  />
                </div>
                <div>
                  <span
                    className="text-[13px] font-medium"
                    style={{ color: "var(--ci-text)" }}
                  >
                    SSL / TLS
                  </span>
                  <p
                    className="text-[11px]"
                    style={{ color: "var(--ci-text-muted)" }}
                  >
                    Encrypt the connection to the database
                  </p>
                </div>
              </label>

              {/* Inline test result */}
              {testResult && (
                <div
                  className="rounded-xl p-3.5"
                  style={{
                    background: testResult.success
                      ? "rgba(22, 163, 74, 0.08)"
                      : "rgba(239, 68, 68, 0.08)",
                    border: `1px solid ${testResult.success ? "rgba(22, 163, 74, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500">
                        <IconCheck className="h-3 w-3 text-white" />
                      </div>
                    ) : (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500">
                        <IconX className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <span
                      className="text-[13px] font-semibold"
                      style={{
                        color: testResult.success ? "#16A34A" : "#EF4444",
                      }}
                    >
                      {testResult.success
                        ? "Connection successful"
                        : "Connection failed"}
                    </span>
                    <button
                      onClick={() => setTestResult(null)}
                      className="ml-auto shrink-0"
                      style={{ color: "var(--ci-text-muted)" }}
                    >
                      <IconX className="h-3 w-3" />
                    </button>
                  </div>
                  {testResult.success && (
                    <div className="mt-2 flex flex-wrap gap-3">
                      {testResult.latency_ms != null && (
                        <span
                          className="rounded-md px-2 py-0.5 text-[11px] font-medium"
                          style={{
                            background: "rgba(22, 163, 74, 0.1)",
                            color: "#16A34A",
                          }}
                        >
                          {testResult.latency_ms}ms latency
                        </span>
                      )}
                      {testResult.database_version && (
                        <span
                          className="rounded-md px-2 py-0.5 text-[11px] font-medium"
                          style={{
                            background: "rgba(22, 163, 74, 0.1)",
                            color: "#16A34A",
                          }}
                        >
                          v{testResult.database_version}
                        </span>
                      )}
                      {testResult.tables_count != null && (
                        <span
                          className="rounded-md px-2 py-0.5 text-[11px] font-medium"
                          style={{
                            background: "rgba(22, 163, 74, 0.1)",
                            color: "#16A34A",
                          }}
                        >
                          {testResult.tables_count} tables
                        </span>
                      )}
                    </div>
                  )}
                  {!testResult.success && testResult.error && (
                    <p className="mt-1.5 text-[11px]" style={{ color: "#EF4444" }}>
                      {testResult.error}
                    </p>
                  )}
                  {!testResult.success &&
                    testResult.suggestions &&
                    testResult.suggestions.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5">
                        {testResult.suggestions.map((s, i) => (
                          <li
                            key={i}
                            className="text-[11px]"
                            style={{ color: "var(--ci-text-muted)" }}
                          >
                            &bull; {s}
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              )}

              {/* Save Error */}
              {saveError && (
                <div
                  className="flex items-center gap-2 rounded-xl p-3.5 text-[12px]"
                  style={{
                    background: "rgba(239, 68, 68, 0.08)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    color: "#EF4444",
                  }}
                >
                  <IconX className="h-4 w-4 shrink-0" />
                  {saveError}
                </div>
              )}

              {/* Actions */}
              <div
                className="flex items-center gap-3 border-t pt-4"
                style={{ borderColor: "var(--ci-border)" }}
              >
                <button
                  onClick={handleTest}
                  disabled={isTesting}
                  className="rounded-xl px-4 py-2.5 text-[12px] font-semibold transition-all hover:shadow-sm active:scale-[0.98] disabled:opacity-50"
                  style={{
                    background: "var(--ci-bg-wash)",
                    border: "1px solid var(--ci-border)",
                    color: "var(--ci-text)",
                  }}
                >
                  {isTesting ? (
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-t-transparent"
                        style={{
                          borderColor: "var(--ci-text-muted)",
                          borderTopColor: "transparent",
                        }}
                      />
                      Testing...
                    </span>
                  ) : (
                    "Test Connection"
                  )}
                </button>
                <div className="flex-1" />
                <button
                  onClick={closeForm}
                  className="rounded-xl px-4 py-2.5 text-[12px] font-semibold transition-all hover:bg-black/5"
                  style={{ color: "var(--ci-text-muted)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-xl px-5 py-2.5 text-[12px] font-semibold text-white transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
                  style={{
                    background: `linear-gradient(135deg, ${DB_COLORS[form.type]}, ${DB_COLORS[form.type]}cc)`,
                  }}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </span>
                  ) : formMode === "edit" ? (
                    "Update Connection"
                  ) : (
                    "Save Connection"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
