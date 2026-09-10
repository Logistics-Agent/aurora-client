import { describe, expect, it } from "vitest";

import { parseGroundedAnswerDto } from "./assistant.dto";

describe("assistant DTO", () => {
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
