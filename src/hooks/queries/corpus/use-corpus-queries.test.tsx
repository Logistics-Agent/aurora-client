import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { corpusService } from "@/api/services/corpus.service";

import { useRegulatoryCorpusQuery } from "./use-corpus-queries";

vi.mock("@/api/services/corpus.service", async () => {
  const actual = await vi.importActual<typeof import("@/api/services/corpus.service")>(
    "@/api/services/corpus.service",
  );
  return {
    ...actual,
    corpusService: { ...actual.corpusService, queryRegulatory: vi.fn() },
  };
});

describe("useRegulatoryCorpusQuery", () => {
  it("runs only after a submitted query is provided", async () => {
    vi.mocked(corpusService.queryRegulatory).mockResolvedValue({
      query: "dangerous goods",
      retrievalTraceId: "trace",
      evidenceSufficiency: "SUFFICIENT",
      generatedExplanation: null,
      results: [],
    });
    const client = new QueryClient();
    const { result } = renderHook(
      () =>
        useRegulatoryCorpusQuery({
          query: "dangerous goods",
          topK: 10,
          minimumRelevanceScore: 0.4,
        }),
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={client}>{children}</QueryClientProvider>
        ),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(corpusService.queryRegulatory).toHaveBeenCalledWith({
      query: "dangerous goods",
      topK: 10,
      minimumRelevanceScore: 0.4,
    });
  });
});
