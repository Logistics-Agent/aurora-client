import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { complianceService } from "@/api/services/compliance.service";

import { useComplianceEvaluationsQuery } from "./use-compliance-evaluations-query";

afterEach(() => vi.restoreAllMocks());

describe("useComplianceEvaluationsQuery", () => {
  it("loads tenant evaluations with normalized pagination and filters", async () => {
    vi.spyOn(complianceService, "listEvaluations").mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(() => useComplianceEvaluationsQuery({ freshness: "STALE" }), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(complianceService.listEvaluations).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      freshness: "STALE",
    });
  });
});
