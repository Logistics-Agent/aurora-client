import { afterEach, describe, expect, it, vi } from "vitest";

import { api } from "@/lib/api";

import { documentsService } from "./documents.service";

afterEach(() => {
  vi.restoreAllMocks();
});

const statusResponse = {
  id: "job-123",
  documentType: "SHIPMENT",
  status: "NEEDS_REVIEW",
  stage: "HUMAN_REVIEW",
  fileName: "invoice.pdf",
  needsReview: true,
  confidence: 0.72,
  normalizedJson: "{}",
  errorCode: null,
  errorMessage: null,
  createdAt: "2026-09-09T05:00:00Z",
  updatedAt: "2026-09-09T05:05:00Z",
};

describe("documents API service", () => {
  it("lists documents through the canonical BFF path and parses the response", async () => {
    const get = vi.spyOn(api, "get").mockResolvedValue({
      items: [statusResponse],
      page: 1,
      pageSize: 20,
      totalItems: 1,
      totalPages: 1,
    } as never);

    const result = await documentsService.listDocuments({
      page: 1,
      pageSize: 20,
      status: "NEEDS_REVIEW",
      shipmentId: "shipment-1",
    });

    expect(get).toHaveBeenCalledWith("api/v1/documents/shipment-documents", {
      params: {
        page: 1,
        pageSize: 20,
        status: "NEEDS_REVIEW",
        shipmentId: "shipment-1",
      },
    });
    expect(result.items[0]?.id).toBe("job-123");
  });

  it("maps the review mutation to the BFF action, fields and comment contract", async () => {
    const post = vi.spyOn(api, "post").mockResolvedValue(statusResponse as never);

    await documentsService.reviewDocument("job-123", {
      decision: "CORRECT",
      correctedFields: { invoiceNumber: "INV-2" },
      reviewNotes: "Corrected from the source document.",
    });

    expect(post).toHaveBeenCalledWith("api/v1/documents/shipment-documents/job-123/review", {
      action: "CORRECT",
      fields: [{ name: "invoiceNumber", value: "INV-2" }],
      comment: "Corrected from the source document.",
    });
  });

  it("creates a document intake from a verified upload without browser-owned IDs", async () => {
    const post = vi.spyOn(api, "post").mockResolvedValue(statusResponse as never);

    await documentsService.createDocumentIntake({
      uploadId: "01a09545-6eb5-7f02-bde4-1d9398a95b7a",
      documentTypeHint: "COMMERCIAL_INVOICE",
      idempotencyKey: "intake-1",
      purpose: "SHIPMENT_DOCUMENT",
      externalReference: "shipment-1",
    });

    expect(post).toHaveBeenCalledWith("api/v1/documents/intakes", {
      uploadId: "01a09545-6eb5-7f02-bde4-1d9398a95b7a",
      documentTypeHint: "COMMERCIAL_INVOICE",
      idempotencyKey: "intake-1",
      purpose: "SHIPMENT_DOCUMENT",
      externalReference: "shipment-1",
    });
  });

  it("includes an explicit external document id when submitting a shipment document", async () => {
    const post = vi.spyOn(api, "post").mockResolvedValue(statusResponse as never);

    await documentsService.submitShipmentDocument({
      idempotencyKey: "request-1",
      storageReference: "objects/tenant-1/file-1",
      fileName: "invoice.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1024,
      documentTypeHint: 1,
      externalDocumentId: "doc-123",
      shipmentId: "shipment-1",
    });

    expect(post).toHaveBeenCalledWith("api/v1/documents/shipment", {
      idempotencyKey: "request-1",
      storageReference: "objects/tenant-1/file-1",
      fileName: "invoice.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1024,
      documentTypeHint: 1,
      externalDocumentId: "doc-123",
      shipmentId: "shipment-1",
    });
  });
});
