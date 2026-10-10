import { z } from "zod";

import {
  type DocumentStatus,
  parseDocumentStatusDto,
} from "./document.dto";

const uploadStatusValues = ["PENDING", "UPLOADED", "CONSUMED", "EXPIRED"] as const;

const validTimestamp = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Expected a valid upload timestamp");

const documentUploadSessionDto = z.object({
  uploadId: z.string().uuid(),
  storageReference: z.string().min(1),
  writeUrl: z.string().url(),
  requiredHeaders: z.record(z.string(), z.string()),
  expiresAt: validTimestamp,
  maximumSizeBytes: z.number().int().positive(),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  contentSha256: z.string().regex(/^[a-f0-9]{64}$/).nullable(),
  status: z.enum(uploadStatusValues),
});

export type DocumentUploadSession = z.infer<typeof documentUploadSessionDto>;
export type DocumentTypeHint =
  | "COMMERCIAL_INVOICE"
  | "PACKING_LIST"
  | "BILL_OF_LADING"
  | "CUSTOMS_DECLARATION"
  | "CERTIFICATE_OF_ORIGIN"
  | "PROOF_OF_DELIVERY"
  | "OTHER";
export type DocumentPurpose =
  | "SHIPMENT_DOCUMENT"
  | "REGULATORY_CORPUS"
  | "KNOWLEDGE_CORPUS"
  | "GENERAL_DOCUMENT";
export type DocumentIntake = DocumentStatus;

export interface CreateDocumentUploadSessionInput {
  idempotencyKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  contentSha256?: string;
}

export interface CreateDocumentIntakeInput {
  uploadId: string;
  documentTypeHint: DocumentTypeHint;
  idempotencyKey: string;
  purpose?: DocumentPurpose;
  externalReference?: string;
}

export function parseDocumentUploadSessionDto(value: unknown): DocumentUploadSession {
  return documentUploadSessionDto.parse(value);
}

export function parseDocumentIntakeDto(value: unknown): DocumentIntake {
  return parseDocumentStatusDto(value);
}
