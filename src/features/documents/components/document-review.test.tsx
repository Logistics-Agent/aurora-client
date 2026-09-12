import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { documentsService } from "@/api/services/documents.service";
import { ApiError } from "@/lib/api-error";

import { DocumentReview } from "./document-review";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderDocumentReview() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <DocumentReview />
    </QueryClientProvider>,
  );
}

describe("DocumentReview", () => {
  it("renders live BFF documents instead of UI fixtures", async () => {
    vi.spyOn(documentsService, "listDocuments").mockResolvedValue({
      items: [
        {
          id: "job-live-1",
          documentType: "SHIPMENT",
          status: "NEEDS_REVIEW",
          stage: "HUMAN_REVIEW",
          fileName: "live-invoice.pdf",
          needsReview: true,
          confidence: 0.72,
          normalizedJson: null,
          errorCode: null,
          errorMessage: null,
          createdAt: "2026-09-09T05:00:00Z",
          updatedAt: "2026-09-09T05:05:00Z",
        },
      ],
      page: 1,
      pageSize: 20,
      totalItems: 1,
      totalPages: 1,
    });

    renderDocumentReview();

    await waitFor(() => {
      expect(screen.getAllByText("live-invoice.pdf")).not.toHaveLength(0);
    });
    expect(screen.queryByText("Commercial invoice")).not.toBeInTheDocument();
    expect(screen.getAllByText("Needs review").length).toBeGreaterThan(1);
  });

  it("submits corrected OCR fields through the review endpoint", async () => {
    vi.spyOn(documentsService, "listDocuments").mockResolvedValue({
      items: [
        {
          id: "job-review-1",
          documentType: "SHIPMENT",
          status: "NEEDS_REVIEW",
          stage: "HUMAN_REVIEW",
          fileName: "review-invoice.pdf",
          needsReview: true,
          confidence: 0.61,
          normalizedJson: null,
          errorCode: null,
          errorMessage: null,
          createdAt: "2026-09-09T05:00:00Z",
          updatedAt: "2026-09-09T05:05:00Z",
        },
      ],
      page: 1,
      pageSize: 20,
      totalItems: 1,
      totalPages: 1,
    });
    vi.spyOn(documentsService, "getOcrReviewDetails").mockResolvedValue({
      documentId: "job-review-1",
      jobId: "job-review-1",
      status: "NEEDS_REVIEW",
      originalDocumentReference: "blob://tenant/review-invoice.pdf",
      documentType: "SHIPMENT",
      overallConfidence: 0.61,
      reviewReasons: ["Low confidence"],
      fields: [{ name: "consignee", value: "Acme Ltd", confidence: 0.61, needsReview: true }],
    });
    const review = vi.spyOn(documentsService, "reviewDocument").mockResolvedValue({
      id: "job-review-1",
      documentType: "SHIPMENT",
      status: "READY",
      stage: "COMPLETED",
      fileName: "review-invoice.pdf",
      needsReview: false,
      confidence: 1,
      normalizedJson: null,
      errorCode: null,
      errorMessage: null,
      createdAt: "2026-09-09T05:00:00Z",
      updatedAt: "2026-09-09T05:06:00Z",
    });

    renderDocumentReviewWithOcrFields();

    const field = await screen.findByLabelText("OCR field consignee");
    fireEvent.change(field, { target: { value: "Acme Logistics Ltd" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Submit corrections" })[0]);
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Submit corrections" }),
    );

    await waitFor(() =>
      expect(review).toHaveBeenCalledWith("job-review-1", {
        decision: "CORRECT",
        correctedFields: { consignee: "Acme Logistics Ltd" },
      }),
    );
  });

  it("keeps OCR-unavailable errors distinct from an empty queue", async () => {
    vi.spyOn(documentsService, "listDocuments").mockRejectedValue(
      new ApiError({
        code: "DOCUMENT_OCR_UNAVAILABLE",
        message: "OCR unavailable",
        status: 503,
      }),
    );

    renderDocumentReview();

    expect(await screen.findByText("OCR processing unavailable")).toBeInTheDocument();
    expect(screen.queryByText("No documents currently in review queue.")).not.toBeInTheDocument();
  });

  it("loads a deep-linked document from its detail endpoint", async () => {
    vi.spyOn(documentsService, "listDocuments").mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 20,
      totalItems: 0,
      totalPages: 0,
    });
    vi.spyOn(documentsService, "getDocument").mockResolvedValue({
      id: "job-deep-link",
      documentType: "DOCUMENT",
      status: "PROCESSING",
      stage: "EXTRACTING",
      fileName: "deep-link.pdf",
      needsReview: false,
      confidence: null,
      normalizedJson: null,
      errorCode: null,
      errorMessage: null,
      createdAt: null,
      updatedAt: null,
    });

    render(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <DocumentReview initialDocumentId="job-deep-link" />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("deep-link.pdf")).toBeInTheDocument();
  });

  it("preserves local corrections after a review conflict", async () => {
    vi.spyOn(documentsService, "listDocuments").mockResolvedValue({
      items: [
        {
          id: "job-conflict",
          documentType: "DOCUMENT",
          status: "NEEDS_REVIEW",
          stage: "HUMAN_REVIEW",
          fileName: "conflict.pdf",
          needsReview: true,
          confidence: 0.61,
          normalizedJson: null,
          errorCode: null,
          errorMessage: null,
          createdAt: null,
          updatedAt: null,
        },
      ],
      page: 1,
      pageSize: 20,
      totalItems: 1,
      totalPages: 1,
    });
    vi.spyOn(documentsService, "getOcrReviewDetails").mockResolvedValue({
      documentId: "job-conflict",
      jobId: "job-conflict",
      status: "NEEDS_REVIEW",
      originalDocumentReference: null,
      documentType: "DOCUMENT",
      overallConfidence: 0.61,
      reviewReasons: ["LOW_CONFIDENCE"],
      fields: [{ name: "consignee", value: "Acme Ltd", confidence: 0.61, needsReview: true }],
    });
    vi.spyOn(documentsService, "reviewDocument").mockRejectedValue(
      new ApiError({
        code: "INVALID_STATE_TRANSITION",
        message: "Document state changed.",
        status: 409,
      }),
    );

    renderDocumentReviewWithOcrFields();

    const field = await screen.findByLabelText("OCR field consignee");
    fireEvent.change(field, { target: { value: "Acme Logistics Ltd" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Submit corrections" })[0]);
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Submit corrections" }),
    );

    expect(
      await screen.findByText(/document changed while you were reviewing it/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("OCR field consignee")).toHaveValue("Acme Logistics Ltd");
  });
});

function renderDocumentReviewWithOcrFields() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <DocumentReview showOcrFields />
    </QueryClientProvider>,
  );
}
