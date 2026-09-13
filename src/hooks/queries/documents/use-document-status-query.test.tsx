import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { documentsService } from "@/api/services/documents.service";

import {
  getDocumentStatusPollingInterval,
  useDocumentStatusQuery,
} from "./use-document-status-query";

afterEach(() => vi.restoreAllMocks());

describe("useDocumentStatusQuery", () => {
  it("polls only non-terminal document states", () => {
    expect(getDocumentStatusPollingInterval("RECEIVED")).toBe(2_000);
    expect(getDocumentStatusPollingInterval("PROCESSING")).toBe(2_000);
    expect(getDocumentStatusPollingInterval("READY")).toBe(false);
    expect(getDocumentStatusPollingInterval("NEEDS_REVIEW")).toBe(false);
    expect(getDocumentStatusPollingInterval("FAILED")).toBe(false);
  });

  it("loads a reload-safe document resource by id", async () => {
    vi.spyOn(documentsService, "getDocument").mockResolvedValue({
      id: "job-1",
      documentType: "DOCUMENT",
      status: "PROCESSING",
      stage: "EXTRACTING",
      fileName: "invoice.pdf",
      needsReview: false,
      confidence: null,
      normalizedJson: null,
      errorCode: null,
      errorMessage: null,
      createdAt: null,
      updatedAt: null,
    });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(() => useDocumentStatusQuery("job-1"), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(documentsService.getDocument).toHaveBeenCalledWith("job-1");
  });
});
