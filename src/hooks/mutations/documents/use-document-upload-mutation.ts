"use client";

import { useMutation } from "@tanstack/react-query";

import {
  type DocumentUploadOptions,
  documentUploadService,
} from "@/api/services/document-upload.service";

export interface UploadDocumentInput extends DocumentUploadOptions {
  file: File;
  idempotencyKey: string;
  contentSha256?: string;
}

export function useDocumentUploadMutation() {
  return useMutation({
    mutationFn: async ({
      file,
      idempotencyKey,
      contentSha256,
      signal,
      onProgress,
    }: UploadDocumentInput) => {
      const session = await documentUploadService.createUploadSession({
        idempotencyKey,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        ...(contentSha256 ? { contentSha256 } : {}),
      });
      await documentUploadService.uploadObject(session, file, { signal, onProgress });
      return session;
    },
  });
}
