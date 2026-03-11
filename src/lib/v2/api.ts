const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function httpJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...((init?.headers as Record<string, string>) || {}),
    },
  });
  if (response.status === 204 || response.status === 205)
    return undefined as T;
  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(errorBody || `Request failed: ${response.status}`);
  }
  return response.json();
}

/** Try real API, return fallback on network/server error */
async function httpJsonSafe<T>(url: string, init: RequestInit | undefined, fallback: T): Promise<T> {
  try {
    return await httpJson<T>(url, init);
  } catch {
    return fallback;
  }
}

/* ── Demo data for when no backend is running ── */

const DEMO_THREADS = [
  { thread_id: "demo-1", title: "Revenue analysis Q4 2025", updated_at: new Date(Date.now() - 3600000).toISOString(), connection_name: "Production Analytics" },
  { thread_id: "demo-2", title: "Top selling products this month", updated_at: new Date(Date.now() - 7200000).toISOString(), connection_name: "E-Commerce DB" },
  { thread_id: "demo-3", title: "Customer segmentation report", updated_at: new Date(Date.now() - 86400000).toISOString(), connection_name: "Production Analytics" },
  { thread_id: "demo-4", title: "Marketing campaign performance", updated_at: new Date(Date.now() - 86400000 * 2).toISOString(), connection_name: "Marketing DB" },
  { thread_id: "demo-5", title: "Inventory status overview", updated_at: new Date(Date.now() - 86400000 * 3).toISOString(), connection_name: "E-Commerce DB" },
  { thread_id: "demo-6", title: "User growth metrics", updated_at: new Date(Date.now() - 86400000 * 5).toISOString(), connection_name: "Production Analytics" },
];

const DEMO_CONNECTIONS = {
  items: [
    { id: "conn-1", name: "Production Analytics", type: "postgresql", status: "active", tables_count: 42 },
    { id: "conn-2", name: "E-Commerce DB", type: "mysql", status: "active", tables_count: 28 },
    { id: "conn-3", name: "Marketing DB", type: "postgresql", status: "active", tables_count: 15 },
  ],
  total: 3,
};

const DEMO_COLLECTIONS = [
  { id: "col-1", name: "Sales & Revenue", color: "#6366F1", connection_ids: ["conn-1", "conn-2"], description: "All sales-related databases" },
  { id: "col-2", name: "Marketing Analytics", color: "#EC4899", connection_ids: ["conn-3"], description: "Marketing campaign data" },
];

// === Thread API ===
export const threadApi = {
  search: (params?: { limit?: number; offset?: number }) =>
    httpJsonSafe<any[]>("/threads/search", {
      method: "POST",
      body: JSON.stringify({
        limit: params?.limit ?? 50,
        offset: params?.offset ?? 0,
      }),
    }, DEMO_THREADS),

  getState: (threadId: string) =>
    httpJsonSafe<any>(`/threads/${threadId}/state`, undefined, { values: { messages: [] } }),

  create: (data: { thread_id: string; title?: string }) =>
    httpJsonSafe<any>("/threads", {
      method: "POST",
      body: JSON.stringify(data),
    }, data),

  delete: (threadId: string) =>
    httpJsonSafe<void>(`/threads/${threadId}`, { method: "DELETE" }, undefined as any),

  getCanvasHistory: (threadId: string) =>
    httpJsonSafe<any[]>(`/api/v1/canvas-history/${threadId}`, undefined, []),
};

// === Connection API ===
export const connectionApi = {
  list: (page = 1, pageSize = 50) =>
    httpJsonSafe<any>(
      `/api/v1/connections?page=${page}&page_size=${pageSize}`,
      undefined,
      DEMO_CONNECTIONS
    ),

  get: (id: string, includeConfig = false) =>
    httpJsonSafe<any>(
      `/api/v1/connections/${id}${includeConfig ? "?include_config=true" : ""}`,
      undefined,
      DEMO_CONNECTIONS.items.find(c => c.id === id) || DEMO_CONNECTIONS.items[0]
    ),

  create: (data: any) =>
    httpJson<any>("/api/v1/connections", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    httpJson<any>(`/api/v1/connections/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    httpJson<void>(`/api/v1/connections/${id}`, { method: "DELETE" }),

  test: (data: any) =>
    httpJson<any>("/api/v1/connections/test", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  testExisting: (id: string) =>
    httpJson<any>(`/api/v1/connections/${id}/test`, { method: "POST" }),
};

// === Metadata API ===
export const metadataApi = {
  listTables: (connectionId: string, schema?: string) =>
    httpJson<any[]>(
      `/api/v1/metadata/tables?connection_id=${connectionId}${schema ? `&schema=${schema}` : ""}`
    ),

  getTableSchema: (connectionId: string, tableName: string, schema?: string) =>
    httpJson<any>(
      `/api/v1/metadata/tables/${tableName}?connection_id=${connectionId}${schema ? `&schema=${schema}` : ""}`
    ),

  getSampleData: (connectionId: string, tableName: string, limit = 10) =>
    httpJson<any>(
      `/api/v1/metadata/tables/${tableName}/sample?connection_id=${connectionId}&limit=${limit}`
    ),

  getRelationships: (connectionId: string) =>
    httpJson<any[]>(
      `/api/v1/metadata/tables/relationships?connection_id=${connectionId}`
    ),

  refresh: (connectionId: string, tables?: string[]) =>
    httpJson<any>("/api/v1/metadata/refresh", {
      method: "POST",
      body: JSON.stringify({ connection_id: connectionId, tables }),
    }),
};

// === Introspection API ===
export const introspectionApi = {
  start: (connectionId: string, config?: Record<string, unknown>) =>
    httpJson<any>(
      `/api/v1/connections/${connectionId}/introspect`,
      { method: "POST", body: JSON.stringify(config || {}) }
    ),

  getStatus: (connectionId: string) =>
    httpJson<any>(
      `/api/v1/connections/${connectionId}/introspect/status`
    ).catch(() => null),

  getMetadata: (connectionId: string) =>
    httpJson<any>(
      `/api/v1/connections/${connectionId}/introspect/metadata`
    ),

  submitResponses: (connectionId: string, responses: Record<string, unknown>) =>
    httpJson<any>(
      `/api/v1/connections/${connectionId}/introspect/submit-responses`,
      { method: "POST", body: JSON.stringify(responses) }
    ),

  getValidatedExamples: (connectionId: string) =>
    httpJson<any[]>(
      `/api/v1/connections/${connectionId}/validated-examples`
    ),
};

// === Prompts API ===
export const promptsApi = {
  list: (connectionId: string) =>
    httpJson<any[]>(`/api/v1/connections/${connectionId}/prompts`),

  update: (connectionId: string, promptId: string, text: string) =>
    httpJson<any>(`/api/v1/connections/${connectionId}/prompts/${promptId}`, {
      method: "PATCH",
      body: JSON.stringify({ text }),
    }),
};

// === Dashboard API ===
export const dashboardApi = {
  list: () => httpJsonSafe<any[]>("/api/v1/dashboards", undefined, []),
  get: (id: string) => httpJson<any>(`/api/v1/dashboards/${id}`),
  create: (data: any) =>
    httpJson<any>("/api/v1/dashboards", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    httpJson<void>(`/api/v1/dashboards/${id}`, { method: "DELETE" }),
  addWidget: (dashboardId: string, data: any) =>
    httpJson<any>(`/api/v1/dashboards/${dashboardId}/widgets`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  removeWidget: (dashboardId: string, widgetId: string) =>
    httpJson<void>(
      `/api/v1/dashboards/${dashboardId}/widgets/${widgetId}`,
      { method: "DELETE" }
    ),
  updateWidget: (dashboardId: string, widgetId: string, data: any) =>
    httpJson<any>(
      `/api/v1/dashboards/${dashboardId}/widgets/${widgetId}`,
      { method: "PATCH", body: JSON.stringify(data) }
    ),
};

// === Suggestions API ===
export const suggestionsApi = {
  list: (connectionId: string) =>
    httpJsonSafe<any[]>(`/api/v1/connections/${connectionId}/suggestions`, undefined, []),
};

// === Collections API ===
export const collectionsApi = {
  list: () => httpJsonSafe<any[]>("/api/v1/collections", undefined, DEMO_COLLECTIONS),
  get: (id: string) => httpJsonSafe<any>(
    `/api/v1/collections/${id}`,
    undefined,
    DEMO_COLLECTIONS.find(c => c.id === id) || DEMO_COLLECTIONS[0]
  ),
  create: (data: any) =>
    httpJson<any>("/api/v1/collections", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    httpJson<any>(`/api/v1/collections/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    httpJson<void>(`/api/v1/collections/${id}`, { method: "DELETE" }),
};
