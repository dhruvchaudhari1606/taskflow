import { QueryClient } from "@tanstack/react-query";

// ─── TanStack Query Client ────────────────────────────────────────────────────
// Global config for all queries in the application.

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache for 5 minutes before considering stale
      staleTime: 1000 * 60 * 5,
      // Keep unused data for 10 minutes
      gcTime: 1000 * 60 * 10,
      // Retry failed requests twice
      retry: 2,
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus in production
      refetchOnWindowFocus: process.env.NODE_ENV === "production",
      // Don't refetch on reconnect by default
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});
