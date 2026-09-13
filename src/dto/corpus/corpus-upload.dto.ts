import { z } from "zod";

const corpusIntakeResponseDto = z.object({
  corpusDocumentId: z.string().uuid(),
  corpusVersionId: z.string().uuid(),
  corpusType: z.enum(["REGULATORY", "KNOWLEDGE"]),
  ocrJobId: z.string().uuid(),
  status: z.string().min(1),
  stage: z.string().nullable().optional(),
});

export type CorpusUploadPurpose = "REGULATORY_CORPUS" | "KNOWLEDGE_CORPUS";

export interface CreateCorpusIntakeInput {
  purpose: CorpusUploadPurpose;
  idempotencyKey: string;
  title: string;
  authority?: string;
  canonicalSourceUri?: string;
  jurisdictionCode?: string;
  regulationType?: number;
  category?: number;
  sourceReference?: string;
  languageCode?: string;
  versionLabel?: string;
  publishedAt?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export type CorpusIntakeResponse = z.infer<typeof corpusIntakeResponseDto>;

export function parseCorpusIntakeResponse(value: unknown): CorpusIntakeResponse {
  return corpusIntakeResponseDto.parse(value);
}
