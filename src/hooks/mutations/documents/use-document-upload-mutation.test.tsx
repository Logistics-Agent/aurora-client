import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { documentUploadService } from "@/api/services/document-upload.service";

import { useDocumentUploadMutation } from "./use-document-upload-mutation";

describe("useDocumentUploadMutation", () => {
  it("creates a session and uploads the selected file to its signed URL", async () => {
    const session = {
      uploadId: "01a09545-6eb5-7f02-bde4-1d9398a95b7a",
      storageReference: "tenant/uploads/invoice.pdf",
      writeUrl: "https://objects.example.test/upload",
      requiredHeaders: {},
      expiresAt: "2026-09-12T12:15:00Z",
      maximumSizeBytes: 10_485_760,
      fileName: "invoice.pdf",
      mimeType: "application/pdf",
      sizeBytes: 4,
      contentSha256: null,
      status: "PENDING" as const,
    };
    vi.spyOn(documentUploadService, "createUploadSession").mockResolvedValue(session);
    vi.spyOn(documentUploadService, "uploadObject").mockResolvedValue();
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const file = new File(["test"], "invoice.pdf", { type: "application/pdf" });
    const onProgress = vi.fn();
    const { result } = renderHook(() => useDocumentUploadMutation(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      ),
    });

    act(() => {
      result.current.mutate({ file, idempotencyKey: "upload-attempt-1", onProgress });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(documentUploadService.createUploadSession).toHaveBeenCalledWith({
      idempotencyKey: "upload-attempt-1",
      fileName: "invoice.pdf",
      mimeType: "application/pdf",
      sizeBytes: 4,
    });
    expect(documentUploadService.uploadObject).toHaveBeenCalledWith(session, file, {
      onProgress,
      signal: undefined,
    });
    expect(result.current.data).toEqual(session);
  });
});
