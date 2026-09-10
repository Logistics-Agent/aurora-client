import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { documentsService } from "@/api/services/documents.service";

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
    expect(screen.getByText("Needs review")).toBeInTheDocument();
  });

  it("submits storage metadata to the OCR endpoint from the upload form", async () => {
    vi.spyOn(documentsService, "listDocuments").mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 20,
      totalItems: 0,
      totalPages: 0,
    });
    const submit = vi.spyOn(documentsService, "submitShipmentDocument").mockResolvedValue({
      id: "job-new-1",
      documentType: "SHIPMENT",
      status: "RECEIVED",
      stage: "RECEIVING",
      fileName: "invoice.pdf",
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
        <DocumentReview showUpload />
      </QueryClientProvider>,
    );
    await waitFor(() => expect(screen.getByLabelText("Storage reference")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Storage reference"), {
      target: { value: "blob://tenant/invoice.pdf" },
    });
    fireEvent.change(screen.getByLabelText("Document file name"), {
      target: { value: "invoice.pdf" },
    });
    fireEvent.change(screen.getByLabelText("Document size in bytes"), {
      target: { value: "1200" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit for OCR" }));

    await waitFor(() =>
      expect(submit).toHaveBeenCalledWith(
        expect.objectContaining({
          storageReference: "blob://tenant/invoice.pdf",
          fileName: "invoice.pdf",
          sizeBytes: 1200,
        }),
      ),
    );
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
      status: "VERIFIED",
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
