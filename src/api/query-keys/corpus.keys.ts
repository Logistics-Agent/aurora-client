import type { KnowledgeQueryInput, RegulatoryQueryInput } from "@/api/services/corpus.service";

import { rootQueryKeys } from "./root.keys";

export const corpusKeys = {
  all: [...rootQueryKeys.all, "corpus"] as const,
  regulatoryQuery: (input: RegulatoryQueryInput) =>
    [...corpusKeys.all, "regulatory-query", input] as const,
  knowledgeQuery: (input: KnowledgeQueryInput) =>
    [...corpusKeys.all, "knowledge-query", input] as const,
};
