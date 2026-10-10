export const MAX_DOCUMENT_SIZE_BYTES = 10_485_760;

export const SUPPORTED_DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;

export function validateDocumentFile(file: File | null): string | null {
  if (!file) return "Select a document file to upload.";
  if (!SUPPORTED_DOCUMENT_TYPES.includes(file.type as (typeof SUPPORTED_DOCUMENT_TYPES)[number])) {
    return "This file type is not supported. Choose a PDF, JPG, or PNG file.";
  }
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) return "The document must be 10 MB or smaller.";
  return null;
}
