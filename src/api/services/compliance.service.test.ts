import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "@/lib/api";

import { complianceService } from "./compliance.service";

afterEach(() => vi.restoreAllMocks());

const evaluationResponse = {
  evaluationId: "evaluation-1",
  externalShipmentId: "shipment-1",
  status: "COMPLIANCE_EVALUATION_STATUS_COMPLETED",
  riskLevel: "COMPLIANCE_RISK_LEVEL_LOW",
  findings: [],
  missingDocuments: [],
  assumptions: [],
  complianceConfidence: 0.91,
  evidenceSufficiency: "EVIDENCE_SUFFICIENCY_SUFFICIENT",
  requestedAt: "2026-09-09T05:00:00Z",
  completedAt: "2026-09-09T05:01:00Z",
  errorCode: "",
  errorMessage: "",
};

const groundedResponse = {
  query: "Which rule applies?",
  answer: "Use the cited rule.",
  regulatoryCitations: [],
  knowledgeReferences: [],
  conflicts: [],
  insufficientEvidence: false,
  missingInformation: [],
  governance: {
    decisionId: "decision-1",
    automationLevel: "ASSISTED",
    requiresApproval: false,
    capabilityCode: "compliance.answer",
    totalTokens: 15,
  },
  retrievalTraceId: "trace-1",
};

describe("compliance API service", () => {
  it("evaluates a real snapshot and parses the persisted response", async () => {
    const post = vi.spyOn(api, "post").mockResolvedValue(evaluationResponse as never);

    const result = await complianceService.evaluateCompliance({
      idempotencyKey: "request-1",
      externalShipmentId: "shipment-1",
      originCountryCode: "VN",
      destinationCountryCode: "US",
      transportMode: "OCEAN",
      cargo: [],
      documents: [],
    });

    expect(post).toHaveBeenCalledWith("api/v1/compliance/evaluations", {
      idempotencyKey: "request-1",
      externalShipmentId: "shipment-1",
      originCountryCode: "VN",
      destinationCountryCode: "US",
      transportMode: "OCEAN",
      cargo: [],
      documents: [],
    });
    expect(result.status).toBe("COMPLETED");
  });

  it("loads a persisted evaluation without recalculating it", async () => {
    const get = vi.spyOn(api, "get").mockResolvedValue(evaluationResponse as never);

    const result = await complianceService.getComplianceEvaluation("evaluation-1");

    expect(get).toHaveBeenCalledWith("api/v1/compliance/evaluations/evaluation-1");
    expect(result.evaluationId).toBe("evaluation-1");
  });

  it("returns grounded copilot output with citations and governance fields", async () => {
    const post = vi.spyOn(api, "post").mockResolvedValue(groundedResponse as never);

    const result = await complianceService.askComplianceCopilot({ query: "Which rule applies?" });

    expect(post).toHaveBeenCalledWith("api/v1/compliance/copilot/ask", {
      query: "Which rule applies?",
    });
    expect(result.governance.decisionId).toBe("decision-1");
  });
});
