import { describe, expect, it } from "vitest";

import {
  parseDocumentListDto,
  parseDocumentReviewDto,
  parseDocumentStatusDto,
} from "./document.dto";

const documentFixture = {
  id: "job-123",
  documentType: "SHIPMENT",
  status: "NEEDS_REVIEW",
  stage: "HUMAN_REVIEW",
  fileName: "commercial-invoice.pdf",
  needsReview: true,
  confidence: 0.72,
  normalizedJson: '{"invoiceNumber":"INV-1"}',
  errorCode: null,
  errorMessage: null,
  createdAt: "2026-09-09T05:00:00Z",
  updatedAt: "2026-09-09T05:05:00Z",
};

describe("document DTO parsers", () => {
  it("parses the BFF document status response and preserves nullable fields", () => {
    const parsed = parseDocumentStatusDto(documentFixture);

    expect(parsed.id).toBe("job-123");
    expect(parsed.status).toBe("NEEDS_REVIEW");
    expect(parsed.confidence).toBe(0.72);
    expect(parsed.errorCode).toBeNull();
  });

  it("parses a paginated document list without changing server status semantics", () => {
    const parsed = parseDocumentListDto({
      items: [documentFixture],
      page: 1,
      pageSize: 20,
      totalItems: 1,
      totalPages: 1,
    });

    expect(parsed.items[0]?.documentType).toBe("SHIPMENT");
    expect(parsed.totalItems).toBe(1);
  });

  it("parses field-level OCR review data using the server field names", () => {
    const parsed = parseDocumentReviewDto({
      documentId: "doc-123",
      jobId: "job-123",
      status: "NEEDS_REVIEW",
      originalDocumentReference: "objects/tnt-1/doc-123",
      documentType: "INVOICE",
      overallConfidence: 0.72,
      reviewReasons: ["LOW_CONFIDENCE"],
      fields: [
        {
          name: "invoiceNumber",
          value: "INV-1",
          confidence: 0.91,
          needsReview: false,
        },
      ],
    });

    expect(parsed.fields[0]?.name).toBe("invoiceNumber");
    expect(parsed.originalDocumentReference).toContain("objects/");
  });

  it("rejects a response without the stable document id or status", () => {
    expect(() =>
      parseDocumentStatusDto({
        ...documentFixture,
        id: "",
        status: "UNKNOWN_STATUS",
      }),
    ).toThrow();
  });
});
