"use client";

import { useQuery } from "@tanstack/react-query";

import {
  type ComplianceEvaluationListParams,
  complianceService,
} from "@/api/services/compliance.service";
import { complianceKeys } from "@/api/query-keys/compliance.keys";

const DEFAULT_PARAMS = {
  page: 1,
  pageSize: 20,
} as const;

export function useComplianceEvaluationsQuery(
  params: ComplianceEvaluationListParams = {},
  options?: { enabled?: boolean },
) {
  const normalizedParams = {
    page: params.page ?? DEFAULT_PARAMS.page,
    pageSize: params.pageSize ?? DEFAULT_PARAMS.pageSize,
    ...(params.status ? { status: params.status } : {}),
    ...(params.freshness ? { freshness: params.freshness } : {}),
  };

  return useQuery({
    queryKey: complianceKeys.list(normalizedParams),
    queryFn: () => complianceService.listEvaluations(normalizedParams),
    enabled: options?.enabled ?? true,
  });
}
