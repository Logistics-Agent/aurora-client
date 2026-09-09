import { beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "@/lib/api";

import { corpusService } from "./corpus.service";

vi.mock("@/lib/api", () => ({ api: { post: vi.fn() } }));

describe("corpusService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("ingests tenant regulatory sources through the documented route", async () => {
    vi.mocked(api.post).mockResolvedValue({
      id: "reg-1",
      documentType: "REGULATORY",
      status: "PROCESSING",
      stage: "EMBEDDING",
      fileName: "rule.pdf",
      needsReview: false,
      confidence: 1,
      normalizedJson: null,
      errorCode: null,
      errorMessage: null,
      createdAt: "2026-09-09T05:00:00Z",
      updatedAt: null,
    });
    await corpusService.ingestRegulatory({
      authority: "IMO",
      title: "Dangerous Goods",
      regulationType: 1,
      canonicalSourceUri: "https://example.test/rule",
      contentReference: "regulatory/tenant/rule.md",
      rawText: "Rule text",
    });
    expect(api.post).toHaveBeenCalledWith("api/v1/documents/regulatory", {
      authority: "IMO",
      title: "Dangerous Goods",
      regulationType: 1,
      canonicalSourceUri: "https://example.test/rule",
      contentReference: "regulatory/tenant/rule.md",
      rawText: "Rule text",
    });
  });
});
