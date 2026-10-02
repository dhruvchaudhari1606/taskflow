// ─── Standard API Response Shapes ────────────────────────────────────────────
// These match the backend's consistent response structure exactly.

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── API Error ────────────────────────────────────────────────────────────────

export interface ApiError {
  success: false;
  message: string;
  errorCode?: string;
  statusCode?: number;
}

// ─── Query / Filter Params ────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SearchParams extends PaginationParams {
  search?: string;
}
