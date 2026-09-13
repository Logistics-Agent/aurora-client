import { CONTROLLERS } from "@/configs/api";
import {
  type CreateCorpusIntakeInput,
  parseCorpusIntakeResponse,
  type CorpusIntakeResponse,
} from "@/dto/corpus/corpus-upload.dto";
import { api } from "@/lib/api";
import { ApiError } from "@/lib/api-error";

import { type DocumentUploadOptions, documentUploadService } from "./document-upload.service";

export interface CorpusFileUploadInput extends DocumentUploadOptions {
  file: File;
  intake: CreateCorpusIntakeInput;
}

export function getCorpusFileMimeType(file: File): string {
  if (file.name.toLowerCase().endsWith(".md")) return "text/markdown";
  return file.type || "application/octet-stream";
}

function parseResponse(value: unknown): CorpusIntakeResponse {
  try {
    return parseCorpusIntakeResponse(value);
  } catch (error) {
    throw new ApiError({
      message: "Corpus service returned an invalid intake response.",
      code: "SERVER",
      details: error,
      status: 500,
    });
  }
}

export const corpusUploadService = {
  uploadFile: async ({ file, intake, signal, onProgress }: CorpusFileUploadInput) => {
    const session = await documentUploadService.createUploadSession({
      idempotencyKey: intake.idempotencyKey,
      fileName: file.name,
      mimeType: getCorpusFileMimeType(file),
      sizeBytes: file.size,
    });
    await documentUploadService.uploadObject(session, file, { signal, onProgress });
    const response = await api.post<unknown>(CONTROLLERS.documents.corpusIntakes, {
      ...intake,
      uploadId: session.uploadId,
    });
    return parseResponse(response);
  },
};
