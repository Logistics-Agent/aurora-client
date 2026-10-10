import { z } from "zod";

const assistantModeDto = z.enum(["ALL", "REGULATORY", "KNOWLEDGE"]);

const timestampDto = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Expected a valid timestamp");

const verifiedContextDto = z.object({
  shipmentId: z.string().min(1).optional(),
  evaluationId: z.string().min(1).optional(),
});

const responseContextDto = z.object({
  shipmentId: z.string(),
  evaluationId: z.string(),
  freshness: z.string(),
  snapshotHash: z.string(),
});

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

export const assistantQueryRequestDto = z.object({
  query: z.string().min(1),
  mode: assistantModeDto.optional(),
  jurisdictionCode: z.string().min(1).optional(),
  effectiveAt: timestampDto.optional(),
  regulationTypes: z.array(z.number().int()).optional(),
  categories: z.array(z.number().int()).optional(),
  topK: z.number().int().positive().max(20).optional(),
  minimumScore: z.number().min(0).max(1).optional(),
  context: verifiedContextDto.optional(),
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
  context: responseContextDto.nullable().optional(),
});

export type AssistantMode = z.infer<typeof assistantModeDto>;
export type VerifiedAssistantContext = z.infer<typeof verifiedContextDto>;
export type AssistantResponseContext = z.infer<typeof responseContextDto>;
export type AssistantQueryRequest = z.infer<typeof assistantQueryRequestDto>;
export type GroundedAnswer = z.infer<typeof groundedAnswerDto>;
export type AssistantQueryResponse = GroundedAnswer;

export function parseGroundedAnswerDto(value: unknown): GroundedAnswer {
  return groundedAnswerDto.parse(value);
}
