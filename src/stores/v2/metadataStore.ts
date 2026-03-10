import { create } from "zustand";
import { persist } from "zustand/middleware";

type DetailsTab = "columns" | "statistics" | "relationships" | "sample";
type SortBy = "name" | "rows" | "size";

interface MetadataStoreState {
  expandedTables: string[];
  selectedTable: string | null;
  detailsOpen: boolean;
  activeTab: DetailsTab;
  searchQuery: string;
  sortBy: SortBy;
  sortDirection: "asc" | "desc";
  favorites: string[];
  recentTables: string[];
}

interface MetadataStoreActions {
  toggleExpanded: (tableName: string) => void;
  selectTable: (tableName: string | null) => void;
  openDetails: (tableName: string) => void;
  closeDetails: () => void;
  setActiveTab: (tab: DetailsTab) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: SortBy) => void;
  toggleFavorite: (tableName: string) => void;
  addToRecent: (tableName: string) => void;
  reset: () => void;
}

const initialState: MetadataStoreState = {
  expandedTables: [],
  selectedTable: null,
  detailsOpen: false,
  activeTab: "columns",
  searchQuery: "",
  sortBy: "name",
  sortDirection: "asc",
  favorites: [],
  recentTables: [],
};

export const useMetadataStore = create<MetadataStoreState & MetadataStoreActions>()(
  persist(
    (set) => ({
      ...initialState,
      toggleExpanded: (tableName) => set((s) => ({
        expandedTables: s.expandedTables.includes(tableName)
          ? s.expandedTables.filter((t) => t !== tableName)
          : [...s.expandedTables, tableName],
      })),
      selectTable: (tableName) => set({ selectedTable: tableName }),
      openDetails: (tableName) => set({ selectedTable: tableName, detailsOpen: true }),
      closeDetails: () => set({ detailsOpen: false }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSortBy: (sortBy) => set((s) => ({
        sortBy,
        sortDirection: s.sortBy === sortBy ? (s.sortDirection === "asc" ? "desc" : "asc") : "asc",
      })),
      toggleFavorite: (tableName) => set((s) => ({
        favorites: s.favorites.includes(tableName)
          ? s.favorites.filter((t) => t !== tableName)
          : [...s.favorites, tableName],
      })),
      addToRecent: (tableName) => set((s) => ({
        recentTables: [tableName, ...s.recentTables.filter((t) => t !== tableName)].slice(0, 20),
      })),
      reset: () => set({ ...initialState }),
    }),
    {
      name: "cinsights-metadata-store",
      partialize: (state) => ({
        favorites: state.favorites,
        recentTables: state.recentTables,
      }),
    }
  )
);
