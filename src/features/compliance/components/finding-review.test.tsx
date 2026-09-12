import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { complianceService } from "@/api/services/compliance.service";

import { FindingReview } from "./finding-review";

afterEach(() => vi.restoreAllMocks());

function renderFindingReview() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <FindingReview initialEvaluationId="evaluation-live-1" />
    </QueryClientProvider>,
  );
}

describe("FindingReview", () => {
  it("renders persisted findings and does not start an evaluation on mount", async () => {
    const startEvaluation = vi.spyOn(complianceService, "startEvaluation");
    vi.spyOn(complianceService, "getComplianceEvaluation").mockResolvedValue({
      evaluationId: "evaluation-live-1",
      externalShipmentId: "shipment-1",
      status: "COMPLETED",
      freshness: "CURRENT",
      snapshotHash: "sha256:test",
      snapshotVersion: 1,
      staleAt: null,
      staleReasonCodes: [],
      riskLevel: "HIGH",
      findings: [
        {
          findingId: "finding-live-1",
          type: "VIOLATION",
          code: "HS_MISMATCH",
          category: "CUSTOMS",
          title: "Live HS code mismatch",
          description: "Review the declared commodity code.",
          severity: "HIGH",
          citations: [],
        },
      ],
      missingDocuments: [],
      assumptions: [],
      complianceConfidence: 0.8,
      evidenceSufficiency: "SUFFICIENT",
      requestedAt: "2026-09-09T05:00:00Z",
      completedAt: "2026-09-09T05:01:00Z",
      errorCode: "",
      errorMessage: "",
    });

    renderFindingReview();

    await waitFor(() => {
      expect(screen.getAllByText("Live HS code mismatch").length).toBeGreaterThan(0);
    });
    expect(startEvaluation).not.toHaveBeenCalled();
    expect(screen.queryByText("Commercial invoice mismatch")).not.toBeInTheDocument();
  });
});
