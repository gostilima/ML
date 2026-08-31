// Shared envelope types for the backend REST API.
// Assumed contract (per task spec): every response is either
//   { success: true, data: T, meta?: Record<string, unknown> }
// or
//   { success: false, error: { code: string; message: string } }

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown> | null;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiError;

export interface PaginatedMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginatedMeta;
}

// Marks a field whose value is derived/estimated rather than measured directly.
export interface EstimatedField<T> {
  value: T;
  data_type: "estimated" | "real";
}
