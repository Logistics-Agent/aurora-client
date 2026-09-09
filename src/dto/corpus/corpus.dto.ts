import { z } from "zod";

import { type DocumentStatus, parseDocumentStatusDto } from "@/dto/documents/document.dto";

const regulatoryEvidenceDto = z.object({
  sourceId: z.string(),
  documentVersionId: z.string(),
  chunkId: z.string(),
  title: z.string(),
  authority: z.string(),
  jurisdiction: z.string(),
  regulationType: z.string(),
  section: z.string(),
  page: z.string(),
  excerpt: z.string(),
  score: z.number().min(0).max(1),
  citation: z.object({
    documentVersionId: z.string(),
    chunkId: z.string(),
    canonicalSourceUri: z.string(),
  }),
});

const knowledgeEvidenceDto = z.object({
  knowledgeDocumentId: z.string(),
  documentVersionId: z.string(),
  chunkId: z.string(),
  title: z.string(),
  category: z.string(),
  section: z.string(),
  page: z.string(),
  excerpt: z.string(),
  score: z.number().min(0).max(1),
  citation: z.object({
    documentVersionId: z.string(),
    chunkId: z.string(),
    canonicalSourceUri: z.string(),
  }),
});

const regulatoryQueryDto = z.object({
  query: z.string(),
  retrievalTraceId: z.string(),
  evidenceSufficiency: z.string(),
  results: z.array(regulatoryEvidenceDto),
  generatedExplanation: z.string().nullable(),
});

const knowledgeQueryDto = z.object({
  query: z.string(),
  retrievalTraceId: z.string(),
  results: z.array(knowledgeEvidenceDto),
});

export type CorpusDocument = DocumentStatus;
export type RegulatoryEvidence = z.infer<typeof regulatoryEvidenceDto>;
export type KnowledgeEvidence = z.infer<typeof knowledgeEvidenceDto>;
export type RegulatoryQueryResponse = z.infer<typeof regulatoryQueryDto>;
export type KnowledgeQueryResponse = z.infer<typeof knowledgeQueryDto>;

export function parseCorpusDocumentDto(value: unknown): CorpusDocument {
  return parseDocumentStatusDto(value);
}

export function parseRegulatoryQueryDto(value: unknown): RegulatoryQueryResponse {
  return regulatoryQueryDto.parse(value);
}

export function parseKnowledgeQueryDto(value: unknown): KnowledgeQueryResponse {
  return knowledgeQueryDto.parse(value);
}
