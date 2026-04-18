// ─── Auth ───────────────────────────────────────────────────────────────────


// ─── Pagination ──────────────────────────────────────────────────────────────
export interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PageRequest {
  page: number;
  pageSize: number;
  search?: string;
  suiteId?: number;
  status?: string;
}

// ─── API Response wrapper ────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}
