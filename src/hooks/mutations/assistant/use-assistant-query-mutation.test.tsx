import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { assistantService } from "@/api/services/assistant.service";

import { useAssistantQueryMutation } from "./use-assistant-query-mutation";

vi.mock("@/api/services/assistant.service", async () => {
  const actual = await vi.importActual<typeof import("@/api/services/assistant.service")>(
    "@/api/services/assistant.service",
  );
  return { ...actual, assistantService: { query: vi.fn() } };
});

describe("useAssistantQueryMutation", () => {
  it("returns the grounded response from the assistant service", async () => {
    vi.mocked(assistantService.query).mockResolvedValue({
      query: "question",
      answer: "answer",
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
        totalTokens: 1,
      },
      retrievalTraceId: "trace-1",
    });
    const queryClient = new QueryClient();
    const { result } = renderHook(() => useAssistantQueryMutation(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    result.current.mutate({ query: "question" });

    await waitFor(() => expect(result.current.data?.answer).toBe("answer"));
  });
});
