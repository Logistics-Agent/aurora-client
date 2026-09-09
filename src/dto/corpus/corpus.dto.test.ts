import { describe, expect, it } from "vitest";

import { parseKnowledgeQueryDto, parseRegulatoryQueryDto } from "./corpus.dto";

describe("corpus DTOs", () => {
  it("parses regulatory evidence and its citation identity", () => {
    const result = parseRegulatoryQueryDto({
      query: "dangerous goods",
      retrievalTraceId: "trace-1",
      evidenceSufficiency: "SUFFICIENT",
      generatedExplanation: "One source matched.",
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
            canonicalSourceUri: "https://example.test/rule",
          },
        },
      ],
    });
    expect(result.results[0].citation.chunkId).toBe("chunk-1");
  });

  it("parses knowledge evidence without treating it as regulatory evidence", () => {
    const result = parseKnowledgeQueryDto({
      query: "packing SOP",
      retrievalTraceId: "trace-2",
      results: [
        {
          knowledgeDocumentId: "knowledge-1",
          documentVersionId: "version-2",
          chunkId: "chunk-2",
          title: "Packing SOP",
          category: "SOP",
          section: "2",
          page: "1",
          excerpt: "Use pallets.",
          score: 0.8,
          citation: {
            documentVersionId: "version-2",
            chunkId: "chunk-2",
            canonicalSourceUri: "sop://tenant/packing",
          },
        },
      ],
    });
    expect(result.results[0].knowledgeDocumentId).toBe("knowledge-1");
  });
});
