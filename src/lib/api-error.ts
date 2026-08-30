import axios, { type AxiosError } from "axios";

export type ApiFieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  code?: string;
  details?: unknown;
  fieldErrors?: ApiFieldErrors;
  status: number;

  constructor({
    code,
    details,
    fieldErrors,
    message,
    status,
  }: {
    code?: string;
    details?: unknown;
    fieldErrors?: ApiFieldErrors;
    message: string;
    status: number;
  }) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
    this.fieldErrors = fieldErrors;
    this.status = status;
  }
}

type ErrorEnvelope = {
  code?: string;
  details?: unknown;
  error?: string;
  fieldErrors?: ApiFieldErrors;
  message?: string | string[];
  statusCode?: number;
  success?: boolean;
};

const FALLBACK_MESSAGES: Record<number, string> = {
  400: "Request is invalid. Please check your information and try again.",
  401: "Your session has expired. Please sign in again.",
  403: "You do not have permission to access this resource.",
  404: "The requested resource was not found.",
  422: "Some fields are invalid. Please review the form.",
  500: "Something went wrong. Please try again later.",
};

function normalizeMessage(message: ErrorEnvelope["message"], status: number) {
  if (Array.isArray(message)) {
    return message.join(", ");
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return FALLBACK_MESSAGES[status] ?? "Request failed. Please try again.";
}

function fromEnvelope(error: ErrorEnvelope) {
  const status = error.statusCode ?? 0;

  return new ApiError({
    code: error.code ?? error.error,
    details: error.details,
    fieldErrors: error.fieldErrors,
    message: normalizeMessage(error.message, status),
    status,
  });
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error
  ) {
    return fromEnvelope(error as ErrorEnvelope);
  }

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorEnvelope>;
    const data = axiosError.response?.data;
    const status = data?.statusCode ?? axiosError.response?.status ?? 0;

    return new ApiError({
      code: data?.code ?? data?.error,
      details: data?.details,
      fieldErrors: data?.fieldErrors,
      message: normalizeMessage(data?.message, status),
      status,
    });
  }

  if (error instanceof Error) {
    return new ApiError({
      message: error.message || "Request failed. Please try again.",
      status: 0,
    });
  }

  return new ApiError({
    message: "Request failed. Please try again.",
    status: 0,
  });
}

export function getApiErrorMessage(error: unknown) {
  return toApiError(error).message;
}
