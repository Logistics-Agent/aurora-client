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
    Object.entries(session.requiredHeaders).forEach(([name, value]) => {
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
