"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { threadApi, connectionApi, metadataApi, introspectionApi, promptsApi, dashboardApi, suggestionsApi, collectionsApi } from "./api";

// === Thread Hooks ===
export function useSearchThreads(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ["threads", params],
    queryFn: () => threadApi.search(params),
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });
}

export function useThreadState(threadId: string | null) {
  return useQuery({
    queryKey: ["thread-state", threadId],
    queryFn: () => threadApi.getState(threadId!),
    enabled: !!threadId,
    staleTime: 2_000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { thread_id: string; title?: string }) => threadApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["threads"] }),
  });
}

export function useDeleteThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (threadId: string) => threadApi.delete(threadId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["threads"] }),
  });
}

export function useCanvasHistory(threadId: string | null) {
  return useQuery({
    queryKey: ["canvas-history", threadId],
    queryFn: () => threadApi.getCanvasHistory(threadId!),
    enabled: !!threadId,
    staleTime: 60_000,
  });
}

// === Connection Hooks ===
export function useConnections(page = 1, pageSize = 50) {
  return useQuery({
    queryKey: ["connections", page, pageSize],
    queryFn: () => connectionApi.list(page, pageSize),
    staleTime: 30_000,
  });
}

export function useConnection(id: string | null, includeConfig = false) {
  return useQuery({
    queryKey: ["connection", id, includeConfig],
    queryFn: () => connectionApi.get(id!, includeConfig),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => connectionApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["connections"] }),
  });
}

export function useUpdateConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => connectionApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["connections"] }),
  });
}

export function useDeleteConnection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => connectionApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["connections"] }),
  });
}

export function useTestConnection() {
  return useMutation({ mutationFn: (data: any) => connectionApi.test(data) });
}

export function useTestExistingConnection() {
  return useMutation({ mutationFn: (id: string) => connectionApi.testExisting(id) });
}

// === Metadata Hooks ===
export function useTables(connectionId: string | null, schema?: string) {
  return useQuery({
    queryKey: ["tables", connectionId, schema],
    queryFn: () => metadataApi.listTables(connectionId!, schema),
    enabled: !!connectionId,
    staleTime: 60_000,
  });
}

export function useTableSchema(connectionId: string | null, tableName: string | null, schema?: string) {
  return useQuery({
    queryKey: ["table-schema", connectionId, tableName, schema],
    queryFn: () => metadataApi.getTableSchema(connectionId!, tableName!, schema),
    enabled: !!connectionId && !!tableName,
    staleTime: 60_000,
  });
}

export function useSampleData(connectionId: string | null, tableName: string | null, limit = 10) {
  return useQuery({
    queryKey: ["sample-data", connectionId, tableName, limit],
    queryFn: () => metadataApi.getSampleData(connectionId!, tableName!, limit),
    enabled: !!connectionId && !!tableName,
    staleTime: 30_000,
  });
}

export function useRelationships(connectionId: string | null) {
  return useQuery({
    queryKey: ["relationships", connectionId],
    queryFn: () => metadataApi.getRelationships(connectionId!),
    enabled: !!connectionId,
    staleTime: 60_000,
  });
}

export function useRefreshMetadata() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ connectionId, tables }: { connectionId: string; tables?: string[] }) =>
      metadataApi.refresh(connectionId, tables),
    onSuccess: (_, { connectionId }) => {
      qc.invalidateQueries({ queryKey: ["tables", connectionId] });
      qc.invalidateQueries({ queryKey: ["table-schema", connectionId] });
      qc.invalidateQueries({ queryKey: ["sample-data", connectionId] });
    },
  });
}

// === Introspection Hooks ===
export function useIntrospectionStatus(connectionId: string | null, polling = false) {
  return useQuery({
    queryKey: ["introspection-status", connectionId],
    queryFn: () => introspectionApi.getStatus(connectionId!),
    enabled: !!connectionId,
    refetchInterval: polling ? 2000 : false,
    staleTime: 0,
  });
}

export function useStartIntrospection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ connectionId, config }: { connectionId: string; config?: Record<string, unknown> }) =>
      introspectionApi.start(connectionId, config),
    onSuccess: (_, { connectionId }) => {
      qc.invalidateQueries({ queryKey: ["introspection-status", connectionId] });
    },
  });
}

export function useIntrospectionMetadata(connectionId: string | null) {
  return useQuery({
    queryKey: ["introspection-metadata", connectionId],
    queryFn: () => introspectionApi.getMetadata(connectionId!),
    enabled: !!connectionId,
    staleTime: 60_000,
  });
}

export function useValidatedExamples(connectionId: string | null) {
  return useQuery({
    queryKey: ["validated-examples", connectionId],
    queryFn: () => introspectionApi.getValidatedExamples(connectionId!),
    enabled: !!connectionId,
    staleTime: 60_000,
  });
}

// === Prompt Hooks ===
export function usePrompts(connectionId: string | null) {
  return useQuery({
    queryKey: ["prompts", connectionId],
    queryFn: () => promptsApi.list(connectionId!),
    enabled: !!connectionId,
    staleTime: 60_000,
  });
}

export function useUpdatePrompt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ connectionId, promptId, text }: { connectionId: string; promptId: string; text: string }) =>
      promptsApi.update(connectionId, promptId, text),
    onSuccess: (_, { connectionId }) => {
      qc.invalidateQueries({ queryKey: ["prompts", connectionId] });
    },
  });
}

// === Dashboard Hooks ===
export function useDashboards() {
  return useQuery({
    queryKey: ["dashboards"],
    queryFn: () => dashboardApi.list(),
    staleTime: 30_000,
  });
}

export function useDashboard(id: string | null) {
  return useQuery({
    queryKey: ["dashboard", id],
    queryFn: () => dashboardApi.get(id!),
    enabled: !!id,
    staleTime: 10_000,
  });
}

export function useCreateDashboard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => dashboardApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboards"] }),
  });
}

export function useDeleteDashboard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dashboardApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dashboards"] }),
  });
}

export function useAddWidget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ dashboardId, data }: { dashboardId: string; data: any }) =>
      dashboardApi.addWidget(dashboardId, data),
    onSuccess: (_, { dashboardId }) => qc.invalidateQueries({ queryKey: ["dashboard", dashboardId] }),
  });
}

export function useRemoveWidget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ dashboardId, widgetId }: { dashboardId: string; widgetId: string }) =>
      dashboardApi.removeWidget(dashboardId, widgetId),
    onSuccess: (_, { dashboardId }) => qc.invalidateQueries({ queryKey: ["dashboard", dashboardId] }),
  });
}

export function useUpdateWidget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ dashboardId, widgetId, data }: { dashboardId: string; widgetId: string; data: any }) =>
      dashboardApi.updateWidget(dashboardId, widgetId, data),
    onSuccess: (_, { dashboardId }) => qc.invalidateQueries({ queryKey: ["dashboard", dashboardId] }),
  });
}

// === Suggestions Hooks ===
export function useSuggestions(connectionId: string | null) {
  return useQuery({
    queryKey: ["suggestions", connectionId],
    queryFn: () => suggestionsApi.list(connectionId!),
    enabled: !!connectionId,
    staleTime: 60_000,
  });
}

// === Collection Hooks ===
export function useCollections() {
  return useQuery({
    queryKey: ["collections"],
    queryFn: () => collectionsApi.list(),
    staleTime: 30_000,
  });
}

export function useCollection(id: string | null) {
  return useQuery({
    queryKey: ["collection", id],
    queryFn: () => collectionsApi.get(id!),
    enabled: !!id,
    staleTime: 10_000,
  });
}

export function useCreateCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => collectionsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collections"] }),
  });
}

export function useUpdateCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => collectionsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collections"] }),
  });
}

export function useDeleteCollection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => collectionsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["collections"] }),
  });
}
