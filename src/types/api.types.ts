export type ApiResponse<T> = { data: T; message?: string };

export type ApiListResponse<T> = ApiResponse<T[]> & {
  meta?: { page: number; pageSize: number; total: number };
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
