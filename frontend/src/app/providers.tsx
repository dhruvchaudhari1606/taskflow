"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/common/theme-provider";
import { queryClient } from "@/lib/query-client";
// Initialize Axios interceptors
import "@/lib/api/interceptors";

// ─── App Providers ────────────────────────────────────────────────────────────
// Wraps the entire application with necessary context providers.
// Order matters: QueryClientProvider must wrap all TanStack Query hooks.

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {children}

        {/* Toast notifications — Stitch-themed */}
        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
            },
          }}
          closeButton
        />

        {/* Query DevTools — only in development */}
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        )}
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
