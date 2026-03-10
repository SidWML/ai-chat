"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

type V3Theme = "dark" | "light";

interface V3ThemeContextValue {
  theme: V3Theme;
  setTheme: (theme: V3Theme) => void;
  toggleTheme: () => void;
}

const V3ThemeContext = createContext<V3ThemeContextValue | null>(null);

const STORAGE_KEY = "v3-theme";

export function V3ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<V3Theme>("dark");

  // Load saved theme on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as V3Theme | null;
      if (saved === "light" || saved === "dark") {
        setThemeState(saved);
      }
    } catch {}
  }, []);

  const setTheme = useCallback((t: V3Theme) => {
    setThemeState(t);
    try { localStorage.setItem(STORAGE_KEY, t); } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <V3ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </V3ThemeContext.Provider>
  );
}

export function useV3Theme(): V3ThemeContextValue {
  const ctx = useContext(V3ThemeContext);
  if (!ctx) throw new Error("useV3Theme must be used within V3ThemeProvider");
  return ctx;
}
