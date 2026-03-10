"use client";

import "./theme.css";
import { V3ThemeProvider, useV3Theme } from "@/providers/V3ThemeProvider";

function V3Inner({ children }: { children: React.ReactNode }) {
  const { theme } = useV3Theme();
  return (
    <div className={`v3-root v3-noise ${theme === "light" ? "v3-light" : ""}`}>
      {children}
    </div>
  );
}

export default function V3Layout({ children }: { children: React.ReactNode }) {
  return (
    <V3ThemeProvider>
      <V3Inner>{children}</V3Inner>
    </V3ThemeProvider>
  );
}
