import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { complianceService } from "@/api/services/compliance.service";

import { useComplianceEvaluationQuery } from "./use-compliance-evaluation-query";

afterEach(() => vi.restoreAllMocks());

describe("useComplianceEvaluationQuery", () => {
  it("loads persisted compliance data only when an evaluation id exists", async () => {
    vi.spyOn(complianceService, "getComplianceEvaluation").mockResolvedValue({
      evaluationId: "evaluation-1",
      externalShipmentId: "shipment-1",
      status: "COMPLETED",
      freshness: "CURRENT",
      snapshotHash: "sha256:test",
      snapshotVersion: 1,
      staleAt: null,
      staleReasonCodes: [],
      riskLevel: "LOW",
      findings: [],
      missingDocuments: [],
      assumptions: [],
      complianceConfidence: 0.9,
      evidenceSufficiency: "SUFFICIENT",
      requestedAt: "2026-09-09T05:00:00Z",
      completedAt: "2026-09-09T05:01:00Z",
      errorCode: "",
      errorMessage: "",
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(() => useComplianceEvaluationQuery("evaluation-1"), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(complianceService.getComplianceEvaluation).toHaveBeenCalledWith("evaluation-1");
    expect(result.current.data?.riskLevel).toBe("LOW");
  });
});
