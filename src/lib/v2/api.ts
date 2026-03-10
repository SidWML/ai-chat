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

// === Thread API ===
export const threadApi = {
  search: (params?: { limit?: number; offset?: number }) =>
    httpJson<any[]>("/threads/search", {
      method: "POST",
      body: JSON.stringify({
        limit: params?.limit ?? 50,
        offset: params?.offset ?? 0,
      }),
    }),

  getState: (threadId: string) =>
    httpJson<any>(`/threads/${threadId}/state`),

  create: (data: { thread_id: string; title?: string }) =>
    httpJson<any>("/threads", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  delete: (threadId: string) =>
    httpJson<void>(`/threads/${threadId}`, { method: "DELETE" }),

  getCanvasHistory: (threadId: string) =>
    httpJson<any[]>(`/api/v1/canvas-history/${threadId}`),
};

// === Connection API ===
export const connectionApi = {
  list: (page = 1, pageSize = 50) =>
    httpJson<any>(
      `/api/v1/connections?page=${page}&page_size=${pageSize}`
    ),

  get: (id: string, includeConfig = false) =>
    httpJson<any>(
      `/api/v1/connections/${id}${includeConfig ? "?include_config=true" : ""}`
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
  list: () => httpJson<any[]>("/api/v1/dashboards"),
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
    httpJson<any[]>(`/api/v1/connections/${connectionId}/suggestions`),
};

// === Collections API ===
export const collectionsApi = {
  list: () => httpJson<any[]>("/api/v1/collections"),
  get: (id: string) => httpJson<any>(`/api/v1/collections/${id}`),
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
