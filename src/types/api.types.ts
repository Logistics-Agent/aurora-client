export type ApiEnvelope<T> = {
  data: T;
  message?: string;
  metadata?: unknown;
  statusCode: number;
  success: boolean;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
};

/** Compatibility alias for callers using the generic response name. */
export type ApiResponse<T> = ApiEnvelope<T>;

/** Compatibility alias for list responses with typed pagination metadata. */
export type ApiListResponse<T> = ApiEnvelope<T[]> & {
  metadata?: PaginationMeta;
};

export type ApiErrorCode =
  | "VALIDATION"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "SERVER"
  | "NETWORK"
  | "TIMEOUT"
  | "UNKNOWN";
