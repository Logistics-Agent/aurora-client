import { z } from "zod";

const documentStatusValues = [
  "RECEIVED",
  "PROCESSING",
  "READY",
  "NEEDS_REVIEW",
  "REJECTED",
  "FAILED",
  "CANCELLED",
] as const;

const documentStageValues = [
  "QUEUED",
  "RECEIVING",
  "EXTRACTING",
  "OCR",
  "NORMALIZING",
  "CHUNKING",
  "EMBEDDING",
  "INDEXING",
  "READY",
  "UPLOADED",
  "OCR_PROCESSING",
  "HUMAN_REVIEW",
  "COMPLETED",
  "ERROR",
] as const;

const documentStageDto = z.preprocess(
  (value) => (value === "REVIEW" ? "HUMAN_REVIEW" : value),
  z.enum(documentStageValues).nullable(),
);

const validDate = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Expected a valid document timestamp");

const nullableDate = validDate.nullable();

const confidence = z.number().min(0).max(1).nullable();

const documentStatusDto = z.object({
  id: z.string().min(1),
  documentType: z.string().min(1),
  status: z.enum(documentStatusValues),
  stage: documentStageDto,
  fileName: z.string().min(1),
  needsReview: z.boolean(),
  confidence,
  normalizedJson: z.string().nullable(),
  errorCode: z.string().nullable(),
  errorMessage: z.string().nullable(),
  createdAt: nullableDate,
  updatedAt: nullableDate,
});

const documentListDto = z.object({
  items: z.array(documentStatusDto),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalItems: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

const ocrFieldDto = z.object({
  name: z.string().min(1),
  value: z.string(),
  confidence: z.number().min(0).max(1),
  needsReview: z.boolean(),
});

const documentReviewDto = z.object({
  documentId: z.string().min(1),
  jobId: z.string().min(1),
  status: z.enum(documentStatusValues),
  originalDocumentReference: z.string().nullable(),
  documentType: z.string().min(1),
  overallConfidence: z.number().min(0).max(1),
  reviewReasons: z.array(z.string()),
  fields: z.array(ocrFieldDto),
});

export type DocumentStatus = z.infer<typeof documentStatusDto>;
export type DocumentList = z.infer<typeof documentListDto>;
export type DocumentReview = z.infer<typeof documentReviewDto>;
export type OcrField = z.infer<typeof ocrFieldDto>;

export function parseDocumentStatusDto(value: unknown): DocumentStatus {
  return documentStatusDto.parse(value);
}

export function parseDocumentListDto(value: unknown): DocumentList {
  return documentListDto.parse(value);
}

export function parseDocumentReviewDto(value: unknown): DocumentReview {
  return documentReviewDto.parse(value);
}
