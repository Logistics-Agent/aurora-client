import { CONTROLLERS } from "@/configs/api";
import {
  type CreateDocumentUploadSessionInput,
  type DocumentUploadSession,
  parseDocumentUploadSessionDto,
} from "@/dto/documents/document-upload.dto";
import { api } from "@/lib/api";
import { ApiError } from "@/lib/api-error";

export interface DocumentUploadOptions {
  signal?: AbortSignal;
  onProgress?: (percentage: number) => void;
}

function parseUploadSession(response: unknown): DocumentUploadSession {
  try {
    return parseDocumentUploadSessionDto(response);
  } catch (error) {
    throw new ApiError({
      message: "Document upload service returned an invalid response.",
      code: "SERVER",
      details: error,
      status: 500,
    });
  }
}

function createAbortError(): DOMException {
  return new DOMException("Document upload was cancelled.", "AbortError");
}

export function resolveFileMimeType(file: File): string {
  if (file.name.toLowerCase().endsWith(".md")) return "text/markdown";
  if (file.type && file.type.trim()) return file.type.trim();

  const ext = file.name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "doc":
      return "application/msword";
    case "txt":
      return "text/plain";
    case "json":
      return "application/json";
    default:
      return "application/octet-stream";
  }
}

export function buildPresignedPutHeaders(
  declaredMimeType?: string,
  requiredHeaders?: Record<string, string>,
): Record<string, string> {
  const headers: Record<string, string> = {};
  let targetMimeType = declaredMimeType?.trim() || "";
  let contentTypeKey = "Content-Type";

  if (requiredHeaders) {
    for (const [key, value] of Object.entries(requiredHeaders)) {
      if (key.toLowerCase() === "content-type") {
        contentTypeKey = key;
        if (value) targetMimeType = value.trim();
      } else {
        headers[key] = value;
      }
    }
  }

  headers[contentTypeKey] = targetMimeType || "application/octet-stream";
  return headers;
}

function uploadObject(
  session: DocumentUploadSession,
  file: File,
  options: DocumentUploadOptions = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (options.signal?.aborted) {
      reject(createAbortError());
      return;
    }

    const request = new XMLHttpRequest();
    const abortUpload = () => request.abort();
    const cleanup = () => options.signal?.removeEventListener("abort", abortUpload);

    request.open("PUT", session.writeUrl);
    request.withCredentials = false;
    const putHeaders = buildPresignedPutHeaders(session.mimeType, session.requiredHeaders);
    Object.entries(putHeaders).forEach(([name, value]) => {
      request.setRequestHeader(name, value);
    });
    request.upload.onprogress = (event) => {
      if (!event.lengthComputable || event.total <= 0) return;
      options.onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      cleanup();
      if (request.status >= 200 && request.status < 300) {
        resolve();
        return;
      }
      reject(
        new ApiError({
          message: "The document could not be uploaded to object storage.",
          code: "UPLOAD_FAILED",
          status: request.status,
        }),
      );
    };
    request.onerror = () => {
      cleanup();
      reject(
        new ApiError({
          message: "The document upload could not reach object storage.",
          code: "UPLOAD_NETWORK_ERROR",
          status: 0,
        }),
      );
    };
    request.onabort = () => {
      cleanup();
      reject(createAbortError());
    };
    options.signal?.addEventListener("abort", abortUpload, { once: true });
    request.send(file);
  });
}

export const documentUploadService = {
  createUploadSession: async (
    input: CreateDocumentUploadSessionInput,
  ): Promise<DocumentUploadSession> => {
    const response = await api.post<unknown>(CONTROLLERS.documents.uploads, input);
    return parseUploadSession(response);
  },
  uploadObject,
};
