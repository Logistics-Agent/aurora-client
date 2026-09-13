import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { corpusService } from "@/api/services/corpus.service";

import { CorpusPage } from "./index";

vi.mock("@/api/services/corpus.service", async () => {
  const actual = await vi.importActual<typeof import("@/api/services/corpus.service")>(
    "@/api/services/corpus.service",
  );
  return {
    ...actual,
    corpusService: {
      ...actual.corpusService,
      queryRegulatory: vi.fn(),
      listRegulatorySources: vi.fn(),
      listKnowledgeDocuments: vi.fn(),
    },
  };
});

describe("CorpusPage", () => {
  it("shows grounded regulatory query results from the corpus API", async () => {
    vi.mocked(corpusService.listRegulatorySources).mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
    });
    vi.mocked(corpusService.listKnowledgeDocuments).mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
    });
    vi.mocked(corpusService.queryRegulatory).mockResolvedValue({
      query: "dangerous goods",
      retrievalTraceId: "trace-1",
      evidenceSufficiency: "SUFFICIENT",
      generatedExplanation: null,
      results: [
        {
          sourceId: "source-1",
          documentVersionId: "version-1",
          chunkId: "chunk-1",
          title: "Dangerous Goods Rule",
          authority: "IMO",
          jurisdiction: "VN",
          regulationType: "CIRCULAR",
          section: "4",
          page: "2",
          excerpt: "Handle safely.",
          score: 0.9,
          citation: {
            documentVersionId: "version-1",
            chunkId: "chunk-1",
            canonicalSourceUri: "urn:rule",
          },
        },
      ],
    });
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <CorpusPage />
      </QueryClientProvider>,
    );
    fireEvent.change(screen.getByLabelText("Regulatory corpus query"), {
      target: { value: "dangerous goods" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Search regulatory corpus" }));
    await waitFor(() => expect(screen.getByText("Dangerous Goods Rule")).toBeInTheDocument());
    expect(screen.getByText(/trace-1/)).toBeInTheDocument();
  });
});
