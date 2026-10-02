import { useState } from "react";

// ─── Pagination Hook ──────────────────────────────────────────────────────────

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
}

interface UsePaginationReturn {
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  resetPage: () => void;
}

export function usePagination({
  initialPage = 1,
  initialLimit = 10,
}: UsePaginationOptions = {}): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  return {
    page,
    limit,
    setPage,
    setLimit: (newLimit: number) => {
      setLimit(newLimit);
      setPage(1); // Reset to page 1 when limit changes
    },
    nextPage: () => setPage((p) => p + 1),
    prevPage: () => setPage((p) => Math.max(1, p - 1)),
    resetPage: () => setPage(1),
  };
}
