import { describe, expect, it } from "vitest";

import {
  parseDocumentIntakeDto,
  parseDocumentUploadSessionDto,
} from "./document-upload.dto";

const uploadSessionFixture = {
  uploadId: "01a09545-6eb5-7f02-bde4-1d9398a95b7a",
  storageReference: "tenant/uploads/01a09545/invoice.pdf",
  writeUrl: "https://objects.example.test/uploads/invoice.pdf?signature=redacted",
  requiredHeaders: {
    "content-type": "application/pdf",
  },
  expiresAt: "2026-09-12T12:15:00Z",
  maximumSizeBytes: 10_485_760,
  fileName: "invoice.pdf",
  mimeType: "application/pdf",
  sizeBytes: 184_320,
  contentSha256: null,
  status: "PENDING",
};

describe("document upload DTO parsers", () => {
  it("parses the source-backed upload session contract", () => {
    const parsed = parseDocumentUploadSessionDto(uploadSessionFixture);

    expect(parsed.uploadId).toBe(uploadSessionFixture.uploadId);
    expect(parsed.requiredHeaders).toEqual({ "content-type": "application/pdf" });
    expect(parsed.status).toBe("PENDING");
  });

  it("rejects upload sessions with invalid URLs, IDs, or size limits", () => {
    expect(() =>
      parseDocumentUploadSessionDto({
        ...uploadSessionFixture,
        uploadId: "not-a-uuid",
        writeUrl: "relative/upload",
        maximumSizeBytes: 0,
      }),
    ).toThrow();
  });

  it("parses an accepted intake as the canonical document status resource", () => {
    const parsed = parseDocumentIntakeDto({
      id: "01a09546-6576-79a5-ad1d-d7a53985708c",
      documentType: "DOCUMENT",
      status: "PROCESSING",
      stage: "QUEUED",
      fileName: "invoice.pdf",
      needsReview: false,
      confidence: 0,
      normalizedJson: null,
      errorCode: null,
      errorMessage: null,
      createdAt: "2026-09-12T12:01:00Z",
      updatedAt: null,
    });

    expect(parsed.id).toBe("01a09546-6576-79a5-ad1d-d7a53985708c");
    expect(parsed.stage).toBe("QUEUED");
  });
});
