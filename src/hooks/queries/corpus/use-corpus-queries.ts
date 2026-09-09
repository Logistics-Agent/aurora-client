"use client";

import { useQuery } from "@tanstack/react-query";

import { corpusKeys } from "@/api/query-keys/corpus.keys";
import {
  corpusService,
  type KnowledgeQueryInput,
  type RegulatoryQueryInput,
} from "@/api/services/corpus.service";

export function useRegulatoryCorpusQuery(input?: RegulatoryQueryInput) {
  const queryInput = input?.query.trim() ? input : undefined;

  return useQuery({
    queryKey: corpusKeys.regulatoryQuery(queryInput ?? { query: "" }),
    queryFn: () => {
      if (!queryInput) throw new Error("A corpus query is required.");
      return corpusService.queryRegulatory(queryInput);
    },
    enabled: Boolean(queryInput),
  });
}

export function useKnowledgeCorpusQuery(input?: KnowledgeQueryInput) {
  const queryInput = input?.query.trim() ? input : undefined;

  return useQuery({
    queryKey: corpusKeys.knowledgeQuery(queryInput ?? { query: "" }),
    queryFn: () => {
      if (!queryInput) throw new Error("A corpus query is required.");
      return corpusService.queryKnowledge(queryInput);
    },
    enabled: Boolean(queryInput),
  });
}
