import { z } from "zod";

const citationDto = z.object({
  evidenceId: z.string(),
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
  canonicalSourceUri: z.string(),
  score: z.number().min(0).max(1),
});

const knowledgeReferenceDto = z.object({
  evidenceId: z.string(),
  sourceId: z.string(),
  documentVersionId: z.string(),
  chunkId: z.string(),
  title: z.string(),
  category: z.string(),
  section: z.string(),
  page: z.string(),
  excerpt: z.string(),
  score: z.number().min(0).max(1),
});

const groundedAnswerDto = z.object({
  query: z.string(),
  answer: z.string(),
  regulatoryCitations: z.array(citationDto),
  knowledgeReferences: z.array(knowledgeReferenceDto),
  conflicts: z.array(
    z.object({
      regulatoryEvidenceId: z.string(),
      knowledgeEvidenceId: z.string(),
      description: z.string(),
    }),
  ),
  insufficientEvidence: z.boolean(),
  missingInformation: z.array(z.string()),
  governance: z.object({
    decisionId: z.string(),
    automationLevel: z.string(),
    requiresApproval: z.boolean(),
    capabilityCode: z.string(),
    totalTokens: z.number().int().nonnegative(),
  }),
  retrievalTraceId: z.string(),
});

export type GroundedAnswer = z.infer<typeof groundedAnswerDto>;

export function parseGroundedAnswerDto(value: unknown): GroundedAnswer {
  return groundedAnswerDto.parse(value);
}
