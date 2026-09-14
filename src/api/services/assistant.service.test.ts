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
      mode: "REGULATORY",
      jurisdictionCode: "US",
      context: {
        shipmentId: "shipment-1",
        evaluationId: "evaluation-1",
      },
      topK: 5,
      minimumScore: 0.6,
    });

    expect(api.post).toHaveBeenCalledWith("api/v1/assistant/query", {
      query: "What is the risk?",
      mode: "REGULATORY",
      jurisdictionCode: "US",
      context: {
        shipmentId: "shipment-1",
        evaluationId: "evaluation-1",
      },
      topK: 5,
      minimumScore: 0.6,
    });
  });

  it("accepts an explicit provider-unavailable response error", async () => {
    vi.mocked(api.post).mockRejectedValue({
      statusCode: 503,
      code: "AI_SERVICE_UNAVAILABLE",
      message: "Assistant provider unavailable.",
    });

    await expect(assistantService.query({ query: "Is this current?" })).rejects.toMatchObject({
      status: 503,
      code: "AI_SERVICE_UNAVAILABLE",
    });
  });
});
