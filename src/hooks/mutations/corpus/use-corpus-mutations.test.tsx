import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { corpusService } from "@/api/services/corpus.service";

import { useCorpusMutations } from "./use-corpus-mutations";

vi.mock("@/api/services/corpus.service", async () => {
  const actual = await vi.importActual<typeof import("@/api/services/corpus.service")>(
    "@/api/services/corpus.service",
  );
  return {
    ...actual,
    corpusService: { ...actual.corpusService, ingestRegulatory: vi.fn() },
  };
});

describe("useCorpusMutations", () => {
  it("runs a typed regulatory ingestion mutation", async () => {
    vi.mocked(corpusService.ingestRegulatory).mockResolvedValue({
      id: "reg-1",
      documentType: "REGULATORY",
      status: "PROCESSING",
      stage: "EMBEDDING",
      fileName: "rule.md",
      needsReview: false,
      confidence: 1,
      normalizedJson: null,
      errorCode: null,
      errorMessage: null,
      createdAt: null,
      updatedAt: null,
    });
    const client = new QueryClient();
    const { result } = renderHook(() => useCorpusMutations(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    });
    result.current.ingestRegulatory.mutate({
      authority: "IMO",
      title: "Rule",
      regulationType: 1,
      canonicalSourceUri: "https://example.test/rule",
      contentReference: "regulatory/tenant/rule.md",
      rawText: "Rule text",
    });
    await waitFor(() =>
      expect(corpusService.ingestRegulatory).toHaveBeenCalledWith({
        authority: "IMO",
        title: "Rule",
        regulationType: 1,
        canonicalSourceUri: "https://example.test/rule",
        contentReference: "regulatory/tenant/rule.md",
        rawText: "Rule text",
      }),
    );
  });
});
