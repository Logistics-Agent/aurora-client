import { rootQueryKeys } from "./root.keys";

export const complianceKeys = {
  all: [...rootQueryKeys.all, "compliance"] as const,
  evaluations: () => [...complianceKeys.all, "evaluations"] as const,
  list: (filters: { page: number; pageSize: number; status?: string; freshness?: string }) =>
    [...complianceKeys.evaluations(), filters] as const,
  evaluation: (id: string) => [...complianceKeys.all, "evaluation", id] as const,
  finding: (id: string) => [...complianceKeys.all, "finding", id] as const,
} as const;
