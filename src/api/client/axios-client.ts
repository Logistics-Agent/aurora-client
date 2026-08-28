import axios, { AxiosError } from "axios";

import { env } from "@/configs";
import { ApiError } from "./api-error";

const statusToCode = (status?: number) => {
  if (!status) return "NETWORK" as const;
  if (status === 401) return "UNAUTHENTICATED" as const;
  if (status === 403) return "FORBIDDEN" as const;
  if (status === 404) return "NOT_FOUND" as const;
  if (status === 409) return "CONFLICT" as const;
  if (status >= 500) return "SERVER" as const;
  if (status >= 400) return "VALIDATION" as const;
  return "UNKNOWN" as const;
};

export const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_BASE_URL || undefined,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(undefined, (error: AxiosError) => {
  const status = error.response?.status;
  const code = error.code === "ECONNABORTED" ? "TIMEOUT" : statusToCode(status);
  throw new ApiError(
    error.message || "An unexpected API error occurred.",
    code,
    status,
    error.response?.data,
  );
});
