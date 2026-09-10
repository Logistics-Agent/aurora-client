import { z } from "zod";
export { type GroundedAnswer, parseGroundedAnswerDto } from "@/dto/assistant/assistant.dto";

const statusNames = ["UNSPECIFIED", "PENDING", "PROCESSING", "COMPLETED", "FAILED"] as const;
const riskNames = ["UNSPECIFIED", "LOW", "MEDIUM", "HIGH", "CRITICAL", "UNKNOWN"] as const;
const findingTypeNames = [
  "UNSPECIFIED",
  "VIOLATION",
  "REQUIREMENT",
  "WARNING",
  "CONFLICT",
] as const;
const evidenceNames = ["UNSPECIFIED", "SUFFICIENT", "INSUFFICIENT", "CONFLICTING"] as const;

function normalizeEnum(value: unknown, prefix: string, numeric: readonly string[]) {
  if (typeof value === "number") return numeric[value] ?? value;
  if (typeof value !== "string") return value;
  return value
    .replace(`${prefix}_`, "")
    .replace(/^COMPLIANCE_/, "")
    .replace(/^EVIDENCE_/, "")
    .replace(/^SUFFICIENCY_/, "")
    .toUpperCase();
}

function enumDto(prefix: string, numeric: readonly string[]) {
  return z.preprocess((value) => normalizeEnum(value, prefix, numeric), z.enum(numeric));
}

function preprocessTimestamp(value: unknown): unknown {
  if (value === null || value === "") return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) {
    const timestamp = value as { seconds?: unknown; nanos?: unknown };
    const seconds = Number(timestamp.seconds);
    const nanos = Number(timestamp.nanos ?? 0);
    if (Number.isFinite(seconds) && Number.isFinite(nanos)) {
      return new Date(seconds * 1000 + nanos / 1_000_000).toISOString();
    }
  }
  return value;
}

const timestampDto = z.preprocess(
  preprocessTimestamp,
  z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Expected a valid timestamp"),
);
const nullableTimestampDto = z.preprocess(preprocessTimestamp, timestampDto.nullable());

const citationDto = z.object({
  regulatoryDocumentId: z.string(),
  documentVersionId: z.string(),
  chunkId: z.string(),
  authority: z.string(),
  title: z.string(),
  canonicalSourceUri: z.string(),
  versionLabel: z.string(),
  sectionLabel: z.string(),
  pageLabel: z.string(),
  effectiveFrom: timestampDto,
  effectiveTo: nullableTimestampDto,
  excerpt: z.string(),
  relevanceScore: z.number().min(0).max(1),
});

const findingDto = z.object({
  findingId: z.string().min(1),
  type: enumDto("COMPLIANCE_FINDING_TYPE", findingTypeNames),
  code: z.string(),
  category: z.string(),
  title: z.string(),
  description: z.string(),
  severity: enumDto("COMPLIANCE_RISK_LEVEL", riskNames),
  citations: z.array(citationDto),
});

const complianceEvaluationDto = z.object({
  evaluationId: z.string().min(1),
  externalShipmentId: z.string(),
  status: enumDto("COMPLIANCE_EVALUATION_STATUS", statusNames),
  riskLevel: enumDto("COMPLIANCE_RISK_LEVEL", riskNames),
  findings: z.array(findingDto),
  missingDocuments: z.array(z.string()),
  assumptions: z.array(z.string()),
  complianceConfidence: z.number().min(0).max(1),
  evidenceSufficiency: enumDto("EVIDENCE_SUFFICIENCY", evidenceNames),
  requestedAt: timestampDto,
  completedAt: nullableTimestampDto,
  errorCode: z.string(),
  errorMessage: z.string(),
});

export type ComplianceEvaluation = z.infer<typeof complianceEvaluationDto>;
export type ComplianceFinding = z.infer<typeof findingDto>;

export function parseComplianceEvaluationDto(value: unknown): ComplianceEvaluation {
  return complianceEvaluationDto.parse(value);
}
