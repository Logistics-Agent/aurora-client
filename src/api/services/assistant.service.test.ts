import { describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";
import { assistantService } from "./assistant.service";
import type { AssistantQueryResponse } from "@/dto/assistant/assistant.dto";

vi.mock("@/lib/api", () => ({
  api: {
    post: vi.fn(),
  },
}));

describe("assistantService", () => {
  it("calls POST /api/v1/assistant/query with provided parameters", async () => {
    const mockResponse: AssistantQueryResponse = {
      query: "What is cold chain SOP?",
      answer: "Cold chain requires continuous monitoring between 2-8°C.",
      regulatoryCitations: [],
      knowledgeReferences: [],
      conflicts: [],
      insufficientEvidence: false,
      missingInformation: [],
      governance: {
        decisionId: "dec-001",
        automationLevel: "ASSISTED",
        requiresApproval: false,
        capabilityCode: "compliance.answer",
        totalTokens: 120,
      },
      retrievalTraceId: "trace-abc-123",
    };

    vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

    const result = await assistantService.query({
      query: "What is cold chain SOP?",
      mode: "ALL",
      jurisdictionCode: "VN",
      topK: 10,
      minimumScore: 0.4,
    });

    expect(api.post).toHaveBeenCalledWith("/api/v1/assistant/query", {
      query: "What is cold chain SOP?",
      mode: "ALL",
      jurisdictionCode: "VN",
      topK: 10,
      minimumScore: 0.4,
    });
    expect(result).toEqual(mockResponse);
  });
});
