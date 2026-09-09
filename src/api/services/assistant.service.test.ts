import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@/lib/api";

import { assistantService } from "./assistant.service";

vi.mock("@/lib/api", () => ({
  api: { post: vi.fn() },
}));

describe("assistantService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("posts a grounded assistant query to the BFF route", async () => {
    vi.mocked(api.post).mockResolvedValue({
      query: "What is the risk?",
      answer: "Evidence is insufficient.",
      regulatoryCitations: [],
      knowledgeReferences: [],
      conflicts: [],
      insufficientEvidence: true,
      missingInformation: ["verified document"],
      governance: {
        decisionId: "decision-1",
        automationLevel: "ASSISTED",
        requiresApproval: true,
        capabilityCode: "assistant.query",
        totalTokens: 10,
      },
      retrievalTraceId: "trace-1",
    });

    await assistantService.query({
      query: "What is the risk?",
      mode: "COMPLIANCE",
      jurisdictionCode: "US",
      topK: 5,
      minimumScore: 0.6,
    });

    expect(api.post).toHaveBeenCalledWith("api/v1/assistant/query", {
      query: "What is the risk?",
      mode: "COMPLIANCE",
      jurisdictionCode: "US",
      topK: 5,
      minimumScore: 0.6,
    });
  });
});
