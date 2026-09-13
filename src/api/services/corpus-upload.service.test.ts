import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "@/lib/api";

import { documentUploadService } from "./document-upload.service";
import { corpusUploadService } from "./corpus-upload.service";

const session = {
  uploadId: "01a09545-6eb5-7f02-bde4-1d9398a95b7a",
  storageReference: "tenants/tenant-1/documents/upload-1/rule.pdf",
  writeUrl: "https://objects.example.test/rule.pdf",
  requiredHeaders: { "content-type": "application/pdf" },
  expiresAt: "2026-09-12T12:15:00Z",
  maximumSizeBytes: 10_485_760,
  fileName: "rule.pdf",
  mimeType: "application/pdf",
  sizeBytes: 4,
  contentSha256: null,
  status: "PENDING" as const,
};

afterEach(() => vi.restoreAllMocks());

describe("corpus upload service", () => {
  it("uploads through the document session before starting corpus intake", async () => {
    const createUploadSession = vi
      .spyOn(documentUploadService, "createUploadSession")
      .mockResolvedValue(session);
    const uploadObject = vi.spyOn(documentUploadService, "uploadObject").mockResolvedValue();
    const post = vi.spyOn(api, "post").mockResolvedValue({
      corpusDocumentId: "01a09545-6eb5-7f02-bde4-1d9398a95b7a",
      corpusVersionId: "01a09545-6eb5-7f02-bde4-1d9398a95b7b",
      corpusType: "REGULATORY",
      ocrJobId: "01a09545-6eb5-7f02-bde4-1d9398a95b7c",
      status: "PROCESSING",
      stage: "OCR",
    } as never);
    const file = new File(["rule"], "rule.pdf", { type: "application/pdf" });
    const intake = {
      purpose: "REGULATORY_CORPUS" as const,
      idempotencyKey: "corpus-1",
      title: "Dangerous Goods Rule",
    };

    const result = await corpusUploadService.uploadFile({ file, intake });

    expect(createUploadSession).toHaveBeenCalledWith({
      idempotencyKey: "corpus-1",
      fileName: "rule.pdf",
      mimeType: "application/pdf",
      sizeBytes: 4,
    });
    expect(uploadObject).toHaveBeenCalledWith(session, file, {
      signal: undefined,
      onProgress: undefined,
    });
    expect(post).toHaveBeenCalledWith("api/v1/documents/corpus-intakes", {
      ...intake,
      uploadId: session.uploadId,
    });
    expect(result.status).toBe("PROCESSING");
  });
});
