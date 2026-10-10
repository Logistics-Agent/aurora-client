import { describe, expect, it } from "vitest";

import { parseComplianceEvaluationDto, parseGroundedAnswerDto } from "./compliance.dto";

describe("compliance DTO parsers", () => {
  it("parses the persisted compliance response without inventing a verdict", () => {
    const result = parseComplianceEvaluationDto({
      evaluationId: "evaluation-1",
      externalShipmentId: "shipment-1",
      status: "COMPLIANCE_EVALUATION_STATUS_COMPLETED",
      riskLevel: "COMPLIANCE_RISK_LEVEL_HIGH",
      findings: [
        {
          findingId: "finding-1",
          type: "COMPLIANCE_FINDING_TYPE_VIOLATION",
          code: "HS_MISMATCH",
          category: "CUSTOMS",
          title: "HS code mismatch",
          description: "The declared code needs review.",
          severity: "COMPLIANCE_RISK_LEVEL_HIGH",
          citations: [
            {
              regulatoryDocumentId: "reg-1",
              documentVersionId: "version-1",
              chunkId: "chunk-1",
              authority: "Customs",
              title: "Customs rule",
              canonicalSourceUri: "https://example.test/rule",
              versionLabel: "2026.1",
              sectionLabel: "2.1",
              pageLabel: "4",
              effectiveFrom: "2026-01-01T00:00:00Z",
              effectiveTo: null,
              excerpt: "Use the matching HS code.",
              relevanceScore: 0.94,
            },
          ],
        },
      ],
      missingDocuments: [],
      assumptions: [],
      complianceConfidence: 0.81,
      evidenceSufficiency: "EVIDENCE_SUFFICIENCY_SUFFICIENT",
      requestedAt: "2026-09-09T05:00:00Z",
      completedAt: "2026-09-09T05:01:00Z",
      errorCode: "",
      errorMessage: "",
    });

    expect(result.status).toBe("COMPLETED");
    expect(result.riskLevel).toBe("HIGH");
    expect(result.findings[0]?.citations[0]?.documentVersionId).toBe("version-1");
    expect(result).not.toHaveProperty("verdict");
  });

  it("normalizes numeric protobuf enum values and preserves insufficient evidence", () => {
    const result = parseComplianceEvaluationDto({
      evaluationId: "evaluation-2",
      externalShipmentId: "shipment-2",
      status: 4,
      riskLevel: 5,
      findings: [],
      missingDocuments: ["commercial-invoice"],
      assumptions: ["Cargo weight was not supplied."],
      complianceConfidence: 0,
      evidenceSufficiency: 2,
      requestedAt: { seconds: "0", nanos: 0 },
      completedAt: null,
      errorCode: "INSUFFICIENT_EVIDENCE",
      errorMessage: "More evidence is required.",
    });

    expect(result.status).toBe("FAILED");
    expect(result.riskLevel).toBe("UNKNOWN");
    expect(result.evidenceSufficiency).toBe("INSUFFICIENT");
    expect(result.missingDocuments).toContain("commercial-invoice");
  });

  it("parses grounded copilot citations and governance metadata", () => {
    const result = parseGroundedAnswerDto({
      query: "Which customs rule applies?",
      answer: "Use the cited customs rule.",
      regulatoryCitations: [
        {
          evidenceId: "evidence-1",
          sourceId: "source-1",
          documentVersionId: "version-1",
          chunkId: "chunk-1",
          title: "Customs rule",
          authority: "Customs",
          jurisdiction: "VN",
          regulationType: "CUSTOMS",
          section: "2.1",
          page: "4",
          excerpt: "Use the matching HS code.",
          canonicalSourceUri: "https://example.test/rule",
          score: 0.94,
        },
      ],
      knowledgeReferences: [],
      conflicts: [],
      insufficientEvidence: false,
      missingInformation: [],
      governance: {
        decisionId: "decision-1",
        automationLevel: "ASSISTED",
        requiresApproval: false,
        capabilityCode: "compliance.answer",
        totalTokens: 120,
      },
      retrievalTraceId: "trace-1",
    });

    expect(result.regulatoryCitations[0]?.evidenceId).toBe("evidence-1");
    expect(result.governance.requiresApproval).toBe(false);
  });
});
