import { describe, expect, it } from "vitest";

import { assistantQueryRequestDto, parseGroundedAnswerDto } from "./assistant.dto";

describe("assistant DTO", () => {
  it("parses request context and response context metadata", () => {
    const request = assistantQueryRequestDto.parse({
      query: "What is the shipment status?",
      context: {
        shipmentId: "shipment-1",
        evaluationId: "evaluation-1",
      },
    });

    const response = parseGroundedAnswerDto({
      query: "What is the shipment status?",
      answer: "The shipment context is current.",
      regulatoryCitations: [],
      knowledgeReferences: [],
      conflicts: [],
      insufficientEvidence: false,
      missingInformation: [],
      governance: {
        decisionId: "decision-1",
        automationLevel: "ASSISTED",
        requiresApproval: false,
        capabilityCode: "assistant.query",
        totalTokens: 12,
      },
      retrievalTraceId: "trace-1",
      context: {
        shipmentId: "shipment-1",
        evaluationId: "evaluation-1",
        freshness: "CURRENT",
        snapshotHash: "snapshot-1",
      },
    });

    expect(request.context?.shipmentId).toBe("shipment-1");
    expect(response.context?.shipmentId).toBe("shipment-1");
    expect(response.context?.evaluationId).toBe("evaluation-1");
    expect(response.context?.freshness).toBe("CURRENT");
    expect(response.context?.snapshotHash).toBe("snapshot-1");
  });

  it("parses grounded BFF responses with governance metadata", () => {
    const response = parseGroundedAnswerDto({
      query: "What is the restricted party risk?",
      answer: "Evidence is insufficient to determine a restricted party match.",
      regulatoryCitations: [],
      knowledgeReferences: [],
      conflicts: [],
      insufficientEvidence: true,
      missingInformation: ["verified party identifier"],
      governance: {
        decisionId: "decision-1",
        automationLevel: "ASSISTED",
        requiresApproval: true,
        capabilityCode: "assistant.query",
        totalTokens: 12,
      },
      retrievalTraceId: "trace-1",
    });

    expect(response.governance.requiresApproval).toBe(true);
    expect(response.insufficientEvidence).toBe(true);
  });
});
