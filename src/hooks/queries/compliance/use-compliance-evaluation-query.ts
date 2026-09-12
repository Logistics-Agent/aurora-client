"use client";

import { useQuery } from "@tanstack/react-query";

import { complianceKeys } from "@/api/query-keys/compliance.keys";
import { complianceService } from "@/api/services/compliance.service";

export function useComplianceEvaluationQuery(id: string | undefined) {
  return useQuery({
    queryKey: complianceKeys.evaluation(id ?? ""),
    queryFn: () => {
      if (!id) throw new Error("A compliance evaluation id is required.");
      return complianceService.getComplianceEvaluation(id);
    },
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "PENDING" || status === "PROCESSING" ? 2_000 : false;
    },
  });
}
