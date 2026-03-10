"use client";

import { AuthProvider } from "@/providers/AuthProvider";
import { SidebarProvider } from "@/providers/SidebarProvider";
import { CanvasProvider } from "@/components/v2/canvas/CanvasProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SidebarProvider>
          <CanvasProvider>
            {children}
          </CanvasProvider>
        </SidebarProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
