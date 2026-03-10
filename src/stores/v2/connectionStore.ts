import { create } from "zustand";
import type { TestConnectionResult } from "@/lib/v2/types";

interface ConnectionStoreState {
  // Active connection for chat
  activeConnectionId: string | null;
  activeConnectionName: string | null;

  // Connection form state
  isFormOpen: boolean;
  formMode: "create" | "edit";
  editingConnectionId: string | null;

  // Testing
  isTestingConnection: boolean;
  testResult: TestConnectionResult | null;
  error: string | null;
}

interface ConnectionStoreActions {
  setActiveConnection: (id: string | null, name: string | null) => void;
  openCreateForm: () => void;
  openEditForm: (connectionId: string) => void;
  closeForm: () => void;
  setTestingConnection: (testing: boolean) => void;
  setTestResult: (result: TestConnectionResult | null) => void;
  setError: (error: string | null) => void;
  clearTestState: () => void;
  reset: () => void;
}

const initialState: ConnectionStoreState = {
  activeConnectionId: null,
  activeConnectionName: null,
  isFormOpen: false,
  formMode: "create",
  editingConnectionId: null,
  isTestingConnection: false,
  testResult: null,
  error: null,
};

export const useConnectionStore = create<ConnectionStoreState & ConnectionStoreActions>((set) => ({
  ...initialState,
  setActiveConnection: (id, name) => set({ activeConnectionId: id, activeConnectionName: name }),
  openCreateForm: () => set({ isFormOpen: true, formMode: "create", editingConnectionId: null, testResult: null, error: null }),
  openEditForm: (connectionId) => set({ isFormOpen: true, formMode: "edit", editingConnectionId: connectionId, testResult: null, error: null }),
  closeForm: () => set({ isFormOpen: false, editingConnectionId: null, testResult: null, error: null }),
  setTestingConnection: (testing) => set({ isTestingConnection: testing }),
  setTestResult: (result) => set({ testResult: result, isTestingConnection: false }),
  setError: (error) => set({ error }),
  clearTestState: () => set({ isTestingConnection: false, testResult: null, error: null }),
  reset: () => set(initialState),
}));
