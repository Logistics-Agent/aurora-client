import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { complianceKeys } from "@/api/query-keys/compliance.keys";
import { documentsKeys } from "@/api/query-keys/documents.keys";
import { documentsService } from "@/api/services/documents.service";

import { useDocumentIntakeMutation } from "./use-document-intake-mutation";

describe("useDocumentIntakeMutation", () => {
  it("stores the accepted status and invalidates document and compliance context", async () => {
    const document = {
      id: "job-1",
      documentType: "DOCUMENT",
      status: "PROCESSING" as const,
      stage: "QUEUED" as const,
      fileName: "invoice.pdf",
      needsReview: false,
      confidence: 0,
      normalizedJson: null,
      errorCode: null,
      errorMessage: null,
      createdAt: null,
      updatedAt: null,
    };
    vi.spyOn(documentsService, "createDocumentIntake").mockResolvedValue(document);
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const { result } = renderHook(() => useDocumentIntakeMutation(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    });

    act(() => {
      result.current.mutate({
        uploadId: "01a09545-6eb5-7f02-bde4-1d9398a95b7a",
        documentTypeHint: "COMMERCIAL_INVOICE",
        idempotencyKey: "intake-1",
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(client.getQueryData(documentsKeys.detail("job-1"))).toEqual(document);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: documentsKeys.lists() });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: complianceKeys.all });
  });
});
